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
                <!-- 星球表面特征 -->
                <div
                  class="planet-crater"
                  v-for="i in 5"
                  :key="`crater-${i}`"
                ></div>
                <div
                  class="planet-mountain"
                  v-for="i in 3"
                  :key="`mountain-${i}`"
                ></div>
              </div>

              <!-- 小星球/卫星 -->
              <div class="moon moon-1"></div>
              <div class="moon moon-2"></div>
              <div class="moon moon-3"></div>
              <div class="moon moon-4"></div>
              <div class="moon moon-5"></div>
              <div class="moon moon-6"></div>

              <!-- 彗星 -->
              <div class="comet">
                <div class="comet-head"></div>
                <div class="comet-tail"></div>
                <div class="comet-tail tail-2"></div>
              </div>
              <div class="comet comet-2">
                <div class="comet-head"></div>
                <div class="comet-tail"></div>
                <div class="comet-tail tail-2"></div>
              </div>

              <!-- 星际之门 -->
              <div class="stargate">
                <div class="stargate-ring"></div>
                <div class="stargate-ring ring-2"></div>
                <div class="stargate-ring ring-3"></div>
                <div class="stargate-core"></div>
              </div>
              <div class="stargate stargate-2">
                <div class="stargate-ring"></div>
                <div class="stargate-ring ring-2"></div>
                <div class="stargate-ring ring-3"></div>
                <div class="stargate-core"></div>
              </div>

              <!-- 流星/粒子 -->
              <div
                class="shooting-star"
                v-for="i in 5"
                :key="`star-${i}`"
              ></div>
              <div
                class="particle"
                v-for="i in 10"
                :key="`particle-${i}`"
              ></div>

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
            <!-- 北斗七星（放大版） -->
            <div class="constellation big-dipper">
              <span class="star" v-for="i in 7" :key="`dipper-${i}`"></span>
              <svg class="constellation-line" viewBox="0 0 100 140">
                <polyline
                  points="10,130 20,100 35,85 50,70 65,55 80,40 90,20"
                />
              </svg>
            </div>

            <!-- 猎户座 -->
            <div class="constellation orion">
              <span class="star" v-for="i in 8" :key="`orion-${i}`"></span>
              <svg class="constellation-line" viewBox="0 0 120 160">
                <polyline points="20,140 30,110 50,90 60,70 50,50 40,30" />
                <line x1="30" y1="110" x2="70" y2="110" />
                <line x1="50" y1="90" x2="80" y2="90" />
                <line x1="60" y1="70" x2="90" y2="50" />
              </svg>
            </div>

            <!-- 仙后座 -->
            <div class="constellation cassiopeia">
              <span class="star" v-for="i in 5" :key="`cassiopeia-${i}`"></span>
              <svg class="constellation-line" viewBox="0 0 100 80">
                <polyline points="10,40 30,10 50,40 70,10 90,40" />
              </svg>
            </div>

            <!-- 天鹅座 -->
            <div class="constellation cygnus">
              <span class="star" v-for="i in 6" :key="`cygnus-${i}`"></span>
              <svg class="constellation-line" viewBox="0 0 100 120">
                <polyline points="50,10 50,50 50,90" />
                <line x1="20" y1="50" x2="80" y2="50" />
              </svg>
            </div>

            <!-- 黑洞（放大版） -->
            <div class="black-hole">
              <div class="bh-ring"></div>
              <div class="bh-ring ring-2"></div>
              <div class="bh-ring ring-3"></div>
              <div class="bh-core"></div>
              <div class="bh-accretion"></div>
              <div class="bh-glow"></div>
              <!-- 黑洞喷流 -->
              <div class="bh-jet jet-1"></div>
              <div class="bh-jet jet-2"></div>
            </div>

            <!-- 星云（放大版） -->
            <div class="nebula nebula-1"></div>
            <div class="nebula nebula-2"></div>
            <div class="nebula nebula-5"></div>
            <div class="nebula nebula-7"></div>
            <div class="nebula nebula-8"></div>

            <!-- 飘浮的大星星 -->
            <div
              class="floating-star"
              v-for="i in 20"
              :key="`fstar-l-${i}`"
            ></div>

            <!-- 银河旋臂（放大版） -->
            <div class="galaxy-arm"></div>
            <div class="galaxy-arm arm-2"></div>
            <div class="galaxy-arm arm-3"></div>

            <!-- 暗物质云 -->
            <div class="dark-matter dark-matter-1"></div>
            <div class="dark-matter dark-matter-2"></div>
            <div class="dark-matter dark-matter-3"></div>

            <!-- 引力波波纹 -->
            <div class="gravity-wave">
              <div class="wave-ring"></div>
              <div class="wave-ring ring-2"></div>
              <div class="wave-ring ring-3"></div>
            </div>
            <div class="gravity-wave gw-2">
              <div class="wave-ring"></div>
              <div class="wave-ring ring-2"></div>
              <div class="wave-ring ring-3"></div>
            </div>

            <!-- 螺旋星云 -->
            <div class="spiral-nebula">
              <div class="spiral-arm"></div>
              <div class="spiral-arm arm-2"></div>
              <div class="spiral-core"></div>
            </div>
          </div>

          <!-- 右侧星际元素 -->
          <div class="space-elements right">
            <!-- 星云（放大版） -->
            <div class="nebula nebula-3"></div>
            <div class="nebula nebula-4"></div>
            <div class="nebula nebula-6"></div>
            <div class="nebula nebula-9"></div>
            <div class="nebula nebula-10"></div>

            <!-- 飘浮的大星星 -->
            <div
              class="floating-star"
              v-for="i in 20"
              :key="`fstar-r-${i}`"
            ></div>

            <!-- 银河旋臂（放大版） -->
            <div class="galaxy-arm arm-right"></div>
            <div class="galaxy-arm arm-right-2"></div>
            <div class="galaxy-arm arm-right-3"></div>

            <!-- 脉冲星（放大版） -->
            <div class="pulsar">
              <div class="pulsar-core"></div>
              <div class="pulsar-beam beam-1"></div>
              <div class="pulsar-beam beam-2"></div>
              <div class="pulsar-beam beam-3"></div>
            </div>
            <div class="pulsar pulsar-2">
              <div class="pulsar-core"></div>
              <div class="pulsar-beam beam-1"></div>
              <div class="pulsar-beam beam-2"></div>
              <div class="pulsar-beam beam-3"></div>
            </div>

            <!-- 超新星遗迹（放大版） -->
            <div class="supernova-remnant"></div>
            <div class="supernova-remnant sn-2"></div>

            <!-- 星团 -->
            <div class="star-cluster">
              <div
                class="cluster-star"
                v-for="i in 8"
                :key="`cluster-${i}`"
              ></div>
            </div>
            <div class="star-cluster cluster-2">
              <div
                class="cluster-star"
                v-for="i in 6"
                :key="`cluster2-${i}`"
              ></div>
            </div>

            <!-- 类星体 -->
            <div class="quasar">
              <div class="quasar-core"></div>
              <div class="quasar-jet jet-1"></div>
              <div class="quasar-jet jet-2"></div>
              <div class="quasar-glow"></div>
            </div>
            <div class="quasar quasar-2">
              <div class="quasar-core"></div>
              <div class="quasar-jet jet-1"></div>
              <div class="quasar-jet jet-2"></div>
              <div class="quasar-glow"></div>
            </div>

            <!-- 暗能量流 -->
            <div class="dark-energy">
              <div class="energy-stream"></div>
              <div class="energy-stream stream-2"></div>
              <div class="energy-stream stream-3"></div>
            </div>
            <div class="dark-energy de-2">
              <div class="energy-stream"></div>
              <div class="energy-stream stream-2"></div>
              <div class="energy-stream stream-3"></div>
            </div>

            <!-- 螺旋星云 -->
            <div class="spiral-nebula sn-right">
              <div class="spiral-arm"></div>
              <div class="spiral-arm arm-2"></div>
              <div class="spiral-core"></div>
            </div>

            <!-- 小行星带 -->
            <div class="asteroid-belt">
              <div
                class="asteroid"
                v-for="i in 12"
                :key="`asteroid-${i}`"
              ></div>
            </div>
          </div>

          <!-- 额外星际装饰 - 底部 -->
          <div class="space-bottom">
            <div class="cosmic-dust"></div>
            <div class="cosmic-dust dust-2"></div>
            <div class="cosmic-dust dust-3"></div>
            <!-- 宇宙微波背景辐射 -->
            <div class="cmb"></div>
          </div>

          <!-- 顶部星际元素 -->
          <div class="space-top">
            <div class="aurora"></div>
            <div class="aurora aurora-2"></div>
            <div class="aurora aurora-3"></div>
            <div class="aurora aurora-4"></div>
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

