<template>
  <div class="nb-seckill">
    <!-- 页面搜索 header：搜索秒杀商品 -->
    <PageSearchHeader v-model="skKw" placeholder="搜索秒杀商品…" />
    <div class="wrap">
      <div class="crumbs">
        <router-link to="/">Nebula Home</router-link>
        <span class="sep">/</span>
        <span class="cur">量子秒杀</span>
      </div>
      <div class="page-head sec-head">
        <div class="sec-title">
          <h2>
            ⚡ 量子秒杀
            <small>QUANTUM SECKILL · 限时抢购 · 全场低至 1 折</small>
          </h2>
        </div>
      </div>

      <!-- ===== 场次页签：正在秒杀 / 预约秒杀 / 历史秒杀 ===== -->
      <div class="sk-tabs">
        <button
          class="sk-tab"
          :class="{ active: activeTab === 'live' }"
          @click="activeTab = 'live'"
        >
          正在秒杀
          <em>{{ liveSkus.length }}</em>
        </button>
        <button
          class="sk-tab"
          :class="{ active: activeTab === 'upcoming' }"
          @click="activeTab = 'upcoming'"
        >
          预约秒杀
          <em>{{ upcomingSkus.length }}</em>
        </button>
        <button
          class="sk-tab"
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          历史秒杀
          <em>{{ historySkus.length }}</em>
        </button>
      </div>

      <!-- ===== 场次状态条 ===== -->
      <div class="sk-banner" :class="bannerState">
        <div class="sk-b-ic">⚡</div>
        <div class="sk-b-info">
          <div class="sk-b-t">{{ bannerText }}</div>
          <div class="sk-b-s">{{ bannerSub }}</div>
        </div>
        <div class="sk-b-count">
          <span class="lbl">本场倒计时</span>
          <span class="num">{{ countdownText }}</span>
        </div>
      </div>

      <!-- ===== 秒杀商品 ===== -->
      <div class="sk-grid">
        <div v-for="s in filteredSkus" :key="String(s.skuId)" class="sk-card">
          <div class="sk-img" @click="goDetail(s)">
            <img
              v-if="s.skuInfo?.skuDefaultImg"
              :src="s.skuInfo.skuDefaultImg"
              :alt="s.skuInfo.skuTitle || s.skuInfo.skuName"
            />
            <div v-else class="ph">◈</div>
            <span class="sk-tag" :class="skState(s).cls">
              {{ skState(s).label }}
            </span>
          </div>
          <div class="sk-info">
            <div class="sk-name" @click="goDetail(s)">
              {{ s.skuInfo?.skuTitle || s.skuInfo?.skuName || '量子商品' }}
            </div>
            <div class="sk-sub">
              {{ s.skuInfo?.skuSubtitle || '限时秒杀 · 手慢无' }}
            </div>
            <div class="sk-price-row">
              <span class="sk-price">
                <small>¥</small>
                {{ fmt(s.seckillPrice) }}
              </span>
              <span class="sk-old">¥{{ fmt(s.skuInfo?.price) }}</span>
              <span class="sk-disc">
                {{ discText(s) }}
              </span>
            </div>
            <div class="sk-meta">
              限购
              <b>{{ s.seckillLimit }}</b>
              件 · 场次库存
              <b>{{ s.seckillCount }}</b>
            </div>
            <div class="sk-count">
              <template v-if="skState(s).state === 'soon'">
                距开始
                <b>{{ fmtCount(s.startTime - now) }}</b>
              </template>
              <template v-else-if="skState(s).state === 'live'">
                距结束
                <b>{{ fmtCount(s.endTime - now) }}</b>
              </template>
              <template v-else>本场已结束</template>
            </div>
            <button
              class="sk-btn"
              :class="skState(s).state"
              :disabled="
                skState(s).state !== 'live' || queueingSkuId === String(s.skuId)
              "
              @click="doKill(s)"
            >
              {{
                skState(s).state === 'soon'
                  ? '预约'
                  : skState(s).state === 'end'
                    ? '已结束'
                    : skState(s).state === 'off'
                      ? '已下架'
                      : skState(s).state === 'sold'
                        ? '已抢完'
                        : queueingSkuId === String(s.skuId)
                          ? '排队中…'
                          : '⚡ 立即抢购'
              }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="!loading && filteredSkus.length === 0" class="sk-empty show">
        <div class="empty-orb"><span>⚡</span></div>
        <div class="empty-t">NO SIGNAL · 当前无秒杀场次</div>
        <div class="empty-s">秒杀活动尚未开始，去商品库逛逛吧</div>
        <router-link class="btn btn-primary btn-sm" to="/list">
          ⟶ 去逛逛
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageSearchHeader from '@/components/nebula/PageSearchHeader/index.vue'
import { reqSeckillSessions } from '@/api/seckill'
import { seckillKillWithQueue } from '@/utils/seckillQueue'
import useUserStore from '@/store/modules/user'
import message from '@/utils/message'

const router = useRouter()
const userStore = useUserStore()

interface SeckillSku {
  promotionId: number | string
  promotionSessionId: number | string
  skuId: number | string
  seckillPrice: number
  seckillCount: number
  seckillLimit: number
  skuInfo?: {
    skuId?: number | string
    skuName?: string
    skuTitle?: string
    skuSubtitle?: string
    skuDefaultImg?: string
    price?: number
  }
  startTime: number
  endTime: number
  randomCode: string
  /** 剩余库存（&lt;=0 已售罄/已下架，展示「已抢完」并禁用按钮） */
  stock?: number
  /** 上架状态（0=已下架 1=上架；下架展示「已下架」，与售罄区分） */
  shelfStatus?: number
}

const liveSkus = ref<SeckillSku[]>([])
const upcomingSkus = ref<SeckillSku[]>([])
const historySkus = ref<SeckillSku[]>([])
const activeTab = ref<'live' | 'upcoming' | 'history'>('live')
const loading = ref(true)
/** 正在排队抢购的 SKU（仅该商品按钮进入排队态，不影响其他商品） */
const queueingSkuId = ref<string | null>(null)
const skKw = ref('')
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

// 当前页签展示的商品
const skus = computed(() =>
  activeTab.value === 'live'
    ? liveSkus.value
    : activeTab.value === 'upcoming'
      ? upcomingSkus.value
      : historySkus.value,
)

const filteredSkus = computed(() => {
  const kw = skKw.value.trim().toLowerCase()
  if (!kw) return skus.value
  return skus.value.filter((s) =>
    (s.skuInfo?.skuTitle || s.skuInfo?.skuName || '')
      .toLowerCase()
      .includes(kw),
  )
})

function skState(s: SeckillSku) {
  const t = now.value
  if (t < s.startTime)
    return { state: 'soon' as const, label: '预约', cls: 'soon' }
  if (t > s.endTime)
    return { state: 'end' as const, label: '已结束', cls: 'end' }
  // 下架优先于售罄：仅后端明确返回 stock=0 才算售罄（字段缺失不兜底，避免误报）
  if (Number(s.shelfStatus ?? 1) === 0)
    return { state: 'off' as const, label: '已下架', cls: 'sold' }
  if (s.stock != null && Number(s.stock) <= 0)
    return { state: 'sold' as const, label: '已抢完', cls: 'sold' }
  return { state: 'live' as const, label: '秒杀中', cls: 'live' }
}

const fmt = (n: number | string | undefined) =>
  String(Math.round(Number(n || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const discText = (s: SeckillSku) => {
  const p = Number(s.skuInfo?.price || 0)
  const sp = Number(s.seckillPrice || 0)
  if (p <= 0 || sp <= 0) return ''
  const d = Math.round((1 - sp / p) * 100)
  return d > 0 ? `${d} 折起` : ''
}

// 倒计时 mm:ss 或 hh:mm:ss
function fmtCount(ms: number) {
  const sec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

// 场次 banner：最早开始/最晚结束
const bannerState = computed(() => {
  if (skus.value.length === 0) return 'none'
  const anyLive = skus.value.some((s) => skState(s).state === 'live')
  const anySoon = skus.value.some((s) => skState(s).state === 'soon')
  if (anyLive) return 'live'
  if (anySoon) return 'soon'
  if (skus.value.some((s) => skState(s).state === 'sold')) return 'sold'
  return 'end'
})
const bannerText = computed(() => {
  if (skus.value.length === 0) return '量子秒杀 · 限时抢购'
  if (activeTab.value === 'history') return '历史秒杀 · 过往场次商品'
  const st = bannerState.value
  if (st === 'live') return '⚡ 秒杀进行中 · 手慢无'
  if (st === 'soon') return '下一场预约中 · 距开始'
  if (st === 'sold') return '本场商品已抢光 · 手慢无'
  return '本场秒杀已结束 · 关注下一场'
})
const bannerSub = computed(() => {
  if (skus.value.length === 0) return '当前无场次数据'
  const live = skus.value.filter((s) => skState(s).state === 'live').length
  const soon = skus.value.filter((s) => skState(s).state === 'soon').length
  const sold = skus.value.filter((s) => skState(s).state === 'sold').length
  return `本场 ${skus.value.length} 件商品 · 秒杀中 ${live} 件 · 待开始 ${soon} 件 · 已抢完 ${sold} 件`
})
const countdownText = computed(() => {
  if (skus.value.length === 0) return '--:--'
  const targets = skus.value
    .map((s) => (skState(s).state === 'soon' ? s.startTime : s.endTime))
    .filter(Boolean)
  if (targets.length === 0) return '00:00'
  const nearest = Math.min(...targets)
  return fmtCount(nearest - now.value)
})

// 跳转秒杀详情页（该 SKU 的参数/细节图）
const goDetail = (s: SeckillSku) =>
  router.push({ path: '/seckillDetail', query: { skuId: String(s.skuId) } })

// 场次映射
function mapSku(s: any): SeckillSku | null {
  if (!s?.skuId) return null
  return {
    promotionId: s.promotionId,
    promotionSessionId: s.promotionSessionId,
    skuId: s.skuId,
    seckillPrice: Number(s.seckillPrice ?? 0),
    seckillCount: Number(s.seckillCount ?? 0),
    seckillLimit: Number(s.seckillLimit ?? 1),
    skuInfo: s.skuInfo || {},
    startTime: Number(s.startTime ?? 0),
    endTime: Number(s.endTime ?? 0),
    randomCode: String(s.randomCode || ''),
    stock: Number(s.stock ?? 0),
    shelfStatus: Number(s.shelfStatus ?? 1),
  }
}

async function loadSeckill() {
  loading.value = true
  try {
    const res: any = await reqSeckillSessions()
    if (res.code === 200 && res.data) {
      const srcLive: any[] = res.data.live || []
      const srcUpcoming: any[] = res.data.upcoming || []
      const srcHistory: any[] = res.data.history || []
      liveSkus.value = srcLive
        .map((s: any) => mapSku(s))
        .filter((x): x is SeckillSku => x !== null)
      upcomingSkus.value = srcUpcoming
        .map((s: any) => mapSku(s))
        .filter((x): x is SeckillSku => x !== null)
      historySkus.value = srcHistory
        .map((s: any) => mapSku(s))
        .filter((x): x is SeckillSku => x !== null)
    } else {
      liveSkus.value = []
      upcomingSkus.value = []
      historySkus.value = []
    }
  } catch {
    liveSkus.value = []
    upcomingSkus.value = []
    historySkus.value = []
  } finally {
    loading.value = false
  }
}

async function doKill(s: SeckillSku) {
  if (!userStore.token) {
    router.push({ path: '/login', query: { redirect: '/seckill' } })
    return
  }
  if (queueingSkuId.value) return
  if (Number(s.shelfStatus ?? 1) === 0) {
    message.info('该商品已下架')
    return
  }
  if (s.stock != null && Number(s.stock) <= 0) {
    message.info('该商品已抢完')
    return
  }
  queueingSkuId.value = String(s.skuId)
  try {
    // 淘宝式排队：kill 扣库存后异步建单，轮询到订单落库才跳收银台
    const orderSn = await seckillKillWithQueue({
      killId: `${s.promotionSessionId}-${s.skuId}`,
      key: s.randomCode,
      num: 1,
    })
    if (orderSn) {
      message.success('⚡ 抢购成功！正在跳转收银台…')
      // 带上商品信息：秒杀单 MQ 异步落库，收银台明细可能未补全，由 pay 页兜底展示
      router.push({
        path: '/pay',
        query: {
          orderSn,
          skuId: String(s.skuId),
          name: s.skuInfo?.skuTitle || s.skuInfo?.skuName || '',
          image: s.skuInfo?.skuDefaultImg || '',
          price: String(s.seckillPrice ?? ''),
        },
      })
    } else {
      message.error('手慢了，抢购失败或订单生成超时')
      loadSeckill() // 刷新列表（库存/状态可能已变化）
    }
  } catch (e) {
    message.error((e as Error).message || '秒杀失败，稍后再试')
  } finally {
    queueingSkuId.value = null
  }
}

onMounted(() => {
  loadSeckill()
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
/* ===== 面包屑 ===== */
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
.page-head {
  margin: 20px 0 0;
}

/* ===== 场次页签 ===== */
.sk-tabs {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
.sk-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 26px;
  border-radius: 13px;
  border: 1px solid rgba(0, 240, 255, 0.18);
  background: rgba(6, 10, 26, 0.6);
  color: var(--dim);
  font-family: var(--font-h);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  cursor: pointer;
  transition: 0.25s;
}
.sk-tab em {
  font-style: normal;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  padding: 1px 8px;
  border-radius: 999px;
  background: rgba(143, 163, 200, 0.15);
}
.sk-tab:hover {
  border-color: rgba(0, 240, 255, 0.45);
  color: var(--txt);
}
.sk-tab.active {
  border-color: var(--cyan);
  background: linear-gradient(
    90deg,
    rgba(0, 240, 255, 0.14),
    rgba(168, 85, 247, 0.1)
  );
  color: var(--cyan);
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.18);
}
.sk-tab.active em {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
}

/* ===== 场次状态条 ===== */
.sk-banner {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 20px;
  padding: 18px 24px;
  border-radius: 16px;
  border: 1px solid rgba(255, 46, 196, 0.35);
  background: linear-gradient(
    90deg,
    rgba(255, 46, 196, 0.12),
    rgba(168, 85, 247, 0.08)
  );
  box-shadow: 0 0 24px rgba(255, 46, 196, 0.12);
}
.sk-banner.live {
  border-color: rgba(0, 240, 255, 0.45);
  background: linear-gradient(
    90deg,
    rgba(0, 240, 255, 0.12),
    rgba(57, 255, 136, 0.06)
  );
  box-shadow: 0 0 24px rgba(0, 240, 255, 0.15);
}
.sk-banner.soon {
  border-color: rgba(255, 197, 61, 0.4);
  background: linear-gradient(
    90deg,
    rgba(255, 197, 61, 0.1),
    rgba(168, 85, 247, 0.06)
  );
}
.sk-b-ic {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  background: linear-gradient(
    145deg,
    rgba(255, 46, 196, 0.25),
    rgba(0, 240, 255, 0.2)
  );
  border: 1px solid rgba(255, 46, 196, 0.4);
  box-shadow: 0 0 16px rgba(255, 46, 196, 0.3);
}
.sk-b-info {
  flex: 1;
  min-width: 0;
}
.sk-b-t {
  font-family: var(--font-h);
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 2px;
  color: var(--txt);
}
.sk-b-s {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  margin-top: 5px;
}
.sk-b-count {
  text-align: right;
  flex-shrink: 0;
}
.sk-b-count .lbl {
  display: block;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
}
.sk-b-count .num {
  display: block;
  margin-top: 4px;
  font-family: var(--font-h);
  font-size: 26px;
  font-weight: 900;
  color: var(--magenta);
  text-shadow: 0 0 16px rgba(255, 46, 196, 0.6);
  letter-spacing: 2px;
}

/* ===== 秒杀商品 ===== */
.sk-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 18px;
}
.sk-card {
  border: 1px solid rgba(255, 46, 196, 0.2);
  border-radius: 16px;
  overflow: hidden;
  background: var(--panel);
  backdrop-filter: blur(10px);
  transition: 0.3s;
  animation: skIn 0.3s ease;
}
@keyframes skIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.sk-card:hover {
  border-color: rgba(255, 46, 196, 0.5);
  box-shadow: 0 0 24px rgba(255, 46, 196, 0.15);
  transform: translateY(-3px);
}
.sk-img {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: radial-gradient(
    circle at 50% 40%,
    rgba(255, 46, 196, 0.1),
    rgba(6, 10, 26, 0.9) 75%
  );
}
.sk-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.sk-img .ph {
  font-size: 40px;
  color: var(--magenta);
  text-shadow: 0 0 18px rgba(255, 46, 196, 0.7);
}
.sk-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  letter-spacing: 2px;
  padding: 4px 12px;
  border-radius: 12px;
  color: #fff;
}
.sk-tag.live {
  background: linear-gradient(90deg, #ff2ec4, #ff6b3d);
  box-shadow: 0 0 12px rgba(255, 46, 196, 0.6);
  animation: blink 1.2s infinite;
}
.sk-tag.soon {
  background: rgba(255, 197, 61, 0.85);
  color: #02101a;
}
.sk-tag.end {
  background: rgba(143, 163, 200, 0.35);
  color: var(--dim);
}
.sk-tag.sold {
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
.sk-info {
  padding: 14px 16px 16px;
}
.sk-name {
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1.4;
  min-height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;
  transition: 0.2s;
}
.sk-name:hover {
  color: var(--cyan);
}
.sk-sub {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 1px;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sk-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 10px;
}
.sk-price {
  font-family: var(--font-h);
  font-size: 24px;
  font-weight: 900;
  color: var(--magenta);
  text-shadow: 0 0 14px rgba(255, 46, 196, 0.55);
}
.sk-price small {
  font-size: 12px;
  margin-right: 1px;
}
.sk-old {
  font-size: 12px;
  color: var(--dim);
  text-decoration: line-through;
}
.sk-disc {
  margin-left: auto;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: #02101a;
  background: linear-gradient(90deg, #ff2ec4, #ff6b3d);
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 700;
}
.sk-meta {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 1px;
  margin-top: 8px;
}
.sk-meta b {
  color: var(--cyan);
}
.sk-count {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  margin-top: 8px;
  letter-spacing: 1px;
}
.sk-count b {
  color: var(--amber);
  font-size: 13px;
  letter-spacing: 2px;
}
.sk-btn {
  width: 100%;
  height: 42px;
  margin-top: 12px;
  border: none;
  border-radius: 11px;
  cursor: pointer;
  font-family: var(--font-h);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  transition: 0.25s;
}
.sk-btn.live {
  background: linear-gradient(90deg, #ff2ec4, #ff6b3d);
  color: #02101a;
  box-shadow: 0 0 18px rgba(255, 46, 196, 0.5);
}
.sk-btn.live:hover:not(:disabled) {
  filter: brightness(1.15);
  box-shadow: 0 0 28px rgba(255, 46, 196, 0.85);
}
.sk-btn.soon {
  background: rgba(255, 197, 61, 0.15);
  border: 1px solid rgba(255, 197, 61, 0.45);
  color: var(--amber);
  cursor: not-allowed;
}
.sk-btn.end {
  background: rgba(143, 163, 200, 0.08);
  border: 1px solid rgba(143, 163, 200, 0.25);
  color: var(--dim);
  cursor: not-allowed;
}
.sk-btn.sold {
  background: rgba(143, 163, 200, 0.08);
  border: 1px solid rgba(143, 163, 200, 0.25);
  color: var(--dim);
  cursor: not-allowed;
}

/* ===== 空状态 ===== */
.sk-empty {
  text-align: center;
  padding: 80px 20px;
  border: 1px dashed rgba(255, 46, 196, 0.3);
  border-radius: 18px;
  background: rgba(6, 10, 26, 0.5);
  margin-top: 18px;
}
.empty-orb {
  width: 84px;
  height: 84px;
  margin: 0 auto 18px;
  border-radius: 50%;
  border: 1px dashed rgba(255, 46, 196, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  color: var(--magenta);
  text-shadow: 0 0 18px var(--magenta);
  animation: nb-spin 14s linear infinite;
}
.empty-orb span {
  animation: nb-spin 14s linear infinite reverse;
}
.empty-t {
  font-family: var(--font-h);
  font-size: 19px;
  letter-spacing: 3px;
  color: var(--txt);
}
.empty-s {
  color: var(--dim);
  font-size: 13.5px;
  margin: 10px 0 24px;
  letter-spacing: 1px;
}

@media (max-width: 1080px) {
  .sk-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .sk-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .sk-banner {
    flex-wrap: wrap;
  }
  .sk-b-count {
    text-align: left;
  }
}
</style>
