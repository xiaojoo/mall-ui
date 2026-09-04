import { reqSeckillKill } from '@/api/seckill'
import { reqOrderDetail } from '@/api/order'

/**
 * 淘宝式排队秒杀：kill 只扣库存 + 返回订单号（订单由 MQ 消费端异步落库），
 * 前端轮询订单详情直到订单存在（排队成功），返回 orderSn；超时返回 null。
 *
 * @param opts.killId    秒杀活动商品 ID（promotionSessionId-skuId）
 * @param opts.key       秒杀随机码
 * @param opts.num       秒杀数量，默认 1
 * @param opts.onQueue   进入排队状态回调（用于按钮/文案切换）
 * @param opts.timeoutMs 排队等待上限，默认 20s
 * @returns 订单号（成功）或 null（排队超时）
 * @throws   kill 接口失败（未抢到/已抢购/未开始等），message 可直接提示
 */
export async function seckillKillWithQueue(opts: {
  killId: string
  key: string
  num?: number
  onQueue?: () => void
  timeoutMs?: number
}): Promise<string | null> {
  const res: any = await reqSeckillKill({
    killId: opts.killId,
    key: opts.key,
    num: opts.num ?? 1,
  })
  if (res?.code !== 200 || !res.data) {
    throw new Error(res?.message || res?.msg || '秒杀失败，稍后再试')
  }
  const orderSn = String(res.data)
  opts.onQueue?.()

  // 轮询等待异步建单（kill 返回 200 即已扣库存、进入排队）
  const deadline = Date.now() + (opts.timeoutMs ?? 20000)
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 1000))
    try {
      const d: any = await reqOrderDetail(orderSn)
      if (d?.code === 200 && d.data?.order) return orderSn
    } catch {
      /* 单次查询失败继续等 */
    }
  }
  return null
}