/* 三屏各自背景 - 增强星云感 */
.hero-slide.s1 {
  background:
    radial-gradient(
      900px 600px at 78% 18%,
      rgba(168, 85, 247, 0.35),
      transparent 60%
    ),
    radial-gradient(
      700px 500px at 20% 80%,
      rgba(0, 240, 255, 0.2),
      transparent 60%
    ),
    radial-gradient(
      500px 400px at 50% 50%,
      rgba(100, 50, 200, 0.1),
      transparent 50%
    ),
    linear-gradient(115deg, #070b20 0%, #0b1030 45%, #120a2e 100%);
}
.hero-slide.s2 {
  background:
    radial-gradient(
      900px 600px at 80% 20%,
      rgba(255, 46, 196, 0.38),
      transparent 60%
    ),
    radial-gradient(
      700px 500px at 15% 85%,
      rgba(255, 107, 61, 0.25),
      transparent 60%
    ),
    radial-gradient(
      500px 400px at 60% 40%,
      rgba(200, 50, 100, 0.12),
      transparent 50%
    ),
    linear-gradient(115deg, #1c0714 0%, #2c0a1e 45%, #1c0a2e 100%);
}
.hero-slide.s3 {
  background:
    radial-gradient(
      900px 600px at 75% 18%,
      rgba(255, 197, 61, 0.3),
      transparent 60%
    ),
    radial-gradient(
      700px 500px at 25% 82%,
      rgba(57, 255, 136, 0.15),
      transparent 60%
    ),
    radial-gradient(
      500px 400px at 40% 60%,
      rgba(200, 150, 50, 0.1),
      transparent 50%
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
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(0, 240, 255, 0.45);
  background: rgba(5, 9, 24, 0.75);
  backdrop-filter: blur(8px);
  color: var(--cyan);
  font-size: 16px;
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

/* 星球表面特征 - 陨石坑 */
.planet-crater {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle at 40% 35%,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.35) 60%,
    rgba(0, 0, 0, 0.1) 100%
  );
  z-index: 3;
}
.planet-crater:nth-child(6) {
  width: 18px;
  height: 14px;
  top: 25%;
  left: 15%;
}
.planet-crater:nth-child(7) {
  width: 25px;
  height: 20px;
  top: 55%;
  right: 20%;
}
.planet-crater:nth-child(8) {
  width: 12px;
  height: 10px;
  top: 40%;
  left: 55%;
}
.planet-crater:nth-child(9) {
  width: 20px;
  height: 16px;
  top: 70%;
  left: 30%;
}
.planet-crater:nth-child(10) {
  width: 8px;
  height: 8px;
  top: 15%;
  left: 45%;
}

/* 星球表面特征 - 山脉 */
.planet-mountain {
  position: absolute;
  border-radius: 50% 50% 50% 50% / 30% 30% 70% 70%;
  background: rgba(255, 255, 255, 0.04);
  z-index: 3;
}
.planet-mountain:nth-child(11) {
  width: 30px;
  height: 18px;
  bottom: 20%;
  right: 25%;
  transform: rotate(-20deg);
}
.planet-mountain:nth-child(12) {
  width: 22px;
  height: 14px;
  top: 30%;
  left: 35%;
  transform: rotate(30deg);
}
.planet-mountain:nth-child(13) {
  width: 18px;
  height: 12px;
  bottom: 35%;
  left: 10%;
  transform: rotate(-10deg);
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
.moon-4 {
  width: 18px;
  height: 18px;
  bottom: 25%;
  right: 0;
  animation: moonOrbit1 18s linear infinite 2s;
}
.moon-5 {
  width: 22px;
  height: 22px;
  top: 45%;
  right: -5%;
  animation: moonOrbit2 20s linear infinite 3s;
}
.moon-6 {
  width: 15px;
  height: 15px;
  bottom: 40%;
  left: -3%;
  animation: moonOrbit3 15s linear infinite 1s;
}

/* ===== 彗星 ===== */
.comet {
  position: absolute;
  top: -10%;
  right: 20%;
  animation: cometFly 12s linear infinite;
  z-index: 4;
}
.comet-2 {
  top: 60%;
  right: -5%;
  animation-duration: 16s;
  animation-delay: 4s;
}
.comet-head {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #fff, #ffd700);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
}
.comet-tail {
  position: absolute;
  top: 50%;
  left: -60px;
  width: 60px;
  height: 2px;
  background: linear-gradient(to left, rgba(255, 215, 0, 0.6), transparent);
  transform: translateY(-50%);
}
.comet-tail.tail-2 {
  left: -90px;
  width: 90px;
  height: 1px;
  background: linear-gradient(to left, rgba(100, 200, 255, 0.3), transparent);
  top: 60%;
}
@keyframes cometFly {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  25% {
    transform: translate(-30px, 20px) scale(0.8);
    opacity: 0.8;
  }
  50% {
    transform: translate(-60px, 40px) scale(0.6);
    opacity: 0.6;
  }
  75% {
    transform: translate(-90px, 60px) scale(0.4);
    opacity: 0.3;
  }
  100% {
    transform: translate(-120px, 80px) scale(0);
    opacity: 0;
  }
}

/* ===== 星际之门 ===== */
.stargate {
  position: absolute;
  bottom: 0;
  left: 10%;
  width: 50px;
  height: 50px;
  z-index: 3;
  animation: stargatePulse 3s ease-in-out infinite;
}
.stargate-2 {
  top: 10%;
  right: 5%;
  left: auto;
  animation-delay: 1.5s;
  width: 35px;
  height: 35px;
}
.stargate-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(0, 240, 255, 0.2);
  animation: stargateSpin 8s linear infinite;
}
.stargate-ring.ring-2 {
  inset: 15%;
  border-color: rgba(0, 240, 255, 0.15);
  animation-duration: 6s;
  animation-direction: reverse;
}
.stargate-ring.ring-3 {
  inset: 30%;
  border-color: rgba(0, 240, 255, 0.1);
  animation-duration: 10s;
}
.stargate-core {
  position: absolute;
  inset: 40%;
  border-radius: 50%;
  background: radial-gradient(circle, #00f0ff, #0066ff);
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.5);
  animation: stargateCore 2s ease-in-out infinite;
}
@keyframes stargatePulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}
@keyframes stargateSpin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes stargateCore {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.4);
    opacity: 1;
  }
}

