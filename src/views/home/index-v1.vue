<template>
  <div class="nb-home">
    <!-- ===== HERO 轮播（全宽，左右切换 + 自动播放） ===== -->
    <section
      class="hero"
      @mouseenter="stopHeroAuto"
      @mouseleave="startHeroAuto"
    >
      <div
        class="hero-track"
        :style="{ transform: `translateX(-${heroIdx * 100}%)` }"
      >
        <!-- 动态渲染 Hero Slides -->
        <div
          v-for="(slide, index) in heroSlides"
          :key="index"
          class="hero-slide"
          :class="`s${index + 1}`"
        >
          <div class="wrap">
            <div>
              <div class="hero-kicker">
                {{ slide.kicker }}
              </div>
              <h1 v-html="slide.title" />
              <p class="hero-sub" v-html="slide.subtitle" />
              <div class="hero-btns">
                <router-link
                  v-for="(btn, bIdx) in slide.buttons"
                  :key="bIdx"
                  class="btn"
                  :class="btn.type === 'primary' ? 'btn-primary' : 'btn-ghost'"
                  :to="btn.link"
                >
                  {{ btn.text }}
                </router-link>
              </div>
              <div class="hero-stats">
                <div
                  v-for="(stat, sIdx) in slide.stats"
                  :key="sIdx"
                  class="hstat"
                >
                  <div class="n">
                    {{ stat.value }}
                    <em>{{ stat.suffix }}</em>
                  </div>
                  <div class="l">{{ stat.label }}</div>
                </div>
              </div>
            </div>

            <!-- 全息星球展示区 -->
            <div class="holo">
              <!-- 星球轨道环 -->
              <div class="holo-ring"></div>
              <div class="holo-ring ring-2"></div>
              <div class="holo-ring ring-3"></div>

              <!-- 主星球 -->
              <div class="planet" :class="`planet-${index + 1}`">
                <div class="planet-core"></div>
                <div class="planet-atmosphere"></div>
                <div class="planet-ring"></div>
                <div class="planet-texture"></div>
                <div class="planet-glow"></div>
              </div>

              <!-- 小星球/卫星 -->
              <div class="moon moon-1"></div>
              <div class="moon moon-2"></div>
              <div class="moon moon-3"></div>

              <!-- 流星/粒子 -->
              <div
                class="shooting-star"
                v-for="i in 3"
                :key="`star-${i}`"
              ></div>
              <div class="particle" v-for="i in 6" :key="`particle-${i}`"></div>

              <!-- 信息芯片 -->
              <div
                v-for="(chip, cIdx) in slide.chips"
                :key="cIdx"
                class="holo-chip"
                :class="`chip-${String.fromCharCode(97 + cIdx)}`"
              >
                {{ chip }}
              </div>

              <!-- 价格标签 -->
              <div class="holo-price">
                <small>{{ slide.priceLabel }}</small>
                {{ slide.price }}
                <small style="display: inline; font-size: 12px">
                  .{{ slide.priceCent }}
                </small>
              </div>
            </div>
          </div>

          <!-- ===== 星际元素（两侧分布） ===== -->
          <!-- 左侧星际元素 -->
          <div class="space-elements left">
            <!-- 北斗七星 -->
            <div class="constellation big-dipper">
              <span class="star" v-for="i in 7" :key="`dipper-${i}`"></span>
              <svg class="constellation-line" viewBox="0 0 100 140">
                <polyline
                  points="10,130 20,100 35,85 50,70 65,55 80,40 90,20"
                />
              </svg>
            </div>

            <!-- 黑洞 -->
            <div class="black-hole">
              <div class="bh-ring"></div>
              <div class="bh-ring ring-2"></div>
              <div class="bh-ring ring-3"></div>
              <div class="bh-core"></div>
              <div class="bh-accretion"></div>
            </div>

            <!-- 星云 -->
            <div class="nebula nebula-1"></div>
            <div class="nebula nebula-2"></div>

            <!-- 飘浮的星星 -->
            <div
              class="floating-star"
              v-for="i in 8"
              :key="`fstar-l-${i}`"
            ></div>

            <!-- 银河旋臂 -->
            <div class="galaxy-arm"></div>
          </div>

          <!-- 右侧星际元素 -->
          <div class="space-elements right">
            <!-- 星云 -->
            <div class="nebula nebula-3"></div>
            <div class="nebula nebula-4"></div>

            <!-- 飘浮的星星 -->
            <div
              class="floating-star"
              v-for="i in 8"
              :key="`fstar-r-${i}`"
            ></div>

            <!-- 银河旋臂 -->
            <div class="galaxy-arm arm-right"></div>

            <!-- 脉冲星 -->
            <div class="pulsar">
              <div class="pulsar-core"></div>
              <div class="pulsar-beam beam-1"></div>
              <div class="pulsar-beam beam-2"></div>
            </div>

            <!-- 超新星遗迹 -->
            <div class="supernova-remnant"></div>
          </div>
        </div>
      </div>

      <!-- 左右切换 + 指示点 -->
      <button class="hero-arrow left" @click="heroPrev">&#9664;</button>
      <button class="hero-arrow right" @click="heroNext">&#9654;</button>
      <div class="hero-dots">
        <span
          v-for="i in heroSlides.length"
          :key="i"
          :class="{ on: i - 1 === heroIdx }"
          @click="heroGo(i - 1)"
        ></span>
      </div>
    </section>

    <!-- ===== 跑马灯（全宽） ===== -->
    <Ticker />

    <!-- ===== 限时秒杀 ===== -->
    <section class="sec">
      <div class="wrap">
        <div class="sec-head">
          <div class="sec-title">
            <h2>
              &#9889; 限时秒杀
              <small>FLASH SALE · 量子倒计时</small>
            </h2>
          </div>
        </div>
        <div class="sale-grid">
          <div class="sale-panel">
            <h3>
              &#128293;
              <span class="hot">超时空</span>
              秒杀专场
            </h3>
            <p>量子引擎 · 每日低价</p>
            <div class="countdown">
              <div class="cd-box">
                <div class="num">{{ cdH }}</div>
                <div class="lab">HOURS</div>
              </div>
              <div class="cd-sep">:</div>
              <div class="cd-box">
                <div class="num">{{ cdM }}</div>
                <div class="lab">MINS</div>
              </div>
              <div class="cd-sep">:</div>
              <div class="cd-box">
                <div class="num">{{ cdS }}</div>
                <div class="lab">SECS</div>
              </div>
            </div>
            <button class="go" @click="$router.push('/seckill')">
              进入时空卖场 &#10230;
            </button>
          </div>
          <div class="sale-products">
            <ProductCard
              v-for="p in saleProducts"
              :key="String(p.id ?? p.skuId)"
              :product="p"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ===== 热销商品 ===== -->
    <section class="sec">
      <div class="wrap">
        <div class="sec-head">
          <div class="sec-title">
            <h2>
              &#129520; 智能推荐 · 为你定制
              <small>AI PERSONALIZED · 由量子引擎生成</small>
            </h2>
          </div>
        </div>
        <div class="prod-grid">
          <ProductCard
            v-for="p in hotProducts"
            :key="String(p.id ?? p.skuId)"
            :product="p"
          />
        </div>
        <div v-if="loading && hotProducts.length === 0" class="prod-loading">
          量子引擎加载中…
        </div>
        <!-- 懒加载哨兵 + 状态提示 -->
        <div ref="sentinelRef" class="load-sentinel"></div>
        <div
          v-if="recommendDone && hotProducts.length > 0"
          class="load-more-tip"
        >
          — 已加载全部商品 —
        </div>
        <div v-else-if="loading" class="load-more-tip">加载中…</div>
      </div>
    </section>

    <!-- ===== 特性条（组件） ===== -->
    <AppFeatures />

    <!-- ===== 大促横条（组件） ===== -->
    <AppPromo />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import Ticker from '@/components/nebula/Ticker/index.vue'
