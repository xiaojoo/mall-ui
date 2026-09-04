<template>
  <div class="nb-pay">
    <!-- 页面搜索 header -->
    <PageSearchHeader placeholder="搜索订单信息…" />
    <div class="wrap">
      <div class="crumbs">
        <router-link to="/">Nebula Home</router-link>
        <span class="sep">/</span>
        <router-link to="/cart">购物车</router-link>
        <span class="sep">/</span>
        <router-link to="/checkout">确认订单</router-link>
        <span class="sep">/</span>
        <span class="cur">确认支付</span>
      </div>
      <div class="page-head sec-head">
        <div class="sec-title">
          <h2>
            💳 量子收银台
            <small>PAYMENT DESK · 确认支付</small>
          </h2>
        </div>
      </div>

      <div class="pay-wrap">
        <!-- ===== 订单信息 ===== -->
        <section class="pay-sec">
          <div class="pay-sec-head">
            <div class="bar"></div>
            <h3>
              订单信息
              <small>ORDER INFO</small>
            </h3>
          </div>
          <div class="pay-sec-body">
            <div class="pay-stats">
              <div class="pay-stat">
                <div class="sl">订单编号 · ORDER NO</div>
                <div class="sv mono">{{ orderNo }}</div>
              </div>
              <div class="pay-stat">
                <div class="sl">应付总额 · TOTAL</div>
                <div class="sv cyan">
                  <small>¥</small>
                  {{ fmt(payTotal) }}
                </div>
              </div>
              <div class="pay-stat">
                <div class="sl">支付剩余 · TIME LEFT</div>
                <div class="sv amber" :class="{ warn: leftSec <= 60 }">
                  {{ timeText }}
                </div>
              </div>
            </div>
            <div class="timer-bar"><i :style="{ width: timerWidth }"></i></div>
          </div>
        </section>

        <!-- ===== 商品清单 ===== -->
        <section class="pay-sec">
          <div class="pay-sec-head">
            <div class="bar"></div>
            <h3>
              商品清单
              <small>ORDER ITEMS · 按商家分组</small>
            </h3>
          </div>
          <div class="pay-sec-body">
            <div v-if="loadFailed" class="pay-empty">
              <div class="pay-empty-ico">◌</div>
              <div class="pay-empty-t">订单不存在或尚未生成</div>
              <div class="pay-empty-d">
                订单号：{{ orderNo || '（缺失）' }}，请确认秒杀订单是否创建成功
              </div>
              <div class="pay-empty-btns">
                <button class="pay-empty-btn" @click="retryLoad">
                  ↻ 重新加载
                </button>
                <router-link class="pay-empty-btn ghost" to="/">
                  返回首页
                </router-link>
              </div>
            </div>
            <div v-else-if="items.length === 0" class="pay-empty">
              <div class="pay-empty-ico">⚡</div>
              <div class="pay-empty-t">商品清单加载中…</div>
            </div>
            <div v-for="shop in shopGroups" :key="shop.name" class="shop-card">
              <div class="shop-head">
                <span class="shop-ico">◈</span>
                <span class="shop-name">{{ shop.name }}</span>
                <span class="shop-count">
                  共 {{ shop.items.reduce((s, i) => s + i.qty, 0) }} 件
                </span>
              </div>
              <div v-for="(it, i) in shop.items" :key="i" class="oitem">
                <div class="oicon">
                  <img
                    v-if="it.image"
                    :src="it.image"
                    :alt="it.name"
                    class="oicon-img"
                  />
                  <div v-else class="ph" :class="it.ph || ''">
                    {{ it.icon }}
                  </div>
                </div>
                <div>
                  <div class="oname">{{ it.name }}</div>
                  <div v-if="it.param" class="oparams">{{ it.param }}</div>
                </div>
                <div class="oprice">
                  <small>¥</small>
                  {{ fmt(it.price) }}
                </div>
                <div class="oqty">×{{ it.qty }}</div>
                <div class="osub">¥{{ fmt(it.price * it.qty) }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== 选择支付方式 ===== -->
        <section class="pay-sec">
          <div class="pay-sec-head">
            <div class="bar"></div>
            <h3>
              选择支付方式
              <small>PAYMENT METHOD</small>
            </h3>
          </div>
          <div class="pay-sec-body">
            <div class="pay-methods">
              <div
                v-for="m in PAYS"
                :key="m.id"
                class="pay-method"
                :class="{ active: payMethod === m.id }"
                @click="payMethod = m.id"
              >
                <div class="pmi">{{ m.icon }}</div>
                <div class="pmn">{{ m.name }}</div>
                <div class="pmd">{{ m.desc }}</div>
              </div>
            </div>
            <div class="pay-note">
              ⚡
              <b>量子加密通道</b>
              已就绪
              <span class="sep">◆</span>
              收款方：
              <b>NEBULA MART 星环商城</b>
              <span class="sep">◆</span>
              AES-4096 全链路加密
            </div>
            <div v-if="!successVisible" class="pay-query-row">
              已在支付宝完成支付？
              <button class="pay-query-btn" @click="manualCheckPay()">
                点此确认支付结果
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- ===== 底部支付栏 ===== -->
    <div class="ord-bar">
      <div class="ord-bar-in">
        <router-link class="back" to="/checkout">⟵ 返回确认订单</router-link>
        <div class="ob-total">
          <span class="lab">应付总额</span>
          <span class="val">
            <small>¥</small>
            {{ fmt(payTotal) }}
          </span>
        </div>
        <button
          class="submit"
          :disabled="paying || payWaitVisible || leftSec <= 0"
          @click="doPay"
        >
          {{
            paying
              ? '量子通道加密中…'
              : payWaitVisible
                ? '等待支付…'
                : '⟶ 立即支付'
          }}
        </button>
      </div>
    </div>

    <!-- ===== 等待支付模态框（发起支付后 30s 自动跳我的订单） ===== -->
    <div v-if="payWaitVisible" class="modal-mask show">
      <div class="modal paywait-modal">
        <div class="modal-head">
          <h3>
            ⏳ 等待支付
            <small>PAYMENT PENDING · 订单已提交</small>
          </h3>
        </div>
        <div class="modal-body paywait-body">
          <div class="paywait-orb"><span>◉</span></div>
          <div class="paywait-t">订单已提交，等待支付…</div>
          <div
            class="paywait-status"
            :class="
              payWaitStatus === 'success'
                ? 'ok'
                : payWaitStatus === 'cancel'
                  ? 'bad'
                  : ''
            "
          >
            <span v-if="payWaitStatus === 'success'">
              ✓ 已支付 · 支付宝交易成功
            </span>
            <span v-else-if="payWaitStatus === 'cancel'">
              ⚠ 订单已取消，支付未完成
            </span>
            <span v-else>✦ 等待支付结果…</span>
          </div>
          <div class="paywait-s">
            <b>{{ payWaitLeft }}</b>
            s 后自动跳转「我的订单」
          </div>
        </div>
        <div class="modal-foot">
          <button class="mbtn primary" @click="goOrders">立即查看订单</button>
        </div>
      </div>
    </div>

    <!-- ===== 支付成功弹窗 ===== -->
    <div v-if="successVisible" class="modal-mask show">
      <div class="modal">
        <div class="success-orb">✓</div>
        <h2>支付成功</h2>
        <div class="m-sub">PAYMENT COMPLETE · 量子通道已确认</div>
        <div class="m-rows">
          <div class="m-row">
            <span>实付金额</span>
            <b class="cyan">¥{{ fmt(payTotal) }}</b>
          </div>
          <div class="m-row">
            <span>支付方式</span>
            <b>{{ currentPayName }}</b>
          </div>
        </div>
        <div class="m-btns">
          <router-link class="mbtn ghost" to="/orders">查看订单</router-link>
          <router-link class="mbtn primary" to="/">返回首页 ⟶</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PageSearchHeader from '@/components/nebula/PageSearchHeader/index.vue'
import { useRoute, useRouter } from 'vue-router'
import { reqPayForm, reqOrderDetail, reqPayQuery } from '@/api/order'
import message from '@/utils/message'

const route = useRoute()
const router = useRouter()

interface PayItem {
  name: string
  icon: string
  ph?: string
  image?: string
  qty: number
  price: number
  param?: string
  shop: string
}

const PAYS = [
  { id: 'brain', icon: '🧠', name: '脑波支付', desc: '0.1S 免触控\n无需输密' },
  {
    id: 'card',
    icon: '◈',
    name: '量子银行卡',
    desc: 'AES-4096 加密\n尾号 2048',
  },
  { id: 'star', icon: '✦', name: '星元余额', desc: '余额 ¥88,888\n本次可用' },
]

const orderNo = computed(() => String(route.query.orderSn || ''))

// 秒杀跳转兜底：秒杀页 kill 成功即带商品信息跳转（订单由 MQ 异步落库，
// 明细行的商品名/图/价可能未补全）。本页分情况展示：
// - 正常订单（结算/继续支付）：明细齐全，直接展示接口数据
// - 秒杀订单：明细缺名/图/价时，用跳转带来的商品信息补全（按 skuId 匹配）
const q = route.query
const fbSkuId = q.skuId ? String(q.skuId) : ''
const fbName = q.name ? String(q.name) : ''
const fbImage = q.image ? String(q.image) : ''
const fbPrice = Number(q.price ?? 0)
const hasFb = Boolean(fbSkuId || fbName)
const payTotal = ref(Number(route.query.amount || 0))
const payMethod = ref('brain')
const paying = ref(false)
const successVisible = ref(false)

// 支付成功：展示成功弹窗，停留当前页（由用户点「查看订单/返回首页」，不再自动跳转）
function showSuccess() {
  successVisible.value = true
  if (timer) clearInterval(timer)
}
const loadFailed = ref(false)

// 是否已主动查过支付宝（每次页面加载只对账一次，避免重复查询）
let reconciled = false

const currentPayName = computed(
  () => PAYS.find((p) => p.id === payMethod.value)?.name || '脑波支付',
)

// 订单商品（仅接口数据，不回落 mock）
const items = ref<PayItem[]>([])

const shopGroups = computed(() => {
  const map = new Map<string, PayItem[]>()
  items.value.forEach((it) => {
    if (!map.has(it.shop)) map.set(it.shop, [])
    map.get(it.shop)!.push(it)
  })
  return [...map.entries()].map(([name, list]) => ({ name, items: list }))
})

async function loadPayData() {
  if (!orderNo.value) {
    loadFailed.value = true
    return
  }
  // 秒杀订单是异步创建（kill 先返回订单号，MQ 消费后落库），轮询等待避免查询过早
  // 快速轮询 5 次 × 800ms，未命中再慢速兜底 5 次 × 2s（覆盖 MQ 投递 + Feign 补全商品信息耗时）
  for (let attempt = 0; attempt < 5; attempt++) {
    if (await tryFetchOrder()) return
    if (attempt < 4) await new Promise((r) => setTimeout(r, 800))
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    if (await tryFetchOrder()) return
    if (attempt < 4) await new Promise((r) => setTimeout(r, 2000))
  }
  loadFailed.value = true
}

// 失败后手动重试
async function retryLoad() {
  loadFailed.value = false
  await loadPayData()
}

// 拉取一次订单详情，成功返回 true
async function tryFetchOrder(): Promise<boolean> {
  try {
    const result: any = await reqOrderDetail(orderNo.value)
    if (result.code === 200 && result.data) {
      const data = result.data
      const order = data.order || {}
      let list: any[] = data.items || []
      if (order.payAmount != null) payTotal.value = Number(order.payAmount)
      if (order.totalAmount != null && order.payAmount == null)
        payTotal.value = Number(order.totalAmount)
      // 支付剩余时间：优先用后端下发的支付截止时间戳（payDeadline，与关单队列一致），
      // 后端未下发时退回「下单时间 + 前端兜底时限」，刷新不重置
      const created = parseServerTime(order.createTime)
      const payDeadline = Number(data.payDeadline ?? 0)
      if (payDeadline > 0) {
        deadlineTs.value = payDeadline
      } else if (created) {
        deadlineTs.value = created + PAY_WINDOW_MS
      }
      if (deadlineTs.value) {
        const remain = Math.max(
          1,
          Math.round((deadlineTs.value - Date.now()) / 1000),
        )
        leftSec.value = remain
        TOTAL_SEC.value = Math.max(remain, 1)
      }
      // 秒杀兜底：明细行尚未落库/查询为空时，先用跳转带来的商品信息撑起清单（秒杀单固定 1 件）
      if (hasFb && list.length === 0) {
        list = [
          {
            skuId: fbSkuId,
            skuName: fbName,
            skuPic: fbImage,
            skuPrice: fbPrice || undefined,
            skuQuantity: 1,
          },
        ]
      }
      items.value = list.map((it: any) => {
        // 该行是否可用秒杀跳转信息兜底：带 skuId 时须匹配，未带则只兜底首行
        const fromFb =
          hasFb && (!it.skuId || !fbSkuId || String(it.skuId) === fbSkuId)
        return {
          name:
            it.spuName || it.skuName || (fromFb ? fbName : '') || '量子商品',
          icon: '◈',
          ph: 'p2',
          image: it.skuPic || (fromFb ? fbImage : '') || '',
          qty: Number(it.skuQuantity ?? 1),
          price:
            it.skuPrice != null ? Number(it.skuPrice) : fromFb ? fbPrice : 0,
          param: String(it.skuAttrsVals || '').replace(/;/g, ' / '),
          shop: it.spuBrand || '其他',
        }
      })
      loadFailed.value = false
      // 已支付订单（如刷新/再次进入）：直接展示成功态，不自动跳转
      if (Number(order.status ?? -1) === 1) {
        showSuccess()
      } else if (!reconciled) {
        // 订单未支付但可能实际已付款（支付宝异步通知丢失/回调服务短暂不可用）：
        // 主动查一次支付宝交易状态并同步订单，已支付则展示成功态
        reconciled = true
        await checkPayStatus()
      }
      return true
    }
  } catch {
    /* 网络异常走重试 */
  }
  return false
}

const fmt = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

// ===== 倒计时（优先基于服务器下单时间 + 支付时限，刷新不重置） =====
// 支付时限兜底（毫秒）：仅在后端未下发 payDeadline 时使用（后端实际关单时限 5 分钟）
const PAY_WINDOW_MS = 5 * 60 * 1000
const TOTAL_SEC = ref(14 * 60 + 59) // 进度条基准（无接口数据时 14:59）
const leftSec = ref(TOTAL_SEC.value)
const deadlineTs = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

// 解析后端时间（yyyy-MM-dd HH:mm:ss / ISO / 时间戳），失败返回 null
function parseServerTime(s: any): number | null {
  if (!s) return null
  if (typeof s === 'number') return s
  const str = String(s).trim()
  const t = Date.parse(str.includes('T') ? str : str.replace(/-/g, '/'))
  return Number.isNaN(t) ? null : t
}

const timeText = computed(
  () =>
    `${String(Math.floor(leftSec.value / 60)).padStart(2, '0')}:${String(leftSec.value % 60).padStart(2, '0')}`,
)
const timerWidth = computed(
  () => `${Math.max(0, (leftSec.value / TOTAL_SEC.value) * 100)}%`,
)

// ===== 支付 =====
// 等待支付弹窗：发起支付后 60s 自动跳转我的订单（无论支付结果）
const payWaitVisible = ref(false)
const payWaitLeft = ref(60)
// 支付结果状态（弹窗内展示）：'' 等待中 / 'success' 已支付 / 'cancel' 已取消
const payWaitStatus = ref('')
let payWaitTimer: ReturnType<typeof setInterval> | null = null
let payPollTimer: ReturnType<typeof setInterval> | null = null

function startPayWait() {
  payWaitVisible.value = true
  payWaitLeft.value = 60
  payWaitStatus.value = ''
  if (payWaitTimer) clearInterval(payWaitTimer)
  payWaitTimer = setInterval(() => {
    payWaitLeft.value--
    if (payWaitLeft.value <= 0) goOrders()
  }, 1000)
  // 倒计时期间轮询支付宝成功数据：结果状态显示在弹窗上；未成功不改订单状态
  startPayPolling()
}

// 轮询支付结果：调后端主动查单（confirmPayStatus 仅在支付宝返回成功时才就地更新订单状态，
// 未成功返回原状态、不改动任何数据）
function startPayPolling() {
  if (payPollTimer) clearInterval(payPollTimer)
  payPollTimer = setInterval(async () => {
    try {
      const res: any = await reqPayQuery(orderNo.value)
      if (res?.code === 200) {
        const status = Number(res.data)
        if (status === 1) {
          // 支付宝确认成功（TRADE_SUCCESS/TRADE_FINISHED）：状态显示在弹窗上，等倒计时结束跳转
          payWaitStatus.value = 'success'
          stopPayPolling()
          return
        }
        if (status === 4) {
          payWaitStatus.value = 'cancel'
          stopPayPolling()
        }
      }
    } catch {
      /* 单次查询失败继续轮询 */
    }
  }, 2000)
}

function stopPayPolling() {
  if (payPollTimer) {
    clearInterval(payPollTimer)
    payPollTimer = null
  }
}

function goOrders() {
  if (payWaitTimer) {
    clearInterval(payWaitTimer)
    payWaitTimer = null
  }
  stopPayPolling()
  payWaitVisible.value = false
  router.push('/orders')
}

async function doPay() {
  if (paying.value || payWaitVisible.value) return
  paying.value = true
  // 用户手势内同步打开空白窗口（避免浏览器拦截弹窗），支付表单写入该窗口
  const payWin = window.open('', '_blank')
  try {
    // 调起后端支付宝支付表单（写入新窗口，不在当前页弹出）
    const result: any = await reqPayForm(orderNo.value)
    if (result.code === 200 && result.data) {
      if (payWin) {
        payWin.document.open()
        payWin.document.write(result.data)
        payWin.document.close()
      } else {
        message.error('浏览器拦截了支付窗口，请允许弹窗后重试')
        return
      }
    } else {
      message.error(result?.message || '支付表单生成失败')
      return
    }
  } catch (e) {
    message.error((e as Error).message || '支付发起失败')
    return
  } finally {
    paying.value = false
  }
  // 弹等待支付框：60s 内轮询支付宝成功数据，无论结果最终跳转我的订单
  startPayWait()
}

// 主动查支付宝交易状态并同步订单（后端查到已支付会就地更新订单状态）
// 已支付/已取消返回 true 并弹对应提示
async function checkPayStatus(): Promise<boolean> {
  try {
    const res: any = await reqPayQuery(orderNo.value)
    if (res?.code === 200) {
      const status = Number(res.data)
      if (status === 1) {
        showSuccess()
        return true
      }
      if (status === 4) {
        message.warning('订单已取消，支付未完成')
        return true
      }
    }
  } catch {
    /* 单次查询失败忽略 */
  }
  return false
}

// 主动查支付宝交易状态：已支付弹成功；未支付给提示
async function manualCheckPay(silent = false) {
  if (await checkPayStatus()) {
    return
  }
  if (!silent) message.info('暂未查询到支付记录，请确认是否已在支付宝完成付款')
}

onMounted(() => {
  loadPayData()
  timer = setInterval(() => {
    if (deadlineTs.value) {
      leftSec.value = Math.max(
        0,
        Math.round((deadlineTs.value - Date.now()) / 1000),
      )
    } else {
      leftSec.value = Math.max(0, leftSec.value - 1)
    }
    if (leftSec.value <= 0) {
      leftSec.value = 0
      if (timer) clearInterval(timer)
      message.warning('⚠ 支付超时，订单已自动取消')
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  if (payWaitTimer) {
    clearInterval(payWaitTimer)
    payWaitTimer = null
  }
  if (payPollTimer) {
    clearInterval(payPollTimer)
    payPollTimer = null
  }
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
.pay-wrap {
  max-width: 1224px;
  margin: 0 auto;
}

/* 分区卡片 */
.pay-sec {
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 18px;
  background: var(--panel);
  backdrop-filter: blur(10px);
  margin-top: 18px;
  overflow: hidden;
}
.pay-sec-head {
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
.pay-sec-head .bar {
  width: 4px;
  height: 16px;
  border-radius: 3px;
  background: linear-gradient(180deg, #00f0ff, #a855f7);
  box-shadow: 0 0 8px var(--cyan);
}
.pay-sec-head h3 {
  font-family: var(--font-h);
  font-size: 15px;
  letter-spacing: 2px;
  color: #fff;
}
.pay-sec-head h3 small {
  font-family: var(--font-m);
  font-size: 9px;
  color: var(--dim);
  letter-spacing: 3px;
  font-weight: 400;
  margin-left: 8px;
}
.pay-sec-body {
  padding: 22px 24px;
}

/* 空/错误态 */
.pay-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--dim);
}
.pay-empty-ico {
  font-size: 34px;
  margin-bottom: 10px;
  opacity: 0.7;
}
.pay-empty-t {
  font-size: 15px;
  font-weight: 700;
  color: var(--txt);
  margin-bottom: 6px;
}
.pay-empty-d {
  font-size: 12px;
  line-height: 1.6;
  margin-bottom: 16px;
}
.pay-empty-btn {
  display: inline-block;
  padding: 8px 22px;
  border-radius: 999px;
  border: 1px solid rgba(0, 240, 255, 0.45);
  color: var(--cyan);
  font-size: 13px;
  transition: 0.25s;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
}
.pay-empty-btn:hover {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
}
.pay-empty-btn.ghost {
  color: var(--dim);
  border-color: rgba(143, 163, 200, 0.3);
  text-decoration: none;
}
.pay-empty-btn.ghost:hover {
  background: rgba(143, 163, 200, 0.12);
  color: var(--txt);
}
.pay-empty-btns {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 订单信息 */
.pay-stats {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
.pay-stat {
  text-align: center;
}
.pay-stat .sl {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
}
.pay-stat .sv {
  font-family: var(--font-h);
  font-size: 24px;
  font-weight: 700;
  color: var(--txt);
  margin-top: 7px;
  letter-spacing: 1px;
}
.pay-stat .sv.cyan {
  color: var(--cyan);
  font-size: 32px;
  text-shadow: 0 0 18px rgba(0, 240, 255, 0.6);
}
.pay-stat .sv.cyan small {
  font-size: 16px;
  margin-right: 2px;
}
.pay-stat .sv.amber {
  color: var(--amber);
  text-shadow: 0 0 12px rgba(255, 197, 61, 0.5);
}
.pay-stat .sv.amber.warn {
  color: var(--magenta);
  text-shadow: 0 0 12px rgba(255, 46, 196, 0.7);
  animation: blink 1s infinite;
}
.pay-stat .sv.mono {
  font-family: var(--font-m);
  font-size: 17px;
  letter-spacing: 2px;
  color: var(--txt);
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}
.timer-bar {
  height: 4px;
  border-radius: 3px;
  background: rgba(0, 240, 255, 0.12);
  margin-top: 18px;
  overflow: hidden;
}
.timer-bar i {
  display: block;
  height: 100%;
  width: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #00f0ff, #a855f7, #ff2ec4);
  transition: width 1s linear;
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}

/* 商品清单 */
.shop-card {
  border: 1px solid rgba(0, 240, 255, 0.12);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 12px;
  background: rgba(6, 10, 26, 0.4);
}
.shop-card:last-child {
  margin-bottom: 0;
}
.shop-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.08);
  background: rgba(0, 240, 255, 0.04);
}
.shop-ico {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    rgba(0, 240, 255, 0.25),
    rgba(168, 85, 247, 0.25)
  );
  border: 1px solid rgba(0, 240, 255, 0.4);
  color: var(--cyan);
  font-size: 14px;
  text-shadow: 0 0 10px var(--cyan);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.25);
}
.shop-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--cyan);
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.35);
}
.shop-count {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  margin-left: auto;
}
.oitem {
  display: grid;
  grid-template-columns: 64px 1fr 100px 90px 110px;
  align-items: center;
  gap: 14px;
  padding: 13px 20px;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.07);
}
.oitem:last-child {
  border-bottom: none;
}
.oicon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
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
.oicon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.oicon .ph {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    rgba(0, 240, 255, 0.35),
    rgba(168, 85, 247, 0.3)
  );
  border: 1px solid rgba(0, 240, 255, 0.5);
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.3);
  font-family: var(--font-h);
  font-size: 16px;
  color: #fff;
  text-shadow: 0 0 12px var(--cyan);
}
.oname {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  line-height: 1.4;
}
.oparams {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--amber);
  margin-top: 4px;
  letter-spacing: 1px;
}
.oprice {
  text-align: center;
  font-size: 14px;
  color: var(--dim);
}
.oprice small {
  font-size: var(--font-size-xs);
}
.oqty {
  text-align: center;
  font-size: 13px;
  color: var(--dim);
  font-family: var(--font-m);
}
.osub {
  text-align: right;
  font-family: var(--font-h);
  font-size: 14px;
  font-weight: 700;
  color: var(--green);
  text-shadow: 0 0 10px rgba(57, 255, 136, 0.35);
}

