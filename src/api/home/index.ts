import { request } from '@/utils/request'

enum API {
  HOME_URL = '/product/home',
  HOME_NAV_URL = '/coupon/homenav/list',
}

// 商城首页数据（分类/轮播/热门/秒杀）
export const reqHomeData = () => request.get<any, any>(API.HOME_URL)

// 首页快捷导航（cat-row：全息设备 … 新品首发，mall-coupon 管理）
export const reqHomeNavList = () => request.get<any, any>(API.HOME_NAV_URL)