import AppFeatures from '@/components/nebula/AppFeatures/index.vue'
import AppPromo from '@/components/nebula/AppPromo/index.vue'
import ProductCard, {
  type ProductCardItem,
} from '@/components/nebula/ProductCard/index.vue'
import { MOCK_PRODUCTS } from '@/constants/mock'
import { PRODUCTS_LIST, type ListProduct } from '@/constants/mock'
import { reqCurrentSeckill } from '@/api/seckill'
import { reqSearchSku } from '@/api/search'

// ===== 类型定义 =====
interface HeroSlide {
  kicker: string
  title: string
  subtitle: string
  buttons: Array<{ text: string; link: string; type: 'primary' | 'ghost' }>
  stats: Array<{ value: string | number; suffix: string; label: string }>
  chips: string[]
  priceLabel: string
  price: string
  priceCent: string
}

// ===== Hero 默认数据（使用 const 定义） =====
const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    kicker: '◢ NEURAL-SHOPPING ONLINE · AI 智选已上线 ◣',
    title:
      '未来已至 · <span class="glow-c">银河级</span><br />智能购物体验 <span class="glow-m">全息启动</span>',
    subtitle:
      '接入 <b>量子推荐引擎</b> ，3 秒生成专属购物矩阵。全站商品支持 <b>全息预览</b> 、<b>脑波支付</b> 、<b>轨道快递 48h 达</b> 。',
    buttons: [
      { text: '立即探索 ⟶', link: '/list', type: 'primary' },
      { text: '▶ 观看全息演示', link: 'javascript:void(0)', type: 'ghost' },
    ],
    stats: [
      { value: '2.4', suffix: '亿+', label: '注册星际用户' },
      { value: '98', suffix: '%', label: 'AI 推荐精准度' },
      { value: '0.3', suffix: 's', label: '量子极速加载' },
    ],
    chips: [
      '◈ QUANTUM CORE 量子核心',
      '✓ 已接入星域网 · 信号满格',
      '✦ 全息预览中 · 放大 300%',
      '⟳ AI 同步价格中…',
    ],
    priceLabel: '限时首发',
    price: '¥9,999',
    priceCent: '00',
  },
  {
    kicker: '⚡ QUANTUM SECKILL · 限时抢购',
    title:
      '限时秒杀 · <span class="glow-c">低至 1 折</span><br />量子抢购 <span class="glow-m">手慢无</span>',
    subtitle:
      '全场秒杀商品最低 <b>1 折起</b> ，量子通道极速下单。限时限量， <b>抢完即止</b> ，错过再等一光年。',
    buttons: [
      { text: '进入时空卖场 ⟶', link: '/seckill', type: 'primary' },
      { text: '查看全部商品', link: '/list', type: 'ghost' },
    ],
    stats: [
      { value: '1', suffix: '折起', label: '全场秒杀价' },
      { value: '24', suffix: 'h', label: '不间断场次' },
      { value: '限量', suffix: '⚡', label: '抢完即止' },
    ],
    chips: [
      '⚡ SECKILL NOW 秒杀进行中',
      '🔥 今日已抢 12,880 件',
      '✦ 限购 2 件 · 手慢无',
      '⟳ 倒计时 04:32:11',
    ],
    priceLabel: '秒杀价',
    price: '¥299',
    priceCent: '00',
  },
  {
    kicker: '✦ GALAXY MEMBERSHIP · 星环尊享',
    title:
      '星环会员 · <span class="glow-c">尊享权益</span><br />全场 95 折 <span class="glow-m">专属通道</span>',
    subtitle:
      '开通星环会员，享 <b>全场 95 折</b> 、专属量子客服、 <b>脑波极速支付</b> 、每月 8 号 <b>会员日</b> 双倍积分。',
    buttons: [
      { text: '开通会员 ⟶', link: '/profile', type: 'primary' },
      { text: '了解权益', link: '/list', type: 'ghost' },
    ],
    stats: [
      { value: '95', suffix: '折', label: '全场通用' },
      { value: '8', suffix: '号', label: '每月会员日' },
      { value: '7×24', suffix: 'h', label: '量子专属客服' },
    ],
    chips: [
      '✦ MEMBER ONLY 会员专享',
      '✓ 全年 95 折 · 已生效',
      '◈ 成长值加速 1.5 倍',
      '⟳ 会员日双倍积分中…',
    ],
    priceLabel: '会员年费',
    price: '¥888',
    priceCent: '00',
  },
]

