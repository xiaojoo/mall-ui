import { request } from '@/utils/request'

enum API {
  CART_LIST_URL = '/cart/list',
  CART_DETAIL_URL = '/cart/detail',
  CART_ADD_URL = '/cart/add',
  CART_UPDATE_URL = '/cart/update',
  CART_CHECK_URL = '/cart/check',
  CART_DELETE_URL = '/cart/delete',
  CART_CLEAR_URL = '/cart/clear',
}

export interface CartRequest {
  skuId: string | number
  num?: string | number
  checked?: string | number
  // 规格（如 "颜色:黑色;版本:256GB"，详情页加购传入，其他页面缺省由后端默认）
  skuAttrValues?: string
}

// 购物车列表
export const reqCartList = () => request.get<any, any>(API.CART_LIST_URL)

// 购物车详情
export const reqCartDetail = () => request.get<any, any>(API.CART_DETAIL_URL)

// 添加商品到购物车
export const reqAddToCart = (data: CartRequest) => {
  const form = new URLSearchParams()
  form.append('skuId', String(data.skuId))
  if (data.num !== undefined) form.append('num', String(data.num))
  if (data.skuAttrValues) form.append('skuAttrValues', data.skuAttrValues)
  return request.post<any, any>(API.CART_ADD_URL, form)
}

// 更新购物车商品数量/规格
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reqUpdateCart = (data: CartRequest) => {
  const form = new URLSearchParams()
  form.append('skuId', String(data.skuId))
  if (data.num !== undefined) form.append('num', String(data.num))
  if (data.skuAttrValues) form.append('skuAttrValues', data.skuAttrValues)
  return request.post<any, any>(API.CART_UPDATE_URL, form)
}

// 选中/取消选中购物车商品
export const reqCheckCart = (data: CartRequest) => {
  const form = new URLSearchParams()
  form.append('skuId', String(data.skuId))
  if (data.checked !== undefined) form.append('checked', String(data.checked))
  return request.post<any, any>(API.CART_CHECK_URL, form)
}

// 删除购物车商品
export const reqDeleteCart = (skuId: string | number) =>
  request.post<any, any>(`${API.CART_DELETE_URL}/${skuId}`)

// 清空购物车
export const reqClearCart = () => request.post<any, any>(API.CART_CLEAR_URL)
