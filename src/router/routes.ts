import type { RouteRecordRaw } from 'vue-router'

export const constantRoute: Array<RouteRecordRaw> = [
  // 路由配置
  {
    path: '/',
    component: () => import('@/views/home/index.vue'),
    meta: { show: true },
  },
  // 路由懒加载写法
  {
    name: 'home',
    path: '/home',
    component: () => import('@/views/home/index.vue'),
    meta: { show: true },
  },
  {
    name: 'list',
    path: '/list',
    component: () => import('@/views/list/index.vue'),
    meta: { show: true },
  },
  {
    name: 'details',
    path: '/details',
    component: () => import('@/views/details/index.vue'),
    meta: { show: true },
  },
  {
    name: 'cart',
    path: '/cart',
    component: () => import('@/views/cart/index.vue'),
    meta: { show: true, requiresAuth: true },
  },
  {
    name: 'checkout',
    path: '/checkout',
    component: () => import('@/views/checkout/index.vue'),
    meta: { show: true, requiresAuth: true },
  },
  {
    name: 'orders',
    path: '/orders',
    component: () => import('@/views/orders/index.vue'),
    meta: { show: true, requiresAuth: true },
  },
  {
    name: 'seckill',
    path: '/seckill',
    component: () => import('@/views/seckill/index.vue'),
    meta: { show: true },
  },
  {
    name: 'seckillDetail',
    path: '/seckillDetail',
    component: () => import('@/views/seckill/detail.vue'),
    meta: { show: true },
  },
  {
    name: 'orderDetail',
    path: '/orderDetail/:orderSn',
    component: () => import('@/views/orderDetail/index.vue'),
    meta: { show: false, requiresAuth: true },
  },
  {
    name: 'pay',
    path: '/pay',
    component: () => import('@/views/pay/index.vue'),
    meta: { show: false, requiresAuth: true },
  },
  {
    name: 'profile',
    path: '/profile',
    component: () => import('@/views/profile/index.vue'),
    meta: { show: false, requiresAuth: true },
  },
  {
    name: 'favorites',
    path: '/favorites',
    component: () => import('@/views/favorites/index.vue'),
    meta: { show: true, requiresAuth: true },
  },
  {
    name: 'reviews',
    path: '/reviews',
    component: () => import('@/views/reviews/index.vue'),
    meta: { show: false, requiresAuth: true },
  },
  {
    name: 'shop',
    path: '/shop',
    component: () => import('@/views/shop/index.vue'),
    meta: { show: true },
  },
  // 登录
  {
    name: 'login',
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: { show: false },
  },
  // 注册
  {
    name: 'register',
    path: '/register',
    component: () => import('@/views/register/index.vue'),
    meta: { show: false },
  },
  // {
  //   name: 'test',
  //   path: '/test',
  //   component: () => import('@/views/test/index.vue'),
  //   meta: { show: true },
  // },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home',
  },
]
