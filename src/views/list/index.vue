<template>
  <div class="nb-list">
    <div class="wrap">
      <!-- ===== 面包屑 ===== -->
      <div class="crumbs">
        <router-link to="/">Nebula Home</router-link>
        <span class="sep">/</span>
        <span class="cur">
          {{
            searchKeyword ? `搜索：${searchKeyword}` : '量子商品库 · 全部商品'
          }}
        </span>
      </div>
      <div class="page-head sec-head">
        <div class="sec-title">
          <h2>
            ◈ 量子商品库
            <small>
              {{
                searchKeyword
                  ? `SEARCH · ${searchKeyword}`
                  : 'PRODUCT ARCHIVE · 全量商品数据流'
              }}
            </small>
          </h2>
        </div>
      </div>

      <!-- ===== 筛选条 ===== -->
      <div class="sticky-zone">
        <div class="fbar">
          <div class="fsec">
            <div class="fsec-t">
              <span class="ft-cn">◈ 品牌矩阵</span>
              <span class="ft-en">BRAND MATRIX</span>
            </div>
            <div class="fopts">
              <span
                v-for="(count, brand) in brandCounts"
                :key="brand"
                class="fpill-wrap"
              >
                <button
                  class="fpill"
                  :class="{ active: state.brands.includes(brand) }"
                  @click="toggleMulti('brands', brand)"
                >
                  {{ brand }}
                  <span class="cnt">{{ count }}</span>
                </button>
                <router-link
                  v-if="brandIdOf(brand) != null"
                  class="fshop"
                  :to="{ path: '/shop', query: { brandId: brandIdOf(brand) } }"
                  title="进入店铺"
                >
                  进店
                </router-link>
              </span>
            </div>
          </div>
          <div class="fsec">
            <div class="fsec-t">
              <span class="ft-cn">✦ 商品标签</span>
              <span class="ft-en">PRODUCT TAGS</span>
            </div>
            <div class="fopts">
              <button
                v-for="t in TAGS"
                :key="t"
                class="fpill"
                :class="{ active: state.tags.includes(t) }"
                @click="toggleMulti('tags', t)"
              >
                {{ t }}
              </button>
            </div>
          </div>
          <div class="fsec">
            <div class="fsec-t">
              <span class="ft-cn">◎ 价格区间</span>
              <span class="ft-en">PRICE RANGE</span>
            </div>
            <div class="fopts">
              <button
                v-for="r in pricePresets"
                :key="r.label"
                class="fpill"
                :class="{ active: isPriceActive(r) }"
                @click="applyPricePreset(r)"
              >
                {{ r.label }}
              </button>
            </div>
            <div class="pc-row">
              <input
                name="pMinText"
                v-model.trim="pMinText"
                type="text"
                inputmode="numeric"
                placeholder="最低¥"
              />
              <span class="pc-sep">—</span>
              <input
                name="pMaxText"
                v-model.trim="pMaxText"
                type="text"
                inputmode="numeric"
                placeholder="最高¥"
              />
              <button class="pc-ok" @click="applyCustomPrice">确定</button>
            </div>
          </div>
          <!-- ===== 高级筛选（属性聚合：颜色 / 屏幕刷新率…，hover 弹出选项） ===== -->
          <div v-if="advGroups.length" class="fsec fsec-adv">
            <div class="fsec-t">
              <span class="ft-cn">◈ 高级筛选</span>
              <span class="ft-en">ADVANCED</span>
            </div>
            <div class="adv-groups">
              <div
                v-for="g in advGroups"
                :key="g.attrId"
                class="adv-group"
                @mouseenter="openGroup(g)"
                @mouseleave="scheduleCloseGroup(g)"
              >
                <button
                  type="button"
                  class="adv-trigger"
                  :class="{
                    active: isAttrActive(g),
                    open: hoverAttrId === g.attrId,
                  }"
                  @click="toggleGroup(g)"
                >
                  <span class="adv-name">{{ g.attrName }}</span>
                  <span v-if="attrSelCount(g)" class="adv-badge">
                    {{ attrSelCount(g) }}
                  </span>
                  <span class="adv-caret">▾</span>
                </button>
                <transition name="adv-pop">
                  <div
                    v-if="hoverAttrId === g.attrId"
                    class="adv-pop"
                    @mouseenter="cancelClose(g)"
                    @mouseleave="scheduleCloseGroup(g)"
                  >
                    <button
                      v-for="v in g.attrValue"
                      :key="v"
                      type="button"
                      class="adv-opt"
                      :class="{ on: isAttrValueOn(g, v) }"
                      @click="toggleAttrValue(g, v)"
                    >
                      <span class="adv-opt-dot">●</span>
                      {{ v }}
                    </button>
                  </div>
                </transition>
              </div>
            </div>
            <button
              v-if="hasAttrSel"
              type="button"
              class="adv-clear"
              title="清除属性筛选"
              @click="clearAttrs"
            >
              ⟲ 清除
            </button>
          </div>
          <div class="fsec fsec-rating">
            <div class="fsec-t">
              <span class="ft-cn">★ 最低评分</span>
              <span class="ft-en">MIN RATING</span>
            </div>
            <div class="fopts">
              <button
                v-for="r in ratingOptions"
                :key="r.value"
                class="fpill"
                :class="{ active: state.rating === r.value }"
                @click="setRating(r.value)"
              >
                {{ r.label }}
              </button>
            </div>
            <button class="clear-all" @click="clearAll">⟲ 清除全部</button>
          </div>
        </div>

        <!-- ===== 排序栏 ===== -->
        <div class="sortbar">
          <div class="s-sorts">
            <button
              v-for="s in sortOptions"
              :key="s.key"
              class="sbtn"
              :class="{ active: state.sort === s.key }"
              @click="handleSort(s.key)"
            >
              {{ s.label }}
              <span v-if="s.key === 'price'">{{ priceArrow }}</span>
            </button>
          </div>
          <div class="s-count">
            量子引擎检索到
            <b>{{ resultList.length }}</b>
            件
          </div>
        </div>
      </div>

      <!-- ===== 商品主区 ===== -->
      <section class="shop-main">
        <div v-if="chips.length" class="chips">
          <span
            v-for="(chip, i) in chips"
            :key="i"
            class="chip"
            @click="removeChip(chip)"
          >
            {{ chip.label }}
            <span class="x">✕</span>
          </span>
        </div>

        <div v-if="!loading" class="prod-grid">
          <ProductCard
            v-for="p in resultList"
            :key="String(p.id)"
            :product="toCardItem(p)"
          />
        </div>
        <div v-else class="empty">
          <div class="empty-orb"><span>◉</span></div>
          <div class="empty-t">QUANTUM SCANNING · 量子引擎扫描中</div>
        </div>

        <div v-if="!loading && resultList.length === 0" class="empty">
          <div class="empty-orb"><span>◉</span></div>
          <div class="empty-t">NO SIGNAL · 未检索到匹配商品</div>
          <div class="empty-s">
            量子引擎未在当前筛选条件下发现商品数据流
            <br />
            请调整筛选参数，或清除全部条件重新扫描
          </div>
          <button class="btn btn-ghost btn-sm" @click="clearAll">
            ⟲ 清除全部筛选
          </button>
        </div>

        <!-- 懒加载哨兵 + 状态提示（替代分页） -->
        <div ref="sentinelRef" class="load-sentinel"></div>
        <div v-if="loadingMore" class="load-more-tip">加载中…</div>
        <div v-else-if="noMore && resultList.length > 0" class="load-more-tip">
          — 已加载全部商品 —
        </div>
      </section>
    </div>

    <!-- ===== 特性条（组件） ===== -->
    <AppFeatures />

    <!-- ===== 大促横条（组件） ===== -->
    <AppPromo btn-text="返回首页 ⟶" btn-to="/" />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { useRoute } from 'vue-router'
