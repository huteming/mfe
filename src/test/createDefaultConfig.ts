import { existsSync } from 'fs'
import { join } from 'path'

export default function (cwd: string) {
  const testMatchTypes = ['spec', 'test']
  const hasSrc = existsSync(join(cwd, 'src'))

  return {
    clearMocks: true,

    collectCoverageFrom: [
      'index.{js,jsx,ts,tsx}',
      hasSrc && 'src/**/*.{js,jsx,ts,tsx}',
      '!**/typings/**',
      '!**/types/**',
      '!**/fixtures/**',
      '!**/examples/**',
      '!**/*.stories.{js,jsx,ts,tsx}',
      '!**/*.d.ts',
    ].filter(Boolean),
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    moduleNameMapper: {
      '@/(.*)': 'src/$1',
      // 静态资源
      // '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      //   require.resolve('../static/mocks/fileMocks'),
      '\\.(css|less|sass|scss|stylus)$': require.resolve('identity-obj-proxy'),
    },
    setupFiles: [require.resolve('../static/helpers/setupFiles/shim')],
    setupFilesAfterEnv: [
      require.resolve('../static/helpers/setupFiles/jasmine'),
    ],
    // testEnvironment: require.resolve('jest-environment-jsdom-fourteen'),
    testEnvironment: 'jsdom',
    testMatch: [`**/?*.(${testMatchTypes.join('|')}).(j|t)s?(x)`],
    testPathIgnorePatterns: ['/node_modules/', '/fixtures/'],
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': require.resolve(
        '../static/helpers/transformers/javascript',
      ),
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
