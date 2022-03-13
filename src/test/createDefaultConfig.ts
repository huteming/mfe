import { existsSync } from 'fs'
import { join } from 'path'
import type { Config } from '@jest/types'
import { UserJestConfig } from '@/types'

interface Opts {
  cwd: string
  userJestConfig?: UserJestConfig
}

export default function (opts: Opts): Config.InitialOptions {
  const { cwd, userJestConfig } = opts
  const { extraBabelPlugins, _setupFiles = [] } = userJestConfig || {}
  const testMatchTypes = ['spec', 'test']
  const src = join(cwd, 'src')
  const hasSrc = existsSync(src)

  const babelJestOptions = {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: {
            node: 'current',
          },
        },
      ],
      require.resolve('@babel/preset-react'),
      require.resolve('@babel/preset-typescript'),
    ],
    plugins: [...(extraBabelPlugins || [])],
    babelrc: false,
    configFile: false,
  }

  return {
    rootDir: cwd,
    clearMocks: true,

    collectCoverageFrom: [
      '<rootDir>/index.{js,jsx,ts,tsx}',
      '<rootDir>/src/**/*.{js,jsx,ts,tsx}',
      '!**/typings/**',
      '!**/types/**',
      '!**/fixtures/**',
      '!**/examples/**',
      '!**/*.stories.{js,jsx,ts,tsx}',
      '!**/*.d.ts',
    ].filter(Boolean) as string[],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    moduleNameMapper: {
      '^@/(.*)': '<rootDir>/src/$1',
      // 静态资源
      // '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      //   require.resolve('../static/mocks/fileMocks'),
      '\\.(css|less|sass|scss|stylus)$': require.resolve('identity-obj-proxy'),
      // webpack inline loader
      '^file-loader': require.resolve('../static/mocks/fileMocks'),
    },
    setupFiles: [
      require.resolve('../static/helpers/setupFiles/shim'),
      ..._setupFiles,
    ],
    setupFilesAfterEnv: [
      require.resolve('../static/helpers/setupFiles/jasmine'),
    ],
    // testEnvironment: require.resolve('jest-environment-jsdom-fourteen'),
    testEnvironment: 'jsdom',
    testMatch: [`**/?*.(${testMatchTypes.join('|')}).(j|t)s?(x)`],
    testPathIgnorePatterns: ['/node_modules/', '/fixtures/'],
    transform: {
      // 2022-02-17: 尝试使用 swc 替换 babel 作为 jest 测试时编译工具
      // 2022-02-19: swc 缺少小众的 babel 插件支持, 如: babel-plugin-import
      // '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest', {}],
      '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', babelJestOptions],
      // '^.+\\.(js|jsx|ts|tsx)$': require.resolve(
      //   '../static/helpers/transformers/javascript',
      // ),

      '^.+\\.(css|less|sass|scss|stylus)$': require.resolve(
        '../static/helpers/transformers/css',
      ),
      '^(?!.*\\.(js|jsx|ts|tsx|css|less|sass|scss|stylus|json)$)':
        require.resolve('../static/helpers/transformers/file'),
    },
    verbose: true,
    transformIgnorePatterns: [
      // 加 [^/]*? 是为了兼容 tnpm 的目录结构
      // 比如：_umi-test@1.5.5@umi-test
      // `node_modules/(?!([^/]*?umi|[^/]*?umi-test)/)`,
    ],
    // 用于设置 jest worker 启动的个数
    ...(process.env.MAX_WORKERS
      ? { maxWorkers: Number(process.env.MAX_WORKERS) }
      : {}),
  }
}