import ProductCard, {
  type ProductCardItem,
} from '@/components/nebula/ProductCard/index.vue'
import AppFeatures from '@/components/nebula/AppFeatures/index.vue'
import AppPromo from '@/components/nebula/AppPromo/index.vue'
import type { ListProduct } from '@/constants/mock'
import { reqSearchSku } from '@/api/search'
import message from '@/utils/message'

const route = useRoute()

// 当前搜索关键词（路由 query 驱动，用于标题/面包屑展示）
const searchKeyword = computed(() => String(route.query.keyword || ''))

const TAGS = ['特价', '新品', '热卖', '会员']

interface FilterState {
  cats: string[]
  brands: string[]
  tags: string[]
  pMin: number | null
  pMax: number | null
  rating: number
  sort: string
  priceDir: 'asc' | 'desc'
  kw: string
  /** 高级筛选：attrId -> 已选属性值 */
  attrSel: Record<string, string[]>
}

const state = reactive<FilterState>({
  cats: [],
  brands: [],
  tags: [],
  pMin: null,
  pMax: null,
  rating: 0,
  sort: 'hot',
  priceDir: 'asc',
  kw: '',
  attrSel: {},
})

const pMinText = ref('')
const pMaxText = ref('')
const loading = ref(true)
const apiProducts = ref<ListProduct[]>([])

