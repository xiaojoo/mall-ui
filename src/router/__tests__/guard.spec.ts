import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { authGuard } from '@/router'
import useUserStore from '@/store/modules/user'

// 用内存路由 + 同名守卫构造被测实例（不加载真实页面 chunk，专注守卫逻辑）
const Dummy = { render: () => null }

function createTestRouter(): Router {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Dummy },
      { path: '/home', component: Dummy },
      { path: '/login', component: Dummy },
      { path: '/register', component: Dummy },
      { path: '/cart', component: Dummy, meta: { requiresAuth: true } },
      { path: '/favorites', component: Dummy, meta: { requiresAuth: true } },
      { path: '/checkout', component: Dummy, meta: { requiresAuth: true } },
    ],
  })
  router.beforeEach(authGuard)
  return router
}

describe('路由守卫 authGuard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
    localStorage.clear()
  })

  it('未登录访问需登录页 → 重定向 /login 并携带 redirect', async () => {
    const router = createTestRouter()
    await router.push('/cart')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe('/cart')
  })

  it('redirect 携带完整 fullPath（含 query）', async () => {
    const router = createTestRouter()
    await router.push('/favorites?tab=all')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe('/favorites?tab=all')
  })

  it('未登录访问公开页 → 放行', async () => {
    const router = createTestRouter()
    await router.push('/home')
    expect(router.currentRoute.value.path).toBe('/home')
  })

  it('已登录访问需登录页 → 放行', async () => {
    const userStore = useUserStore()
    userStore.token = 'token-1'
    const router = createTestRouter()
    await router.push('/cart')
    expect(router.currentRoute.value.path).toBe('/cart')
  })

  it('未登录直达 /checkout → 先被登录拦截去 /login（凭证检查在后）', async () => {
    const router = createTestRouter()
    await router.push('/checkout')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe('/checkout')
  })

  it('已登录但无结算凭证访问 /checkout → 回购物车', async () => {
    const userStore = useUserStore()
    userStore.token = 'token-1'
    const router = createTestRouter()
    await router.push('/checkout')
    expect(router.currentRoute.value.path).toBe('/cart')
  })

  it('有结算凭证访问 /checkout → 放行且凭证一次性消费', async () => {
    const userStore = useUserStore()
    userStore.token = 'token-1'
    const router = createTestRouter()
    sessionStorage.setItem('mall_checkout_allowed', '1')

    await router.push('/checkout')
    expect(router.currentRoute.value.path).toBe('/checkout')
    // 凭证已消费，刷新/再进不能停留
    expect(sessionStorage.getItem('mall_checkout_allowed')).toBeNull()

    // 离开再进入 → 被拦回购物车
    await router.push('/home')
    await router.push('/checkout')
    expect(router.currentRoute.value.path).toBe('/cart')
  })

  it('已登录访问 /login 或 /register → 回首页', async () => {
    const userStore = useUserStore()
    userStore.token = 'token-1'
    const router = createTestRouter()
    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/home')
    await router.push('/register')
    expect(router.currentRoute.value.path).toBe('/home')
  })

  it('URL 携带 token → 自动登录、清除 URL 参数、持久化 token', async () => {
    const router = createTestRouter()
    const userStore = useUserStore()
    const userInfoSpy = vi
      .spyOn(userStore, 'userInfo')
      .mockResolvedValue('ok' as never)

    await router.push({ path: '/home', query: { token: 'TOK-1' } })

    expect(userStore.token).toBe('TOK-1')
    expect(localStorage.getItem('MALL_UI_TOKEN')).toBe('TOK-1')
    // token 已从 URL 清除，避免泄露
    expect(router.currentRoute.value.query.token).toBeUndefined()
    expect(router.currentRoute.value.path).toBe('/home')
    expect(userInfoSpy).toHaveBeenCalled()
  })
})
