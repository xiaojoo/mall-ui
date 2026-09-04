<template>
  <div class="nb-favorites">
    <!-- 页面搜索 header：搜索收藏数据 -->
    <PageSearchHeader v-model="favKw" placeholder="搜索收藏商品…" />
    <div class="wrap">
      <div class="crumbs">
        <router-link to="/">Nebula Home</router-link>
        <span class="sep">/</span>
        <span class="cur">商品收藏</span>
      </div>
      <div class="page-head sec-head">
        <div class="sec-title">
          <h2>
            💛 商品收藏
            <small>FAVORITES · 量子心愿单</small>
          </h2>
        </div>
      </div>

      <div class="fav-wrap">
        <!-- 分类页签 -->
        <div class="fav-tabs">
          <div
            v-for="c in catTabs"
            :key="c"
            class="fav-tab"
            :class="{ active: filter === c }"
            @click="filter = c"
          >
            {{ c === 'all' ? '全部' : c }}
            <span class="cnt">{{ tabCount(c) }}</span>
          </div>
        </div>

        <!-- 工具条 -->
        <div class="fav-bar">
          <span class="count">
            已收藏
            <b>{{ favs.length }}</b>
            件商品
          </span>
          <span class="fav-clear" @click="clearAll">清空收藏 ✕</span>
        </div>

        <!-- 同步中 -->
        <div v-if="loading" class="fav-loading">◉ 正在同步云端心愿单…</div>

        <!-- 收藏网格 -->
        <div class="fav-grid">
          <div v-for="f in filteredFavs" :key="String(f.id)" class="fcard">
            <div
              class="fimg"
              :class="{ clickable: !!f.skuId }"
              @click="goDetail(f)"
            >
              <div class="heart" @click.stop="unfav(f)">♥</div>
              <img
                v-if="f.img"
                class="fimg-real"
                :src="f.img"
                :alt="f.name"
                loading="lazy"
              />
              <div v-else class="ph" :class="f.phClass || ''">
                {{ f.icon }}
              </div>
            </div>
            <div class="finfo">
              <div class="fcat">NEBULA · {{ f.category.toUpperCase() }}</div>
              <div class="fname">{{ f.name }}</div>
              <div v-if="favParamsText(f)" class="fparams">
                {{ favParamsText(f) }}
              </div>
              <div class="fprice">
                <small>¥</small>
                {{ fmt(f.price) }}
              </div>
              <div class="fops">
                <button class="fop" @click="unfav(f)">♥ 取消收藏</button>
                <button class="fop cart" @click="buyNow(f)">⟶ 立即购买</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredFavs.length === 0" class="fav-empty show">
          <div class="empty-orb"><span>♥</span></div>
          <div class="empty-t">
            {{ notLogin ? 'SIGNAL LOST · 请先登录' : 'NO SIGNAL · 心愿单为空' }}
          </div>
          <div class="empty-s">
            {{
              notLogin
                ? '登录后心愿单云端同步，换设备也不丢数据'
                : '尚未收藏任何商品，去商品库扫描心仪装备吧'
            }}
          </div>
          <router-link
            v-if="notLogin"
            class="btn btn-primary btn-sm"
            :to="{ path: '/login', query: { redirect: '/favorites' } }"
          >
            ⟶ 去登录
          </router-link>
          <router-link v-else class="btn btn-primary btn-sm" to="/list">
            ⟶ 去逛逛
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageSearchHeader from '@/components/nebula/PageSearchHeader/index.vue'
import useUserStore from '@/store/modules/user'
import useFavoritesStore from '@/store/modules/favorites'
import { reqFavList, reqFavDelete } from '@/api/favorites'
import message from '@/utils/message'

const router = useRouter()
const userStore = useUserStore()
const favStore = useFavoritesStore()

interface Fav {
  id: number | string
  spuId: number | string
  skuId?: number | string
  name: string
  category: string
  price: number
  img?: string
  skuParams?: string
  icon: string
  phClass?: string
}

const notLogin = computed(() => !userStore.token)
const favs = ref<Fav[]>([])
const loading = ref(false)
const filter = ref('all')
const favKw = ref('')

// ===== 占位图（无主图的商品按名称取稳定字符） =====
const GLYPHS = ['◬', '▣', '◮', '◉', '⌬', '◭', '◌', '⬡', '⚡']
const PH_CLASSES = ['', 'p2', 'p3', 'p4']
function glyphFor(name: string) {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return GLYPHS[sum % GLYPHS.length]
}

// ===== 收藏列表（纯 API：JWT 会员维度，无 mock/本地兜底） =====
async function loadFavs() {
  loading.value = true
  favs.value = []
  if (userStore.token) {
    try {
      const res: any = await reqFavList()
      if (res.code === 200) {
        favs.value = (res.data || []).map((f: any, idx: number) => ({
          id: f.id,
          spuId: f.spuId,
          skuId: f.skuId,
          name: String(f.spuName || '').trim() || '未命名商品',
          category: String(f.categoryName || '其他').trim(),
          price: Number(f.price || 0),
          img: f.spuImg || '',
          skuParams: f.skuParams || '',
          icon: glyphFor(String(f.spuName || '')),
          phClass: PH_CLASSES[idx % PH_CLASSES.length],
        }))
      }
    } catch {
      message.error('心愿单同步失败，请稍后重试')
    }
  }
  loading.value = false
  favStore.favCount = favs.value.length
}
onMounted(loadFavs)