// ===== 懒加载状态（替代分页） =====
const loadPageNum = ref(1) // 已加载到的 API 页码
const totalPage = ref(0) // API 总页数（0 = 未知）
const loadingMore = ref(false) // 翻页请求进行中
const noMore = ref(false) // 是否没有更多数据
const sentinelRef = ref<HTMLElement | null>(null)
let loadObserver: IntersectionObserver | null = null

const pricePresets = [
  { label: '全部', min: null, max: null },
  { label: '0-1k', min: 0, max: 1000 },
  { label: '1k-3k', min: 1000, max: 3000 },
  { label: '3k-8k', min: 3000, max: 8000 },
  { label: '8k+', min: 8000, max: null },
]
const ratingOptions = [
  { label: '不限', value: 0 },
  { label: '4.0+', value: 4.0 },
  { label: '4.5+', value: 4.5 },
  { label: '4.8+', value: 4.8 },
]
const sortOptions = [
  { key: 'hot', label: '综合排序' },
  { key: 'sales', label: '销量优先' },
  { key: 'new', label: '新品优先' },
  { key: 'price', label: '价格' },
  { key: 'rating', label: '好评优先' },
]

// ===== API 聚合筛选数据（attrs / brandList，品牌选项遍历用） =====
const apiAttrs = ref<any[]>([])
const apiBrandList = ref<any[]>([])

// ===== 高级筛选（属性聚合：颜色 / 屏幕刷新率…） =====
interface AdvGroup {
  attrId: string
  attrName: string
  attrValue: string[]
}

// hover 展开的组 + 关闭延时（避免在触发钮与弹层之间移动时闪烁）
const hoverAttrId = ref<string | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | null = null

// 归一化属性值（兼容 string / { attrValue, name, count } 两种形态）
function normAttrValue(v: any): string {
  if (typeof v === 'string') return v
  return String(v?.attrValue ?? v?.name ?? '')
}

// 高级筛选组：取 attrs 聚合中非品牌的属性（品牌已单独成区）
const advGroups = computed<AdvGroup[]>(() =>
  apiAttrs.value
    .filter((a) => {
      const name = String(a?.attrName || '').trim()
      return name && !name.includes('品牌')
    })
    .map((a) => ({
      attrId: String(a.attrId),
      attrName: String(a.attrName).trim(),
      attrValue: (a.attrValue || a.attrValues || [])
        .map(normAttrValue)
        .filter(Boolean),
    }))
    .filter((g) => g.attrValue.length > 0),
)

const hasAttrSel = computed(() =>
  Object.values(state.attrSel).some((v) => v.length > 0),
)

function openGroup(g: AdvGroup) {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  hoverAttrId.value = g.attrId
}

function cancelClose(g: AdvGroup) {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  // 回到该组则保持展开
  hoverAttrId.value = g.attrId
}

function scheduleCloseGroup(g: AdvGroup) {
  if (closeTimer) clearTimeout(closeTimer)
  closeTimer = setTimeout(() => {
    if (hoverAttrId.value === g.attrId) hoverAttrId.value = null
  }, 120)
}

// 点击触发钮：在 hover 与点击切换之间互补（移动端无 hover 也能用）
function toggleGroup(g: AdvGroup) {
  hoverAttrId.value = hoverAttrId.value === g.attrId ? null : g.attrId
}

function isAttrActive(g: AdvGroup) {
  return (state.attrSel[g.attrId]?.length ?? 0) > 0
}

function attrSelCount(g: AdvGroup) {
  return state.attrSel[g.attrId]?.length ?? 0
}

function isAttrValueOn(g: AdvGroup, v: string) {
  return state.attrSel[g.attrId]?.includes(v) ?? false
}

// 同组内多选（OR），跨组 AND
function toggleAttrValue(g: AdvGroup, v: string) {
  const cur = state.attrSel[g.attrId] || []
  const i = cur.indexOf(v)
  if (i > -1) {
    cur.splice(i, 1)
    if (cur.length === 0) delete state.attrSel[g.attrId]
    else state.attrSel[g.attrId] = [...cur]
  } else {
    state.attrSel[g.attrId] = [...cur, v]
  }
}

function clearAttrs() {
  state.attrSel = {}
}

