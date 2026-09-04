<template>
  <div class="nb-orders">
    <!-- 页面搜索 header：点击 SEARCH 才搜索订单 -->
    <PageSearchHeader
      submit-only
      placeholder="搜索订单号 / 下单时间…"
      @search="orderKw = $event"
    />
    <div class="wrap">
      <div class="crumbs">
        <router-link to="/">Nebula Home</router-link>
        <span class="sep">/</span>
        <span class="cur">我的订单</span>
      </div>
      <div class="page-head sec-head">
        <div class="sec-title">
          <h2>
            📋 我的订单
            <small>ORDER CENTER · 全量订单数据流</small>
          </h2>
        </div>
      </div>

      <div class="ord-wrap">
        <!-- ===== 状态页签 ===== -->
        <div class="ord-tabs">
          <div
            v-for="f in statusFilters"
            :key="String(f.value)"
            class="ord-tab"
            :class="{ active: filterStatus === f.value }"
            @click="handleFilter(f.value)"
          >
            {{ f.label }}
            <span class="cnt">{{ tabCount(f.value) }}</span>
          </div>
        </div>

        <!-- ===== 订单列表 ===== -->
        <div class="order-list">
          <div v-for="o in pageOrders" :key="o.no" class="order-card">
            <div class="order-head">
              <span class="order-shop" @click.stop="goShop(o)">
                <span class="os-ico">
                  <img
                    v-if="shopOf(o).logo"
                    :src="shopOf(o).logo"
                    alt=""
                    class="os-ico-img"
                  />
                  <span v-else>◈</span>
                </span>
                <span class="os-name">{{ shopOf(o).name }}</span>
              </span>
              <span class="order-no" @click="goDetail(o)">{{ o.no }}</span>
              <span class="order-time">{{ o.time }}</span>
              <span class="order-status" :class="statusCls(o.status)">
                {{ orderStatusText(o) }}
              </span>
            </div>
            <div class="order-items">
              <div
                v-for="(it, i) in o.items.slice(0, 3)"
                :key="i"
                class="o-row"
              >
                <div class="oi">
                  <img
                    v-if="it.image"
                    :src="it.image"
                    :alt="it.name"
                    class="oi-img"
                  />
                  <div v-else class="ph" :class="it.ph || ''">
                    {{ it.icon }}
                  </div>
                </div>
                <div class="on">
                  <div class="n" @click="goDetail(o)">{{ it.name }}</div>
                  <div v-if="it.param" class="p">{{ it.param }}</div>
                </div>
                <span class="qty">×{{ it.qty }}</span>
                <span class="sub">¥{{ fmt(it.price * it.qty) }}</span>
              </div>
              <div v-if="o.items.length > 3" class="o-more">
                … 另有 {{ o.items.length - 3 }} 件商品
              </div>
            </div>
            <div class="order-foot">
              <span class="cnt">共 {{ totalQty(o) }} 件</span>
              <span class="total">
                实付
                <b>
                  <small>¥</small>
                  {{ fmt(totalAmount(o)) }}
                </b>
              </span>
              <button
                v-if="o.status === 0"
                class="oact primary"
                @click.stop="goPay(o)"
              >
                去支付 ⟶
              </button>
              <button
                v-if="o.status === 0"
                class="oact"
                @click.stop="cancelOrder(o)"
              >
                取消订单
              </button>
              <button
                v-if="o.status === 1 || o.status === 2"
                class="oact"
                @click.stop="confirmReceive(o)"
              >
                确认收货
              </button>
              <button
                v-if="o.status !== 0"
                class="oact"
                @click.stop="reorder(o)"
              >
                再次购买
              </button>
              <button
                v-if="(o.status === 3 || o.status === 4) && !isAfterSale(o)"
                class="oact danger"
                @click.stop="removeOrder(o)"
              >
                删除订单
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="!loading && pageOrders.length === 0"
          class="empty-orders show"
        >
          <div class="empty-orb"><span>📋</span></div>
          <div class="empty-t">NO SIGNAL · 暂无此类订单</div>
          <div class="empty-s">该状态下的订单数据流为空，去商品库逛逛吧</div>
          <router-link class="btn btn-primary btn-sm" to="/list">
            ⟶ 去逛逛
          </router-link>
        </div>

        <!-- ===== 分页 ===== -->
        <div class="pag">
          <span class="pag-info">
            共 {{ totalCount }} 条 · {{ totalPages }} 页
          </span>
          <button
            class="pag-btn"
            :disabled="pageNum <= 1"
            @click="goPage(pageNum - 1)"
          >
            ◀
          </button>
          <button
            v-for="p in pageWindow"
            :key="p"
            class="pag-btn"
            :class="{ active: p === pageNum }"
            @click="goPage(p)"
          >
            {{ p }}
          </button>
          <button
            class="pag-btn"
            :disabled="pageNum >= totalPages"
            @click="goPage(pageNum + 1)"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
    <!-- ===== 删除确认弹窗（通用组件） ===== -->
    <ConfirmDialog
      :visible="!!delTarget"
      title="⚠ 删除订单"
      subtitle="DELETE ORDER · 删除后不可恢复"
      confirm-text="✓ 确认删除"
      danger
      @confirm="confirmDelete"
      @cancel="delTarget = null"
    >
      <div class="del-txt">
        确定要删除订单
        <b>{{ delTarget?.no }}</b>
        吗？
        <br />
        删除后该订单将从列表中移除，且不可恢复。
      </div>
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from '@/components/nebula/ConfirmDialog/index.vue'
import PageSearchHeader from '@/components/nebula/PageSearchHeader/index.vue'
import {
  reqOrderListWithItem,
  reqDeleteOrder,
  reqCancelOrder,
  reqReceiveOrder,
} from '@/api/order'
import useUserStore from '@/store/modules/user'
import message from '@/utils/message'