const catTabs = computed(() => [
  'all',
  ...Array.from(new Set(favs.value.map((f) => f.category))),
])
const tabCount = (c: string) =>
  c === 'all'
    ? favs.value.length
    : favs.value.filter((f) => f.category === c).length
const filteredFavs = computed(() => {
  const kw = favKw.value.trim().toLowerCase()
  return favs.value.filter(
    (f) =>
      (filter.value === 'all' || f.category === filter.value) &&
      (!kw || f.name.toLowerCase().includes(kw)),
  )
})

const fmt = (n: number) => {
  if (!n) return '0'
  const v = Math.round(n * 100) / 100
  return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 收藏时保存的参数 JSON → 展示文本（如：机身颜色：黑色 · 屏幕刷新率：512HZ）
function favParamsText(f: Fav): string {
  if (!f.skuParams) return ''
  try {
    const map = JSON.parse(f.skuParams)
    if (!map || typeof map !== 'object') return ''
    return Object.entries(map)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}：${v}`)
      .join(' · ')
  } catch {
    return ''
  }
}

// 点击图片/主图区域进详情（有 skuId 才可跳转；携带收藏时的商品参数回显）
function goDetail(f: Fav) {
  if (!f.skuId) {
    message.info('该商品暂无可售 SKU')
    return
  }
  const query: Record<string, string> = { skuId: String(f.skuId) }
  if (f.skuParams) query.favParams = f.skuParams
  router.push({ path: '/details', query })
}

async function unfav(f: Fav) {
  favs.value = favs.value.filter((x) => x.id !== f.id)
  if (!userStore.token) return
  try {
    const res: any = await reqFavDelete([String(f.id)])
    if (res.code !== 200) {
      message.error(res.message || '取消收藏失败，请重试')
      loadFavs()
      return
    }
    message.info('已取消收藏')
    favStore.favCount = Math.max(0, favStore.favCount - 1)
  } catch {
    message.error('取消收藏失败，请重试')
    loadFavs()
  }
}

async function clearAll() {
  const ids = favs.value.map((f) => String(f.id))
  favs.value = []
  if (!userStore.token || ids.length === 0) return
  try {
    const res: any = await reqFavDelete(ids)
    if (res.code !== 200) {
      message.error(res.message || '清空失败，请重试')
      loadFavs()
      return
    }
    message.success('✓ 心愿单已清空')
    favStore.favCount = 0
  } catch {
    message.error('清空失败，请重试')
    loadFavs()
  }
}

// 收藏时保存的参数 JSON → 参数数组（与详情页 buildAttrValues 同形状："名：值"）
function favParamsList(f: Fav): string[] {
  if (!f.skuParams) return []
  try {
    const map = JSON.parse(f.skuParams)
    if (!map || typeof map !== 'object') return []
    return Object.entries(map)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}：${v}`)
  } catch {
    return []
  }
}

// 立即购买：携带收藏时的参数直接进确认订单（直购模式，不走购物车）
async function buyNow(f: Fav) {
  if (!userStore.token) {
    router.push({ path: '/login', query: { redirect: '/favorites' } })
    return
  }
  if (!f.skuId) {
    message.info('该商品暂无可售 SKU')
    return
  }
  sessionStorage.setItem(
    'mall_buy_now',
    JSON.stringify({
      skuId: Number(f.skuId),
      num: 1,
      skuAttrValues: favParamsList(f),
    }),
  )
  sessionStorage.setItem('mall_checkout_allowed', '1')
  router.push('/checkout')
}
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
.fav-wrap {
  max-width: 1224px;
  margin: 0 auto;
}

/* 分类页签 */
.fav-tabs {
  display: flex;
  gap: 10px;
  margin-top: 22px;
  flex-wrap: wrap;
}
.fav-tab {
  padding: 10px 22px;
  border-radius: 11px;
  cursor: pointer;
  transition: 0.22s;
  border: 1px solid rgba(0, 240, 255, 0.22);
  background: rgba(0, 240, 255, 0.04);
  color: var(--dim);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
}
.fav-tab:hover {
  color: var(--cyan);
  border-color: var(--cyan);
}
.fav-tab.active {
  color: #02101a;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: transparent;
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.45);
  font-weight: 700;
}
.fav-tab .cnt {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  margin-left: 6px;
}

/* 工具条 */
.fav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 0 6px;
}
.fav-bar .count {
  font-size: 14px;
  color: var(--dim);
  letter-spacing: 1px;
}
.fav-bar .count b {
  color: var(--cyan);
  font-weight: 700;
}
.fav-clear {
  color: var(--dim);
  font-size: 13px;
  cursor: pointer;
  letter-spacing: 1px;
  border-bottom: 1px dashed var(--dim);
  transition: 0.2s;
}
.fav-clear:hover {
  color: var(--magenta);
  border-color: var(--magenta);
}

