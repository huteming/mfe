import { isTest } from './helpers'
import chalk from 'chalk'

export default {
  info(...msgs: string[]): void {
    if (isTest()) {
      return
    }

    console.log(chalk.blue(`info - `), ...msgs)
    console.log()
  },

  error(...msgs: string[]): void {
    if (isTest()) {
      return
    }

    console.log(chalk.red(`error - `), ...msgs)
    console.log()
  },
}
