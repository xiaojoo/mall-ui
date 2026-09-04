<template>
  <div class="nb-shop">
    <!-- 页面搜索 header -->
    <PageSearchHeader placeholder="搜索店铺商品…" />
    <div class="wrap">
      <div class="crumbs">
        <router-link to="/">Nebula Home</router-link>
        <span class="sep">/</span>
        <span class="cur">{{ shop ? shop.shopName : '店铺' }}</span>
      </div>

      <!-- ===== 加载中 ===== -->
      <div v-if="loading" class="shop-loading">
        <span class="spin"></span>
        正在加载店铺数据…
      </div>

      <!-- ===== 加载失败 ===== -->
      <div v-else-if="errMsg" class="shop-err">
        <div class="err-ico">⚠</div>
        <div class="err-t">{{ errMsg }}</div>
        <button class="err-btn" @click="init">重新加载</button>
      </div>

      <!-- ===== 暂无商家 ===== -->
      <div v-else-if="!shop" class="shop-err">
        <div class="err-ico">◈</div>
        <div class="err-t">暂无商家入驻，敬请期待</div>
        <router-link class="err-btn" to="/list">去逛逛商品库 ⟶</router-link>
      </div>

      <template v-else>
        <!-- ===== 店铺切换（多商家） ===== -->
        <div v-if="shops.length > 1" class="shop-switch">
          <span class="ss-label">店铺</span>
          <button
            v-for="s in shops"
            :key="s.brandId"
            class="ss-item"
            :class="{ on: s.brandId === shop.brandId }"
            @click="switchShop(s.brandId)"
          >
            <img v-if="s.logo" :src="s.logo" alt="" class="ss-logo" />
            <span v-else class="ss-logo ph">◈</span>
            <span class="ss-name">{{ s.shopName }}</span>
            <span class="ss-cnt">{{ s.productCount }}</span>
          </button>
        </div>

        <!-- ===== 店铺横幅 ===== -->
        <div class="shop-banner">
          <div class="wrap">
            <div class="sb-logo">
              <img
                v-if="shop.logo"
                :src="shop.logo"
                alt=""
                class="sb-logo-img"
              />
              <span v-else>◈</span>
            </div>
            <div class="sb-info">
              <div class="sb-name">
                <h1>{{ shop.shopName }}</h1>
                <span class="sb-badge">官方直营</span>
                <span class="sb-badge amber">星环认证</span>
              </div>
              <div class="sb-desc">
                {{ shop.descript || '这个商家还没有写简介' }}
              </div>
              <div class="sb-stats">
                <div class="sb-stat">
                  <div class="sv">{{ shop.productCount }}</div>
                  <div class="sl">商品 PRODUCTS</div>
                </div>
                <div class="sb-stat">
                  <div class="sv">{{ shop.categoryCount }}</div>
                  <div class="sl">品类 CATEGORIES</div>
                </div>
                <div class="sb-stat">
                  <div class="sv">{{ fmtTotal(shop.totalSales) }}</div>
                  <div class="sl">销量 SALES</div>
                </div>
                <div class="sb-stat">
                  <div class="sv">
                    {{ shop.rating != null ? shop.rating.toFixed(1) : '—' }}
                  </div>
                  <div class="sl">评分 RATING</div>
                </div>
              </div>
            </div>
            <div class="sb-acts">
              <button
                class="sb-btn follow"
                :class="{ on: followed }"
                @click="toggleFollow"
              >
                {{ followed ? '✓ 已关注' : '＋ 关注店铺' }}
              </button>
              <button class="sb-btn service" @click="service">
                ✉ 联系客服
              </button>
            </div>
          </div>
        </div>

        <!-- 资质条 -->
        <div class="sb-qualify">
          <span>
            🛡
            <b>正品保障</b>
            品牌直营
          </span>
          <span>
            ⚡
            <b>极速达</b>
            2 小时达
          </span>
          <span>
            ⟲
            <b>7 星退换</b>
            运费全免
          </span>
          <span>
            🧠
            <b>脑波支付</b>
            免触控
          </span>
          <span>
            🔒
            <b>AES-4096</b>
            量子加密
          </span>
        </div>

        <!-- ===== 店铺页签 ===== -->
        <div class="shop-tabs">
          <div
            v-for="t in tabs"
            :key="t.key"
            class="shop-tab"
            :class="{ active: tab === t.key }"
            @click="tab = t.key"
          >
            {{ t.label }}
            <span class="cnt">({{ tabCount(t.key) }})</span>
          </div>
        </div>

        <!-- 全部商品 -->
        <div v-show="tab === 'all'" class="shop-grid">
          <div v-if="shop.products.length === 0" class="neb-empty">
            <div class="empty-orb"><span>🛸</span></div>
            <div class="empty-t">NO SIGNAL · 暂无在售商品</div>
            <div class="empty-s">该店铺还没有上架商品</div>
          </div>
          <div v-else class="prod-grid">
            <ProductCard
              v-for="p in shop.products"
              :key="String(p.spuId)"
              :product="toCard(p)"
            />
          </div>
        </div>

        <!-- 店铺优惠券 -->
        <div v-show="tab === 'coupon'" class="coupon-row">
          <div v-if="couponLoading" class="coupon-loading">优惠券加载中…</div>
          <template v-else-if="shopCoupons.length">
            <div v-for="c in shopCoupons" :key="c.id" class="coupon-card">
              <div class="cv">{{ couponValue(c) }}</div>
              <div class="cd">
                <div class="t">{{ c.couponName }}</div>
                <div class="d">{{ couponDesc(c) }}</div>
              </div>
              <button
                class="claim"
                :class="{ done: c.claimed }"
                :disabled="claiming === c.id"
                @click="claimCoupon(c)"
              >
                {{ claimText(c) }}
              </button>
            </div>
          </template>
          <div v-else class="neb-empty">
            <div class="empty-orb"><span>🎟</span></div>
            <div class="empty-t">NO SIGNAL · 暂无店铺优惠券</div>
            <div class="empty-s">该店铺暂未发布优惠券，去逛逛商品吧</div>
          </div>
        </div>

        <!-- 关于店铺 -->
        <div v-show="tab === 'about'" class="about-grid">
          <div class="about-card">
            <h4>
              <span class="bar"></span>
              店铺简介
            </h4>
            <p>{{ shop.descript || '这个商家还没有写简介' }}</p>
          </div>
          <div class="about-card">
            <h4>
              <span class="bar"></span>
              服务保障
            </h4>
            <div class="svc">
              <span>
                <b>✓</b>
                正品保障 · 假一赔十
              </span>
              <span>
                <b>✓</b>
                量子溯源芯片
              </span>
              <span>
                <b>✓</b>
                7 星无理由退换
              </span>
              <span>
                <b>✓</b>
                3 年量子质保
              </span>
              <span>
                <b>✓</b>
                7×24h 专属客服
              </span>
              <span>
                <b>✓</b>
                城市 2 小时达
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageSearchHeader from '@/components/nebula/PageSearchHeader/index.vue'
import ProductCard, {
  type ProductCardItem,
} from '@/components/nebula/ProductCard/index.vue'
import {
  reqShopDetail,
  reqShopList,
  type ShopDetail,
  type ShopProduct,
  type ShopSummary,
} from '@/api/shop'
import { reqReceiveCoupon, reqShopCouponList } from '@/api/coupon'
import message from '@/utils/message'

