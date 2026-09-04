import { request } from '@/utils/request'

enum API {
  SECKILL_CURRENT_URL = '/seckill/current',
  SECKILL_SESSIONS_URL = '/seckill/sessions',
  SECKILL_SKU_URL = '/seckill/sku',
  SECKILL_KILL_URL = '/seckill/kill',
}

// 当前可参与秒杀的商品列表
export const reqCurrentSeckill = () =>
  request.get<any, any>(API.SECKILL_CURRENT_URL)

// 分场次秒杀商品：live=正在秒杀 / upcoming=预约秒杀 / history=历史秒杀
export const reqSeckillSessions = () =>
  request.get<any, any>(API.SECKILL_SESSIONS_URL)

// 根据 skuId 查询秒杀信息
export const reqSeckillSkuInfo = (skuId: string | number) =>
  request.get<any, any>(`${API.SECKILL_SKU_URL}/${skuId}`)

// 秒杀下单
export const reqSeckillKill = (params: {
  killId: string
  key: string
  num: number
}) => request.post<any, any>(API.SECKILL_KILL_URL, null, { params })
