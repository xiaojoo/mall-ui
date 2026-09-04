import {
  createRouter,
  createWebHashHistory,
  type RouteLocationNormalized,
} from 'vue-router'
import { constantRoute } from './routes'
import useUserStore from '@/store/modules/user'
import { SET_TOKEN } from '@/utils/token'

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoute,
  // 滚动行为
  scrollBehavior() {
    return {
      left: 0,
      top: 0,
    }
  },
})

// 全局前置守卫（独立导出以便单测；业务逻辑与 router 实例解耦）
export function authGuard(to: RouteLocationNormalized) {
  const userStore = useUserStore()

  // 微博 OAuth 回调：携带 token（会员ID）自动登录，并清除 URL 上的 token
  if (to.query.token) {
    userStore.token = String(to.query.token)
    SET_TOKEN(String(to.query.token))
    userStore.userInfo().catch(() => {})
    const { token: _token, ...rest } = to.query
    return { path: to.path, query: rest }
  }

  // 需要登录的页面：未登录则跳转登录页，并携带回跳地址
  if (to.meta.requiresAuth && !userStore.token) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  // 结算页只能从购物车「去结算」进入：无凭证直接回购物车，禁止填路由直达
  if (to.path === '/checkout') {
    if (sessionStorage.getItem('mall_checkout_allowed') !== '1') {
      return { path: '/cart' }
    }
    // 凭证一次性消费：刷新页面后同样不能停留
    sessionStorage.removeItem('mall_checkout_allowed')
  }

  // 已登录用户访问登录/注册页时，直接回首页
  if ((to.path === '/login' || to.path === '/register') && userStore.token) {
    return { path: '/home' }
  }
}

router.beforeEach(authGuard)

export default router