/* 支付方式 */
.pay-methods {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.pay-method {
  position: relative;
  border: 1px solid rgba(0, 240, 255, 0.18);
  border-radius: 14px;
  padding: 20px 14px;
  cursor: pointer;
  text-align: center;
  transition: 0.25s;
  background: rgba(0, 240, 255, 0.03);
}
.pay-method:hover {
  border-color: rgba(0, 240, 255, 0.45);
  transform: translateY(-2px);
}
.pay-method.active {
  border-color: var(--cyan);
  background: rgba(0, 240, 255, 0.08);
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.2);
}
.pay-method.active::after {
  content: '✓';
  position: absolute;
  top: 10px;
  right: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}
.pay-method .pmi {
  width: 46px;
  height: 46px;
  margin: 0 auto 12px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: linear-gradient(
    145deg,
    rgba(0, 240, 255, 0.15),
    rgba(168, 85, 247, 0.15)
  );
  border: 1px solid rgba(0, 240, 255, 0.35);
  color: var(--cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}
.pay-method .pmn {
  font-size: 15px;
  font-weight: 700;
  color: var(--txt);
  letter-spacing: 1px;
}
.pay-method .pmd {
  font-size: var(--font-size-xs);
  color: var(--dim);
  margin-top: 5px;
  font-family: var(--font-m);
  letter-spacing: 1px;
  line-height: 1.5;
  white-space: pre-line;
}

/* 安全提示 */
.pay-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 13px 20px;
  margin-top: 16px;
  border: 1px dashed rgba(57, 255, 136, 0.3);
  border-radius: 12px;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  background: rgba(57, 255, 136, 0.04);
}
.pay-note b {
  color: var(--green);
  font-weight: 400;
}
.pay-note .sep {
  color: rgba(0, 240, 255, 0.35);
}

