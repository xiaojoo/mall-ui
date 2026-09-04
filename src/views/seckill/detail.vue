<template>
  <div class="nb-seckill-detail">
    <div class="wrap">
      <div class="crumbs">
        <router-link to="/">Nebula Home</router-link>
        <span class="sep">/</span>
        <router-link to="/seckill">量子秒杀</router-link>
        <span class="sep">/</span>
        <span class="cur">秒杀详情</span>
      </div>

      <!-- ===== 顶部：图片 + 秒杀信息 ===== -->
      <div class="sd-main">
        <div class="sd-img">
          <img
            v-if="mainImg"
            :src="mainImg"
            :alt="skuName"
            class="sd-img-real"
          />
          <div v-else class="ph">◈</div>
          <span class="sd-tag" :class="stateCls">{{ stateLabel }}</span>
        </div>
        <div class="sd-info">
          <h2>{{ skuName }}</h2>
          <div v-if="skuSubtitle" class="sd-sub">{{ skuSubtitle }}</div>
          <div class="sd-price-row">
            <span class="sd-price">
              <small>¥</small>
              {{ fmt(seckillPrice) }}
            </span>
            <span v-if="oldPrice" class="sd-old">¥{{ fmt(oldPrice) }}</span>
            <span v-if="discText" class="sd-disc">{{ discText }}</span>
          </div>
          <div class="sd-meta">
            场次库存
            <b>{{ stock ?? '—' }}</b>
            件 · 每人限购
            <b>{{ limit }}</b>
            件
          </div>
          <div class="sd-count">
            <template v-if="state === 'soon'">
              距开始
              <b>{{ countdown }}</b>
            </template>
            <template v-else-if="state === 'live'">
              距结束
              <b>{{ countdown }}</b>
            </template>
            <template v-else-if="state === 'sold'">已抢完</template>
            <template v-else-if="state === 'off'">已下架</template>
            <template v-else>本场已结束</template>
          </div>
          <button
            class="sd-btn"
            :class="state"
            :disabled="state !== 'live' || queueing"
            @click="doKill"
          >
            {{ btnText }}
          </button>
        </div>
      </div>

      <!-- ===== 销售属性（当前 SKU 的取值） ===== -->
      <section v-if="saleAttrs.length" class="sd-sec">
        <div class="sd-sec-head">
          <span class="bar"></span>
          <h3>
            销售属性
            <small>SALE ATTRS</small>
          </h3>
        </div>
        <div class="sd-attrs">
          <div v-for="a in saleAttrs" :key="a.name" class="sd-attr">
            <span class="sd-attr-name">{{ a.name }}</span>
            <span class="sd-attr-val">{{ a.value }}</span>
          </div>
        </div>
      </section>

      <!-- ===== 规格参数 ===== -->
      <section v-if="specGroups.length" class="sd-sec">
        <div class="sd-sec-head">
          <span class="bar"></span>
          <h3>
            规格参数
            <small>SPECIFICATIONS</small>
          </h3>
        </div>
        <div v-for="g in specGroups" :key="g.groupName" class="sd-group">
          <div class="sd-group-name">{{ g.groupName }}</div>
          <table class="sd-spec">
            <tbody>
              <tr v-for="a in g.attrs" :key="a.attrName">
                <td class="sd-spec-name">{{ a.attrName }}</td>
                <td class="sd-spec-val">{{ a.attrValue || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ===== 细节图 ===== -->
      <section v-if="detailImages.length" class="sd-sec">
        <div class="sd-sec-head">
          <span class="bar"></span>
          <h3>
            商品细节
            <small>DETAILS</small>
          </h3>
        </div>
        <div class="sd-detail-imgs">
          <img
            v-for="(u, i) in detailImages"
            :key="i"
            :src="u"
            :alt="`细节图${i + 1}`"
            class="sd-detail-img"
          />
        </div>
      </section>

      <div v-if="!loading && !skuName" class="sd-empty">
        秒杀商品不存在或已下架
        <router-link class="sd-empty-btn" to="/seckill">
          返回秒杀专场
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { reqProductDetail } from '@/api/product'
import { reqSeckillSkuInfo } from '@/api/seckill'
import { seckillKillWithQueue } from '@/utils/seckillQueue'
import useUserStore from '@/store/modules/user'
import message from '@/utils/message'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const skuId = computed(() => String(route.query.skuId || ''))

const loading = ref(true)
const queueing = ref(false)

// ===== 商品信息（详情接口） =====
const skuName = ref('')
const skuSubtitle = ref('')
const mainImg = ref('')
const detailImages = ref<string[]>([])
const saleAttrs = ref<Array<{ name: string; value: string }>>([])
const specGroups = ref<
  Array<{
    groupName: string
    attrs: Array<{ attrName: string; attrValue: string }>
  }>
>([])

// ===== 秒杀信息（秒杀接口） =====
const seckillPrice = ref(0)
const oldPrice = ref(0)
const stock = ref<number | null>(null)
const limit = ref(1)
const startTime = ref(0)
const endTime = ref(0)
const promotionSessionId = ref<string | number>('')
const randomCode = ref('')
const shelfStatus = ref(1)

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const fmt = (n: number | string | undefined) =>
  String(Math.round(Number(n || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const state = computed(() => {
  const t = now.value
  if (!startTime.value || !endTime.value) return 'end'
  if (t < startTime.value) return 'soon'
  if (t > endTime.value) return 'end'
  if (Number(promotionSessionId.value) === 0 && !randomCode.value) return 'end'
  if (Number(shelfStatus.value) === 0) return 'off'
  // 仅后端明确返回 stock=0 才算售罄（字段缺失不兜底，避免误报）
  if (stock.value != null && Number(stock.value) <= 0) return 'sold'
  return 'live'
})
const stateLabel = computed(() => {
  const map: Record<string, string> = {
    soon: '预约',
    live: '秒杀中',
    sold: '已抢完',
    off: '已下架',
    end: '已结束',
  }
  return map[state.value] || ''
})
const stateCls = computed(() => state.value)
const btnText = computed(() => {
  if (state.value === 'soon') return '预约'
  if (state.value === 'end') return '已结束'
  if (state.value === 'sold') return '已抢完'
  if (state.value === 'off') return '已下架'
  return queueing.value ? '排队中…' : '⚡ 立即抢购'
})

const discText = computed(() => {
  if (oldPrice.value <= 0 || seckillPrice.value <= 0) return ''
  const d = Math.round((1 - seckillPrice.value / oldPrice.value) * 100)
  return d > 0 ? `${d} 折起` : ''
})

function fmtCount(ms: number) {
  const sec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}
const countdown = computed(() => {
  const target = state.value === 'soon' ? startTime.value : endTime.value
  return target ? fmtCount(target - now.value) : '--:--'
})

async function loadData() {
  if (!skuId.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    // 1、秒杀信息（价格/库存/时间/随机码）
    const sk: any = await reqSeckillSkuInfo(skuId.value)
    if (sk?.code === 200 && sk.data) {
      const d = sk.data
      seckillPrice.value = Number(d.seckillPrice ?? 0)
      stock.value = d.stock != null ? Number(d.stock) : null
      limit.value = Number(d.seckillLimit ?? 1)
      startTime.value = Number(d.startTime ?? 0)
      endTime.value = Number(d.endTime ?? 0)
      promotionSessionId.value = d.promotionSessionId ?? ''
      randomCode.value = String(d.randomCode || '')
      shelfStatus.value = Number(d.shelfStatus ?? 1)
      oldPrice.value = Number(d.skuInfo?.price ?? 0)
      if (d.skuInfo?.skuTitle) skuName.value = String(d.skuInfo.skuTitle)
      else if (d.skuInfo?.skuName) skuName.value = String(d.skuInfo.skuName)
      if (d.skuInfo?.skuSubtitle)
        skuSubtitle.value = String(d.skuInfo.skuSubtitle)
      if (d.skuInfo?.skuDefaultImg && !mainImg.value)
        mainImg.value = String(d.skuInfo.skuDefaultImg)
    }
    // 2、商品详情（参数/细节图）
    const res: any = await reqProductDetail(skuId.value)
    if (res?.code === 200 && res.data) {
      const data = res.data
      const info = data.info || {}
      if (!skuName.value) {
        skuName.value = String(info.skuTitle || info.skuName || '')
      }
      if (!skuSubtitle.value && info.skuSubtitle)
        skuSubtitle.value = String(info.skuSubtitle)
      if (!oldPrice.value && info.price) oldPrice.value = Number(info.price)
      // 图片
      const imgs: any[] = data.images || []
      const urls = imgs.map((im: any) => im.imgUrl).filter(Boolean)
      mainImg.value = urls[0] || String(info.skuDefaultImg || '')
      // 销售属性：只保留当前 SKU 的取值（如机身颜色只显示本 SKU 的一个颜色，而非全部可选色）
      // 按 attrValue.skuIds 精确匹配当前 skuId；skuIds 缺失/为空时保守丢弃，
      // 避免把同 SPU 其他 SKU 的取值误展示出来
      const saleAttr: any[] = data.saleAttr || []
      const skuIdNum = String(Number(skuId.value))
      saleAttrs.value = saleAttr
        .map((a: any) => {
          const vals = (a.attrValues || [])
            .filter((v: any) => {
              const ids = String(v?.skuIds ?? '')
                .split(',')
                .map((s: string) => s.trim())
                .filter(Boolean)
              return ids.length > 0 && ids.includes(skuIdNum)
            })
            .map((v: any) => String(v?.attrValue ?? v ?? '').trim())
            .filter(Boolean)
          return {
            name: String(a.attrName || '').trim(),
            value: vals.join(' / '),
          }
        })
        .filter((a: any) => a.name && a.value)
      // 规格参数里的取值若对应某个销售属性（按 attrId 关联），只保留当前 SKU 的值：
      // 如 groupAttrs 里 机身颜色=“白色;黑色;蓝色” → 本 SKU 只显示“蓝色”
      const saleAttrMap = new Map<number, string>()
      for (const a of saleAttr) {
        const matched = (a.attrValues || []).find((v: any) => {
          const ids = String(v?.skuIds ?? '')
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
          return ids.includes(skuIdNum)
        })
        if (matched) {
          saleAttrMap.set(
            Number(a.attrId),
            String(matched?.attrValue ?? '').trim(),
          )
        }
      }
      // 细节图：desc.decript 逗号拼接，兼容 <img> HTML
      const decript = String(data.desc?.decript || '')
      if (decript) {
        const htmlImgs = Array.from(
          decript.matchAll(/<img[^>]+src=["']([^"']+)["']/gi),
        ).map((m) => m[1])
        detailImages.value =
          htmlImgs.length > 0
            ? htmlImgs
            : decript
                .split(',')
                .map((s: string) => s.trim())
                .filter(Boolean)
      }
      // 规格参数
      const groups: any[] = data.groupAttrs || []
      specGroups.value = groups
        .map((g: any) => ({
          groupName: String(g.groupName || '').trim(),
          attrs: (g.attrs || [])
            .map((a: any) => ({
              attrName: String(a.attrName || ''),
              // 该属性同时是销售属性时，用当前 SKU 的取值覆盖全量值
              attrValue:
                saleAttrMap.get(Number(a.attrId)) ?? String(a.attrValue ?? ''),
            }))
            .filter((a: any) => a.attrName),
        }))
        .filter((g: any) => g.groupName && g.attrs.length > 0)
    }
  } catch (e) {
    message.error((e as Error).message || '秒杀详情加载失败')
  } finally {
    loading.value = false
  }
}

// 立即抢购：排队式（kill 扣库存 + 异步建单，轮询到订单落库跳收银台）
async function doKill() {
  if (!userStore.token) {
    router.push({
      path: '/login',
      query: { redirect: route.fullPath },
    })
    return
  }
  if (queueing.value) return
  if (state.value !== 'live') {
    message.info(stateLabel.value || '当前不可抢购')
    return
  }
  const killId = `${promotionSessionId.value}-${skuId.value}`
  if (!killId || !randomCode.value) {
    message.info('秒杀未开始或已结束')
    return
  }
  queueing.value = true
  try {
    const orderSn = await seckillKillWithQueue({
      killId,
      key: randomCode.value,
      num: 1,
    })
    if (orderSn) {
      message.success('⚡ 抢购成功！正在跳转收银台…')
      // 带上商品信息：秒杀单 MQ 异步落库，收银台明细可能未补全，由 pay 页兜底展示
      router.push({
        path: '/pay',
        query: {
          orderSn,
          skuId: String(skuId.value),
          name: skuName.value,
          image: mainImg.value,
          price: String(seckillPrice.value || ''),
        },
      })
    } else {
      message.error('手慢了，抢购失败或订单生成超时')
      loadData() // 刷新库存/状态
    }
  } catch (e) {
    message.error((e as Error).message || '秒杀失败，稍后再试')
  } finally {
    queueing.value = false
  }
}

onMounted(() => {
  loadData()
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.crumbs {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 0 0;
  margin-left: 15px;
  font-size: 13px;
  color: var(--dim);
  letter-spacing: 1px;
}
.crumbs a {
  color: var(--cyan);
  text-decoration: none;
  transition: 0.2s;
}
.crumbs a:hover {
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.7);
}
.crumbs .sep {
  color: var(--dim);
  opacity: 0.6;
}
.crumbs .cur {
  color: var(--txt);
}

/* ===== 主区 ===== */
.sd-main {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 36px;
  margin-top: 22px;
  padding: 28px;
  border: 1px solid rgba(255, 46, 196, 0.25);
  border-radius: 18px;
  background: var(--panel);
  backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(255, 46, 196, 0.08);
}
.sd-img {
  position: relative;
  aspect-ratio: 1;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    circle at 50% 40%,
    rgba(255, 46, 196, 0.1),
    rgba(6, 10, 26, 0.9) 75%
  );
}
.sd-img-real {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.sd-img .ph {
  font-size: 64px;
  color: var(--magenta);
  text-shadow: 0 0 20px rgba(255, 46, 196, 0.7);
}
.sd-tag {
  position: absolute;
  top: 14px;
  left: 14px;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  letter-spacing: 2px;
  padding: 5px 14px;
  border-radius: 12px;
  color: #fff;
}
.sd-tag.live {
  background: linear-gradient(90deg, #ff2ec4, #ff6b3d);
  box-shadow: 0 0 14px rgba(255, 46, 196, 0.6);
  animation: blink 1.2s infinite;
}
.sd-tag.soon {
  background: rgba(255, 197, 61, 0.85);
  color: #02101a;
}
.sd-tag.sold,
.sd-tag.off,
.sd-tag.end {
  background: rgba(143, 163, 200, 0.35);
  color: var(--dim);
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.sd-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.sd-info h2 {
  font-family: var(--font-h);
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 1px;
  line-height: 1.35;
  color: var(--txt);
}
.sd-sub {
  font-family: var(--font-m);
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 2px;
  margin-top: 8px;
}
.sd-price-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-top: 22px;
}
.sd-price {
  font-family: var(--font-h);
  font-size: 40px;
  font-weight: 900;
  color: var(--magenta);
  text-shadow: 0 0 18px rgba(255, 46, 196, 0.55);
}
.sd-price small {
  font-size: 18px;
  margin-right: 2px;
}
.sd-old {
  font-size: 14px;
  color: var(--dim);
  text-decoration: line-through;
}
.sd-disc {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: #02101a;
  background: linear-gradient(90deg, #ff2ec4, #ff6b3d);
  padding: 3px 10px;
  border-radius: 9px;
  font-weight: 700;
}
.sd-meta {
  font-family: var(--font-m);
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 1px;
  margin-top: 16px;
}
.sd-meta b {
  color: var(--cyan);
}
.sd-count {
  font-family: var(--font-m);
  font-size: 12px;
  color: var(--dim);
  margin-top: 8px;
  letter-spacing: 1px;
}
.sd-count b {
  color: var(--amber);
  font-size: 15px;
  letter-spacing: 2px;
}
.sd-btn {
  width: 260px;
  height: 52px;
  margin-top: 24px;
  border: none;
  border-radius: 13px;
  cursor: pointer;
  font-family: var(--font-h);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
  transition: 0.25s;
}
.sd-btn.live {
  background: linear-gradient(90deg, #ff2ec4, #ff6b3d);
  color: #02101a;
  box-shadow: 0 0 22px rgba(255, 46, 196, 0.5);
}
.sd-btn.live:hover:not(:disabled) {
  filter: brightness(1.15);
  box-shadow: 0 0 34px rgba(255, 46, 196, 0.85);
  transform: translateY(-2px);
}
.sd-btn.soon {
  background: rgba(255, 197, 61, 0.15);
  border: 1px solid rgba(255, 197, 61, 0.45);
  color: var(--amber);
  cursor: not-allowed;
}
.sd-btn.sold,
.sd-btn.off,
.sd-btn.end {
  background: rgba(143, 163, 200, 0.08);
  border: 1px solid rgba(143, 163, 200, 0.25);
  color: var(--dim);
  cursor: not-allowed;
}

/* ===== 信息区段 ===== */
.sd-sec {
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 18px;
  background: var(--panel);
  backdrop-filter: blur(10px);
  margin-top: 18px;
  overflow: hidden;
}
.sd-sec-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 24px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  background: linear-gradient(
    90deg,
    rgba(0, 240, 255, 0.06),
    rgba(168, 85, 247, 0.04)
  );
}
.sd-sec-head .bar {
  width: 4px;
  height: 16px;
  border-radius: 3px;
  background: linear-gradient(180deg, #00f0ff, #a855f7);
  box-shadow: 0 0 8px var(--cyan);
}
.sd-sec-head h3 {
  font-family: var(--font-h);
  font-size: 15px;
  letter-spacing: 2px;
  color: #fff;
}
.sd-sec-head h3 small {
  font-family: var(--font-m);
  font-size: 9px;
  color: var(--dim);
  letter-spacing: 3px;
  font-weight: 400;
  margin-left: 8px;
}

/* 销售属性 */
.sd-attrs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 20px 24px;
}
.sd-attr {
  border: 1px solid rgba(0, 240, 255, 0.14);
  border-radius: 12px;
  padding: 14px 16px;
  background: rgba(0, 240, 255, 0.03);
}
.sd-attr-name {
  display: block;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
}
.sd-attr-val {
  display: block;
  margin-top: 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--cyan);
}

/* 规格参数 */
.sd-group {
  padding: 14px 24px 4px;
}
.sd-group-name {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--magenta);
  letter-spacing: 2px;
  margin-bottom: 8px;
}
.sd-spec {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 14px;
}
.sd-spec td {
  border: 1px solid rgba(0, 240, 255, 0.08);
  padding: 9px 14px;
  font-size: 13px;
}
.sd-spec-name {
  width: 180px;
  color: var(--dim);
  background: rgba(0, 240, 255, 0.03);
}
.sd-spec-val {
  color: var(--txt);
}

/* 细节图 */
.sd-detail-imgs {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.sd-detail-img {
  width: 100%;
  border-radius: 12px;
  display: block;
}

/* 空态 */
.sd-empty {
  text-align: center;
  padding: 80px 20px;
  color: var(--dim);
  border: 1px dashed rgba(255, 46, 196, 0.3);
  border-radius: 18px;
  margin-top: 18px;
}
.sd-empty-btn {
  display: inline-block;
  margin-left: 12px;
  padding: 8px 22px;
  border-radius: 999px;
  border: 1px solid rgba(0, 240, 255, 0.45);
  color: var(--cyan);
  font-size: 13px;
  text-decoration: none;
}

@media (max-width: 900px) {
  .sd-main {
    grid-template-columns: 1fr;
  }
  .sd-attrs {
    grid-template-columns: 1fr;
  }
}
</style>
