/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'
// mock插件
// import { viteMockServe } from 'vite-plugin-mock'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Inspect from 'vite-plugin-inspect'

const pathSrc = path.resolve(__dirname, 'src')

export default defineConfig(({ mode }) => {
  // 获取各种环境下的对应变量
  const env = loadEnv(mode, process.cwd())
  return {
    resolve: {
      alias: {
        '@': pathSrc,
      },
    },
    plugins: [
      vue(),
      // createSvgIconsPlugin({
      //   iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      //   symbolId: 'icon-[dir]-[name]',
      //   inject: 'body-first',
      // }),
      // mock
      // viteMockServe({
      //   mockPath: 'mock',
      //   enable: command === 'serve', // 仅在开发环境启用
      // }),
      // 自动导入
      AutoImport({
        // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
        imports: ['vue'],
        // 自动导入图标组件
        resolvers: [
          IconsResolver({
            prefix: 'Icon',
          }),
        ],
        dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
      }),
      Components({
        resolvers: [
          // 自动注册图标组件（MDI 图标集，非 Element 系）
          IconsResolver({
            enabledCollections: ['mdi'],
          }),
        ],
        dts: path.resolve(pathSrc, 'components.d.ts'),
      }),
      Icons({
        autoInstall: true,
      }),
      Inspect(),
    ],
    // scss 全局变量
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/styles/variable" as *;`,
        },
      },
    },
    // Vitest 单元测试（npx vitest run）
    // 复用上方 resolve.alias / plugins（vue、auto-import 等），无需单独 vitest.config.ts
    test: {
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      // 单测不跑 CSS 编译，提速
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,vue}'],
        exclude: [
          'src/main.ts',
          'src/**/*.d.ts',
          'src/api/**',
          'src/constants/**',
          'src/auto-imports.d.ts',
          'src/components.d.ts',
        ],
      },
    },
    // 代理跨域：/api 前缀原样转发到网关（网关按 /api/** 路由并剥离前缀）
    server: {
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_SERVE,
          // 需要代理
          changeOrigin: true,
        },
      },
    },
  }
})