// 品牌筛选选项：优先 API brandList 聚合 → 其次 attrs 中品牌属性 → 回退商品统计
const brandCounts = computed(() => {
  const map: Record<string, number> = {}
  // 1. /search/sku 返回的 brandList（最可靠，含品牌名+数量）
  apiBrandList.value.forEach((b) => {
    const name = b.brandName || b.name
    if (name) map[name] = Number(b.brandCount ?? b.count ?? 0) || 0
  })
  if (Object.keys(map).length > 0) return map
  // 2. attrs 中的品牌属性（attrName 含“品牌”的 attrValues）
  const brandAttr = apiAttrs.value.find((a) =>
    String(a.attrName || '').includes('品牌'),
  )
  if (brandAttr) {
    ;(brandAttr.attrValues || []).forEach((v: any) => {
      const name = typeof v === 'string' ? v : v.attrValue || v.name
      if (name) map[name] = Number(v.count ?? 0) || 0
    })
  }
  if (Object.keys(map).length > 0) return map
  // 3. 回退：当前已加载商品统计
  apiProducts.value.forEach((p) => {
    map[p.brand] = (map[p.brand] || 0) + 1
  })
  return map
})

const priceArrow = computed(() =>
  state.sort === 'price' ? (state.priceDir === 'asc' ? ' ▲' : ' ▼') : ' ▲',
)

// 数据源：纯 API 数据（不启用 mock 商品库）
const source = computed(() => apiProducts.value)

