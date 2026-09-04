import { request } from '@/utils/request'

enum API {
  MEMBER_COUPON_LIST_URL = '/coupon/coupon/member/list',
  COUPON_RECEIVE_URL = '/coupon/coupon/member/receive',
}

// C端-可领取优惠券列表
export const reqMemberCouponList = () =>
  request.get<any, any>(API.MEMBER_COUPON_LIST_URL)

// C端-领取优惠券
export const reqReceiveCoupon = (couponId: number) =>
  request.post<any, any>(`${API.COUPON_RECEIVE_URL}/${couponId}`)

// C端-结算页可用优惠券（当前会员已领取未使用 + 门槛满足 + 适用范围匹配）
export const reqMemberUsableCoupon = (params: Record<string, unknown>) =>
  request.get<any, any>('/coupon/coupon/member/usable', { params })

// C端-店铺优惠券列表（该店铺已发布且在领取窗口内的券，带 token 时标记已领取）
export const reqShopCouponList = (brandId: number | string) =>
  request.get<any, any>('/coupon/coupon/shop/list', {
    params: { brandId },
  })