/* 主动查单 */
.pay-query-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
  font-family: var(--font-m);
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 1px;
}
.pay-query-btn {
  padding: 6px 18px;
  border-radius: 999px;
  border: 1px solid rgba(0, 240, 255, 0.45);
  background: transparent;
  color: var(--cyan);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: 0.25s;
}
.pay-query-btn:hover {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
}

/* 底部支付栏 */
.ord-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 999;
}
.ord-bar-in {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-top: 1px solid rgba(0, 240, 255, 0.22);
  border-radius: 18px 18px 0 0;
  background: rgba(5, 9, 24, 0.94);
  backdrop-filter: blur(16px);
  padding: 18px 44px;
  box-shadow:
    0 -12px 40px rgba(0, 0, 0, 0.5),
    0 0 24px rgba(0, 240, 255, 0.08);
}
.ord-bar .back {
  color: var(--dim);
  font-size: 13px;
  letter-spacing: 1px;
  cursor: pointer;
  text-decoration: none;
  transition: 0.2s;
  font-family: var(--font-m);
  white-space: nowrap;
}
.ord-bar .back:hover {
  color: var(--cyan);
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
}
.ord-bar .ob-total {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex: 1;
  justify-content: center;
  white-space: nowrap;
}
.ord-bar .ob-total .lab {
  font-size: 13px;
  color: var(--dim);
  letter-spacing: 1px;
}
.ord-bar .ob-total .val {
  font-family: var(--font-h);
  font-size: 26px;
  font-weight: 900;
  color: var(--cyan);
  text-shadow: 0 0 16px rgba(0, 240, 255, 0.6);
}
.ord-bar .ob-total .val small {
  font-size: 13px;
  margin-right: 1px;
}
.ord-bar .submit {
  flex-shrink: 0;
  width: 300px;
  height: 52px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  font-family: var(--font-h);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 3px;
  box-shadow: 0 0 22px rgba(0, 240, 255, 0.5);
  transition: 0.25s;
}
.ord-bar .submit:hover:not(:disabled) {
  filter: brightness(1.2);
  transform: translateY(-2px);
  box-shadow: 0 0 34px rgba(0, 240, 255, 0.85);
}
.ord-bar .submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* 支付成功弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(3, 5, 14, 0.72);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  width: 440px;
  max-width: calc(100vw - 40px);
  border: 1px solid var(--line);
  border-radius: 20px;
  text-align: center;
  background: rgba(6, 10, 26, 0.97);
  backdrop-filter: blur(20px);
  padding: 36px 34px;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(57, 255, 136, 0.15);
  animation: modalIn 0.3s ease;
}
@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.success-orb {
  width: 86px;
  height: 86px;
  margin: 0 auto 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    circle,
    rgba(57, 255, 136, 0.25),
    rgba(57, 255, 136, 0.06)
  );
  border: 1px solid rgba(57, 255, 136, 0.5);
  box-shadow: 0 0 34px rgba(57, 255, 136, 0.45);
  font-size: 40px;
  color: var(--green);
  text-shadow: 0 0 18px rgba(57, 255, 136, 0.8);
  animation: pop 0.5s ease;
}
@keyframes pop {
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  70% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.modal h2 {
  font-family: var(--font-h);
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 4px;
  color: var(--green);
  text-shadow: 0 0 18px rgba(57, 255, 136, 0.5);
}
.modal .m-sub {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 3px;
  margin-top: 6px;
}
.m-rows {
  max-width: 300px;
  margin: 22px auto 0;
  text-align: left;
}
.m-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--dim);
  margin-bottom: 11px;
  letter-spacing: 1px;
}
.m-row b {
  color: var(--txt);
  font-weight: 600;
}
.m-row .cyan {
  color: var(--cyan);
  font-size: 15px;
}
.m-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 26px;
}
.mbtn {
  height: 46px;
  padding: 0 30px;
  border-radius: 12px;
  cursor: pointer;
  font-family: var(--font-h);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  transition: 0.25s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.mbtn.ghost {
  border: 1px solid rgba(0, 240, 255, 0.4);
  background: transparent;
  color: var(--cyan);
}
.mbtn.ghost:hover {
  background: rgba(0, 240, 255, 0.1);
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.3);
}
.mbtn.primary {
  border: none;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.5);
}
.mbtn.primary:hover {
  filter: brightness(1.2);
  box-shadow: 0 0 28px rgba(0, 240, 255, 0.85);
}
/* ===== 等待支付模态框 ===== */
.paywait-modal {
  width: 420px;
  text-align: center;
}
.paywait-modal .modal-head {
  justify-content: center;
  text-align: center;
}
.paywait-body {
  padding: 18px 0 26px;
}
.paywait-orb {
  width: 76px;
  height: 76px;
  margin: 0 auto 18px;
  border-radius: 50%;
  border: 1px dashed rgba(0, 240, 255, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: var(--cyan);
  text-shadow: 0 0 18px var(--cyan);
  animation: nb-spin 3s linear infinite;
}
.paywait-orb span {
  animation: nb-spin 3s linear infinite reverse;
}
.paywait-t {
  font-family: var(--font-h);
  font-size: 18px;
  letter-spacing: 2px;
  color: var(--txt);
}
.paywait-status {
  margin-top: 12px;
  font-size: 13px;
  color: var(--dim);
  letter-spacing: 1px;
  min-height: 20px;
}
.paywait-status.ok {
  color: var(--green);
  text-shadow: 0 0 10px rgba(57, 255, 136, 0.5);
}
.paywait-status.bad {
  color: var(--amber);
  text-shadow: 0 0 10px rgba(255, 197, 61, 0.4);
}
.paywait-s {
  margin-top: 10px;
  font-size: 13px;
  color: var(--dim);
  letter-spacing: 1px;
}
.paywait-s b {
  color: var(--cyan);
  font-size: 15px;
}
@keyframes nb-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 760px) {
  .pay-methods {
    grid-template-columns: 1fr;
  }
  .ord-bar-in {
    flex-wrap: wrap;
    padding: 14px 18px;
    gap: 12px;
  }
  .ord-bar .ob-total {
    order: 1;
    flex-basis: 100%;
  }
  .ord-bar .submit {
    width: 100%;
    order: 2;
  }
}
</style>