/* ============================================================
   星际元素 - 放大版（左侧和右侧分布）
   ============================================================ */
.space-elements {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: visible;
}

.space-elements.left {
  left: -100px;
}

.space-elements.right {
  right: -100px;
}

/* ===== 北斗七星（放大版） ===== */
.constellation {
  position: absolute;
  opacity: 0.8;
}

.constellation.big-dipper {
  top: 3%;
  left: 0;
  width: 140px;
  height: 200px;
}
.constellation.orion {
  bottom: 35%;
  left: -15%;
  width: 120px;
  height: 160px;
}
.constellation.cassiopeia {
  top: 50%;
  left: 5%;
  width: 100px;
  height: 80px;
}
.constellation.cygnus {
  bottom: 10%;
  left: 20%;
  width: 100px;
  height: 120px;
}

.constellation .star {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
  box-shadow:
    0 0 12px rgba(255, 255, 255, 0.9),
    0 0 24px rgba(100, 200, 255, 0.5);
  animation: twinkle 2s ease-in-out infinite;
}

.constellation.big-dipper .star:nth-child(1) {
  top: 90%;
  left: 5%;
  animation-delay: 0s;
}
.constellation.big-dipper .star:nth-child(2) {
  top: 72%;
  left: 15%;
  animation-delay: 0.3s;
}
.constellation.big-dipper .star:nth-child(3) {
  top: 55%;
  left: 25%;
  animation-delay: 0.6s;
}
.constellation.big-dipper .star:nth-child(4) {
  top: 38%;
  left: 35%;
  animation-delay: 0.9s;
}
.constellation.big-dipper .star:nth-child(5) {
  top: 22%;
  left: 45%;
  animation-delay: 1.2s;
}
.constellation.big-dipper .star:nth-child(6) {
  top: 8%;
  left: 55%;
  animation-delay: 1.5s;
}
.constellation.big-dipper .star:nth-child(7) {
  top: 2%;
  left: 70%;
  animation-delay: 1.8s;
}

.constellation.orion .star:nth-child(1) {
  top: 88%;
  left: 10%;
  animation-delay: 0.2s;
}
.constellation.orion .star:nth-child(2) {
  top: 70%;
  left: 20%;
  animation-delay: 0.5s;
}
.constellation.orion .star:nth-child(3) {
  top: 55%;
  left: 30%;
  animation-delay: 0.8s;
}
.constellation.orion .star:nth-child(4) {
  top: 40%;
  left: 40%;
  animation-delay: 1.1s;
}
.constellation.orion .star:nth-child(5) {
  top: 25%;
  left: 30%;
  animation-delay: 1.4s;
}
.constellation.orion .star:nth-child(6) {
  top: 10%;
  left: 20%;
  animation-delay: 1.7s;
}
.constellation.orion .star:nth-child(7) {
  top: 55%;
  left: 60%;
  animation-delay: 1s;
}
.constellation.orion .star:nth-child(8) {
  top: 40%;
  left: 70%;
  animation-delay: 1.3s;
}

.constellation.cassiopeia .star:nth-child(1) {
  top: 50%;
  left: 5%;
  animation-delay: 0s;
}
.constellation.cassiopeia .star:nth-child(2) {
  top: 10%;
  left: 25%;
  animation-delay: 0.4s;
}
.constellation.cassiopeia .star:nth-child(3) {
  top: 50%;
  left: 45%;
  animation-delay: 0.8s;
}
.constellation.cassiopeia .star:nth-child(4) {
  top: 10%;
  left: 65%;
  animation-delay: 1.2s;
}
.constellation.cassiopeia .star:nth-child(5) {
  top: 50%;
  left: 85%;
  animation-delay: 1.6s;
}