/* 收藏网格 */
.fav-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 16px;
}
.fcard {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: var(--panel);
  border: 1px solid rgba(0, 240, 255, 0.16);
  backdrop-filter: blur(10px);
  transition: 0.3s;
  animation: cardIn 0.3s ease;
}
@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.fcard:hover {
  border-color: rgba(0, 240, 255, 0.55);
  box-shadow:
    0 18px 44px rgba(0, 0, 0, 0.55),
    0 0 26px rgba(0, 240, 255, 0.2);
}
.fcard .fimg {
  position: relative;
  height: 168px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    circle at 50% 40%,
    rgba(0, 240, 255, 0.14),
    rgba(6, 10, 26, 0.9) 70%
  );
}
.fcard .fimg .ph {
  width: 96px;
  height: 96px;
  border-radius: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    rgba(0, 240, 255, 0.35),
    rgba(168, 85, 247, 0.3)
  );
  border: 1px solid rgba(0, 240, 255, 0.5);
  box-shadow:
    0 0 30px rgba(0, 240, 255, 0.4),
    inset 0 0 22px rgba(255, 255, 255, 0.18);
  font-family: var(--font-h);
  font-size: 34px;
  color: #fff;
  text-shadow: 0 0 16px var(--cyan);
}
.fcard .fimg .ph.p2 {
  border-radius: 50%;
  background: linear-gradient(
    145deg,
    rgba(255, 46, 196, 0.4),
    rgba(168, 85, 247, 0.35)
  );
}
.fcard .fimg .ph.p3 {
  border-radius: 8px;
  transform: rotate(45deg);
}
.fcard .fimg .ph.p4 {
  border-radius: 50% 50% 12px 12px;
  background: linear-gradient(
    145deg,
    rgba(57, 255, 136, 0.4),
    rgba(0, 240, 255, 0.35)
  );
}
.fcard .heart {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: 0.22s;
  z-index: 3;
  background: rgba(5, 9, 24, 0.85);
  border: 1px solid rgba(255, 46, 196, 0.45);
  color: var(--magenta);
  text-shadow: 0 0 8px rgba(255, 46, 196, 0.6);
}
.fcard .heart:hover {
  transform: scale(1.15);
  box-shadow: 0 0 14px rgba(255, 46, 196, 0.5);
}
.fcard .fcat {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--cyan);
  letter-spacing: 3px;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}
.fcard .finfo {
  padding: 16px;
  position: relative;
  z-index: 3;
}
.fcard .fname {
  font-size: 16px;
  font-weight: 600;
  margin: 5px 0 8px;
  letter-spacing: 1px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.fcard .fparams {
  font-size: 12px;
  color: var(--cyan);
  letter-spacing: 1px;
  margin: -2px 0 8px;
  opacity: 0.85;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.35);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.fcard .fprice {
  font-family: var(--font-h);
  font-size: 20px;
  font-weight: 900;
  color: var(--green);
  text-shadow: 0 0 14px rgba(57, 255, 136, 0.5);
}
.fcard .fprice small {
  font-size: var(--font-size-xs);
  color: var(--dim);
  text-shadow: none;
  font-family: var(--font-b);
  font-weight: 400;
  margin-right: 2px;
}
.fcard .fprice .old {
  font-size: 13px;
  color: var(--dim);
  text-decoration: line-through;
  font-family: var(--font-b);
  font-weight: 400;
  margin-left: 7px;
  text-shadow: none;
}
.fcard .fops {
  display: flex;
  gap: 8px;
  margin-top: 13px;
}
.fop {
  flex: 1;
  padding: 8px 4px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 12px;
  letter-spacing: 1px;
  transition: 0.2s;
  text-align: center;
  text-decoration: none;
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: var(--dim);
  background: rgba(0, 240, 255, 0.04);
  font-family: var(--font-b);
  font-weight: 600;
}
.fop:hover {
  color: var(--cyan);
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.25);
}
.fop.cart {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  border-color: transparent;
  font-weight: 700;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.35);
}
.fop.cart:hover {
  filter: brightness(1.15);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.6);
}

/* 空状态 */
.fav-empty {
  text-align: center;
  padding: 80px 20px;
  border: 1px dashed rgba(0, 240, 255, 0.3);
  border-radius: 18px;
  background: rgba(6, 10, 26, 0.5);
  margin-top: 20px;
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

.fcard .fimg .fimg-real {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}
.fcard .fimg.clickable {
  cursor: pointer;
}
.fcard .fimg.clickable:hover .fimg-real {
  transform: scale(1.06);
}
.fav-loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--dim);
  font-family: var(--font-m);
  letter-spacing: 2px;
  animation: pulseGlow 1.4s ease-in-out infinite;
}
@keyframes pulseGlow {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

@media (max-width: 1080px) {
  .fav-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .fav-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
