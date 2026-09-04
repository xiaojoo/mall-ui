import { request } from '@/utils/request'

enum API {
  FOOTER_URL = '/product/footer',
}

// 页脚链接（mall-product 聚合 mall-coupon sms_footer_link）
export const reqFooterLinks = () => request.get<any, any>(API.FOOTER_URL)
