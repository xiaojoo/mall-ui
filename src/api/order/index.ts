import { request } from '@/utils/request'

enum API {
  ORDER_LIST_URL = '/order/list',
  ORDER_LIST_WITH_ITEM_URL = '/order/listWithItem',
  ORDER_DETAIL_URL = '/order',
  ORDER_CONFIRM_URL = '/order/confirm',
  ORDER_SUBMIT_URL = '/order/submit',
  ORDER_PAY_FORM_URL = '/order/pay/form',
  ORDER_PAY_QUERY_URL = '/order/pay/query',
  ORDER_CANCEL_URL = '/order/cancel',
  ORDER_REFUND_APPLY_URL = '/order/refund/apply',
  ORDER_FARE_URL = '/ware/wareinfo/fare',
}

// 订单分页列表
export const reqOrderList = (page = 1, limit = 10) =>
  request.get<any, any>(API.ORDER_LIST_URL, { params: { page, limit } })

// 会员订单列表（含商品明细；afterSale=1 只看售后中订单）
export const reqOrderListWithItem = (
  page = 1,
  limit = 10,
  status?: number | '',
  afterSale?: 0 | 1,
) =>
  request.get<any, any>(API.ORDER_LIST_WITH_ITEM_URL, {
    params: {
      page,
      limit,
      ...(status !== '' && status !== undefined ? { status } : {}),
      ...(afterSale ? { afterSale } : {}),
    },
  })

// 订单详情
// 按订单号查询详情（订单 + 商品明细 + 支付信息）
export const reqOrderDetail = (orderSn: string) =>
  request.get<any, any>(`${API.ORDER_DETAIL_URL}/detail/${orderSn}`)

// 删除订单（软删除）
export const reqDeleteOrder = (orderSn: string) =>
  request.post<any, any>(`${API.ORDER_DETAIL_URL}/delete/${orderSn}`)

// 确认订单（立即购买直购模式可传 items，不传则读购物车勾选项）
export const reqOrderConfirm = (data: Record<string, unknown> = {}) =>
  request.post<any, any>(API.ORDER_CONFIRM_URL, data)

// 提交订单
export const reqSubmitOrder = (data: Record<string, unknown>) =>
  request.post<any, any>(API.ORDER_SUBMIT_URL, data)

// 支付宝支付表单
export const reqPayForm = (orderSn: string) =>
  request.post<any, any>(API.ORDER_PAY_FORM_URL, null, { params: { orderSn } })

// 主动查询/确认支付结果（支付宝异步通知丢失时兜底，返回订单状态码，1=已付款）
export const reqPayQuery = (orderSn: string) =>
  request.post<any, any>(API.ORDER_PAY_QUERY_URL, null, { params: { orderSn } })

// 取消订单（仅待付款订单可取消）
export const reqCancelOrder = (orderSn: string) =>
  request.post<any, any>(API.ORDER_CANCEL_URL, null, { params: { orderSn } })

// 申请退款（已付款订单）
export const reqRefundApply = (data: {
  orderSn: string
  reason: string
  description?: string
}) => request.post<any, any>(API.ORDER_REFUND_APPLY_URL, data)

// 确认收货（已付款订单直接完成）
export const reqReceiveOrder = (orderSn: string) =>
  request.post<any, any>('/order/receive', null, { params: { orderSn } })

// 查询地址运费（切换收货地址时重算）
export const reqFare = (addrId: number | string) =>
  request.get<any, any>(API.ORDER_FARE_URL, { params: { addrId } })