// ===== Hero 轮播数据 =====
const heroSlides = ref<HeroSlide[]>(DEFAULT_HERO_SLIDES)
const heroSlidesCount = ref(DEFAULT_HERO_SLIDES.length)

// ===== 秒杀倒计时 =====
const cdH = ref('06')
const cdM = ref('23')
const cdS = ref('41')
let left = 6 * 3600 + 23 * 60 + 41
let timer: ReturnType<typeof setInterval> | null = null

function startCountdown() {
  timer = setInterval(() => {
    left = left <= 0 ? 6 * 3600 : left - 1
    cdH.value = String(Math.floor(left / 3600)).padStart(2, '0')
    cdM.value = String(Math.floor((left % 3600) / 60)).padStart(2, '0')
    cdS.value = String(left % 60).padStart(2, '0')
  }, 1000)
}

// ===== 秒杀商品 =====
const saleProducts = ref<ProductCardItem[]>(MOCK_PRODUCTS.slice(0, 3))

function mapSeckill(list: any[]): ProductCardItem[] {
  return list.map((item) => ({
    id: item.skuId,
    skuId: item.skuId,
    name: item.skuInfo?.skuName || item.skuName || '量子商品',
    category: 'FLASH-SALE',
    image: item.skuInfo?.skuDefaultImg || item.skuImg || '',
    tag: '秒杀',
    tagType: 'grn' as const,
    score: 4.9,
    sales: '限时',
    price: item.seckillPrice ?? 0,
    oldPrice: item.skuInfo?.price || item.normalPrice || 0,
  }))
}

// ===== 热销推荐 =====
const hotProducts = ref<ProductCardItem[]>([])
const pageNum = ref(1)
const totalPage = ref(0)
const loading = ref(true)
const recommendLoading = ref(false)
const recommendDone = ref(false)
const sentinelRef = ref<HTMLElement | null>(null)
let recommendObserver: IntersectionObserver | null = null

function mapSearch(list: any[]): ProductCardItem[] {
  return list.map((item) => ({
    id: item.skuId,
    skuId: item.skuId,
    name: String(item.skuTitle || '').replace(/<[^>]+>/g, ''),
    category: item.skuCategoryName || 'AI-RECOMMEND',
    image: item.skuImg || '',
    score: item.score ?? 4.8,
    sales: item.saleCount ? `销量${item.saleCount}` : '热卖',
    price: item.skuPrice ?? 0,
  }))
}

const fmtSales = (n: number) =>
  n >= 10000
    ? `${(n / 10000).toFixed(1)}w`
    : n >= 1000
      ? `${(n / 1000).toFixed(1)}k`
      : `${n}`

function mockToCard(p: ListProduct): ProductCardItem {
  const discount =
    p.tag === '特价' && p.old ? Math.round((1 - p.price / p.old) * 100) : 0
  return {
    id: p.id,
    skuId: p.id,
    name: p.name,
    category: `${p.brand} · ${p.cat.toUpperCase()}`,
    icon: p.icon,
    phClass: p.ph || undefined,
    tag:
      p.tag === '特价'
        ? `-${discount}%`
        : p.tag === '新品'
          ? '新品'
          : p.tag === '热卖'
            ? '热卖'
            : p.tag || undefined,
    tagType: p.tag === '新品' ? 'blu' : p.tag === '热卖' ? 'grn' : 'red',
    score: p.rating,
    sales: fmtSales(p.sales),
    price: p.price,
    oldPrice: p.old,
  }
}

const MOCK_PAGE_SIZE = 8

function loadMockRecommend(append: boolean) {
  const all = PRODUCTS_LIST.map(mockToCard)
  const total = Math.ceil(all.length / MOCK_PAGE_SIZE)
  const start = (pageNum.value - 1) * MOCK_PAGE_SIZE
  const slice = all.slice(start, start + MOCK_PAGE_SIZE)
  hotProducts.value = append ? [...hotProducts.value, ...slice] : slice
  pageNum.value++
  if (pageNum.value > total) recommendDone.value = true
}

async function loadRecommend(append = false) {
  if (recommendLoading.value || recommendDone.value) return
  recommendLoading.value = true
  if (!append) {
    pageNum.value = 1
    totalPage.value = 0
    recommendDone.value = false
  }
  loading.value = true
  try {
    const res: any = await reqSearchSku({ pageNum: pageNum.value })
    const items: any[] = res?.data?.products || []
    if (items.length > 0) {
      const mapped = mapSearch(items)
      hotProducts.value = append ? [...hotProducts.value, ...mapped] : mapped
      totalPage.value = Number(res?.data?.totalPage ?? 1)
      pageNum.value++
      if (pageNum.value > totalPage.value) recommendDone.value = true
    } else {
      loadMockRecommend(append)
    }
  } catch {
    loadMockRecommend(append)
  } finally {
    loading.value = false
    recommendLoading.value = false
    fillViewportIfNeeded()
  }
}

