import minimist from 'minimist'
import fs from 'fs'
import { join, resolve } from 'path'
import chalk from 'chalk'
import semver, { ReleaseType } from 'semver'
import { prompt } from 'enquirer'
import execa from 'execa'
import { ReleaseCommandOptions } from '@/types'

function run(bin: string, args: string[], opts = {}) {
  return execa(bin, args, { stdio: 'inherit', ...opts })
}

function dryRun(bin: string, args: string[], opts = {}) {
  return console.log(chalk.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts)
}

function step(msg: string) {
  return console.log(chalk.cyan(msg))
}

async function publishPackage(
  cwd: string,
  version: string,
  runIfNotDry: Function,
) {
  const pkgPath = resolve(cwd, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  if (pkg.private) {
    return
  }

  step(`Publishing...`)
  try {
    await runIfNotDry('npm', ['publish'], {
      cwd,
      stdio: 'pipe',
    })
    console.log(chalk.green(`Successfully published v${version}`))
  } catch (e: any) {
    if (e.stderr.match(/previously published/)) {
      console.log(chalk.red(`Skipping already published`))
    } else {
      throw e
    }
  }
}

function updateVersion(cwd: string, version: string) {
  const pkgPath = resolve(cwd, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  pkg.version = version
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

interface IReleaseOpts {
  cwd: string
  options: ReleaseCommandOptions
}

export default async function release(opts: IReleaseOpts) {
  const { cwd, options } = opts
  let pkg = { version: '1.0.0' }
  try {
    pkg = require(join(cwd, 'package.json'))
  } catch (e) {
    console.log(`\n获取 package.json 失败.`)
  }
  const currentVersion = pkg.version
  const preIdInCurrentVersion = semver
    .prerelease(currentVersion)?.[0]
    ?.toString()

  const preId = options.preid || preIdInCurrentVersion
  const isDryRun = options.dry
  const skipTests = options.skipTests
  const skipBuild = options.skipBuild

  const versionIncrements = [
    'patch',
    'minor',
    'major',
    ...(preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : []),
  ] as ReleaseType[]

  const bin = (name: string) => resolve(cwd, 'node_modules/.bin/', name)
  const inc = (i: ReleaseType) => semver.inc(currentVersion, i, preId)
  const runIfNotDry = isDryRun ? dryRun : run

  try {
    let targetVersion: string

    const { publish } = await prompt<{ publish: string }>({
      type: 'select',
      name: 'publish',
      message: 'Select release type',
      choices: versionIncrements
        .map((i) => `${i} (${inc(i)})`)
        .concat(['custom']),
    })

    if (publish === 'custom') {
      targetVersion = (
        await prompt<{ version: string }>({
          type: 'input',
          name: 'version',
          message: 'Input custom version',
          initial: currentVersion,
        })
      ).version
    } else {
      targetVersion = publish.match(/\((.*)\)/)?.[1] as string
    }

    if (!semver.valid(targetVersion)) {
      throw new Error(`invalid target version: ${targetVersion}`)
    }

    const { yes } = await prompt<{ yes: boolean }>({
      type: 'confirm',
      name: 'yes',
      message: `Releasing v${targetVersion}. Confirm?`,
    })

    if (!yes) {
      return
    }

    // 运行测试
    step('\nRunning tests...')
    if (!skipTests && !isDryRun) {
      await run(bin('jest'), ['--clearCache'])
      await run('yarn', ['run', 'test'])
    } else {
      console.log(`(skipped)`)
    }

    // 更新版本号
    step('\nUpdating version...')
    updateVersion(cwd, targetVersion)

    // 运行构建
    step('\nBuilding all packages...')
    if (!skipBuild && !isDryRun) {
      await run('yarn', ['run', 'build'])
    } else {
      console.log(`(skipped)`)
    }

    const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
    if (stdout) {
      step('\nCommitting changes...')
      await runIfNotDry('git', ['add', '-A'])
      await runIfNotDry('git', ['commit', '-m', `build: v${targetVersion}`])
    } else {
      console.log('No changes to commit.')
    }

    // 发布到 npm
    step('\nPublishing package...')
    await publishPackage(cwd, targetVersion, runIfNotDry)

    // push to GitHub
    // step('\nPushing to GitHub...')
    // await runIfNotDry('git', ['tag', `v${targetVersion}`])
    // await runIfNotDry('git', ['push', 'origin', `refs/tags/v${targetVersion}`])
    // await runIfNotDry('git', ['push'])

    if (isDryRun) {
      console.log(`\nDry run finished - run git diff to see package changes.`)
    }

    console.log()
  } catch (err) {
    console.error(err)
  }
}