.constellation.cygnus .star:nth-child(1) {
  top: 5%;
  left: 48%;
  animation-delay: 0s;
}
.constellation.cygnus .star:nth-child(2) {
  top: 30%;
  left: 48%;
  animation-delay: 0.5s;
}
.constellation.cygnus .star:nth-child(3) {
  top: 55%;
  left: 48%;
  animation-delay: 1s;
}
.constellation.cygnus .star:nth-child(4) {
  top: 80%;
  left: 48%;
  animation-delay: 1.5s;
}
.constellation.cygnus .star:nth-child(5) {
  top: 42%;
  left: 10%;
  animation-delay: 0.7s;
}
.constellation.cygnus .star:nth-child(6) {
  top: 42%;
  left: 86%;
  animation-delay: 1.2s;
}

.constellation-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.4;
}

.constellation-line polyline,
.constellation-line line {
  fill: none;
  stroke: rgba(100, 200, 255, 0.4);
  stroke-width: 2;
  stroke-dasharray: 6 6;
}

/* ===== 黑洞（放大版） ===== */
.black-hole {
  position: absolute;
  bottom: 8%;
  left: -30%;
  width: 160px;
  height: 160px;
}

.bh-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(255, 100, 50, 0.2);
  animation: bhSpin 8s linear infinite;
}

.bh-ring {
  inset: 0;
  border-color: rgba(255, 100, 50, 0.15);
}
.bh-ring.ring-2 {
  inset: 15%;
  animation-duration: 6s;
  animation-direction: reverse;
  border-color: rgba(255, 150, 80, 0.12);
}
.bh-ring.ring-3 {
  inset: 30%;
  animation-duration: 10s;
  border-color: rgba(255, 200, 100, 0.1);
}

.bh-core {
  position: absolute;
  inset: 40%;
  border-radius: 50%;
  background: radial-gradient(circle, #2a0a00, #000);
  box-shadow: inset 0 0 30px rgba(255, 100, 50, 0.3);
}

.bh-accretion {
  position: absolute;
  inset: -25%;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0%,
    rgba(255, 100, 50, 0.08) 20%,
    rgba(255, 200, 100, 0.12) 40%,
    rgba(255, 100, 50, 0.08) 60%,
    transparent 80%,
    transparent 100%
  );
  animation: bhAccretion 4s linear infinite;
}

.bh-glow {
  position: absolute;
  inset: -60%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 100, 50, 0.05),
    transparent 70%
  );
  filter: blur(30px);
  animation: bhGlow 3s ease-in-out infinite;
}

/* 黑洞喷流 */
.bh-jet {
  position: absolute;
  width: 4px;
  background: linear-gradient(to top, rgba(255, 200, 100, 0.6), transparent);
  animation: bhJet 4s ease-in-out infinite;
}
.bh-jet.jet-1 {
  height: 80px;
  bottom: 100%;
  left: 48%;
  transform: rotate(8deg);
  animation-delay: 0.5s;
}
.bh-jet.jet-2 {
  height: 60px;
  bottom: 100%;
  right: 48%;
  transform: rotate(-8deg);
  animation-delay: 1.5s;
}
@keyframes bhJet {
  0%,
  100% {
    transform: scaleY(1);
    opacity: 0.6;
  }
  50% {
    transform: scaleY(1.8);
    opacity: 1;
  }
}

@keyframes bhGlow {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

/* ===== 星云（放大版） ===== */
.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.4;
  animation: nebulaFloat 12s ease-in-out infinite;
}

.nebula-1 {
  width: 200px;
  height: 140px;
  top: 15%;
  left: -30%;
  background: radial-gradient(ellipse, rgba(168, 85, 247, 0.5), transparent);
  animation-delay: 0s;
}
.nebula-2 {
  width: 160px;
  height: 110px;
  bottom: 35%;
  left: -15%;
  background: radial-gradient(ellipse, rgba(0, 240, 255, 0.3), transparent);
  animation-delay: 4s;
}
.nebula-5 {
  width: 120px;
  height: 80px;
  top: 55%;
  left: -40%;
  background: radial-gradient(ellipse, rgba(255, 200, 100, 0.2), transparent);
  animation-delay: 8s;
}
.nebula-7 {
  width: 100px;
  height: 70px;
  bottom: 5%;
  left: 10%;
  background: radial-gradient(ellipse, rgba(57, 255, 136, 0.15), transparent);
  animation-delay: 2s;
}
.nebula-8 {
  width: 80px;
  height: 55px;
  top: 5%;
  left: -10%;
  background: radial-gradient(ellipse, rgba(255, 46, 196, 0.15), transparent);
  animation-delay: 6s;
}

.nebula-3 {
  width: 180px;
  height: 130px;
  top: 10%;
  right: -25%;
  background: radial-gradient(ellipse, rgba(255, 46, 196, 0.4), transparent);
  animation-delay: 2s;
}
.nebula-4 {
  width: 220px;
  height: 160px;
  bottom: 25%;
  right: -30%;
  background: radial-gradient(ellipse, rgba(57, 255, 136, 0.25), transparent);
  animation-delay: 6s;
}
.nebula-6 {
  width: 140px;
  height: 100px;
  top: 50%;
  right: -40%;
  background: radial-gradient(ellipse, rgba(100, 200, 255, 0.2), transparent);
  animation-delay: 10s;
}
.nebula-9 {
  width: 90px;
  height: 60px;
  bottom: 5%;
  right: 5%;
  background: radial-gradient(ellipse, rgba(168, 85, 247, 0.15), transparent);
  animation-delay: 3s;
}
.nebula-10 {
  width: 110px;
  height: 75px;
  top: 5%;
  right: -10%;
  background: radial-gradient(ellipse, rgba(255, 200, 100, 0.15), transparent);
  animation-delay: 7s;
}

@keyframes nebulaFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.4;
  }
  33% {
    transform: translate(15px, -20px) scale(1.15);
    opacity: 0.6;
  }
  66% {
    transform: translate(-8px, 15px) scale(0.9);
    opacity: 0.3;
  }
}

/* ===== 飘浮的大星星 ===== */
.floating-star {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  animation: floatStar 6s ease-in-out infinite;
}