function fillViewportIfNeeded() {
  void nextTick(() => {
    const sentinel = sentinelRef.value
    if (
      !sentinel ||
      recommendDone.value ||
      loading.value ||
      recommendLoading.value
    )
      return
    const rect = sentinel.getBoundingClientRect()
    if (rect.top <= window.innerHeight + 300) {
      loadRecommend(true)
    }
  })
}

async function loadData() {
  // 秒杀
  try {
    const res: any = await reqCurrentSeckill()
    const list: any[] = res?.data || []
    if (list.length > 0) {
      saleProducts.value = mapSeckill(list)
    }
  } catch {
    // 保持 mock
  }

  // 推荐
  await loadRecommend(false)
}

// ===== HERO 轮播控制 =====
const heroIdx = ref(0)
let heroTimer: ReturnType<typeof setInterval> | null = null

function heroGo(i: number) {
  heroIdx.value = (i + heroSlidesCount.value) % heroSlidesCount.value
  restartHeroAuto()
}
function heroNext() {
  heroGo(heroIdx.value + 1)
}
function heroPrev() {
  heroGo(heroIdx.value - 1)
}
function startHeroAuto() {
  stopHeroAuto()
  heroTimer = setInterval(() => {
    heroIdx.value = (heroIdx.value + 1) % heroSlidesCount.value
  }, 5000)
}
function stopHeroAuto() {
  if (heroTimer) {
    clearInterval(heroTimer)
    heroTimer = null
  }
}
function restartHeroAuto() {
  if (heroTimer) startHeroAuto()
}

onMounted(() => {
  startCountdown()
  loadData()
  startHeroAuto()

  recommendObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        loadRecommend(true)
      }
    },
    { rootMargin: '200px 0px' },
  )
  if (sentinelRef.value) recommendObserver.observe(sentinelRef.value)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  stopHeroAuto()
  recommendObserver?.disconnect()
})
</script>

<style scoped>
/* ===== 首页独有：HERO ===== */
.hero {
  position: relative;
  margin: 20px 0 0;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid var(--line);
  box-shadow:
    0 20px 70px rgba(0, 0, 0, 0.55),
    inset 0 0 80px rgba(0, 240, 255, 0.05);
}

/* 三屏各自背景 */
.hero-slide.s1 {
  background:
    radial-gradient(
      800px 500px at 78% 18%,
      rgba(168, 85, 247, 0.32),
      transparent 60%
    ),
    radial-gradient(
      600px 400px at 20% 80%,
      rgba(0, 240, 255, 0.18),
      transparent 60%
    ),
    linear-gradient(115deg, #070b20 0%, #0b1030 45%, #120a2e 100%);
}
.hero-slide.s2 {
  background:
    radial-gradient(
      800px 500px at 80% 20%,
      rgba(255, 46, 196, 0.34),
      transparent 60%
    ),
    radial-gradient(
      600px 400px at 15% 85%,
      rgba(255, 107, 61, 0.22),
      transparent 60%
    ),
    linear-gradient(115deg, #1c0714 0%, #2c0a1e 45%, #1c0a2e 100%);
}
.hero-slide.s3 {
  background:
    radial-gradient(
      800px 500px at 75% 18%,
      rgba(255, 197, 61, 0.26),
      transparent 60%
    ),
    radial-gradient(
      600px 400px at 25% 82%,
      rgba(57, 255, 136, 0.13),
      transparent 60%
    ),
    linear-gradient(115deg, #151307 0%, #201b0b 45%, #0d1a12 100%);
}

.hero-track {
  display: flex;
  width: 100%;
  transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
}
.hero-slide {
  min-width: 100%;
  display: flex;
  position: relative;
  overflow: visible;
}
.hero-slide .wrap {
  width: 100%;
  position: relative;
  z-index: 2;
}

.hero-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 6;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid rgba(0, 240, 255, 0.45);
  background: rgba(5, 9, 24, 0.75);
  backdrop-filter: blur(8px);
  color: var(--cyan);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.25s;
  opacity: 0;
}
.hero:hover .hero-arrow {
  opacity: 1;
}
.hero-arrow.left {
  left: 14px;
}
.hero-arrow.right {
  right: 14px;
}
.hero-arrow:hover {
  background: rgba(0, 240, 255, 0.22);
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.5);
}

.hero-dots {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  z-index: 6;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.hero-dots span {
  width: 26px;
  height: 5px;
  border-radius: 3px;
  background: rgba(0, 240, 255, 0.22);
  cursor: pointer;
  transition: 0.25s;
}
.hero-dots span:hover {
  background: rgba(0, 240, 255, 0.5);
}
.hero-dots span.on {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
  width: 44px;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    115deg,
    transparent 40%,
    rgba(0, 240, 255, 0.06) 50%,
    transparent 60%
  );
  background-size: 250% 100%;
  animation: sheen 7s linear infinite;
  z-index: 1;
}
@keyframes sheen {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -50% 0;
  }
}

.hero .wrap {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 20px;
  padding: 56px 44px;
  align-items: center;
  position: relative;
  z-index: 2;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid rgba(0, 240, 255, 0.4);
  background: rgba(0, 240, 255, 0.07);
  font-family: var(--font-m);
  font-size: 12px;
  color: var(--cyan);
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.25);
  animation: flicker 3.2s infinite;
}
@keyframes flicker {
  0%,
  92%,
  100% {
    opacity: 1;
  }
  93% {
    opacity: 0.4;
  }
  95% {
    opacity: 1;
  }
  97% {
    opacity: 0.6;
  }
}

