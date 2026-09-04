import { request } from '@/utils/request'

enum API {
  CATEGORY_TREE_URL = '/product/category/tree',
}

// 获取分类树数据
export const reqCategoryTree = () =>
  request.get<any, any>(API.CATEGORY_TREE_URL)
