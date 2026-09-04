import { createApp } from 'vue'
import App from './App.vue'

// 引入全局样式
import '@/assets/styles/index.scss'
// 引入路由
import router from '@/router'
// 引入仓库
import pinia from './store'
// 引入滚动显现指令
import reveal from '@/directives/reveal'

const app = createApp(App)

app.use(router)
app.use(pinia)
app.directive('reveal', reveal)

// 等首屏路由解析完成（懒加载页面 chunk 就绪）再挂载。
// 否则首次渲染时 route 还是起始位置 '/'，会先画出首页头部/分类导航，
// 等目标页面 chunk 加载完路由才切到正确页面 → 刷新其他页面时「首页导航+搜索框」一闪而过。
// 等待期间 #app 内的 .app-boot 占位（index.html）保持显示，避免白屏。
await router.isReady()

app.mount('#app')