.space-elements.left .floating-star:nth-child(1) {
  top: 2%;
  left: 15%;
  animation-delay: 0.1s;
}
.space-elements.left .floating-star:nth-child(2) {
  top: 8%;
  left: 75%;
  animation-delay: 0.6s;
}
.space-elements.left .floating-star:nth-child(3) {
  top: 18%;
  left: 5%;
  animation-delay: 1.1s;
}
.space-elements.left .floating-star:nth-child(4) {
  top: 25%;
  left: 85%;
  animation-delay: 1.6s;
}
.space-elements.left .floating-star:nth-child(5) {
  top: 35%;
  left: 10%;
  animation-delay: 2.1s;
}
.space-elements.left .floating-star:nth-child(6) {
  top: 42%;
  left: 70%;
  animation-delay: 2.6s;
}
.space-elements.left .floating-star:nth-child(7) {
  top: 52%;
  left: 0%;
  animation-delay: 3.1s;
}
.space-elements.left .floating-star:nth-child(8) {
  top: 60%;
  left: 80%;
  animation-delay: 3.6s;
}
.space-elements.left .floating-star:nth-child(9) {
  top: 70%;
  left: 15%;
  animation-delay: 4.1s;
}
.space-elements.left .floating-star:nth-child(10) {
  top: 78%;
  left: 65%;
  animation-delay: 4.6s;
}
.space-elements.left .floating-star:nth-child(11) {
  top: 85%;
  left: 5%;
  animation-delay: 5.1s;
}
.space-elements.left .floating-star:nth-child(12) {
  top: 92%;
  left: 75%;
  animation-delay: 5.6s;
}
.space-elements.left .floating-star:nth-child(13) {
  top: 15%;
  left: 45%;
  animation-delay: 0.3s;
}
.space-elements.left .floating-star:nth-child(14) {
  top: 48%;
  left: 35%;
  animation-delay: 1.8s;
}
.space-elements.left .floating-star:nth-child(15) {
  top: 65%;
  left: 50%;
  animation-delay: 3.3s;
}
.space-elements.left .floating-star:nth-child(16) {
  top: 30%;
  left: 55%;
  animation-delay: 0.8s;
}
.space-elements.left .floating-star:nth-child(17) {
  top: 55%;
  left: 20%;
  animation-delay: 2.3s;
}
.space-elements.left .floating-star:nth-child(18) {
  top: 75%;
  left: 40%;
  animation-delay: 3.8s;
}
.space-elements.left .floating-star:nth-child(19) {
  top: 5%;
  left: 35%;
  animation-delay: 4.8s;
}
.space-elements.left .floating-star:nth-child(20) {
  top: 40%;
  left: 5%;
  animation-delay: 0.9s;
}

.space-elements.right .floating-star:nth-child(1) {
  top: 3%;
  right: 10%;
  animation-delay: 0.2s;
}
.space-elements.right .floating-star:nth-child(2) {
  top: 10%;
  right: 70%;
  animation-delay: 0.7s;
}
.space-elements.right .floating-star:nth-child(3) {
  top: 20%;
  right: 0%;
  animation-delay: 1.2s;
}
.space-elements.right .floating-star:nth-child(4) {
  top: 28%;
  right: 80%;
  animation-delay: 1.7s;
}
.space-elements.right .floating-star:nth-child(5) {
  top: 38%;
  right: 15%;
  animation-delay: 2.2s;
}
.space-elements.right .floating-star:nth-child(6) {
  top: 45%;
  right: 65%;
  animation-delay: 2.7s;
}
.space-elements.right .floating-star:nth-child(7) {
  top: 55%;
  right: 5%;
  animation-delay: 3.2s;
}
.space-elements.right .floating-star:nth-child(8) {
  top: 62%;
  right: 75%;
  animation-delay: 3.7s;
}
.space-elements.right .floating-star:nth-child(9) {
  top: 72%;
  right: 20%;
  animation-delay: 4.2s;
}
.space-elements.right .floating-star:nth-child(10) {
  top: 80%;
  right: 60%;
  animation-delay: 4.7s;
}
.space-elements.right .floating-star:nth-child(11) {
  top: 88%;
  right: 10%;
  animation-delay: 5.2s;
}
.space-elements.right .floating-star:nth-child(12) {
  top: 95%;
  right: 70%;
  animation-delay: 5.7s;
}
.space-elements.right .floating-star:nth-child(13) {
  top: 18%;
  right: 40%;
  animation-delay: 0.4s;
}
.space-elements.right .floating-star:nth-child(14) {
  top: 50%;
  right: 30%;
  animation-delay: 1.9s;
}
.space-elements.right .floating-star:nth-child(15) {
  top: 68%;
  right: 45%;
  animation-delay: 3.4s;
}
.space-elements.right .floating-star:nth-child(16) {
  top: 35%;
  right: 50%;
  animation-delay: 0.9s;
}
.space-elements.right .floating-star:nth-child(17) {
  top: 58%;
  right: 15%;
  animation-delay: 2.4s;
}
.space-elements.right .floating-star:nth-child(18) {
  top: 78%;
  right: 35%;
  animation-delay: 3.9s;
}
.space-elements.right .floating-star:nth-child(19) {
  top: 8%;
  right: 30%;
  animation-delay: 4.9s;
}
.space-elements.right .floating-star:nth-child(20) {
  top: 42%;
  right: 0%;
  animation-delay: 1s;
}

@keyframes floatStar {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(8px, -15px) scale(1.8);
    opacity: 1;
  }
}

/* ===== 银河旋臂（放大版） ===== */
.galaxy-arm {
  position: absolute;
  width: 3px;
  height: 300px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(200, 180, 255, 0.08) 15%,
    rgba(200, 180, 255, 0.2) 40%,
    rgba(200, 180, 255, 0.08) 65%,
    transparent 100%
  );
  transform-origin: bottom center;
  animation: galaxySway 8s ease-in-out infinite;
}

.galaxy-arm {
  bottom: -30px;
  left: 5%;
  transform: rotate(-20deg);
}
.galaxy-arm.arm-2 {
  bottom: -20px;
  left: 35%;
  transform: rotate(-35deg);
  animation-delay: 4s;
  height: 200px;
  opacity: 0.6;
}
.galaxy-arm.arm-3 {
  bottom: -10px;
  left: 65%;
  transform: rotate(-15deg);
  animation-delay: 2s;
  height: 150px;
  opacity: 0.4;
}

