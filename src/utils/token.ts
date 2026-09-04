// 商城前端专属键：与 mall-web（后台，同源 5173 时）隔离，避免读到后台 UUID token
const TOKEN_KEY = 'MALL_UI_TOKEN'

export const SET_TOKEN = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const GET_TOKEN = () => {
  return localStorage.getItem(TOKEN_KEY)
}

// 本地存储删除TOKEN
export const REMOVE_TOKEN = () => {
  localStorage.removeItem(TOKEN_KEY)
}
