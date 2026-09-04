import { request } from '@/utils/request'

enum API {
  PRODUCT_HOME_URL = '/product/home',
  PRODUCT_CATALOG_URL = '/product/catalog',
  PRODUCT_DETAIL_URL = '/product/detail',
  CATEGORY_TREE_URL = '/product/category/tree',
  ATTRGROUP_WITHATTR_URL = '/product/attrgroup',
}

// 商城首页数据
export const reqProductHome = () => request.get<any, any>(API.PRODUCT_HOME_URL)

// 首页三级分类树
export const reqCatalog = () => request.get<any, any>(API.PRODUCT_CATALOG_URL)

// 商品详情
export const reqProductDetail = (skuId: string | number) =>
  request.get<any, any>(`${API.PRODUCT_DETAIL_URL}/${skuId}`)

// 分类属性分组（含属性）—— 规格参数全量，用于商品详情展示
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reqAttrGroupWithAttr = (catelogId: number | string) =>
  request.get<any, any>(`${API.ATTRGROUP_WITHATTR_URL}/${catelogId}/withattr`)

// 商品评价列表（pms_spu_comment）
export const reqCommentList = (params: Record<string, unknown> = {}) =>
  request.get<any, any>('/product/spucomment/list', { params })

// 发表评价
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reqCommentSave = (data: Record<string, unknown>) =>
  request.post<any, any>('/product/spucomment/save', data)

// 更新评价
export const reqCommentUpdate = (data: Record<string, unknown>) =>
  request.post<any, any>('/product/spucomment/update', data)

// 删除评价
export const reqCommentDelete = (ids: Array<number | string>) =>
  request.post<any, any>('/product/spucomment/delete', ids)

// 举报评论（pms_spu_comment_report）
export const reqCommentReportSave = (data: Record<string, unknown>) =>
  request.post<any, any>('/product/spucommentreport/save', data)

// 当前会员是否可评价该商品（已购买且支付成功）
export const reqCommentPaidCheck = (skuId: number | string) =>
  request.get<any, any>('/product/comment/paidCheck', {
    params: { skuId },
  })

// Minio 图片上传（网关 /api/file → mall-third-party MinioController /file/upload）
export const reqUploadImage = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return request.post<any, any>('/file/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 分类树（含子分类）
export const reqCategoryTree = () =>
  request.get<any, any>(API.CATEGORY_TREE_URL)