const router = useRouter()
const userStore = useUserStore()

interface OrderItem {
  name: string
  icon: string
  ph?: string
  image?: string
  skuId?: string | number
  qty: number
  price: number
  param?: string
  /** 商家/品牌名 */
  spuBrand?: string
  /** 品牌 id（店铺跳转） */
  brandId?: number
  /** 品牌 logo（店铺图标） */
  brandLogo?: string
}
interface Order {
  no: string
  time: string
  status: number
  refundApplyStatus?: number | null
  items: OrderItem[]
  payAmount?: number
}

const statusFilters: { label: string; value: number | '' | 'afterSale' }[] = [
  { label: '全部', value: '' },
  { label: '待付款', value: 0 },
  { label: '已付款', value: 1 },
  { label: '已发货', value: 2 },
  { label: '已完成', value: 3 },
  { label: '售后中', value: 'afterSale' },
  { label: '已关闭', value: 4 },
]

const orders = ref<Order[]>([])
const filterStatus = ref<number | '' | 'afterSale'>('')
const pageNum = ref(1)
const pageSize = 5
const loading = ref(true)
// 服务端分页总页数；mock 模式按本地数据算
const totalPages = ref(1)
const totalCount = ref(0)

const STATUS_TEXT: Record<number, string> = {
  0: '待支付',
  1: '已支付',
  2: '已发货',
  3: '已完成',
  4: '已取消',
  5: '无效订单',
}

const statusText = (s: number) => STATUS_TEXT[s] ?? '未知'
// 有进行中售后（refundApplyStatus 0 待处理 / 1 退货中）的订单，徽标文字显示「售后中」，样式沿用 ost-done；退款完成（2）按订单状态显示「已完成」
const orderStatusText = (o: Order) =>
  isAfterSale(o) ? '售后中' : statusText(o.status)
const statusCls = (s: number) =>
  s === 0
    ? 'ost-unpaid'
    : s === 1 || s === 2
      ? 'ost-paid'
      : s === 3
        ? 'ost-done'
        : 'ost-cancel'

const fmt = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const totalQty = (o: Order) => o.items.reduce((s, i) => s + i.qty, 0)
// 实付金额：API 订单优先 payAmount，mock 按明细求和
const totalAmount = (o: Order) =>
  o.payAmount ?? o.items.reduce((s, i) => s + i.price * i.qty, 0)

