import axios from 'axios'
// 全局提示改用 @/utils/message
// 引入用户相关仓库
import useUserStore from '@/store/modules/user.ts'

// 创建 Axios 实例
export const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/',
  timeout: 5000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.token = userStore.token
    }
    // 在请求头中添加通用信息（如 token 等）
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return Promise.resolve(response.data)
    }
    return Promise.reject(response.data)
  },
  (error) => {
    const status = error.response?.status || 0 // 状态码
    const message = getErrorMessage(status, error.response?.data) // 获取错误信息
    // ElMessage({ type: 'error', message }) // 显示错误消息
    // return Promise.reject(error)
    return Promise.reject(new Error(message))
  },
)

// 定义状态码类型
type StatusCode = 400 | 401 | 403 | 404 | 429 | 500 | 502 | 503 | number

// 定义返回数据类型
interface ResponseData {
  message?: string // 错误消息
  [key: string]: any // 其他字段
}

// 通用错误消息处理函数
function getErrorMessage(status: StatusCode, data: ResponseData = {}): string {
  const defaultMessage = '请求失败，请稍后重试' // 默认消息

  // 状态码与消息的映射表
  const errorMessages: Record<StatusCode, string> = {
    400: '请求参数错误',
    401: '未授权，请登录',
    403: '拒绝访问，权限不足',
    404: '请求资源未找到',
    429: '请求过于频繁，请稍后重试',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用，请稍后再试',
  }

  // 如果映射表中有对应消息，返回该消息
  if (errorMessages[status]) {
    return errorMessages[status]
  }

  // 优先返回服务器返回的消息，否则返回默认消息
  return data?.message || defaultMessage
}