const route = useRoute()
const router = useRouter()

// ===== 店铺数据（API：mall-web 商家账号发布的品牌 + 已上架商品） =====
const shops = ref<ShopSummary[]>([])
const shop = ref<ShopDetail | null>(null)
const loading = ref(true)
const errMsg = ref('')

async function init() {
  loading.value = true
  errMsg.value = ''
  try {
    const listRes: any = await reqShopList()
    shops.value = listRes?.data || []
    const brandId = Number(route.query.brandId)
    const target =
      brandId && shops.value.find((s) => s.brandId === brandId)
        ? brandId
        : shops.value[0]?.brandId
    if (target == null) {
      shop.value = null
    } else {
      await loadShop(target)
    }
  } catch {
    errMsg.value = '店铺数据加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

async function loadShop(brandId: number) {
  errMsg.value = ''
  try {
    const res: any = await reqShopDetail(brandId)
    if (res?.code === 200 && res?.data) {
      shop.value = res.data
      return
    }
    // 后端返回 fail（店铺不存在或已关闭）或空数据
    shop.value = null
    errMsg.value = String(res?.msg || '店铺不存在或已关闭')
  } catch {
    shop.value = null
    errMsg.value = '店铺数据加载失败，请稍后重试'
  }
}

// 店铺切换：同步 URL（/shop?brandId=xxx），watch 路由变化重新加载
function switchShop(brandId: number) {
  if (brandId === shop.value?.brandId) return
  router.replace({ query: { brandId } })
}

watch(
  () => route.query.brandId,
  (val) => {
    const brandId = Number(val)
    if (brandId && shops.value.some((s) => s.brandId === brandId)) {
      loadShop(brandId)
    }
  },
)

init()

// ===== 店铺页签 =====
const tab = ref<'all' | 'coupon' | 'about'>('all')
const followed = ref(false)

const tabs = [
  { key: 'all', label: '全部商品' },
  { key: 'coupon', label: '店铺优惠券' },
  { key: 'about', label: '关于店铺' },
] as const

const tabCount = (key: string) =>
  key === 'all'
    ? (shop.value?.products.length ?? 0)
    : key === 'coupon'
      ? shopCoupons.value.length
      : 2

// ===== 店铺优惠券（API：该店铺已发布且在领取窗口内的券） =====
interface ShopCoupon {
  id: number
  couponName: string
  amount: number
  minPoint: number
  endTime: string
  claimed: boolean
}

const shopCoupons = ref<ShopCoupon[]>([])
const couponLoading = ref(false)
const claiming = ref<number | null>(null)

async function loadShopCoupons() {
  const brandId = shop.value?.brandId
  if (!brandId) {
    shopCoupons.value = []
    return
  }
  couponLoading.value = true
  try {
    const res: any = await reqShopCouponList(brandId)
    shopCoupons.value = (res?.data || []).map((c: any) => ({
      id: Number(c.id),
      couponName: String(c.couponName || '优惠券'),
      amount: Number(c.amount ?? 0),
      minPoint: Number(c.minPoint ?? 0),
      endTime: String(c.endTime || ''),
      claimed: !!c.claimed,
    }))
  } catch {
    shopCoupons.value = []
  } finally {
    couponLoading.value = false
  }
}

// 切换店铺后重新拉取该店优惠券
watch(shop, (s) => {
  if (s?.brandId) loadShopCoupons()
})

const trimNum = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2))