// 筛选 + 排序
const resultList = computed(() => {
  const list = source.value.filter((p) => {
    if (state.cats.length && !state.cats.includes(p.cat)) return false
    if (state.brands.length && !state.brands.includes(p.brand)) return false
    if (state.tags.length && !state.tags.includes(p.tag)) return false
    if (state.pMin != null && p.price < state.pMin) return false
    if (state.pMax != null && p.price > state.pMax) return false
    if (p.rating < state.rating) return false
    // 高级筛选：每个已选属性组，商品必须命中至少一个值
    for (const [attrId, vals] of Object.entries(state.attrSel)) {
      if (!vals.length) continue
      const prodAttrs = p.attrs || []
      const hit = prodAttrs.some(
        (a) =>
          String(a.attrId) === attrId &&
          (a.attrValue || []).some((av) => vals.includes(av)),
      )
      if (!hit) return false
    }
    if (state.kw) {
      const q = state.kw.toLowerCase()
      // 名称可能含高亮标签，先剥掉再匹配
      const plainName = p.name.replace(/<[^>]+>/g, '')
      if (
        !plainName.toLowerCase().includes(q) &&
        !p.cat.includes(q) &&
        !p.brand.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })
  const sorted = [...list]
  switch (state.sort) {
    case 'sales':
      sorted.sort((a, b) => b.sales - a.sales)
      break
    case 'new':
      sorted.sort(
        (a, b) =>
          (b.tag === '新品' ? 1 : 0) - (a.tag === '新品' ? 1 : 0) ||
          b.id - a.id,
      )
      break
    case 'price':
      sorted.sort((a, b) =>
        state.priceDir === 'asc' ? a.price - b.price : b.price - a.price,
      )
      break
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating || b.sales - a.sales)
      break
    default:
      sorted.sort(
        (a, b) =>
          b.sales / 1000 + b.rating * 10 - (a.sales / 1000 + a.rating * 10),
      )
  }
  return sorted
})

// 已选 chips
interface Chip {
  label: string
  remove: () => void
}
const chips = computed<Chip[]>(() => {
  const list: Chip[] = []
  state.cats.forEach((c) =>
    list.push({
      label: `分类:${c}`,
      remove: () => {
        state.cats = state.cats.filter((x) => x !== c)
      },
    }),
  )
  state.brands.forEach((b) =>
    list.push({
      label: `品牌:${b}`,
      remove: () => {
        state.brands = state.brands.filter((x) => x !== b)
      },
    }),
  )
  state.tags.forEach((t) =>
    list.push({
      label: `标签:${t}`,
      remove: () => {
        state.tags = state.tags.filter((x) => x !== t)
      },
    }),
  )
  if (state.pMin != null || state.pMax != null) {
    list.push({
      label: `价格:${state.pMin ?? '0'}~${state.pMax ?? '∞'}`,
      remove: () => {
        state.pMin = state.pMax = null
        pMinText.value = pMaxText.value = ''
      },
    })
  }
  if (state.rating) {
    list.push({
      label: `评分≥${state.rating.toFixed(1)}`,
      remove: () => {
        state.rating = 0
      },
    })
  }
  Object.entries(state.attrSel).forEach(([attrId, vals]) => {
    if (!vals.length) return
    const g = advGroups.value.find((x) => x.attrId === attrId)
    const name = g?.attrName || `属性${attrId}`
    list.push({
      label: `${name}:${vals.join('、')}`,
      remove: () => {
        delete state.attrSel[attrId]
      },
    })
  })
  if (state.kw) {
    list.push({
      label: `扫描:${state.kw}`,
      remove: () => {
        state.kw = ''
      },
    })
  }
  return list
})

function removeChip(chip: Chip) {
  chip.remove()
  apply()
}

function setRating(v: number) {
  state.rating = v
  apply()
}

function toggleMulti(key: 'brands' | 'tags', v: string) {
  const arr = state[key]
  const i = arr.indexOf(v)
  if (i > -1) arr.splice(i, 1)
  else arr.push(v)
  apply()
}

// 品牌名 → brandId（/search/sku 聚合数据），供“进店”跳转 /shop?brandId=
function brandIdOf(brand: string): number | null {
  const hit = apiBrandList.value.find(
    (b) => (b.brandName || b.name) === brand && b.brandId != null,
  )
  return hit ? Number(hit.brandId) : null
}

function isPriceActive(r: { min: number | null; max: number | null }) {
  return state.pMin === r.min && state.pMax === r.max
}

function applyPricePreset(r: { min: number | null; max: number | null }) {
  state.pMin = r.min
  state.pMax = r.max
  apply()
}

// 价格输入解析：空 → null；非法（非数字/负数）→ NaN
function parsePrice(v: string): number | null | typeof NaN {
  const t = v.trim()
  if (t === '') return null
  if (!/^\d+(\.\d+)?$/.test(t)) return NaN
  return Number(t)
}

// 自定义价格：普通文本框 + 数据校验
function applyCustomPrice() {
  const min = parsePrice(pMinText.value)
  const max = parsePrice(pMaxText.value)
  if (Number.isNaN(min) || Number.isNaN(max)) {
    message.error('价格请输入有效数字（如 100 / 100.5）')
    return
  }
  if (min !== null && max !== null && min > max) {
    message.warning('最低价不能高于最高价')
    return
  }
  if ((min !== null && min < 0) || (max !== null && max < 0)) {
    message.warning('价格不能为负数')
    return
  }
  state.pMin = min
  state.pMax = max
  apply()
}

function handleSort(key: string) {
  if (key === 'price') {
    if (state.sort === 'price') {
      state.priceDir = state.priceDir === 'asc' ? 'desc' : 'asc'
    } else {
      state.sort = 'price'
    }
  } else {
    state.sort = key
  }
}

function clearAll() {
  state.cats = []
  state.brands = []
  state.tags = []
  state.pMin = null
  state.pMax = null
  state.rating = 0
  state.kw = ''
  state.attrSel = {}
  pMinText.value = pMaxText.value = ''
  apiProducts.value = []
  loadRemote()
}

function apply() {
  // 筛选/排序状态变更后由响应式 computed 自动重算，无需额外处理
}

// 卡片字段映射
function toCardItem(p: ListProduct): ProductCardItem {
  const discount =
    p.tag === '特价' && p.old ? Math.round((1 - p.price / p.old) * 100) : 0
  return {
    id: p.id,
    skuId: p.id,
    name: p.name,
    category: `${p.brand} · ${p.cat.toUpperCase()}`,
    image: p.image || '',
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
    tagType:
      p.tag === '新品'
        ? 'blu'
        : p.tag === '热卖'
          ? 'grn'
          : p.tag === '会员'
            ? 'red'
            : 'red',
    score: p.rating,
    sales:
      p.sales >= 10000
        ? `${(p.sales / 10000).toFixed(1)}w`
        : p.sales >= 1000
          ? `${(p.sales / 1000).toFixed(1)}k`
          : `${p.sales}`,
    price: p.price,
    oldPrice: p.old,
  }
}

// ===== 远程接口：首屏/参数变化时加载第一页 =====
async function loadRemote() {
  loading.value = true
  loadPageNum.value = 1
  totalPage.value = 0
  noMore.value = false
  const keyword = String(route.query.keyword || '')
  const catalog3Id = route.query.catalog3Id
  try {
    const res: any = await reqSearchSku({
      keyword: keyword || undefined,
      catalog3Id: catalog3Id ? String(catalog3Id) : undefined,
      pageNum: 1,
    })
    const items: any[] = res?.data?.products || []
    apiProducts.value = items.map((it) => apiToProduct(it))
    // 保存聚合筛选数据（品牌选项遍历用）
    apiAttrs.value = res?.data?.attrs || []
    apiBrandList.value = res?.data?.brandList || []
    totalPage.value = Number(res?.data?.totalPage ?? 0)
    if (
      items.length === 0 ||
      (totalPage.value > 0 && loadPageNum.value >= totalPage.value)
    ) {
      noMore.value = true
    }
    // 无论结果是否为空，都让关键词参与筛选
    if (keyword) state.kw = keyword
  } catch {
    apiProducts.value = []
    noMore.value = true
    if (keyword) state.kw = keyword
  } finally {
    loading.value = false
    // 首屏内容不满一屏时立即补页
    fillViewportIfNeeded()
  }
}

// 懒加载：请求下一页并追加到列表
async function loadMore() {
  if (loading.value || loadingMore.value || noMore.value) return
  if (totalPage.value > 0 && loadPageNum.value >= totalPage.value) {
    noMore.value = true
    return
  }
  loadingMore.value = true
  const keyword = String(route.query.keyword || '')
  const catalog3Id = route.query.catalog3Id
  try {
    const res: any = await reqSearchSku({
      keyword: keyword || undefined,
      catalog3Id: catalog3Id ? String(catalog3Id) : undefined,
      pageNum: loadPageNum.value + 1,
    })
    const items: any[] = res?.data?.products || []
    // 每页都可能返回聚合数据，持续更新
    if (res?.data?.attrs) apiAttrs.value = res.data.attrs
    if (res?.data?.brandList) apiBrandList.value = res.data.brandList
    totalPage.value = Number(res?.data?.totalPage ?? 0)
    if (items.length > 0) {
      apiProducts.value = [
        ...apiProducts.value,
        ...items.map((it) => apiToProduct(it)),
      ]
      loadPageNum.value++
      if (totalPage.value > 0 && loadPageNum.value >= totalPage.value) {
        noMore.value = true
      }
    } else {
      noMore.value = true
    }
  } catch {
    noMore.value = true
  } finally {
    loadingMore.value = false
    // 视口大/内容不满屏时继续补页，直到填满视口或没有更多
    fillViewportIfNeeded()
  }
}

// 内容不足一屏时自动补页（视口较大时懒加载哨兵无新 intersection 事件，需要主动检查）
function fillViewportIfNeeded() {
  void nextTick(() => {
    const sentinel = sentinelRef.value
    if (!sentinel || noMore.value || loading.value || loadingMore.value) return
    const rect = sentinel.getBoundingClientRect()
    if (rect.top <= window.innerHeight + 300) {
      loadMore()
    }
  })
}

// 保留后端搜索高亮（<b style='color:red'> → <em class="hl">），其余标签剥掉防注入
function highlightTitle(raw: any): string {
  return String(raw || '')
    .replace(/<b[^>]*>/gi, '<em class="hl">')
    .replace(/<\/b>/gi, '</em>')
    .replace(/<[^>]+>/g, (m) => (/^<\/?em(\s[^>]*)?>$/i.test(m) ? m : ''))
}

// API 商品映射（缺失展示字段用中性默认值，不引入 mock 数据）
function apiToProduct(it: any): ListProduct {
  return {
    id: it.skuId,
    name: highlightTitle(it.skuTitle),
    cat: it.skuCategoryName || '量子商品',
    brand: it.brandName || 'NEBULA',
    price: Number(it.skuPrice ?? 0),
    old: Number(it.oldPrice ?? it.skuPrice ?? 0),
    sales: Number(it.saleCount ?? 0),
    rating: Number(it.score ?? 4.5),
    tag: it.tag || '',
    image: it.skuImg || '',
    icon: it.skuImg ? '' : '◈',
    ph: 'p2',
    // 高级筛选数据：ES sku attrs（颜色/屏幕刷新率等）
    attrs: Array.isArray(it.attrs)
      ? it.attrs.map((a: any) => ({
          attrId: a.attrId,
          attrName: String(a.attrName || ''),
          attrValue: Array.isArray(a.attrValue) ? a.attrValue.map(String) : [],
        }))
      : undefined,
  }
}

// 路由变化（如头部搜索跳转）重新加载
watch(
  () => route.query,
  () => {
    apiProducts.value = []
    state.kw = ''
    loadRemote()
  },
)

onMounted(() => {
  loadRemote()
  // 懒加载：底部哨兵进入视口（提前 300px）时加载下一页
  loadObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        loadMore()
      }
    },
    { rootMargin: '300px 0px' },
  )
  if (sentinelRef.value) loadObserver.observe(sentinelRef.value)
})