.hero h1 {
  font-family: var(--font-h);
  font-weight: 900;
  font-size: 46px;
  line-height: 1.14;
  margin: 20px 0 6px;
}
.hero h1 .glow-c {
  color: var(--cyan);
  text-shadow: 0 0 22px rgba(0, 240, 255, 0.8);
}
.hero h1 .glow-m {
  color: var(--magenta);
  text-shadow: 0 0 22px rgba(255, 46, 196, 0.75);
}

.hero-sub {
  color: var(--dim);
  font-size: 17px;
  max-width: 520px;
  line-height: 1.7;
  margin: 10px 0 26px;
}
.hero-sub b {
  color: var(--green);
  font-weight: 600;
}

.hero-btns {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.hero-stats {
  display: flex;
  gap: 34px;
  margin-top: 34px;
}
.hstat {
  position: relative;
}
.hstat .n {
  font-family: var(--font-h);
  font-weight: 700;
  font-size: 24px;
  color: #fff;
  text-shadow: 0 0 14px rgba(0, 240, 255, 0.6);
}
.hstat .n em {
  font-style: normal;
  color: var(--cyan);
}
.hstat .l {
  font-size: 12px;
  color: var(--dim);
  margin-top: 2px;
}

/* ===== 星球系统 ===== */
.holo {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  perspective: 1200px;
}

/* 主星球 */
.planet {
  position: relative;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  animation: planetFloat 8s ease-in-out infinite;
  transform-style: preserve-3d;
}

.planet-core {
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 30%,
    rgba(255, 255, 255, 0.6) 0%,
    rgba(255, 255, 255, 0.1) 40%,
    transparent 70%
  );
  z-index: 2;
}

.planet-atmosphere {
  position: absolute;
  inset: -15%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 25%,
    rgba(0, 240, 255, 0.15) 0%,
    transparent 60%
  );
  z-index: 1;
  animation: atmospherePulse 4s ease-in-out infinite;
}

.planet-ring {
  position: absolute;
  inset: -40%;
  border-radius: 50%;
  border: 2px solid rgba(0, 240, 255, 0.2);
  transform: rotateX(70deg) rotateZ(15deg);
  z-index: 0;
  animation: ringSpin 20s linear infinite;
}
.planet-ring::before {
  content: '';
  position: absolute;
  inset: 20%;
  border-radius: 50%;
  border: 1px dashed rgba(0, 240, 255, 0.15);
}

.planet-texture {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(
      ellipse at 70% 30%,
      rgba(255, 255, 255, 0.08) 0%,
      transparent 30%
    ),
    radial-gradient(
      ellipse at 20% 70%,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 25%
    ),
    radial-gradient(
      ellipse at 50% 50%,
      transparent 40%,
      rgba(0, 0, 0, 0.2) 100%
    );
  z-index: 3;
}

.planet-glow {
  position: absolute;
  inset: -50%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 25%,
    rgba(0, 240, 255, 0.15) 0%,
    transparent 50%
  );
  z-index: 0;
  filter: blur(20px);
  animation: glowPulse 3s ease-in-out infinite;
}

/* 各星球颜色主题 */
.planet-1 {
  background: radial-gradient(
    circle at 35% 30%,
    #7c3aed 0%,
    #4f46e5 30%,
    #1e1b4b 60%,
    #0f0a2a 100%
  );
  box-shadow: 0 0 80px rgba(124, 58, 237, 0.4);
}
.planet-1 .planet-ring {
  border-color: rgba(124, 58, 237, 0.3);
}

.planet-2 {
  background: radial-gradient(
    circle at 35% 30%,
    #ec4899 0%,
    #be185d 30%,
    #701a75 60%,
    #2d0a1e 100%
  );
  box-shadow: 0 0 80px rgba(236, 72, 153, 0.4);
}
.planet-2 .planet-ring {
  border-color: rgba(236, 72, 153, 0.3);
}

.planet-3 {
  background: radial-gradient(
    circle at 35% 30%,
    #fbbf24 0%,
    #d97706 30%,
    #78350f 60%,
    #1c1206 100%
  );
  box-shadow: 0 0 80px rgba(251, 191, 36, 0.4);
}
.planet-3 .planet-ring {
  border-color: rgba(251, 191, 36, 0.3);
}

/* 月球/卫星 */
.moon {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 25%, #94a3b8, #475569);
  box-shadow: 0 0 20px rgba(148, 163, 184, 0.2);
}

.moon-1 {
  width: 40px;
  height: 40px;
  top: 5%;
  right: 8%;
  animation: moonOrbit1 12s linear infinite;
}
.moon-2 {
  width: 25px;
  height: 25px;
  bottom: 10%;
  left: 5%;
  animation: moonOrbit2 16s linear infinite reverse;
}
.moon-3 {
  width: 30px;
  height: 30px;
  top: 15%;
  left: 20%;
  animation: moonOrbit3 14s linear infinite;
}

/* 流星 */
.shooting-star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #fff;
  border-radius: 50%;
  box-shadow:
    0 0 4px #fff,
    0 0 8px rgba(0, 240, 255, 0.3);
  animation: shootingStar 4s linear infinite;
}
.shooting-star:nth-child(1) {
  top: 10%;
  left: 60%;
  animation-delay: 0s;
}
.shooting-star:nth-child(2) {
  top: 20%;
  left: 30%;
  animation-delay: 1.5s;
}
.shooting-star:nth-child(3) {
  top: 5%;
  left: 80%;
  animation-delay: 3s;
}