function couponValue(c: ShopCoupon) {
  return c.amount > 0 ? `-¥${trimNum(c.amount)}` : '优惠'
}

function couponDesc(c: ShopCoupon) {
  const gate = c.minPoint > 0 ? `满${trimNum(c.minPoint)}可用` : '无门槛'
  const end = c.endTime
    ? ` · 至 ${String(c.endTime).replace('T', ' ').slice(0, 16)}`
    : ''
  return `${gate}${end}`
}

function claimText(c: ShopCoupon) {
  if (c.claimed) return '✓ 已领取'
  return claiming.value === c.id ? '领取中…' : '领取'
}

async function claimCoupon(c: ShopCoupon) {
  if (c.claimed || claiming.value != null) return
  claiming.value = c.id
  try {
    await reqReceiveCoupon(c.id)
    c.claimed = true
    message.success(`✓ 已领取「${c.couponName}」`)
  } catch (e: any) {
    const msg = String(e?.msg || e?.message || '领取失败')
    message.error(msg)
    if (msg.includes('登录')) {
      router.push({ path: '/login', query: { redirect: route.fullPath } })
    } else {
      // 已领取/限领等情况：刷新标记状态
      loadShopCoupons()
    }
  } finally {
    claiming.value = null
  }
}

const fmtSales = (n: number) =>
  n >= 10000
    ? `${(n / 10000).toFixed(1)}w`
    : n >= 1000
      ? `${(n / 1000).toFixed(1)}k`
      : `${n}`

