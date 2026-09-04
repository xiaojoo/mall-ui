<template>
  <!-- 全局固定背景 -->
  <AppBackground />
  <!-- 顶部工具条（全页面显示）+ 主头部（仅首页/详情） -->
  <AppHeader />
  <!-- 分类导航：仅首页 / 商品详情显示 -->
  <AppNav v-if="showNav" />
  <!-- 页面主体 -->
  <main class="nb-main">
    <router-view />
  </main>
  <!-- 页脚 -->
  <AppFooter />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBackground from '@/components/nebula/AppBackground/index.vue'
import AppHeader from '@/components/nebula/AppHeader/index.vue'
import AppNav from '@/components/nebula/AppNav/index.vue'
import AppFooter from '@/components/nebula/AppFooter/index.vue'
import useUserStore from '@/store/modules/user'
import { SET_TOKEN } from '@/utils/token'

const router = useRouter()
const route = useRoute()
const WEIBO_REDIRECT_KEY = 'weibo_redirect'

// 分类导航只在 首页 / 商品列表 / 商品详情 显示（nb-header 由 AppHeader 内部按路由控制）
const showNav = computed(() => {
  const n = String(route.name)
  return (
    ['home', 'list', 'details'].includes(n) ||
    ['/', '/home', '/list', '/details'].includes(route.path)
  )
})

onMounted(() => {
  // 微博 OAuth 回调：token 在 URL query（hash 路由下 vue-router 读不到 search，这里处理）
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  if (token) {
    const userStore = useUserStore()
    userStore.token = token
    SET_TOKEN(token)
    userStore.userInfo().catch(() => {})
    // 清除 URL 上的 token，避免泄露
    params.delete('token')
    const search = params.toString()
    history.replaceState(
      null,
      '',
      window.location.pathname +
        (search ? `?${search}` : '') +
        window.location.hash,
    )
    // 微博登录回跳：登录页保存了原页面地址，登录后跳回去
    const redirect = sessionStorage.getItem(WEIBO_REDIRECT_KEY)
    sessionStorage.removeItem(WEIBO_REDIRECT_KEY)
    if (redirect && redirect !== router.currentRoute.value.fullPath) {
      router.push(redirect)
    }
  }
})
</script>

<style scoped>
.nb-main {
  position: relative;
  z-index: 2;
  min-height: 60vh;
}
</style>