.galaxy-arm.arm-right {
  bottom: -30px;
  right: 5%;
  left: auto;
  transform: rotate(20deg);
  animation-delay: 2s;
}
.galaxy-arm.arm-right-2 {
  bottom: -20px;
  right: 35%;
  left: auto;
  transform: rotate(35deg);
  animation-delay: 6s;
  height: 200px;
  opacity: 0.6;
}
.galaxy-arm.arm-right-3 {
  bottom: -10px;
  right: 65%;
  left: auto;
  transform: rotate(15deg);
  animation-delay: 4s;
  height: 150px;
  opacity: 0.4;
}

@keyframes galaxySway {
  0%,
  100% {
    transform: rotate(-20deg) scaleY(1);
  }
  50% {
    transform: rotate(-8deg) scaleY(1.15);
  }
}

.galaxy-arm.arm-right {
  animation-name: galaxySwayRight;
}
.galaxy-arm.arm-right-2 {
  animation-name: galaxySwayRight;
}
.galaxy-arm.arm-right-3 {
  animation-name: galaxySwayRight;
}

@keyframes galaxySwayRight {
  0%,
  100% {
    transform: rotate(20deg) scaleY(1);
  }
  50% {
    transform: rotate(8deg) scaleY(1.15);
  }
}

/* ===== 脉冲星（放大版） ===== */
.pulsar {
  position: absolute;
  top: 15%;
  right: -25%;
  width: 80px;
  height: 80px;
}
.pulsar-2 {
  bottom: 15%;
  right: -10%;
  top: auto;
  width: 60px;
  height: 60px;
}

.pulsar-core {
  position: absolute;
  inset: 30%;
  border-radius: 50%;
  background: radial-gradient(circle, #fff, #a855f7);
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.8);
  animation: pulsarCore 1.5s ease-in-out infinite;
}

.pulsar-beam {
  position: absolute;
  inset: 35%;
  border-radius: 50%;
  border: 3px solid rgba(168, 85, 247, 0.2);
}

.pulsar-beam.beam-1 {
  transform: rotate(0deg) scaleX(4);
  border-color: rgba(168, 85, 247, 0.2);
  animation: pulsarBeam1 2s linear infinite;
}
.pulsar-beam.beam-2 {
  transform: rotate(60deg) scaleX(4);
  border-color: rgba(236, 72, 153, 0.2);
  animation: pulsarBeam1 2s linear infinite 0.33s;
}
.pulsar-beam.beam-3 {
  transform: rotate(120deg) scaleX(4);
  border-color: rgba(99, 102, 241, 0.2);
  animation: pulsarBeam1 2s linear infinite 0.66s;
}

@keyframes pulsarCore {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.6;
  }
}

@keyframes pulsarBeam1 {
  0% {
    transform: rotate(0deg) scaleX(4);
    opacity: 0.2;
  }
  50% {
    transform: rotate(180deg) scaleX(5);
    opacity: 0.6;
  }
  100% {
    transform: rotate(360deg) scaleX(4);
    opacity: 0.2;
  }
}

/* ===== 超新星遗迹（放大版） ===== */
.supernova-remnant {
  position: absolute;
  bottom: 20%;
  right: -30%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 200, 100, 0.1),
    rgba(255, 100, 50, 0.05) 40%,
    transparent 70%
  );
  border: 2px solid rgba(255, 200, 100, 0.12);
  animation: supernovaPulse 6s ease-in-out infinite;
}
.sn-2 {
  top: 30%;
  right: -15%;
  bottom: auto;
  width: 80px;
  height: 80px;
  animation-delay: 3s;
}

.supernova-remnant::before {
  content: '';
  position: absolute;
  inset: 20%;
  border-radius: 50%;
  border: 1.5px dashed rgba(255, 200, 100, 0.1);
  animation: supernovaSpin 10s linear infinite;
}
.supernova-remnant::after {
  content: '';
  position: absolute;
  inset: -20%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 200, 100, 0.03),
    transparent 60%
  );
  animation: supernovaPulse 6s ease-in-out infinite 0.5s;
}

@keyframes supernovaPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.7;
  }
}

@keyframes supernovaSpin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== 星团 ===== */
.star-cluster {
  position: absolute;
  bottom: 5%;
  right: 5%;
  width: 60px;
  height: 60px;
}
.cluster-2 {
  top: 40%;
  right: 0%;
  bottom: auto;
  width: 45px;
  height: 45px;
}

.star-cluster .cluster-star {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  animation: twinkle 2s ease-in-out infinite;
}

.star-cluster .cluster-star:nth-child(1) {
  width: 5px;
  height: 5px;
  top: 10%;
  left: 50%;
  animation-delay: 0.4s;
  box-shadow: 0 0 8px rgba(255, 200, 200, 0.6);
}
.star-cluster .cluster-star:nth-child(2) {
  width: 3px;
  height: 3px;
  top: 70%;
  left: 20%;
  animation-delay: 1s;
  box-shadow: 0 0 6px rgba(200, 200, 255, 0.5);
}
.star-cluster .cluster-star:nth-child(3) {
  width: 4px;
  height: 4px;
  top: 40%;
  left: 80%;
  animation-delay: 1.6s;
  box-shadow: 0 0 8px rgba(255, 255, 200, 0.6);
}
.star-cluster .cluster-star:nth-child(4) {
  width: 3px;
  height: 3px;
  top: 80%;
  left: 70%;
  animation-delay: 2.2s;
  box-shadow: 0 0 6px rgba(200, 255, 200, 0.5);
}
.star-cluster .cluster-star:nth-child(5) {
  width: 5px;
  height: 5px;
  top: 60%;
  left: 45%;
  animation-delay: 0.6s;
  box-shadow: 0 0 10px rgba(255, 200, 255, 0.7);
}
.star-cluster .cluster-star:nth-child(6) {
  width: 2px;
  height: 2px;
  top: 30%;
  left: 15%;
  animation-delay: 1.8s;
  box-shadow: 0 0 4px rgba(200, 255, 255, 0.4);
}
.star-cluster .cluster-star:nth-child(7) {
  width: 4px;
  height: 4px;
  top: 15%;
  left: 70%;
  animation-delay: 2.6s;
  box-shadow: 0 0 8px rgba(255, 200, 100, 0.5);
}
.star-cluster .cluster-star:nth-child(8) {
  width: 3px;
  height: 3px;
  top: 50%;
  left: 10%;
  animation-delay: 0.8s;
  box-shadow: 0 0 6px rgba(100, 200, 255, 0.5);
}