const fmtTotal = (n: number) =>
  n >= 10000 ? `${(n / 10000).toFixed(1)}w` : `${n}`

// 商品标签：真实数据派生（销量最高=热卖 / spuId 最新=新品）
const topSkuIds = computed(() => {
  const list = shop.value?.products || []
  if (list.length < 2) return { hot: -1, fresh: -1 }
  const hot = [...list].sort((a, b) => (b.sales || 0) - (a.sales || 0))[0]
  const fresh = [...list].sort((a, b) => b.spuId - a.spuId)[0]
  return { hot: hot?.spuId ?? -1, fresh: fresh?.spuId ?? -1 }
})

function toCard(p: ShopProduct): ProductCardItem {
  const { hot, fresh } = topSkuIds.value
  const isHot = hot === p.spuId && (p.sales || 0) > 0
  const isFresh = fresh === p.spuId
  return {
    id: p.spuId,
    skuId: p.skuId,
    name: p.spuName,
    category: p.catalogName ? `NEBULA · ${p.catalogName}` : undefined,
    image: p.img || '',
    icon: p.img ? undefined : '◬',
    tag: isHot ? '热卖' : isFresh ? '新品' : undefined,
    tagType: isHot ? 'grn' : isFresh ? 'blu' : undefined,
    score: p.rating ?? undefined,
    sales: fmtSales(p.sales || 0),
    price: p.price ?? 0,
  }
}

function toggleFollow() {
  followed.value = !followed.value
  message.success(followed.value ? '✓ 已关注店铺' : '已取消关注')
}

function service() {
  message.info('✉ 量子客服将在 5 分钟内接入')
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

/* ===== 加载 / 错误 / 空态 ===== */
.shop-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 90px 0;
  color: var(--dim);
  letter-spacing: 2px;
}
.spin {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid rgba(0, 240, 255, 0.25);
  border-top-color: var(--cyan);
  animation: nb-spin 0.8s linear infinite;
}
@keyframes nb-spin {
  to {
    transform: rotate(360deg);
  }
}
.shop-err {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 90px 0;
}
.err-ico {
  font-size: 44px;
  color: var(--amber);
  text-shadow: 0 0 18px rgba(255, 197, 61, 0.5);
}
.err-t {
  color: var(--dim);
  letter-spacing: 2px;
}
.err-btn {
  padding: 10px 26px;
  border-radius: 10px;
  border: 1px solid rgba(0, 240, 255, 0.5);
  background: rgba(0, 240, 255, 0.07);
  color: var(--cyan);
  cursor: pointer;
  font-size: 13px;
  letter-spacing: 2px;
  text-decoration: none;
  transition: 0.2s;
}
.err-btn:hover {
  background: rgba(0, 240, 255, 0.16);
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.3);
}

/* ===== 店铺切换 ===== */
.shop-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  padding: 12px 16px;
  border: 1px solid rgba(0, 240, 255, 0.12);
  border-radius: 14px;
  background: var(--panel);
  overflow-x: auto;
  backdrop-filter: blur(8px);
}
.ss-label {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 3px;
  flex-shrink: 0;
}
.ss-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 10px;
  border: 1px solid rgba(0, 240, 255, 0.14);
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  transition: 0.2s;
  flex-shrink: 0;
}
.ss-item:hover {
  color: var(--txt);
  border-color: rgba(0, 240, 255, 0.4);
}
.ss-item.on {
  color: var(--cyan);
  border-color: rgba(0, 240, 255, 0.6);
  background: rgba(0, 240, 255, 0.08);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.2);
}
.ss-logo {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  object-fit: cover;
}
.ss-logo.ph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--cyan);
  background: rgba(0, 240, 255, 0.1);
}
.ss-name {
  font-size: 13px;
  letter-spacing: 1px;
}
.ss-cnt {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
}