onBeforeUnmount(() => {
  loadObserver?.disconnect()
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

/* ===== 筛选条 ===== */
.sticky-zone {
  margin-top: 20px;
}
.fbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--panel);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.3);
  /* backdrop-filter 会形成层叠上下文，弹层要盖过下方排序栏/商品区 */
  position: relative;
  z-index: 50;
}
.fsec {
  display: flex;
  align-items: center;
  gap: 14px;
}
.fsec-t {
  position: relative;
  width: 96px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: var(--font-m);
}
.fsec-t .ft-cn {
  font-size: 15px;
  font-weight: 700;
  color: var(--txt);
  letter-spacing: 2px;
  font-family: var(--font-b);
  display: flex;
  align-items: center;
  gap: 5px;
}
.fsec-t .ft-en {
  font-size: 9px;
  color: var(--dim);
  letter-spacing: 3px;
  line-height: 1;
}
.fopts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.fpill-wrap {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.fpill-wrap .fshop {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--cyan);
  text-decoration: none;
  padding: 3px 7px;
  border-radius: 6px;
  border: 1px solid rgba(0, 240, 255, 0.3);
  background: rgba(0, 240, 255, 0.05);
  transition: 0.2s;
  letter-spacing: 1px;
}
.fpill-wrap .fshop:hover {
  background: rgba(0, 240, 255, 0.15);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}