.cluster-2 .cluster-star:nth-child(1) {
  width: 4px;
  height: 4px;
  top: 15%;
  left: 40%;
  animation-delay: 0.3s;
}
.cluster-2 .cluster-star:nth-child(2) {
  width: 2px;
  height: 2px;
  top: 60%;
  left: 10%;
  animation-delay: 0.9s;
}
.cluster-2 .cluster-star:nth-child(3) {
  width: 3px;
  height: 3px;
  top: 35%;
  left: 75%;
  animation-delay: 1.5s;
}
.cluster-2 .cluster-star:nth-child(4) {
  width: 2px;
  height: 2px;
  top: 75%;
  left: 65%;
  animation-delay: 2.1s;
}
.cluster-2 .cluster-star:nth-child(5) {
  width: 4px;
  height: 4px;
  top: 50%;
  left: 45%;
  animation-delay: 0.5s;
}
.cluster-2 .cluster-star:nth-child(6) {
  width: 2px;
  height: 2px;
  top: 25%;
  left: 20%;
  animation-delay: 1.7s;
}

/* ===== 类星体 ===== */
.quasar {
  position: absolute;
  top: 45%;
  right: -15%;
  width: 60px;
  height: 60px;
}
.quasar-2 {
  bottom: 35%;
  right: -25%;
  top: auto;
  width: 45px;
  height: 45px;
}
.quasar-core {
  position: absolute;
  inset: 25%;
  border-radius: 50%;
  background: radial-gradient(circle, #fff, #0066ff);
  box-shadow: 0 0 40px rgba(0, 102, 255, 0.8);
  animation: quasarCore 2s ease-in-out infinite;
}
.quasar-jet {
  position: absolute;
  width: 2px;
  background: linear-gradient(to top, rgba(0, 102, 255, 0.6), transparent);
  animation: quasarJet 3s ease-in-out infinite;
}
.quasar-jet.jet-1 {
  height: 50px;
  bottom: 100%;
  left: 45%;
  transform: rotate(-10deg);
  animation-delay: 0.2s;
}
.quasar-jet.jet-2 {
  height: 40px;
  bottom: 100%;
  right: 45%;
  transform: rotate(10deg);
  animation-delay: 1.2s;
}
.quasar-glow {
  position: absolute;
  inset: -80%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 102, 255, 0.05), transparent 70%);
  filter: blur(20px);
  animation: quasarGlow 3s ease-in-out infinite;
}
@keyframes quasarCore {
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
@keyframes quasarJet {
  0%,
  100% {
    transform: scaleY(1);
    opacity: 0.4;
  }
  50% {
    transform: scaleY(2);
    opacity: 1;
  }
}
@keyframes quasarGlow {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.3);
  }
}

/* ===== 暗物质云 ===== */
.dark-matter {
  position: absolute;
  border-radius: 50%;
  filter: blur(30px);
  opacity: 0.15;
  animation: darkMatter 8s ease-in-out infinite;
}
.dark-matter-1 {
  width: 100px;
  height: 80px;
  top: 30%;
  left: -20%;
  background: radial-gradient(ellipse, rgba(100, 50, 200, 0.3), transparent);
  animation-delay: 0s;
}
.dark-matter-2 {
  width: 80px;
  height: 60px;
  bottom: 45%;
  left: -10%;
  background: radial-gradient(ellipse, rgba(50, 100, 200, 0.2), transparent);
  animation-delay: 4s;
}
.dark-matter-3 {
  width: 60px;
  height: 45px;
  top: 70%;
  left: 5%;
  background: radial-gradient(ellipse, rgba(200, 50, 100, 0.15), transparent);
  animation-delay: 2s;
}
@keyframes darkMatter {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.15;
  }
  50% {
    transform: translate(20px, -10px) scale(1.3);
    opacity: 0.25;
  }
}

/* ===== 暗能量流 ===== */
.dark-energy {
  position: absolute;
  bottom: 25%;
  right: -10%;
  width: 100px;
  height: 60px;
}
.de-2 {
  top: 25%;
  right: -5%;
  bottom: auto;
  width: 80px;
  height: 45px;
}

.energy-stream {
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(100, 200, 255, 0.1) 30%,
    rgba(100, 200, 255, 0.3) 50%,
    rgba(100, 200, 255, 0.1) 70%,
    transparent 100%
  );
  animation: energyStream 4s ease-in-out infinite;
}
.energy-stream:nth-child(1) {
  left: 20%;
  animation-delay: 0s;
}
.energy-stream:nth-child(2) {
  left: 50%;
  animation-delay: 1.3s;
  height: 80%;
  top: 10%;
}
.energy-stream:nth-child(3) {
  left: 80%;
  animation-delay: 2.6s;
  height: 70%;
  top: 15%;
}
@keyframes energyStream {
  0% {
    transform: scaleY(0.5);
    opacity: 0.3;
  }
  50% {
    transform: scaleY(1.5);
    opacity: 0.8;
  }
  100% {
    transform: scaleY(0.5);
    opacity: 0.3;
  }
}

/* ===== 引力波波纹 ===== */
.gravity-wave {
  position: absolute;
  top: 55%;
  left: -10%;
  width: 80px;
  height: 80px;
}
.gw-2 {
  top: 25%;
  left: 5%;
  width: 60px;
  height: 60px;
}
.wave-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(0, 240, 255, 0.08);
  animation: waveRing 4s ease-in-out infinite;
}
.wave-ring.ring-2 {
  inset: 25%;
  animation-delay: 1s;
  border-color: rgba(0, 240, 255, 0.06);
}
.wave-ring.ring-3 {
  inset: 50%;
  animation-delay: 2s;
  border-color: rgba(0, 240, 255, 0.04);
}
@keyframes waveRing {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

/* ===== 螺旋星云 ===== */
.spiral-nebula {
  position: absolute;
  top: 15%;
  left: -15%;
  width: 100px;
  height: 100px;
}
.sn-right {
  top: 60%;
  right: -20%;
  left: auto;
}
.spiral-arm {
  position: absolute;
  width: 60px;
  height: 4px;
  background: linear-gradient(to right, rgba(168, 85, 247, 0.3), transparent);
  border-radius: 50%;
  transform-origin: center;
  animation: spiralSpin 10s linear infinite;
}
.spiral-arm {
  top: 48%;
  left: 20%;
  transform: rotate(0deg) scaleX(1.2);
}
.spiral-arm.arm-2 {
  top: 48%;
  left: 20%;
  transform: rotate(120deg) scaleX(1.2);
  animation-delay: 3.3s;
}
.spiral-core {
  position: absolute;
  inset: 35%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.6), transparent);
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.3);
}
@keyframes spiralSpin {
  to {
    transform: rotate(360deg) scaleX(1.2);
  }
}