// 服务端已按状态+分页返回，直接展示（搜索在当前已加载数据内过滤）
const orderKw = ref('')
const pageOrders = computed(() => {
  const kw = orderKw.value.trim().toLowerCase()
  if (!kw) return orders.value
  return orders.value.filter(
    (o) => o.no.toLowerCase().includes(kw) || o.time.toLowerCase().includes(kw),
  )
})
const pageWindow = computed(() => {
  const pages = totalPages.value
  const win: number[] = []
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - pageNum.value) <= 1) win.push(i)
  }
  return win
})
const tabCount = (v: number | '' | 'afterSale') => {
  if (v === '') return totalCount.value
  if (v === 'afterSale') return afterSaleCount.value
  return statusCounts.value[v] || 0
}
// 售后中订单总数（服务端按售后申请状态统计）
const afterSaleCount = ref(0)
// 各状态订单总数（服务端统计，避免只算当前页）
const statusCounts = ref<Record<number, number>>({})

// ===== 加载（纯 API：服务端分页 + 状态筛选，无 mock 兑底） =====
async function loadOrders() {
  loading.value = true
  if (!userStore.token) {
    orders.value = []
    totalPages.value = 1
    totalCount.value = 0
    loading.value = false
    return
  }
  try {
    const result: any = await reqOrderListWithItem(
      pageNum.value,
      pageSize,
      filterStatus.value === 'afterSale' ? '' : filterStatus.value,
      filterStatus.value === 'afterSale' ? 1 : 0,
    )
    if (result.code === 200) {
      const pageData = result.data || {}
      const list: any[] = pageData.list || []
      orders.value = list.map((o: any) => ({
        no: o.orderSn || '',
        time: String(o.createTime || '').replace('T', ' '),
        status: Number(o.status ?? 0),
        refundApplyStatus:
          o.refundApplyStatus != null ? Number(o.refundApplyStatus) : null,
        payAmount:
          Number(o.payAmount ?? 0) > 0 ? Number(o.payAmount) : undefined,
        items: (o.orderItemEntityList || []).map((it: any) => ({
          name: it.spuName || it.skuName || '量子商品',
          icon: '◈',
          ph: 'p2',
          image: it.skuPic || '',
          skuId: it.skuId,
          qty: Number(it.skuQuantity ?? 1),
          price: Number(it.skuPrice ?? 0),
          param: String(it.skuAttrsVals || '').replace(/;/g, ' / '),
          spuBrand: it.spuBrand || '',
          brandId: it.brandId != null ? Number(it.brandId) : undefined,
          brandLogo: it.brandLogo || '',
        })),
      }))
      totalPages.value = Math.max(1, Number(pageData.totalPage ?? 1))
      totalCount.value = Number(pageData.totalCount ?? 0)
      statusCounts.value = pageData.statusCounts || {}
      afterSaleCount.value = Number(pageData.afterSaleCount ?? 0)
    } else {
      orders.value = []
      totalPages.value = 1
      totalCount.value = 0
    }
  } catch {
    orders.value = []
    totalPages.value = 1
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

function handleFilter(v: number | '' | 'afterSale') {
  filterStatus.value = v
  pageNum.value = 1
  loadOrders()
}
function goPage(p: number) {
  pageNum.value = p
  loadOrders()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ===== 进 orderDetail 记录 tab 位置，返回时恢复；刷新/直接进入不恢复 =====
const VIEW_STATE_KEY = 'mall_orders_view_state'
const VIEW_PENDING_KEY = 'mall_orders_restore_pending'

function saveViewState() {
  try {
    sessionStorage.setItem(
      VIEW_STATE_KEY,
      JSON.stringify({ filter: filterStatus.value, page: pageNum.value }),
    )
  } catch {
    /* 忽略 */
  }
}

// 仅当刚从 orderDetail 返回时恢复（goDetail 写入 pending，恢复后清除）；刷新/直接进入不恢复
function restoreViewStateIfReturning() {
  try {
    if (sessionStorage.getItem(VIEW_PENDING_KEY) !== '1') return
    sessionStorage.removeItem(VIEW_PENDING_KEY)
    const raw = sessionStorage.getItem(VIEW_STATE_KEY)
    if (!raw) return
    const s = JSON.parse(raw)
    if (statusFilters.some((f) => f.value === s.filter)) {
      filterStatus.value = s.filter
    }
    const p = Number(s.page)
    if (Number.isFinite(p) && p > 0) pageNum.value = p
  } catch {
    /* 忽略损坏数据 */
  }
}

// ===== 操作 =====
const goDetail = (o: Order) => {
  try {
    sessionStorage.setItem(VIEW_PENDING_KEY, '1')
  } catch {
    /* 忽略 */
  }
  saveViewState()
  router.push(`/orderDetail/${o.no}`)
}
const goPay = (o: Order) =>
  router.push({ path: '/pay', query: { orderSn: o.no } })

async function cancelOrder(o: Order) {
  try {
    await reqCancelOrder(o.no)
    message.success('✓ 订单已取消')
    await loadOrders()
  } catch (e) {
    message.error((e as Error).message || '取消失败，请稍后再试')
  }
}
async function confirmReceive(o: Order) {
  try {
    const res: any = await reqReceiveOrder(o.no)
    if (res.code === 200) {
      o.status = 3
      message.success('✓ 已确认收货 · 订单已完成')
    } else {
      message.error(res.message || '确认收货失败')
    }
  } catch (e) {
    message.error((e as Error).message || '确认收货失败，请稍后重试')
  }
}
function reorder(o: Order) {
  const list = o.items || []
  if (list.length === 0) {
    message.warning('该订单没有可再次购买的商品')
    return
  }
  // 写入直购数据（多商品），跳结算页走 buy-now 直购模式
  sessionStorage.setItem(
    'mall_buy_now',
    JSON.stringify({
      items: list.map((it) => ({
        skuId: Number(it.skuId),
        count: Number(it.qty ?? 1),
        skuAttrValues: it.param ? it.param.split(' / ') : [],
      })),
    }),
  )
  message.success('⚡ 已加入结算清单')
  // 结算页凭证：与详情页立即购买/购物车去结算一致，否则路由守卫会弹回购物车
  sessionStorage.setItem('mall_checkout_allowed', '1')
  router.push('/checkout')
}
// 订单商家：取第一个商品的品牌名/logo
const shopOf = (o: Order) => {
  const it = o.items?.[0]
  return { name: it?.spuBrand || '其他', logo: it?.brandLogo || '' }
}

// 点击商家跳店铺（有品牌 id 时）
function goShop(o: Order) {
  const brandId = o.items?.[0]?.brandId
  if (brandId != null) {
    router.push({ path: '/shop', query: { brandId } })
  } else {
    message.info('该商家暂未开设店铺')
  }
}

// 是否有进行中的售后（0 待处理 / 1 退货中）——售后中不可删除；2 已完成/3 已拒绝不算
const isAfterSale = (o: Order) =>
  o.refundApplyStatus === 0 || o.refundApplyStatus === 1

function removeOrder(o: Order) {
  delTarget.value = o
}

const delTarget = ref<Order | null>(null)

async function confirmDelete() {
  const o = delTarget.value
  if (!o) return
  delTarget.value = null
  if (userStore.token) {
    try {
      await reqDeleteOrder(o.no)
      message.success('✓ 订单已删除')
      // 当前页删空则回退一页
      if (orders.value.length === 1 && pageNum.value > 1) pageNum.value--
      await loadOrders()
      return
    } catch {
      /* 忽略，继续本地移除 */
    }
  }
  orders.value = orders.value.filter((x) => x.no !== o.no)
  totalCount.value = Math.max(0, totalCount.value - 1)
  message.success('✓ 订单已删除')
}

onMounted(() => {
  restoreViewStateIfReturning()
  loadOrders()
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
.ord-wrap {
  max-width: 1224px;
  margin: 0 auto;
}

/* 状态页签 */
.ord-tabs {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 22px;
  flex-wrap: wrap;
}
.ord-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 26px;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.22s;
  border: 1px solid rgba(0, 240, 255, 0.22);
  background: rgba(0, 240, 255, 0.04);
  color: var(--dim);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
}
.ord-tab:hover {
  color: var(--cyan);
  border-color: var(--cyan);
}
.ord-tab.active {
  color: #02101a;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: transparent;
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.45);
  font-weight: 700;
}
.ord-tab .cnt {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  padding: 1px 8px;
  border-radius: 10px;
  background: rgba(0, 240, 255, 0.14);
}
.ord-tab.active .cnt {
  background: rgba(2, 16, 26, 0.22);
  color: #02101a;
}

/* 订单卡片 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}
.order-card {
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 18px;
  background: var(--panel);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: 0.3s;
  animation: cardIn 0.3s ease;
  cursor: pointer;
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
.order-card:hover {
  border-color: rgba(0, 240, 255, 0.4);
  box-shadow: 0 0 22px rgba(0, 240, 255, 0.1);
}
.order-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 22px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.09);
  background: linear-gradient(
    90deg,
    rgba(0, 240, 255, 0.05),
    rgba(168, 85, 247, 0.03)
  );
}
.order-shop {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
}
.order-shop .os-ico {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    rgba(0, 240, 255, 0.25),
    rgba(168, 85, 247, 0.25)
  );
  border: 1px solid rgba(0, 240, 255, 0.4);
  color: var(--cyan);
  font-size: 12px;
  overflow: hidden;
}
.order-shop .os-ico .os-ico-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.order-shop .os-name {
  font-family: var(--font-m);
  font-size: 13px;
  font-weight: 400;
  color: var(--txt);
  letter-spacing: 2px;
  transition: 0.2s;
}
.order-shop:hover .os-name {
  color: var(--cyan);
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
}
.order-no {
  font-family: var(--font-m);
  font-size: 13px;
  color: var(--txt);
  letter-spacing: 2px;
  cursor: pointer;
  transition: 0.2s;
}
.order-no:hover {
  color: var(--cyan);
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
}
.order-time {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 1px;
}
.order-status {
  margin-left: auto;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  letter-spacing: 2px;
  padding: 5px 14px;
  border-radius: 14px;
}
.ost-unpaid {
  color: var(--amber);
  border: 1px solid rgba(255, 197, 61, 0.45);
  background: rgba(255, 197, 61, 0.08);
  text-shadow: 0 0 8px rgba(255, 197, 61, 0.5);
}
.ost-paid {
  color: var(--cyan);
  border: 1px solid rgba(0, 240, 255, 0.45);
  background: rgba(0, 240, 255, 0.08);
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}
.ost-done {
  color: var(--green);
  border: 1px solid rgba(57, 255, 136, 0.45);
  background: rgba(57, 255, 136, 0.08);
  text-shadow: 0 0 8px rgba(57, 255, 136, 0.5);
}
.ost-cancel {
  color: var(--dim);
  border: 1px solid rgba(143, 163, 200, 0.3);
  background: rgba(143, 163, 200, 0.06);
}
.order-items {
  padding: 10px 22px;
}
.o-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.06);
}
.o-row:last-child {
  border-bottom: none;
}
.o-row .oi {
  width: 100px;
  height: 100px;
  border-radius: 11px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    circle at 50% 40%,
    rgba(0, 240, 255, 0.14),
    rgba(6, 10, 26, 0.9) 70%
  );
  border: 1px solid rgba(0, 240, 255, 0.2);
  overflow: hidden;
}
.o-row .oi-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.o-row .oi .ph {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    rgba(0, 240, 255, 0.35),
    rgba(168, 85, 247, 0.3)
  );
  border: 1px solid rgba(0, 240, 255, 0.5);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.3);
  font-family: var(--font-h);
  font-size: 14px;
  color: #fff;
  text-shadow: 0 0 10px var(--cyan);
}
.o-row .oi .ph.p2 {
  border-radius: 50%;
  background: linear-gradient(
    145deg,
    rgba(255, 46, 196, 0.4),
    rgba(168, 85, 247, 0.35)
  );
}
.o-row .oi .ph.p3 {
  border-radius: 4px;
  transform: rotate(45deg);
}
.o-row .oi .ph.p4 {
  border-radius: 50% 50% 8px 8px;
  background: linear-gradient(
    145deg,
    rgba(57, 255, 136, 0.4),
    rgba(0, 240, 255, 0.35)
  );
}
.o-row .on {
  flex: 1;
  min-width: 0;
}
.o-row .on .n {
  font-size: var(--font-size-lg);
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  width: fit-content;
  transition: 0.2s;
}
.o-row .on .n:hover {
  color: var(--cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}
.o-row .on .p {
  font-family: var(--font-m);
  font-size: var(--font-size-sm);
  color: var(--amber);
  margin-top: 3px;
}
.o-row .qty {
  font-family: var(--font-m);
  font-size: 13px;
  color: var(--dim);
}
.o-row .sub {
  font-family: var(--font-h);
  font-size: 14px;
  font-weight: 700;
  color: var(--green);
  min-width: 80px;
  text-align: right;
}
.o-more {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  padding: 6px 0 4px;
  letter-spacing: 2px;
}
.order-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 22px;
  border-top: 1px solid rgba(0, 240, 255, 0.09);
}
.order-foot .cnt {
  font-size: 13px;
  color: var(--dim);
  letter-spacing: 1px;
}
.order-foot .total {
  margin-left: auto;
  font-size: 13px;
  color: var(--dim);
  letter-spacing: 1px;
  margin-right: 8px;
}
.order-foot .total b {
  font-family: var(--font-h);
  font-size: 19px;
  font-weight: 900;
  color: var(--cyan);
  text-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
  margin-left: 6px;
}
.order-foot .total b small {
  font-size: var(--font-size-xs);
  margin-right: 1px;
}
.oact {
  padding: 8px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: 0.2s;
  border: 1px solid rgba(0, 240, 255, 0.3);
  background: rgba(0, 240, 255, 0.05);
  color: var(--dim);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.oact:hover {
  color: var(--cyan);
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.25);
}
.oact.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  color: var(--amber);
  border-color: rgba(255, 197, 61, 0.4);
}
.oact.disabled:hover {
  color: var(--amber);
  border-color: rgba(255, 197, 61, 0.4);
  box-shadow: none;
}
.oact.primary {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  border-color: transparent;
  font-weight: 700;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.4);
}
.oact.primary:hover {
  filter: brightness(1.15);
  box-shadow: 0 0 22px rgba(0, 240, 255, 0.7);
}
.oact.danger {
  border-color: rgba(255, 46, 196, 0.35);
  color: var(--magenta);
  background: rgba(255, 46, 196, 0.05);
}
.oact.danger:hover {
  border-color: var(--magenta);
  background: rgba(255, 46, 196, 0.12);
  box-shadow: 0 0 10px rgba(255, 46, 196, 0.3);
  color: var(--magenta);
}

/* 空状态 */
.empty-orders {
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

/* 分页 */
.pag {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
  align-items: center;
}
.pag-info {
  font-family: var(--font-m);
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 2px;
  margin-right: 8px;
}
.pag-btn {
  min-width: 42px;
  height: 42px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(0, 240, 255, 0.3);
  background: rgba(0, 240, 255, 0.05);
  color: var(--dim);
  font-family: var(--font-m);
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 1px;
}
.pag-btn:hover {
  color: var(--cyan);
  border-color: var(--cyan);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.3);
}
.pag-btn.active {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  border-color: transparent;
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.6);
  font-weight: 700;
}
.pag-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

@media (max-width: 760px) {
  .ord-tabs {
    gap: 8px;
  }
  .ord-tab {
    padding: 9px 16px;
    font-size: 13px;
  }
  .order-foot {
    flex-wrap: wrap;
  }
  .order-foot .total {
    margin-left: 0;
    width: 100%;
  }
}

/* ===== 删除确认内容样式（弹窗组件本身已抽离） ===== */
.del-txt {
  font-size: 14px;
  color: var(--dim);
  line-height: 1.9;
  letter-spacing: 1px;
  padding: 6px 2px;
}
.del-txt b {
  color: var(--cyan);
  font-family: var(--font-m);
  letter-spacing: 2px;
  margin: 0 4px;
}
</style>