/* 粒子 */
.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(0, 240, 255, 0.4);
  animation: particleFloat 6s ease-in-out infinite;
}
.particle:nth-child(1) {
  top: 25%;
  left: 10%;
  animation-delay: 0.2s;
}
.particle:nth-child(2) {
  top: 45%;
  right: 5%;
  animation-delay: 0.8s;
}
.particle:nth-child(3) {
  bottom: 30%;
  left: 15%;
  animation-delay: 1.4s;
}
.particle:nth-child(4) {
  top: 60%;
  right: 12%;
  animation-delay: 2s;
}
.particle:nth-child(5) {
  top: 12%;
  left: 40%;
  animation-delay: 2.6s;
}
.particle:nth-child(6) {
  bottom: 20%;
  right: 25%;
  animation-delay: 3.2s;
}

/* ===== 星际元素 - 左侧和右侧分布 ===== */
.space-elements {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 180px;
  pointer-events: none;
  z-index: 1;
  overflow: visible;
}

.space-elements.left {
  left: -40px;
}

.space-elements.right {
  right: -40px;
}

/* ===== 北斗七星 ===== */
.constellation {
  position: absolute;
  opacity: 0.7;
}

.constellation.big-dipper {
  top: 8%;
  left: 5%;
  width: 70px;
  height: 100px;
}

.constellation .star {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
  box-shadow:
    0 0 6px rgba(255, 255, 255, 0.8),
    0 0 12px rgba(100, 200, 255, 0.4);
  animation: twinkle 2s ease-in-out infinite;
}

.constellation .star:nth-child(1) {
  top: 90%;
  left: 5%;
  animation-delay: 0s;
}
.constellation .star:nth-child(2) {
  top: 72%;
  left: 15%;
  animation-delay: 0.3s;
}
.constellation .star:nth-child(3) {
  top: 55%;
  left: 25%;
  animation-delay: 0.6s;
}
.constellation .star:nth-child(4) {
  top: 38%;
  left: 35%;
  animation-delay: 0.9s;
}
.constellation .star:nth-child(5) {
  top: 22%;
  left: 45%;
  animation-delay: 1.2s;
}
.constellation .star:nth-child(6) {
  top: 8%;
  left: 55%;
  animation-delay: 1.5s;
}
.constellation .star:nth-child(7) {
  top: 2%;
  left: 70%;
  animation-delay: 1.8s;
}

.constellation-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
}

.constellation-line polyline {
  fill: none;
  stroke: rgba(100, 200, 255, 0.3);
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

/* ===== 黑洞 ===== */
.black-hole {
  position: absolute;
  bottom: 15%;
  left: -10%;
  width: 80px;
  height: 80px;
}

.bh-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 100, 50, 0.15);
  animation: bhSpin 8s linear infinite;
}

.bh-ring {
  inset: 0;
}
.bh-ring.ring-2 {
  inset: 15%;
  animation-duration: 6s;
  animation-direction: reverse;
}
.bh-ring.ring-3 {
  inset: 30%;
  animation-duration: 10s;
}

.bh-core {
  position: absolute;
  inset: 40%;
  border-radius: 50%;
  background: radial-gradient(circle, #1a0a00, #000);
  box-shadow: inset 0 0 20px rgba(255, 100, 50, 0.2);
}

.bh-accretion {
  position: absolute;
  inset: -20%;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0%,
    rgba(255, 100, 50, 0.05) 20%,
    rgba(255, 200, 100, 0.08) 40%,
    rgba(255, 100, 50, 0.05) 60%,
    transparent 80%,
    transparent 100%
  );
  animation: bhAccretion 4s linear infinite;
}

@keyframes bhSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes bhAccretion {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

/* ===== 星云 ===== */
.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(30px);
  opacity: 0.3;
  animation: nebulaFloat 12s ease-in-out infinite;
}

.nebula-1 {
  width: 120px;
  height: 80px;
  top: 20%;
  left: -20%;
  background: radial-gradient(ellipse, rgba(168, 85, 247, 0.4), transparent);
  animation-delay: 0s;
}

.nebula-2 {
  width: 90px;
  height: 60px;
  bottom: 40%;
  left: -10%;
  background: radial-gradient(ellipse, rgba(0, 240, 255, 0.25), transparent);
  animation-delay: 4s;
}

.nebula-3 {
  width: 100px;
  height: 70px;
  top: 15%;
  right: -15%;
  background: radial-gradient(ellipse, rgba(255, 46, 196, 0.3), transparent);
  animation-delay: 2s;
}

.nebula-4 {
  width: 130px;
  height: 90px;
  bottom: 30%;
  right: -20%;
  background: radial-gradient(ellipse, rgba(57, 255, 136, 0.2), transparent);
  animation-delay: 6s;
}

@keyframes nebulaFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  33% {
    transform: translate(10px, -15px) scale(1.1);
    opacity: 0.5;
  }
  66% {
    transform: translate(-5px, 10px) scale(0.9);
    opacity: 0.25;
  }
}

/* ===== 飘浮的星星 ===== */
.floating-star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.6);
  animation: floatStar 6s ease-in-out infinite;
}