/* ===== 小行星带 ===== */
.asteroid-belt {
  position: absolute;
  top: 70%;
  right: -5%;
  width: 80px;
  height: 80px;
}
.asteroid {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #64748b, #334155);
  animation: asteroidOrbit 8s linear infinite;
}
.asteroid:nth-child(1) {
  width: 6px;
  height: 5px;
  top: 10%;
  left: 50%;
  animation-delay: 0s;
}
.asteroid:nth-child(2) {
  width: 4px;
  height: 3px;
  top: 30%;
  left: 80%;
  animation-delay: 0.7s;
}
.asteroid:nth-child(3) {
  width: 7px;
  height: 6px;
  top: 55%;
  left: 85%;
  animation-delay: 1.4s;
}
.asteroid:nth-child(4) {
  width: 3px;
  height: 3px;
  top: 75%;
  left: 60%;
  animation-delay: 2.1s;
}
.asteroid:nth-child(5) {
  width: 5px;
  height: 4px;
  top: 80%;
  left: 30%;
  animation-delay: 2.8s;
}
.asteroid:nth-child(6) {
  width: 4px;
  height: 4px;
  top: 60%;
  left: 10%;
  animation-delay: 3.5s;
}
.asteroid:nth-child(7) {
  width: 6px;
  height: 5px;
  top: 35%;
  left: 5%;
  animation-delay: 4.2s;
}
.asteroid:nth-child(8) {
  width: 3px;
  height: 3px;
  top: 15%;
  left: 20%;
  animation-delay: 4.9s;
}
.asteroid:nth-child(9) {
  width: 5px;
  height: 4px;
  top: 45%;
  left: 70%;
  animation-delay: 5.6s;
}
.asteroid:nth-child(10) {
  width: 4px;
  height: 3px;
  top: 70%;
  left: 45%;
  animation-delay: 6.3s;
}
.asteroid:nth-child(11) {
  width: 3px;
  height: 3px;
  top: 20%;
  left: 60%;
  animation-delay: 7s;
}
.asteroid:nth-child(12) {
  width: 5px;
  height: 4px;
  top: 50%;
  left: 30%;
  animation-delay: 7.7s;
}
@keyframes asteroidOrbit {
  0% {
    transform: rotate(0deg) translateX(30px) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(30px) rotate(-360deg);
  }
}

/* ===== 顶部极光 ===== */
.space-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.aurora {
  position: absolute;
  top: -20px;
  height: 60px;
  filter: blur(20px);
  opacity: 0.2;
  animation: aurora 8s ease-in-out infinite;
}
.aurora {
  left: 0;
  width: 40%;
  background: linear-gradient(
    to right,
    rgba(0, 240, 255, 0.3),
    rgba(168, 85, 247, 0.1)
  );
  animation-delay: 0s;
}
.aurora-2 {
  left: 20%;
  width: 35%;
  background: linear-gradient(
    to right,
    rgba(255, 46, 196, 0.2),
    rgba(0, 240, 255, 0.1)
  );
  animation-delay: 2.6s;
}
.aurora-3 {
  left: 50%;
  width: 30%;
  background: linear-gradient(
    to right,
    rgba(57, 255, 136, 0.15),
    rgba(168, 85, 247, 0.1)
  );
  animation-delay: 5.2s;
}
.aurora-4 {
  left: 70%;
  width: 25%;
  background: linear-gradient(
    to right,
    rgba(255, 200, 100, 0.15),
    rgba(255, 46, 196, 0.1)
  );
  animation-delay: 3.8s;
}
@keyframes aurora {
  0%,
  100% {
    transform: translateX(0) scaleY(1);
    opacity: 0.15;
  }
  50% {
    transform: translateX(30px) scaleY(1.5);
    opacity: 0.35;
  }
}

/* ===== 宇宙微波背景辐射 ===== */
.cmb {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background:
    radial-gradient(
      ellipse at 20% 100%,
      rgba(0, 240, 255, 0.02) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 50% 100%,
      rgba(168, 85, 247, 0.02) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 100%,
      rgba(57, 255, 136, 0.02) 0%,
      transparent 50%
    );
  pointer-events: none;
  z-index: 0;
}

/* ===== 底部宇宙尘埃 ===== */
.space-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.cosmic-dust {
  position: absolute;
  bottom: 0;
  left: -50%;
  width: 200%;
  height: 100%;
  background: radial-gradient(
    ellipse at 30% 100%,
    rgba(168, 85, 247, 0.04) 0%,
    transparent 50%
  );
  animation: dustDrift 20s linear infinite;
}
.cosmic-dust.dust-2 {
  background: radial-gradient(
    ellipse at 70% 100%,
    rgba(0, 240, 255, 0.03) 0%,
    transparent 50%
  );
  animation: dustDrift 20s linear infinite reverse;
  animation-delay: 5s;
}
.cosmic-dust.dust-3 {
  background: radial-gradient(
    ellipse at 50% 100%,
    rgba(255, 46, 196, 0.03) 0%,
    transparent 50%
  );
  animation: dustDrift 25s linear infinite;
  animation-delay: 10s;
}

@keyframes dustDrift {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(20%);
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
    transform: scale(1.6);
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

@keyframes bhSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes bhAccretion {
  to {
    transform: rotate(360deg);
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
    transform: translate(80px, 50px) scale(0);
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
    transform: translateY(-25px) scale(1.8);
    opacity: 0.9;
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
  .moon-4 {
    width: 15px;
    height: 15px;
  }
  .moon-5,
  .moon-6 {
    display: none;
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
  .comet {
    display: none;
  }
  .stargate {
    display: none;
  }
}
</style>
