// 用户登录请求数据类型
export interface LoginFormData {
  username: string
  password: string
  captchaKey?: string
  captchaCode?: string
}

// 用户注册请求数据类型
export interface RegisterFormData {
  username: string
  mobile: string
  password: string
  code: string
  captchaKey?: string
  captchaCode?: string
}

// 后端统一返回结构 Result<T>
export interface ResultData<T = unknown> {
  code: number
  message: string
  data: T
}

// 会员信息数据类型（登录返回，id 即登录凭证 token）
export interface UserInfo {
  id: number
  userId?: number
  username: string
  nickname?: string
  mobile: string
}

// 登录/注册/用户信息响应统一使用 ResultData
export type LoginResponseData = ResultData<UserInfo>
export type RegisterResponseData = ResultData<null>
export type UserInfoResponseData = ResultData<UserInfo>