.space-elements.left .floating-star:nth-child(1) {
  top: 5%;
  left: 30%;
  animation-delay: 0.2s;
}
.space-elements.left .floating-star:nth-child(2) {
  top: 15%;
  left: 60%;
  animation-delay: 0.8s;
}
.space-elements.left .floating-star:nth-child(3) {
  top: 30%;
  left: 15%;
  animation-delay: 1.4s;
}
.space-elements.left .floating-star:nth-child(4) {
  top: 45%;
  left: 70%;
  animation-delay: 2s;
}
.space-elements.left .floating-star:nth-child(5) {
  top: 60%;
  left: 25%;
  animation-delay: 2.6s;
}
.space-elements.left .floating-star:nth-child(6) {
  top: 75%;
  left: 55%;
  animation-delay: 3.2s;
}
.space-elements.left .floating-star:nth-child(7) {
  top: 88%;
  left: 10%;
  animation-delay: 3.8s;
}
.space-elements.left .floating-star:nth-child(8) {
  top: 50%;
  left: 45%;
  animation-delay: 4.4s;
}

.space-elements.right .floating-star:nth-child(1) {
  top: 8%;
  right: 20%;
  animation-delay: 0.4s;
}
.space-elements.right .floating-star:nth-child(2) {
  top: 20%;
  right: 50%;
  animation-delay: 1s;
}
.space-elements.right .floating-star:nth-child(3) {
  top: 35%;
  right: 10%;
  animation-delay: 1.6s;
}
.space-elements.right .floating-star:nth-child(4) {
  top: 50%;
  right: 60%;
  animation-delay: 2.2s;
}
.space-elements.right .floating-star:nth-child(5) {
  top: 65%;
  right: 25%;
  animation-delay: 2.8s;
}
.space-elements.right .floating-star:nth-child(6) {
  top: 78%;
  right: 45%;
  animation-delay: 3.4s;
}
.space-elements.right .floating-star:nth-child(7) {
  top: 90%;
  right: 15%;
  animation-delay: 4s;
}
.space-elements.right .floating-star:nth-child(8) {
  top: 45%;
  right: 75%;
  animation-delay: 4.6s;
}

@keyframes floatStar {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(5px, -10px) scale(1.5);
    opacity: 0.9;
  }
}

/* ===== 银河旋臂 ===== */
.galaxy-arm {
  position: absolute;
  width: 2px;
  height: 200px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(200, 180, 255, 0.05) 20%,
    rgba(200, 180, 255, 0.15) 40%,
    rgba(200, 180, 255, 0.05) 60%,
    transparent 100%
  );
  transform-origin: bottom center;
  animation: galaxySway 8s ease-in-out infinite;
}

.galaxy-arm {
  bottom: -20px;
  left: 20%;
  transform: rotate(-15deg);
}

.galaxy-arm.arm-right {
  bottom: -20px;
  right: 20%;
  left: auto;
  transform: rotate(15deg);
  animation-delay: 4s;
}

@keyframes galaxySway {
  0%,
  100% {
    transform: rotate(-15deg) scaleY(1);
  }
  50% {
    transform: rotate(-5deg) scaleY(1.1);
  }
}

.galaxy-arm.arm-right {
  animation-name: galaxySwayRight;
}

@keyframes galaxySwayRight {
  0%,
  100% {
    transform: rotate(15deg) scaleY(1);
  }
  50% {
    transform: rotate(5deg) scaleY(1.1);
  }
}

/* ===== 脉冲星 ===== */
.pulsar {
  position: absolute;
  top: 25%;
  right: 0;
  width: 40px;
  height: 40px;
}

.pulsar-core {
  position: absolute;
  inset: 30%;
  border-radius: 50%;
  background: radial-gradient(circle, #fff, #a855f7);
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.6);
  animation: pulsarCore 1.5s ease-in-out infinite;
}

.pulsar-beam {
  position: absolute;
  inset: 40%;
  border-radius: 50%;
  border: 2px solid rgba(168, 85, 247, 0.2);
}

.pulsar-beam.beam-1 {
  transform: rotate(0deg) scaleX(3);
  border-color: rgba(168, 85, 247, 0.15);
  animation: pulsarBeam1 2s linear infinite;
}

.pulsar-beam.beam-2 {
  transform: rotate(90deg) scaleX(3);
  border-color: rgba(236, 72, 153, 0.15);
  animation: pulsarBeam2 2s linear infinite 0.5s;
}

@keyframes pulsarCore {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

@keyframes pulsarBeam1 {
  0% {
    transform: rotate(0deg) scaleX(3);
    opacity: 0.3;
  }
  50% {
    transform: rotate(180deg) scaleX(4);
    opacity: 0.8;
  }
  100% {
    transform: rotate(360deg) scaleX(3);
    opacity: 0.3;
  }
}

@keyframes pulsarBeam2 {
  0% {
    transform: rotate(90deg) scaleX(3);
    opacity: 0.3;
  }
  50% {
    transform: rotate(270deg) scaleX(4);
    opacity: 0.8;
  }
  100% {
    transform: rotate(450deg) scaleX(3);
    opacity: 0.3;
  }
}

/* ===== 超新星遗迹 ===== */
.supernova-remnant {
  position: absolute;
  bottom: 25%;
  right: -10%;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 200, 100, 0.08),
    rgba(255, 100, 50, 0.04) 40%,
    transparent 70%
  );
  border: 1px solid rgba(255, 200, 100, 0.1);
  animation: supernovaPulse 6s ease-in-out infinite;
}

.supernova-remnant::before {
  content: '';
  position: absolute;
  inset: 20%;
  border-radius: 50%;
  border: 1px dashed rgba(255, 200, 100, 0.08);
  animation: supernovaSpin 10s linear infinite;
}

@keyframes supernovaPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
}

@keyframes supernovaSpin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== 闪烁星星通用 ===== */
@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
}

/* ===== 动画 ===== */
@keyframes planetFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

@keyframes atmospherePulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

