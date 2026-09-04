import { defineStore } from 'pinia'
// 引入接口
import { reqLogin, reqUserInfo, reqLogOut } from '@/api/user'
// 引入数据类型
import type { LoginFormData } from '@/api/user/type'
import type { UserState } from '@/store/modules/types/type'
// 引入本地存储
import { REMOVE_TOKEN, GET_TOKEN, SET_TOKEN } from '@/utils/token'

const useUserStore = defineStore('User', {
  // 数据存储
  state: (): UserState => {
    return {
      token: GET_TOKEN() || null,
      username: '',
      avatar: '',
    }
  },
  // 异步、逻辑处理
  actions: {
    // 用户登录的方法（后端返回会员信息 + data.token 会员 JWT；兼容旧版 data.id）
    async userLogin(data: LoginFormData) {
      const result: any = await reqLogin(data)
      if (result.code === 200) {
        this.token = String(result.data?.token ?? result.data?.id ?? '')
        this.username =
          result.data?.nickname ||
          result.data?.username ||
          result.data?.mobile ||
          data.username
        // 本地持久化 token
        SET_TOKEN(this.token)
        return 'ok'
      } else {
        return Promise.reject(new Error(result.message || '登录失败'))
      }
    },

    // 获取会员信息方法
    async userInfo() {
      if (!this.token) return Promise.reject('未登录')
      const result: any = await reqUserInfo()
      if (result.code === 200) {
        this.username =
          result.data?.nickname ||
          result.data?.username ||
          result.data?.mobile ||
          this.username
        // 头像（微博登录等场景会员 header 字段为头像地址）
        this.avatar = result.data?.header || result.data?.avatar || this.avatar
        return 'ok'
      } else {
        return Promise.reject(new Error(result.message || '获取用户信息失败'))
      }
    },

    // 退出登录
    async userLogOut() {
      if (this.token) {
        await reqLogOut().catch(() => {})
      }
      this.token = ''
      this.username = ''
      this.avatar = ''
      REMOVE_TOKEN()
    },
  },
  getters: {},
})

export default useUserStore
