import { BuildCommandOptions } from '../types'
import { copy } from '@/utils/copy'
import { getStaticDirPath } from '@/utils/helpers'
import logger from '@/utils/logger'
import handlebars from 'handlebars'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export default async function createAction(
  projectName: string,
  _options: BuildCommandOptions,
) {
  const cwd = process.cwd()
  const from = join(getStaticDirPath(), 'project')
  const to = join(cwd, projectName)
  const projectInfo = {
    name: projectName,
  }

  // 复制 project-template 到目标路径下创建工程
  copy(from, to)

  // handlebars模版引擎解析用户输入的信息存在package.json
  const jsonPath = join(to, 'package.json')
  const jsonContent = readFileSync(jsonPath, 'utf-8')
  const jsonResult = handlebars.compile(jsonContent)(projectInfo)

  writeFileSync(jsonPath, jsonResult)

  logger.info('仓库创建完成')
}