@keyframes ringSpin {
  to {
    transform: rotateX(70deg) rotateZ(360deg);
  }
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes moonOrbit1 {
  0% {
    transform: rotate(0deg) translateX(120px) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(120px) rotate(-360deg);
  }
}

@keyframes moonOrbit2 {
  0% {
    transform: rotate(0deg) translateX(90px) rotate(0deg);
  }
  100% {
    transform: rotate(-360deg) translateX(90px) rotate(360deg);
  }
}

@keyframes moonOrbit3 {
  0% {
    transform: rotate(0deg) translateX(70px) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(70px) rotate(-360deg);
  }
}

@keyframes shootingStar {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: translate(60px, 40px) scale(0);
    opacity: 0;
  }
}

@keyframes particleFloat {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) scale(1.5);
    opacity: 0.8;
  }
}

.holo-chip {
  position: absolute;
  padding: 9px 16px;
  border-radius: 10px;
  background: rgba(6, 10, 26, 0.85);
  border: 1px solid var(--line);
  font-family: var(--font-m);
  font-size: 12px;
  color: var(--cyan);
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.22);
  animation: chipFloat 4.5s ease-in-out infinite;
  backdrop-filter: blur(6px);
  white-space: nowrap;
  z-index: 5;
}

@keyframes chipFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.chip-a {
  top: 8%;
  left: 2%;
  animation-delay: 0.4s;
}
.chip-b {
  top: 18%;
  right: 0;
  animation-delay: 1.1s;
  color: var(--green);
  border-color: rgba(57, 255, 136, 0.4);
  box-shadow: 0 0 16px rgba(57, 255, 136, 0.25);
}
.chip-c {
  bottom: 6%;
  left: 8%;
  animation-delay: 1.8s;
  color: var(--magenta);
  border-color: rgba(255, 46, 196, 0.4);
  box-shadow: 0 0 16px rgba(255, 46, 196, 0.25);
}
.chip-d {
  bottom: 16%;
  right: 6%;
  animation-delay: 2.4s;
}

.holo-price {
  position: absolute;
  bottom: -6px;
  right: 4%;
  font-family: var(--font-h);
  font-size: 34px;
  font-weight: 900;
  color: var(--green);
  text-shadow: 0 0 24px rgba(57, 255, 136, 0.8);
  z-index: 5;
}
.holo-price small {
  font-size: 14px;
  color: var(--dim);
  text-shadow: none;
  display: block;
  font-family: var(--font-m);
}

/* ===== 限时秒杀 ===== */
.sale-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}
.sale-panel {
  border-radius: 18px;
  padding: 26px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 46, 196, 0.35);
  background: linear-gradient(
    160deg,
    rgba(30, 6, 40, 0.85),
    rgba(10, 4, 26, 0.85)
  );
  box-shadow:
    0 12px 40px rgba(255, 46, 196, 0.14),
    inset 0 0 50px rgba(255, 46, 196, 0.07);
}
.sale-panel::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 46, 196, 0.35),
    transparent 70%
  );
  animation: planetFloat 5s ease-in-out infinite;
}
.sale-panel h3 {
  font-family: var(--font-h);
  font-size: 19px;
  color: #fff;
  position: relative;
}
.sale-panel h3 .hot {
  color: var(--magenta);
  text-shadow: 0 0 16px rgba(255, 46, 196, 0.9);
}
.sale-panel p {
  color: var(--dim);
  font-size: 14px;
  line-height: 1.6;
  margin: 8px 18px 8px 0;
  position: relative;
}
.countdown {
  display: flex;
  gap: 10px;
  position: relative;
  margin: 35px 0;
}
.cd-box {
  flex: 1;
  text-align: center;
  padding: 12px 4px 10px;
  border-radius: 12px;
  position: relative;
  background: rgba(255, 46, 196, 0.1);
  border: 1px solid rgba(255, 46, 196, 0.35);
}
.cd-box .num {
  font-family: var(--font-h);
  font-size: 26px;
  font-weight: 900;
  color: var(--magenta);
  text-shadow: 0 0 18px rgba(255, 46, 196, 0.8);
}
.cd-box .lab {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  margin-top: 3px;
}
.cd-sep {
  font-family: var(--font-h);
  color: var(--magenta);
  align-self: center;
  font-size: 20px;
  text-shadow: 0 0 10px var(--magenta);
}
.sale-panel .go {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  background: linear-gradient(90deg, #ff2ec4, #a855f7);
  color: #fff;
  font-family: var(--font-h);
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 0 22px rgba(255, 46, 196, 0.5);
  transition: 0.25s;
}
.sale-panel .go:hover {
  filter: brightness(1.2);
  transform: translateY(-2px);
  box-shadow: 0 0 34px rgba(255, 46, 196, 0.8);
}
.sale-products {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.prod-loading {
  text-align: center;
  padding: 60px 0;
  color: var(--dim);
  font-family: var(--font-m);
}
.load-sentinel {
  height: 1px;
}
.load-more-tip {
  text-align: center;
  padding: 26px 0 6px;
  color: var(--dim);
  font-family: var(--font-m);
  font-size: 12px;
}

@media (max-width: 1080px) {
  .sale-grid {
    grid-template-columns: 1fr;
  }
  .hero .wrap {
    grid-template-columns: 1fr;
    padding: 32px 20px;
  }
  .holo {
    min-height: 300px;
  }
  .planet {
    width: 150px;
    height: 150px;
  }
  .moon-1 {
    width: 30px;
    height: 30px;
  }
  .moon-2 {
    width: 20px;
    height: 20px;
  }
  .moon-3 {
    width: 25px;
    height: 25px;
  }
  .hero h1 {
    font-size: 32px;
  }
  .hero-stats {
    gap: 20px;
    flex-wrap: wrap;
  }
  .space-elements {
    display: none;
  }
}
</style>
