import { IJestOptions } from '../types'
import { getAliasFromTsConfig } from './utils'
import type { Config } from '@jest/types'

export default function mergeOptions(
  cwd: string,
  jestOptions?: IJestOptions,
): Config.InitialOptions {
  const { extraOptions } = jestOptions || {}
  const { setupFiles = [] } = extraOptions || {}
  const testMatchTypes = ['spec', 'test']

  return {
    rootDir: cwd,
    clearMocks: true,

    setupFiles: [
      require.resolve('../static/helpers/setupFiles/shim'),
      ...setupFiles,
    ],
    // setupFilesAfterEnv: [
    //   require.resolve('../static/helpers/setupFiles/jasmine'),
    // ],

    collectCoverageFrom: [
      // '<rootDir>/index.{js,jsx,ts,tsx}',
      '<rootDir>/src/**/*.{js,jsx,ts,tsx}',
      '<rootDir>/tests/**/*.{js,jsx,ts,tsx}',
      '!**/typings/**',
      '!**/types/**',
      '!**/fixtures/**',
      '!**/examples/**',
      '!**/*.stories.{js,jsx,ts,tsx}',
      '!**/*.d.ts',
    ].filter(Boolean) as string[],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    moduleNameMapper: {
      ...getAliasFromTsConfig(cwd),
      // 静态资源
      // '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      //   require.resolve('../static/mocks/fileMocks'),
      '\\.(css|less|sass|scss|stylus)$': require.resolve('identity-obj-proxy'),
      // webpack inline loader
      '^file-loader': require.resolve('../static/mocks/fileMocks'),
    },
    testEnvironment: 'jsdom',
    testMatch: [`**/?*.(${testMatchTypes.join('|')}).(j|t)s?(x)`],
    testPathIgnorePatterns: ['/node_modules/', '/fixtures/'],
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest', {}],

      '^.+\\.(css|less|sass|scss|stylus)$': require.resolve(
        '../static/helpers/transformers/css',
      ),
      '^(?!.*\\.(js|jsx|ts|tsx|css|less|sass|scss|stylus|json)$)':
        require.resolve('../static/helpers/transformers/file'),
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],

    // 表示是否应该在运行期间报告每个单独的测试。所有的错误在执行后也仍然会显示在底部。
    verbose: true,

    // 用于设置 jest worker 启动的个数
    ...(process.env.MAX_WORKERS
      ? { maxWorkers: Number(process.env.MAX_WORKERS) }
      : {}),
  }
}
