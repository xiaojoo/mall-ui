import { request } from '@/utils/request'

enum API {
  FAV_LIST_URL = '/member/membercollectspu/list',
  FAV_COUNT_URL = '/member/membercollectspu/count',
  FAV_STATUS_URL = '/member/membercollectspu/status',
  FAV_SAVE_URL = '/member/membercollectspu/save',
  FAV_DELETE_URL = '/member/membercollectspu/delete',
  FAV_DELETE_BY_SPU_URL = '/member/membercollectspu/deleteBySpu',
}

// 当前会员收藏列表（后端聚合商品名称/主图/价格/分类）
export const reqFavList = () => request.get<any, any>(API.FAV_LIST_URL)

// 当前会员收藏数量（Header 角标）
export const reqFavCount = () => request.get<any, any>(API.FAV_COUNT_URL)

// 当前会员是否已收藏该 SPU（详情页收藏按钮状态）
export const reqFavStatus = (spuId: number | string) =>
  request.get<any, any>(`${API.FAV_STATUS_URL}/${spuId}`)

// 添加收藏（幂等；名称/主图缺省时后端从商品服务补齐，skuParams 为所选商品参数 JSON）
export const reqFavSave = (data: {
  spuId: number | string
  spuName?: string
  spuImg?: string
  skuParams?: string
}) => request.post<any, any>(API.FAV_SAVE_URL, data)

// 批量取消收藏（按收藏记录 id）
export const reqFavDelete = (ids: Array<number | string>) =>
  request.post<any, any>(API.FAV_DELETE_URL, ids)

// 按 spuId 取消收藏（详情页收藏按钮反选）
export const reqFavDeleteBySpu = (spuId: number | string) =>
  request.post<any, any>(API.FAV_DELETE_BY_SPU_URL, { spuId })
