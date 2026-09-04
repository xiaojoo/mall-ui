import { defineStore } from 'pinia'
import { reqFavCount } from '@/api/favorites'

// 心愿单角标数量（Header 与收藏各入口共享）
export default defineStore('favorites', {
  state: () => ({
    favCount: 0,
  }),
  actions: {
    // 从后端拉取当前会员收藏总数（未登录/失败为 0，不显示角标）
    async refreshFavCount() {
      try {
        const result: any = await reqFavCount()
        this.favCount = result?.code === 200 ? Number(result.data || 0) : 0
      } catch {
        this.favCount = 0
      }
    },
  },
})