/* ===== 店铺横幅 ===== */
.shop-banner {
  position: relative;
  margin-top: 20px;
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 20px;
  overflow: hidden;
  background:
    radial-gradient(
      600px 260px at 80% 0%,
      rgba(168, 85, 247, 0.28),
      transparent 60%
    ),
    radial-gradient(
      500px 240px at 12% 100%,
      rgba(0, 240, 255, 0.16),
      transparent 60%
    ),
    linear-gradient(115deg, #0a0f28 0%, #0d1034 50%, #140a30 100%);
  box-shadow:
    0 18px 60px rgba(0, 0, 0, 0.45),
    inset 0 0 80px rgba(0, 240, 255, 0.05);
}
.shop-banner .wrap {
  display: flex;
  align-items: center;
  gap: 26px;
  padding: 34px 40px;
  position: relative;
  z-index: 2;
}
.sb-logo {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: conic-gradient(
    from 0deg,
    #00f0ff,
    #3d7bff,
    #a855f7,
    #ff2ec4,
    #00f0ff
  );
  box-shadow: 0 0 34px rgba(0, 240, 255, 0.45);
  font-size: 46px;
  color: #fff;
  text-shadow: 0 0 16px rgba(0, 240, 255, 0.8);
  overflow: hidden;
}
.sb-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.sb-info {
  flex: 1;
  min-width: 0;
}
.sb-name {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.sb-name h1 {
  font-family: var(--font-h);
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #fff;
  text-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
}
.sb-badge {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  letter-spacing: 2px;
  padding: 4px 12px;
  border-radius: 12px;
  color: #02101a;
  background: linear-gradient(90deg, #39ff88, #00f0ff);
  box-shadow: 0 0 10px rgba(57, 255, 136, 0.5);
}
.sb-badge.amber {
  background: linear-gradient(90deg, #ffc53d, #ff9f1a);
  box-shadow: 0 0 10px rgba(255, 197, 61, 0.5);
}
.sb-desc {
  font-size: 14px;
  color: var(--dim);
  margin-top: 10px;
  letter-spacing: 1px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sb-stats {
  display: flex;
  gap: 34px;
  margin-top: 16px;
  flex-wrap: wrap;
}
.sb-stat {
  text-align: center;
}
.sb-stat .sv {
  font-family: var(--font-h);
  font-size: 19px;
  font-weight: 700;
  color: var(--cyan);
  text-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
}
.sb-stat .sl {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  margin-top: 4px;
}
.sb-acts {
  display: flex;
  gap: 12px;
  flex-direction: column;
  flex-shrink: 0;
}
.sb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 26px;
  border-radius: 12px;
  cursor: pointer;
  font-family: var(--font-h);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  transition: 0.25s;
}
.sb-btn.follow {
  border: 1px solid rgba(0, 240, 255, 0.55);
  background: rgba(0, 240, 255, 0.08);
  color: var(--cyan);
}
.sb-btn.follow:hover {
  background: rgba(0, 240, 255, 0.16);
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.35);
}
.sb-btn.follow.on {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  border-color: transparent;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
}
.sb-btn.service {
  border: 1px solid rgba(255, 197, 61, 0.45);
  background: rgba(255, 197, 61, 0.06);
  color: var(--amber);
}
.sb-btn.service:hover {
  background: rgba(255, 197, 61, 0.14);
  box-shadow: 0 0 14px rgba(255, 197, 61, 0.3);
}

/* 资质条 */
.sb-qualify {
  display: flex;
  gap: 26px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 14px 20px;
  margin-top: 16px;
  border: 1px solid rgba(0, 240, 255, 0.14);
  border-radius: 14px;
  background: var(--panel);
  backdrop-filter: blur(8px);
}
.sb-qualify span {
  font-size: 13px;
  color: var(--dim);
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 7px;
}
.sb-qualify b {
  color: var(--green);
  font-weight: 700;
}

/* 店铺页签 */
.shop-tabs {
  display: flex;
  gap: 10px;
  margin-top: 26px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.12);
  padding-bottom: 0;
}
.shop-tab {
  padding: 12px 26px;
  font-size: 15px;
  font-weight: 700;
  color: var(--dim);
  cursor: pointer;
  letter-spacing: 2px;
  position: relative;
  transition: 0.2s;
}
.shop-tab:hover {
  color: var(--txt);
}
.shop-tab.active {
  color: var(--cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}
.shop-tab::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: linear-gradient(90deg, #00f0ff, #ff2ec4);
  transform: scaleX(0);
  transition: 0.25s;
  box-shadow: 0 0 8px var(--cyan);
}
.shop-tab.active::after {
  transform: scaleX(1);
}
.shop-tab .cnt {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  margin-left: 6px;
}
.shop-tab.active .cnt {
  color: var(--cyan);
}
.shop-grid {
  margin-top: 18px;
}

/* 空状态（参考 reviews 页）：旋转虚线环 + 主副文案 */
.neb-empty {
  text-align: center;
  padding: 60px 20px;
  border: 1px dashed rgba(0, 240, 255, 0.3);
  border-radius: 18px;
  background: rgba(6, 10, 26, 0.5);
  margin-top: 18px;
}
.coupon-loading {
  padding: 50px 0;
  text-align: center;
  color: var(--dim);
  letter-spacing: 2px;
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

/* 优惠券 */
.coupon-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 18px;
}
.coupon-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(0, 240, 255, 0.18);
  background: linear-gradient(
    120deg,
    rgba(0, 240, 255, 0.06),
    rgba(168, 85, 247, 0.05)
  );
}
.coupon-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #00f0ff, #a855f7, #ff2ec4);
  box-shadow: 0 0 10px var(--cyan);
}
.coupon-card .cv {
  font-family: var(--font-h);
  font-size: 26px;
  font-weight: 900;
  color: var(--cyan);
  text-shadow: 0 0 14px rgba(0, 240, 255, 0.5);
  min-width: 72px;
  text-align: center;
}
.coupon-card .cd {
  flex: 1;
  min-width: 0;
}
.coupon-card .cd .t {
  font-size: 15px;
  font-weight: 700;
  color: var(--txt);
  letter-spacing: 1px;
}
.coupon-card .cd .d {
  font-size: var(--font-size-xs);
  color: var(--dim);
  margin-top: 5px;
  line-height: 1.5;
}
.coupon-card .claim {
  padding: 7px 16px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 12px;
  letter-spacing: 1px;
  transition: 0.2s;
  border: 1px solid rgba(0, 240, 255, 0.45);
  color: var(--cyan);
  background: rgba(0, 240, 255, 0.06);
  flex-shrink: 0;
}
.coupon-card .claim:hover {
  background: rgba(0, 240, 255, 0.15);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
.coupon-card .claim.done {
  border-color: rgba(57, 255, 136, 0.4);
  color: var(--green);
  background: rgba(57, 255, 136, 0.06);
  cursor: default;
}

/* 关于店铺 */
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 18px;
}
.about-card {
  border: 1px solid rgba(0, 240, 255, 0.14);
  border-radius: 16px;
  padding: 22px;
  background: var(--panel);
  backdrop-filter: blur(8px);
}
.about-card h4 {
  font-family: var(--font-h);
  font-size: 14px;
  letter-spacing: 2px;
  color: #fff;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.about-card h4 .bar {
  width: 4px;
  height: 15px;
  border-radius: 3px;
  background: linear-gradient(180deg, #00f0ff, #a855f7);
  box-shadow: 0 0 8px var(--cyan);
}
.about-card p {
  font-size: 14px;
  color: var(--dim);
  line-height: 1.9;
  letter-spacing: 0.3px;
}
.about-card .svc {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.about-card .svc span {
  font-size: 13px;
  color: var(--dim);
  display: flex;
  align-items: center;
  gap: 8px;
}
.about-card .svc b {
  color: var(--green);
}

@media (max-width: 1080px) {
  .coupon-row {
    grid-template-columns: 1fr;
  }
  .about-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 760px) {
  .shop-banner .wrap {
    flex-wrap: wrap;
  }
  .sb-acts {
    flex-direction: row;
    width: 100%;
  }
  .shop-tabs {
    overflow-x: auto;
  }
}
</style>
