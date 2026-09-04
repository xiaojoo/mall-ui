import { defineStore } from 'pinia'
import { reqCartList } from '@/api/cart'

// 购物车角标数量（Header 与各加购入口共享）
export default defineStore('cart', {
  state: () => ({
    cartCount: 0,
  }),
  actions: {
    // 从后端拉取购物车商品总件数（未登录/失败为 0，不显示角标）
    async refreshCartCount() {
      try {
        const result: any = await reqCartList()
        const list: any[] = result?.data || []
        this.cartCount = list.reduce(
          (sum, item) => sum + Number(item.count || 0),
          0,
        )
      } catch {
        this.cartCount = 0
      }
    },
  },
})
