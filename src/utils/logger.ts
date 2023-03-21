import chalk from 'chalk'

export default {
  info(...msgs: string[]) {
    console.log(chalk.blue(`info - `), ...msgs)
    console.log()
  },

  error(...msgs: string[]) {
    console.log(chalk.red(`error - `), ...msgs)
    console.log()
  },
}
