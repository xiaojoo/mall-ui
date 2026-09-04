import { request } from '@/utils/request'

// 店铺列表项（mall-web 商家账号发布的品牌，showStatus=1）
export interface ShopSummary {
  brandId: number
  shopName: string
  logo: string
  productCount: number
}

// 店铺商品
export interface ShopProduct {
  spuId: number
  skuId: number
  spuName: string
  img: string
  price: number
  sales: number
  catalogId: number
  catalogName: string
  rating: number | null
}

// 店铺详情
export interface ShopDetail {
  brandId: number
  shopName: string
  logo: string
  descript: string
  productCount: number
  categoryCount: number
  totalSales: number
  rating: number | null
  products: ShopProduct[]
}

// 店铺列表（默认店铺/店铺切换）
export const reqShopList = () => request.get<any, any>('/product/shop/list')

// 店铺详情（店铺信息 + 在售商品）
export const reqShopDetail = (brandId: number | string) =>
  request.get<any, any>(`/product/shop/${brandId}`)
