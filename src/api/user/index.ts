import { request } from '@/utils/request'
import type {
  LoginFormData,
  LoginResponseData,
  RegisterFormData,
  RegisterResponseData,
  UserInfoResponseData,
} from './type'

enum API {
  LOGIN_URL = '/auth/login',
  REGISTER_URL = '/auth/register',
  USERINFO_URL = '/member/info',
  LOGOUT_URL = '/auth/logout',
  SMS_CODE_URL = '/sms/sendCode',
  CAPTCHA_URL = '/auth/captcha',
  ADDRESS_LIST_URL = '/member/memberreceiveaddress/list',
  ADDRESS_SAVE_URL = '/member/memberreceiveaddress/save',
  ADDRESS_UPDATE_URL = '/member/memberreceiveaddress/update',
  ADDRESS_DELETE_URL = '/member/memberreceiveaddress/delete',
}

// 获取图形验证码（key + base64 图片）
export const reqCaptcha = () => request.get<any, any>(API.CAPTCHA_URL)

// 用户登录接口（后端按手机号登录会员，username 即手机号）
export const reqLogin = (data: LoginFormData) =>
  request.post<any, LoginResponseData>(API.LOGIN_URL, {
    mobile: data.username,
    password: data.password,
    captchaKey: data.captchaKey,
    captchaCode: data.captchaCode,
  })

// 用户注册接口（携带短信验证码，后端 Redis 比对）
export const reqRegister = (data: RegisterFormData) =>
  request.post<any, RegisterResponseData>(API.REGISTER_URL, {
    userName: data.mobile,
    mobile: data.mobile,
    phone: data.mobile,
    password: data.password,
    code: data.code,
    captchaKey: data.captchaKey,
    captchaCode: data.captchaCode,
  })

// 获取会员信息接口（token 由请求拦截器自动放入 header）
export const reqUserInfo = () =>
  request.get<any, UserInfoResponseData>(API.USERINFO_URL)

// 微信登录授权链接（thirdparty 生成，跳转公众号网页授权）
export const reqWechatLoginUrl = () =>
  request.get<any, any>('/thirdparty/wx/portal/public/loginUrl')

// 微信扫码登录：获取二维码（sessionId 为场景值）
export const reqWxQrCode = (sessionId: number) =>
  request.get<any, any>('/thirdparty/wx/portal/public/qrCode', {
    params: { sessionId },
  })

// 微信扫码登录：轮询登录结果
export const reqWxLoginStatus = (sessionId: number) =>
  request.get<any, any>('/thirdparty/wx/portal/public/loginStatus', {
    params: { sessionId },
  })

// 更新会员信息（昵称/头像/性别/生日/签名等）
export const reqUpdateUserInfo = (data: Record<string, unknown>) =>
  request.post<any, any>('/member/update', data)

// 个人中心：按当前登录会员查询收货地址（token 由拦截器携带）
export const reqProfileAddressList = () =>
  request.get<any, any>('/member/address/list')

// 个人中心：新增收货地址
export const reqProfileAddressAdd = (data: Record<string, unknown>) =>
  request.post<any, any>('/member/address', data)

// 个人中心：更新收货地址
export const reqProfileAddressUpdate = (data: Record<string, unknown>) =>
  request.post<any, any>('/member/address/update', data)

// 个人中心：删除收货地址
export const reqProfileAddressDelete = (id: number | string) =>
  request.post<any, any>(`/member/address/${id}`)

// 个人中心：设为默认地址
export const reqProfileAddressSetDefault = (id: number | string) =>
  request.post<any, any>(`/member/address/default/${id}`)

// 用户退出登录接口（登录态由前端清除）
export const reqLogOut = () => request.get<any, any>(API.LOGOUT_URL)

// 发送短信验证码
export const reqSendSmsCode = (phone: string) =>
  request.get<any, any>(API.SMS_CODE_URL, { params: { phone } })

// OSS 直传签名（头像上传等）
export const reqOssPolicy = () =>
  request.get<any, any>('/thirdparty/oss/policy', {
    params: { t: Date.now() },
  })

// 收货地址列表
export const reqAddressList = (page = 1, limit = 10) =>
  request.get<any, any>(API.ADDRESS_LIST_URL, { params: { page, limit } })

// 收货地址列表（当前登录会员，token 由拦截器携带）
export const reqMemberAddressList = () =>
  request.get<any, any>('/member/address/list')

// 新增收货地址（memberId 即登录 token）
export const reqAddressSave = (data: Record<string, unknown>) =>
  request.post<any, any>(API.ADDRESS_SAVE_URL, data)

// 修改收货地址
export const reqAddressUpdate = (data: Record<string, unknown>) =>
  request.post<any, any>(API.ADDRESS_UPDATE_URL, data)

// 删除收货地址
export const reqAddressDelete = (ids: number[]) =>
  request.post<any, any>(API.ADDRESS_DELETE_URL, ids)