.fpill {
  padding: 7px 13px;
  border-radius: 9px;
  border: 1px solid rgba(0, 240, 255, 0.25);
  background: rgba(0, 240, 255, 0.05);
  color: var(--dim);
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  font-family: var(--font-b);
  letter-spacing: 1px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.fpill:hover {
  color: var(--cyan);
  border-color: var(--cyan);
}
.fpill.active {
  color: #02101a;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: transparent;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
  font-weight: 700;
}
.fpill .cnt {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  opacity: 0.75;
}
.fsec-rating {
  position: relative;
}
.fsec-rating .fopts {
  max-width: calc(100% - 140px);
}
.fsec-rating .clear-all {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
.clear-all {
  padding: 9px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 46, 196, 0.4);
  background: rgba(255, 46, 196, 0.06);
  color: var(--magenta);
  font-size: 13px;
  cursor: pointer;
  letter-spacing: 1px;
  font-family: var(--font-m);
  transition: 0.2s;
  white-space: nowrap;
}
.clear-all:hover {
  background: rgba(255, 46, 196, 0.14);
  box-shadow: 0 0 14px rgba(255, 46, 196, 0.4);
}

/* ===== 高级筛选（hover 下拉） ===== */
.adv-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.adv-group {
  position: relative;
}
.adv-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border-radius: 9px;
  border: 1px solid rgba(0, 240, 255, 0.25);
  background: rgba(0, 240, 255, 0.05);
  color: var(--dim);
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  font-family: var(--font-b);
  letter-spacing: 1px;
  font-weight: 600;
}
.adv-trigger:hover {
  color: var(--cyan);
  border-color: var(--cyan);
}
.adv-trigger.open {
  color: var(--cyan);
  border-color: var(--cyan);
  background: rgba(0, 240, 255, 0.12);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.25);
}
.adv-trigger.active {
  color: #02101a;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: transparent;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
  font-weight: 700;
}
.adv-caret {
  font-size: var(--font-size-xs);
  opacity: 0.8;
  transition: transform 0.2s;
}
.adv-trigger.open .adv-caret {
  transform: rotate(180deg);
}
.adv-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 10px;
  background: rgba(0, 240, 255, 0.9);
  color: #02101a;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.adv-trigger.active .adv-badge {
  background: rgba(2, 16, 26, 0.85);
  color: var(--cyan);
}
.adv-pop {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 40;
  min-width: 240px;
  max-width: 460px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px;
  border: 1px solid rgba(0, 240, 255, 0.35);
  border-radius: 12px;
  background: rgba(8, 12, 30, 0.96);
  backdrop-filter: blur(14px);
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.55),
    0 0 20px rgba(0, 240, 255, 0.15);
}
.adv-opt {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: 8px;
  border: 1px solid rgba(0, 240, 255, 0.22);
  background: rgba(0, 240, 255, 0.04);
  color: var(--dim);
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  font-family: var(--font-b);
  font-weight: 600;
}
.adv-opt .adv-opt-dot {
  font-size: 8px;
  color: rgba(0, 240, 255, 0.35);
  transition: 0.2s;
}
.adv-opt:hover {
  color: var(--cyan);
  border-color: var(--cyan);
}
.adv-opt.on {
  color: #02101a;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: transparent;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.45);
  font-weight: 700;
}
.adv-opt.on .adv-opt-dot {
  color: #02101a;
}
.adv-clear {
  margin-left: auto;
  align-self: center;
  padding: 7px 13px;
  border-radius: 9px;
  border: 1px solid rgba(255, 46, 196, 0.4);
  background: rgba(255, 46, 196, 0.06);
  color: var(--magenta);
  font-size: 12px;
  cursor: pointer;
  font-family: var(--font-m);
  letter-spacing: 1px;
  transition: 0.2s;
  white-space: nowrap;
}
.adv-clear:hover {
  background: rgba(255, 46, 196, 0.14);
  box-shadow: 0 0 14px rgba(255, 46, 196, 0.4);
}
/* 弹层过渡 */
.adv-pop-enter-active,
.adv-pop-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  transform-origin: top left;
}
.adv-pop-enter-from,
.adv-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.pc-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 2px;
}
.pc-row input {
  width: 76px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(0, 240, 255, 0.25);
  background: rgba(6, 10, 26, 0.7);
  color: var(--txt);
  padding: 0 8px;
  font-family: var(--font-m);
  font-size: 12px;
  outline: none;
  transition: 0.2s;
}
.pc-row input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
.pc-row .pc-sep {
  color: var(--dim);
}
.pc-row .pc-ok {
  height: 32px;
  padding: 0 11px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  font-family: var(--font-h);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 1px;
  transition: 0.2s;
}
.pc-row .pc-ok:hover {
  filter: brightness(1.2);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
}

