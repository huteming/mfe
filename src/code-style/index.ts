import { CodeStyleCommandOptions } from '@/types'
import stringify from 'json-stable-stringify-without-jsonify'
import { writeFileSync } from 'fs'
import { join } from 'path'
import spawn from 'cross-spawn'
import { Legacy } from '@eslint/eslintrc'

const { ConfigOps, naming, ModuleResolver } = Legacy

function sortByKey(a: any, b: any) {
  return a.key > b.key ? 1 : -1
}

async function writeJSConfigFile(cwd: string, config: Object) {
  const filePath = `./.eslintrc.js`
  const stringifiedContent = `module.exports = ${stringify(config, {
    cmp: sortByKey,
    space: 4,
  })}\n`

  writeFileSync(filePath, stringifiedContent, 'utf8')

  const eslintBin = join(cwd, './node_modules/.bin/eslint')
  const result = spawn.sync(eslintBin, ['--fix', '--quiet', filePath], {
    encoding: 'utf8',
  })

  if (result.error || result.status !== 0) {
    console.warn('eslint 配置文件已生成, 但该文件格式化失败')
  }
}

function processOptions(options: CodeStyleCommandOptions) {
  const config: any = {
    env: {
      browser: true,
      es2021: true,
    },
    extends: ['plugin:react/recommended', 'airbnb'],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: ['react'],
    rules: {},
  }

  // ts
  if (options.typescript) {
    config.parser = '@typescript-eslint/parser'
    config.plugins.push('@typescript-eslint')
  }

  return config
}

function installSyncSaveDev(packages: string[] | string) {
  const packageList = Array.isArray(packages) ? packages : [packages]
  const npmProcess = spawn.sync('yarn', ['add', '-D'].concat(packageList), {
    stdio: 'inherit',
  })
  const error = npmProcess.error as any

  if (error && error.code === 'ENOENT') {
    const pluralS = packageList.length > 1 ? 's' : ''

    console.error(
      `Could not execute npm. Please install the following package${pluralS} with a package manager of your choice: ${packageList.join(
        ', ',
      )}`,
    )
  }
}

function fetchPeerDependencies(packageName: string) {
  const npmProcess = spawn.sync(
    'npm',
    ['show', '--json', packageName, 'peerDependencies'],
    { encoding: 'utf8' },
  )

  const error = npmProcess.error as any

  if (error && error.code === 'ENOENT') {
    return null
  }
  const fetchedText = npmProcess.stdout.trim()

  return JSON.parse(fetchedText || '{}')
}

function getPeerDependencies(moduleName: string) {
  let result = getPeerDependencies.cache.get(moduleName)

  if (!result) {
    result = fetchPeerDependencies(moduleName)
    getPeerDependencies.cache.set(moduleName, result)
  }

  return result
}
getPeerDependencies.cache = new Map()

function getModulesList(config: any) {
  const modules: any = {
    // eslint: 'latest',
  }

  // Create a list of modules which should be installed based on config
  if (config.plugins) {
    for (const plugin of config.plugins) {
      const moduleName = naming.normalizePackageName(plugin, 'eslint-plugin')

      modules[moduleName] = 'latest'
    }
  }
  if (config.extends) {
    const extendList = Array.isArray(config.extends)
      ? config.extends
      : [config.extends]

    for (const extend of extendList) {
      if (extend.startsWith('eslint:') || extend.startsWith('plugin:')) {
        continue
      }
      const moduleName = naming.normalizePackageName(extend, 'eslint-config')

      modules[moduleName] = 'latest'
      // 解析依赖包的 peerDependencies, 也需要自动安装
      Object.assign(modules, getPeerDependencies(`${moduleName}@latest`))
    }
  }

  const parser =
    config.parser || (config.parserOptions && config.parserOptions.parser)

  if (parser) {
    modules[parser] = 'latest'
  }

  modules.eslint = 'latest'

  return Object.keys(modules).map((name) => `${name}@${modules[name]}`)
}

interface InitCodeStyleOpts {
  cwd: string
  options: CodeStyleCommandOptions
}

export default function initCodeStyle(opts: InitCodeStyleOpts) {
  const { cwd, options } = opts

  const config = processOptions(options)
  const modules = getModulesList(config)
  installSyncSaveDev(modules)
  writeJSConfigFile(cwd, config)
}
