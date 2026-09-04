import { request } from '@/utils/request'

enum API {
  SEARCH_SKU_URL = '/search/sku',
}

export interface SearchParams {
  keyword?: string
  catalog3Id?: string | number
  brandId?: string | number[]
  sort?: string
  skuPrice?: string
  attrs?: string[]
  pageNum?: number
}

// 搜索商品
// 数组参数序列化为重复 key（brandId=1&brandId=2、attrs=a&attrs=b），与后端 List 参数绑定一致
export const reqSearchSku = (params: SearchParams) =>
  request.get<any, any>(API.SEARCH_SKU_URL, {
    params,
    paramsSerializer: { indexes: null },
  })