/* ===== 排序栏 ===== */
.sortbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--panel);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.3);
  margin-top: 20px;
}
.s-sorts {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.sbtn {
  padding: 8px 15px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--dim);
  border: 1px solid transparent;
  transition: 0.2s;
  font-family: var(--font-b);
  font-weight: 600;
  letter-spacing: 1px;
  background: transparent;
}
.sbtn:hover {
  color: var(--txt);
}
.sbtn.active {
  color: var(--cyan);
  border-color: rgba(0, 240, 255, 0.45);
  background: rgba(0, 240, 255, 0.1);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.2);
}
.s-count {
  font-family: var(--font-m);
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 2px;
  white-space: nowrap;
}
.s-count b {
  color: var(--cyan);
  font-size: 16px;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}

/* ===== 已选筛选标签 ===== */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  min-height: 0;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(0, 240, 255, 0.08);
  border: 1px solid rgba(0, 240, 255, 0.4);
  font-size: 13px;
  color: var(--cyan);
  letter-spacing: 1px;
  cursor: pointer;
  transition: 0.2s;
  font-family: var(--font-m);
  animation: chipIn 0.25s ease;
}
@keyframes chipIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.chip:hover {
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.4);
}
.chip .x {
  color: var(--magenta);
  font-weight: 700;
  font-size: 13px;
  line-height: 1;
  text-shadow: 0 0 8px rgba(255, 46, 196, 0.6);
}

/* ===== 商品网格 ===== */
.shop-main .prod-grid {
  grid-template-columns: repeat(4, 1fr);
  margin-top: 20px;
}

/* ===== 空状态 ===== */
.empty {
  text-align: center;
  padding: 70px 20px;
  border: 1px dashed rgba(0, 240, 255, 0.3);
  border-radius: 18px;
  background: rgba(6, 10, 26, 0.5);
  /* margin-top: 16px; */
}
.empty-orb {
  width: 84px;
  height: 84px;
  margin: 0 auto 18px;
  border-radius: 50%;
  border: 1px dashed rgba(0, 240, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  color: var(--cyan);
  text-shadow: 0 0 18px var(--cyan);
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
  font-size: 14px;
  margin: 10px 0 24px;
  letter-spacing: 1px;
}

/* ===== 懒加载哨兵 + 状态提示（替代分页） ===== */
.load-sentinel {
  height: 1px;
}
.load-more-tip {
  text-align: center;
  padding: 26px 0 6px;
  color: var(--dim);
  font-family: var(--font-m);
  font-size: 12px;
  letter-spacing: 2px;
}

@media (max-width: 1080px) {
  .shop-main .prod-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .fsec {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .fsec-t {
    width: auto;
    padding: 0;
  }
  .fsec-adv {
    gap: 10px;
  }
  .adv-clear {
    margin-left: 0;
  }
  .adv-pop {
    max-width: calc(100vw - 48px);
  }
  .sortbar {
    flex-wrap: wrap;
    gap: 10px;
  }
  .shop-main .prod-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
