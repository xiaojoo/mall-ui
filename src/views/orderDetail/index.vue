<template>
  <div class="nb-order-detail">
    <div class="wrap">
      <div class="crumbs">
        <router-link to="/">Nebula Home</router-link>
        <span class="sep">/</span>
        <router-link to="/orders">我的订单</router-link>
        <span class="sep">/</span>
        <span class="cur">订单详情 {{ orderNo }}</span>
      </div>
      <div class="page-head sec-head">
        <div class="sec-title">
          <h2>
            📦 订单详情
            <small>ORDER DETAIL · 全链路追踪</small>
          </h2>
        </div>
      </div>

      <div class="d-wrap">
        <!-- ===== 订单状态条 ===== -->
        <div class="d-status">
          <span class="s-badge" :class="statusCls">{{ statusLabel }}</span>
          <span class="s-text">
            <b>{{ statusTip }}</b>
          </span>
          <span class="s-no">{{ orderNo }}</span>
        </div>

        <!-- ===== 物流时间线 ===== -->
        <section class="d-sec">
          <div class="d-sec-head">
            <div class="bar"></div>
            <h3>
              物流追踪
              <small>LOGISTICS TRACKING</small>
            </h3>
          </div>
          <div class="d-sec-body">
            <div class="tl">
              <div
                v-for="(step, i) in timeline"
                :key="i"
                class="tl-item"
                :class="step.cls"
              >
                <div class="t-t">{{ step.t }}</div>
                <div class="t-s">{{ step.s }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== 售后流程（有售后申请时展示） ===== -->
        <section v-if="refundApply" class="d-sec">
          <div class="d-sec-head">
            <div class="bar"></div>
            <h3>
              售后流程
              <small>AFTER-SALE PROCESS</small>
            </h3>
          </div>
          <div class="d-sec-body">
            <div class="as-info">
              <span class="as-reason">原因：{{ refundApply.reason }}</span>
              <span class="as-amount">
                退款金额：¥{{ fmt(Number(refundApply.returnAmount || 0)) }}
              </span>
              <span class="as-status" :class="asStatusCls">
                {{ asStatusText }}
              </span>
            </div>
            <div class="tl as-tl">
              <div
                v-for="(step, i) in asTimeline"
                :key="i"
                class="tl-item"
                :class="step.cls"
              >
                <div class="t-t">{{ step.t }}</div>
                <div class="t-s">{{ step.s }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== 收货信息 ===== -->
        <section class="d-sec">
          <div class="d-sec-head">
            <div class="bar"></div>
            <h3>
              收货信息
              <small>DELIVERY INFO</small>
            </h3>
          </div>
          <div class="d-sec-body">
            <div class="dl">
              <div class="dl-item">
                <div class="lk">收货人</div>
                <div class="lv">{{ detail.recipient }}</div>
              </div>
              <div class="dl-item">
                <div class="lk">联系电话</div>
                <div class="lv mono">{{ detail.phone }}</div>
              </div>
              <div class="dl-item">
                <div class="lk">收货地址</div>
                <div class="lv">{{ detail.addr }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== 商品清单 ===== -->
        <section class="d-sec">
          <div class="d-sec-head">
            <div class="bar"></div>
            <h3>
              商品清单
              <small>ORDER ITEMS</small>
            </h3>
          </div>
          <div class="d-sec-body">
            <div class="shop-card">
              <div class="shop-head">
                <span class="shop-ico">
                  <img
                    v-if="shopLogo"
                    :src="shopLogo"
                    alt=""
                    class="shop-ico-img"
                  />
                  <span v-else>◈</span>
                </span>
                <router-link
                  v-if="shopBrandId"
                  class="shop-name shop-link"
                  :to="{ path: '/shop', query: { brandId: shopBrandId } }"
                  title="进入店铺"
                >
                  {{ shopName }}
                </router-link>
                <span v-else class="shop-name">{{ shopName }}</span>
                <span class="shop-count">共 {{ totalQty }} 件</span>
              </div>
              <div v-for="(it, i) in items" :key="i" class="oitem">
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
                  <div class="oname" @click="goDetail(it)">{{ it.name }}</div>
                  <div v-if="it.param" class="oparams">{{ it.param }}</div>
                </div>
                <div class="oprice">
                  <small>¥</small>
                  {{ fmt(it.price) }}
                </div>
                <div class="oqty">×{{ it.qty }}</div>
                <div class="osub">¥{{ fmt(it.price * it.qty) }}</div>
                <button
                  v-if="canReview && myItemCommentCount(it) < 2"
                  class="oitem-review"
                  :title="
                    myItemCommentCount(it) === 1 ? '追加评论' : '评价该商品'
                  "
                  @click="toggleReviewForm(it)"
                >
                  {{ myItemCommentCount(it) === 1 ? '✚ 追加评论' : '✎ 评价' }}
                </button>
                <span
                  v-else-if="canReview && myItemCommentCount(it) >= 2"
                  class="oitem-review-full"
                >
                  已评价 2 条
                </span>
                <!-- 内联发表评论表单 -->
                <div
                  v-if="reviewForm.skuId === String(it.skuId)"
                  class="oitem-review-form"
                >
                  <div class="orf-head">
                    <span class="orf-title">
                      {{
                        myItemCommentCount(it) === 1
                          ? '✚ 追加评论'
                          : '✎ 发表评论'
                      }}
                    </span>
                    <span class="orf-stars">
                      <span
                        v-for="s in 5"
                        :key="s"
                        class="orf-star"
                        :class="{ on: reviewForm.stars >= s }"
                        @click="reviewForm.stars = s"
                      >
                        ★
                      </span>
                    </span>
                    <span v-if="myItemCommentCount(it) === 1" class="orf-tip">
                      追加评论不参与评分统计
                    </span>
                  </div>
                  <textarea
                    v-model.trim="reviewForm.content"
                    maxlength="300"
                    rows="3"
                    name="orderReviewContent"
                    placeholder="分享你的星际购物体验…（300 字以内）"
                  ></textarea>
                  <div class="orf-imgs">
                    <div
                      v-for="(u, j) in reviewForm.images"
                      :key="u"
                      class="orf-img"
                    >
                      <img :src="u" alt="预览" />
                      <button
                        class="orf-img-del"
                        @click="reviewForm.images.splice(j, 1)"
                      >
                        ✕
                      </button>
                    </div>
                    <label
                      v-if="
                        reviewForm.images.length < 3 && !reviewForm.uploading
                      "
                      class="orf-img-add"
                    >
                      <input
                        type="file"
                        name="orderReviewImages"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        multiple
                        hidden
                        @change="onReviewFormImgChange"
                      />
                      <span>📷</span>
                      <small>图片</small>
                    </label>
                    <span v-if="reviewForm.uploading" class="orf-up">
                      ✦ 上传中…
                    </span>
                  </div>
                  <div class="orf-foot">
                    <span class="orf-count">
                      {{ reviewForm.content.length }}/300
                    </span>
                    <button class="orf-btn ghost" @click="closeReviewForm">
                      取消
                    </button>
                    <button
                      class="orf-btn"
                      :disabled="
                        reviewForm.submitting ||
                        reviewForm.uploading ||
                        !reviewForm.content
                      "
                      @click="submitItemComment(it)"
                    >
                      {{ reviewForm.submitting ? '发表中…' : '✓ 发表' }}
                    </button>
                  </div>
                </div>
                <!-- 我的评论：展示 + 删除 -->
                <div
                  v-if="itemComments[String(it.skuId)]?.length"
                  class="oitem-comments"
                >
                  <div
                    v-for="c in itemComments[String(it.skuId)]"
                    :key="c.id"
                    class="oc-item"
                  >
                    <span class="oc-stars">
                      {{ '★'.repeat(c.stars) }}{{ '☆'.repeat(5 - c.stars) }}
                    </span>
                    <span v-if="c.isAdditional" class="oc-add">追加</span>
                    <span class="oc-content">{{ c.content }}</span>
                    <span class="oc-time">{{ c.time }}</span>
                    <button
                      class="oc-del"
                      @click="deleteItemComment(String(it.skuId), c)"
                    >
                      🗑 删除
                    </button>
                    <div v-if="c.resources.length" class="oc-imgs">
                      <img
                        v-for="(u, j) in c.resources"
                        :key="j"
                        :src="u"
                        :alt="`评论图片${j + 1}`"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== 订单信息 ===== -->
        <section class="d-sec">
          <div class="d-sec-head">
            <div class="bar"></div>
            <h3>
              订单信息
              <small>ORDER INFO</small>
            </h3>
          </div>
          <div class="d-sec-body">
            <div class="info-grid">
              <div class="info-item">
                订单编号
                <b class="mono">{{ orderNo }}</b>
              </div>
              <div class="info-item">
                下单时间
                <b>{{ orderTime }}</b>
              </div>
              <div class="info-item">
                支付方式
                <b>{{ detail.pay }}</b>
              </div>
              <div class="info-item">
                优惠券
                <b class="green">{{ detail.coupon }}</b>
              </div>
              <div class="info-item">
                商品金额
                <b>¥{{ fmt(goodsAmount) }}</b>
              </div>
              <div class="info-item">
                运费
                <b>¥{{ fmt(detail.ship) }}</b>
              </div>
              <div class="info-item">
                优惠金额
                <b class="green">-¥{{ fmt(couponAmount) }}</b>
              </div>
              <div class="info-item">
                订单状态
                <b :class="statusCls">{{ statusLabel }}</b>
              </div>
            </div>
            <div class="amount-box">
              <div class="amount-total">
                <span class="lab">实付金额</span>
                <span class="val">
                  <small>¥</small>
                  {{ fmt(totalAmount) }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- ===== 底部操作栏 ===== -->
    <div class="d-bar">
      <div class="d-bar-in">
        <router-link class="back" to="/orders">⟵ 返回订单列表</router-link>
        <div class="db-total">
          <span class="lab">实付金额</span>
          <span class="val">
            <small>¥</small>
            {{ fmt(totalAmount) }}
          </span>
        </div>
        <div class="db-acts">
          <router-link
            v-if="status === 0"
            class="dbar-btn primary"
            :to="{ path: '/pay', query: { orderSn: orderNo } }"
          >
            ⟶ 去支付
          </router-link>
          <button
            v-if="status === 1 || status === 2"
            class="dbar-btn primary"
            @click="confirmReceive"
          >
            ✓ 确认收货
          </button>
          <button v-if="status === 3" class="dbar-btn" @click="reorder">
            再次购买
          </button>
          <button
            v-if="
              status >= 1 && status <= 3 && !hasActiveAfterSale && !refundDone
            "
            class="dbar-btn warn"
            @click="refundVisible = true"
          >
            ⟲ 申请退款
          </button>
          <span v-else-if="hasActiveAfterSale" class="dbar-btn warn disabled">
            售后中
          </span>
          <span v-else-if="refundDone" class="dbar-btn warn disabled">
            已完成
          </span>
          <button
            v-if="(status === 3 || status === 4) && !hasActiveAfterSale"
            class="dbar-btn danger"
            @click="delVisible = true"
          >
            删除订单
          </button>
        </div>
      </div>
    </div>

    <!-- ===== 申请退款弹窗 ===== -->
    <div
      v-if="refundVisible"
      class="modal-mask show"
      @click.self="refundVisible = false"
    >
      <div class="modal">
        <div class="modal-head">
          <h3>
            ⟲ 申请退款
            <small>REFUND APPLY · 退款至原支付方式</small>
          </h3>
          <button class="modal-close" @click="refundVisible = false">✕</button>
        </div>
        <div class="refund-body">
          <div class="rf-amount">
            <span class="rf-lab">退款金额</span>
            <span class="rf-val">
              <small>¥</small>
              {{ fmt(totalAmount) }}
            </span>
          </div>
          <div class="rf-reasons">
            <div
              v-for="rs in REFUND_REASONS"
              :key="rs"
              class="rf-reason"
              :class="{ active: refundReason === rs }"
              @click="refundReason = rs"
            >
              {{ rs }}
            </div>
          </div>
          <textarea
            v-model.trim="refundDesc"
            maxlength="200"
            rows="2"
            name="refundDesc"
            placeholder="问题描述（选填，200 字以内）"
          ></textarea>
        </div>
        <div class="modal-foot">
          <button class="mbtn ghost" @click="refundVisible = false">
            取消
          </button>
          <button
            class="mbtn primary"
            :disabled="refunding || !refundReason"
            @click="submitRefund"
          >
            {{ refunding ? '提交中…' : '✓ 提交申请' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== 删除确认弹窗（通用组件） ===== -->
    <ConfirmDialog
      v-model:visible="delVisible"
      title="⚠ 删除订单"
      subtitle="DELETE ORDER · 删除后不可恢复"
      confirm-text="✓ 确认删除"
      danger
      @confirm="confirmDelete"
    >
      <div class="del-txt">
        确定要删除订单
        <b>{{ orderNo }}</b>
        吗？
        <br />
        删除后该订单将从列表中移除，且不可恢复。
      </div>
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ConfirmDialog from '@/components/nebula/ConfirmDialog/index.vue'
import {
  reqOrderDetail,
  reqDeleteOrder,
  reqRefundApply,
  reqReceiveOrder,
} from '@/api/order'
import {
  reqCommentList,
  reqCommentDelete,
  reqCommentSave,
  reqUploadImage,
} from '@/api/product'
import useUserStore from '@/store/modules/user'
import message from '@/utils/message'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

interface OrderItem {
  name: string
  icon: string
  ph?: string
  image?: string
  skuId?: string | number
  spuId?: string | number
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

// 商品关联的我的评论（按 skuId 分组）
interface ItemComment {
  id: number
  stars: number
  content: string
  time: string
  isAdditional: boolean
  resources: string[]
}

const orderNo = computed(() => String(route.params.orderSn || ''))
const status = ref(-1)
const orderTime = ref('')
const items = ref<OrderItem[]>([])
const payAmount = ref(0)
const couponAmount = ref(0)
const detail = ref({
  recipient: '',
  phone: '',
  addr: '',
  coupon: '不使用优惠券',
  ship: 0,
  pay: '在线支付',
})

function payTypeText(payType: any) {
  const map: Record<number, string> = {
    1: '支付宝',
    2: '微信支付',
    3: '银联支付',
  }
  return map[Number(payType)] || '在线支付'
}

const STATUS_META: Record<number, { label: string; cls: string; tip: string }> =
  {
    0: {
      label: '待支付',
      cls: 'ost-unpaid',
      tip: '订单尚未支付，请在限时内完成付款',
    },
    1: { label: '已支付', cls: 'ost-paid', tip: '支付已确认，量子仓正在打包' },
    2: { label: '已发货', cls: 'ost-paid', tip: '包裹已发出，正在轨道运输中' },
    3: {
      label: '已完成',
      cls: 'ost-done',
      tip: '订单已完成，感谢您的星际购物',
    },
    4: {
      label: '已取消',
      cls: 'ost-cancel',
      tip: '订单已取消，如有疑问请联系客服',
    },
  }
const statusLabel = computed(() => STATUS_META[status.value]?.label ?? '未知')
const statusCls = computed(() => STATUS_META[status.value]?.cls ?? 'ost-cancel')
const statusTip = computed(() => STATUS_META[status.value]?.tip ?? '')

const totalQty = computed(() => items.value.reduce((s, i) => s + i.qty, 0))

// 商家名/品牌 id（取首个商品；用于店铺跳转）
const shopName = computed(
  () => items.value[0]?.spuBrand || 'NEBULA 星环官方旗舰店',
)
const shopBrandId = computed(() => items.value[0]?.brandId)
const shopLogo = computed(() => items.value[0]?.brandLogo || '')
const goodsAmount = computed(() =>
  items.value.reduce((s, i) => s + i.price * i.qty, 0),
)
// 实付金额优先接口 payAmount，兜底明细合计
const totalAmount = computed(() =>
  payAmount.value > 0
    ? payAmount.value
    : Math.max(
        0,
        goodsAmount.value + Number(detail.value.ship || 0) - couponAmount.value,
      ),
)

const fmt = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

// 物流时间线（按状态生成）
const timeline = computed(() => {
  const t = orderTime.value
  if (status.value === 0)
    return [{ t: '订单已提交', s: `${t} · 量子引擎已生成订单`, cls: 'cur' }]
  if (status.value === 4)
    return [
      { t: '订单已提交', s: `${t} · 量子引擎已生成订单`, cls: 'done' },
      { t: '订单已取消', s: `${t} · 用户主动取消`, cls: 'cur' },
    ]
  if (status.value === 1 || status.value === 2)
    return [
      { t: '订单已提交', s: `${t} · 量子引擎已生成订单`, cls: 'done' },
      { t: '支付成功', s: `${t} · 量子通道已确认收款`, cls: 'done' },
      { t: '商家打包中', s: `${t} · 量子仓拣货 · 预计 40 分钟`, cls: 'cur' },
      { t: '轨道发货', s: '等待发货', cls: '' },
      { t: '已签收', s: '等待签收', cls: '' },
    ]
  return [
    { t: '订单已提交', s: `${t} · 量子引擎已生成订单`, cls: 'done' },
    { t: '支付成功', s: `${t} · 量子通道已确认收款`, cls: 'done' },
    { t: '商家打包中', s: `${t} · 量子仓拣货完成`, cls: 'done' },
    { t: '轨道发货', s: `${t} · 星舰号 NX-7 已离港`, cls: 'done' },
    { t: '已签收', s: `${t} · 签收人：本人`, cls: 'cur' },
  ]
})

// 商品关联评论（key: skuId）
const itemComments = ref<Record<string, ItemComment[]>>({})

// ===== 售后流程（最近一笔售后申请） =====
const refundApply = ref<{
  id: number
  reason: string
  returnAmount: number
  status: number
  createTime: string
} | null>(null)

// 0 待处理 / 1 退货中 / 2 已完成 / 3 已拒绝
const AS_STATUS_TEXT: Record<number, string> = {
  0: '待处理',
  1: '退货中',
  2: '已完成',
  3: '已拒绝',
}
const asStatusText = computed(
  () => AS_STATUS_TEXT[Number(refundApply.value?.status ?? -1)] ?? '处理中',
)
const asStatusCls = computed(() => {
  const s = Number(refundApply.value?.status)
  if (s === 2) return 'ok'
  if (s === 3) return 'bad'
  return ''
})
// 是否有进行中的售后（0 待处理 / 1 退货中）——售后中不可再申请/删除；2 已完成/3 已拒绝不算
const hasActiveAfterSale = computed(
  () =>
    refundApply.value !== null &&
    [0, 1].includes(Number(refundApply.value.status)),
)
// 退款已完成（审核通过且退款成功）
const refundDone = computed(
  () => refundApply.value !== null && Number(refundApply.value.status) === 2,
)
const asTimeline = computed(() => {
  const t = String(refundApply.value?.createTime || '').replace('T', ' ')
  const s = Number(refundApply.value?.status)
  if (s === 0)
    return [
      { t: '申请已提交', s: `${t} · 售后申请已提交`, cls: 'done' },
      { t: '平台处理中', s: '等待商家/平台审核', cls: 'cur' },
    ]
  if (s === 1)
    return [
      { t: '申请已提交', s: `${t} · 售后申请已提交`, cls: 'done' },
      { t: '退货处理中', s: '商家已受理，退货流程进行中', cls: 'cur' },
    ]
  if (s === 2)
    return [
      { t: '申请已提交', s: `${t} · 售后申请已提交`, cls: 'done' },
      { t: '平台处理中', s: '审核通过', cls: 'done' },
      { t: '退款完成', s: '款项已原路退回', cls: 'cur' },
    ]
  if (s === 3)
    return [
      { t: '申请已提交', s: `${t} · 售后申请已提交`, cls: 'done' },
      { t: '申请被拒绝', s: '未通过审核，可联系客服', cls: 'cur' },
    ]
  return [{ t: '售后处理中', s: '请耐心等待', cls: 'cur' }]
})

async function loadItemComments() {
  const skuIds = items.value.map((it) => String(it.skuId || '')).filter(Boolean)
  for (const skuId of skuIds) {
    try {
      const res: any = await reqCommentList({ skuId, page: 1, limit: 100 })
      if (res.code === 200) {
        const list: any[] = res.data?.list || []
        // 只看当前用户对该 sku 的评价（排除回复 commentType=1）
        itemComments.value[skuId] = list
          .filter(
            (c) =>
              Number(c.commentType) !== 1 &&
              String(c.memberNickName || '') === userStore.username,
          )
          .map((c: any) => ({
            id: c.id,
            stars: Number(c.star ?? 5),
            content: String(c.content || ''),
            time: String(c.createTime || '').slice(0, 10),
            isAdditional: Number(c.commentType) === 2,
            resources: parseCommentResources(c.resources),
          }))
      }
    } catch {
      /* 忽略 */
    }
  }
}

// 评论图片：接口为 JSON [{type,url}]，兼容逗号分隔字符串
function parseCommentResources(raw?: string): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
        .map((it) => (it && it.url ? String(it.url) : ''))
        .filter(Boolean)
    }
  } catch {
    /* 非 JSON，走逗号拆分 */
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

// ===== 发表评论（内联表单：购买后直接可评） =====
const reviewForm = reactive({
  skuId: '',
  stars: 5,
  content: '',
  images: [] as string[],
  uploading: false,
  submitting: false,
})

const myItemCommentCount = (it: OrderItem) =>
  (itemComments.value[String(it.skuId || '')] || []).length

function toggleReviewForm(it: OrderItem) {
  const skuId = String(it.skuId || '')
  if (!skuId) return
  if (reviewForm.skuId === skuId) {
    closeReviewForm()
    return
  }
  if (myItemCommentCount(it) >= 2) {
    message.info('已评价 2 条，达上限')
    return
  }
  reviewForm.skuId = skuId
  reviewForm.stars = 5
  reviewForm.content = ''
  reviewForm.images = []
}

function closeReviewForm() {
  reviewForm.skuId = ''
  reviewForm.content = ''
  reviewForm.images = []
}

async function onReviewFormImgChange(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = ''
  if (files.length === 0) return
  const remain = 3 - reviewForm.images.length
  if (remain <= 0) {
    message.warning('最多上传 3 张图片')
    return
  }
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  for (const f of files.slice(0, remain)) {
    if (!allowed.includes(f.type)) {
      message.warning('图片格式错误，仅支持 jpg/png/gif/webp')
      continue
    }
    if (f.size > 2 * 1024 * 1024) {
      message.warning('图片大小不能超过 2MB')
      continue
    }
    reviewForm.uploading = true
    try {
      const res: any = await reqUploadImage(f)
      if (res.code === 200 && res.data) {
        reviewForm.images.push(res.data)
      } else {
        message.error(res.message || '图片上传失败')
      }
    } catch (err) {
      message.error((err as Error).message || '图片上传失败，请重试')
    } finally {
      reviewForm.uploading = false
    }
  }
}

async function submitItemComment(it: OrderItem) {
  const skuId = String(it.skuId || '')
  const content = reviewForm.content.trim()
  if (!content) {
    message.warning('请先写下评价内容')
    return
  }
  const cnt = myItemCommentCount(it)
  if (cnt >= 2) {
    message.warning('已评价 2 条，达上限')
    return
  }
  reviewForm.submitting = true
  try {
    const res: any = await reqCommentSave({
      skuId: Number(skuId),
      spuId: it.spuId ? Number(it.spuId) : null,
      spuName: it.name,
      memberNickName: userStore.username || '量子会员',
      memberIcon:
        userStore.avatar && /^https?:\/\//.test(userStore.avatar)
          ? userStore.avatar
          : '',
      star: reviewForm.stars,
      content,
      spuAttributes: it.param || '',
      resources: reviewForm.images.length
        ? JSON.stringify(
            reviewForm.images.map((u) => ({ type: 'image', url: u })),
          )
        : '',
      // 第 2 条自动追加评论（后端同样强制）
      commentType: cnt === 1 ? 2 : 0,
      showStatus: 1,
      likesCount: 0,
      replyCount: 0,
    })
    if (res.code === 200) {
      message.success(cnt === 1 ? '✓ 追加评论成功' : '✓ 评论发表成功')
      closeReviewForm()
      loadItemComments()
    } else {
      message.error(res.message || '评论发表失败')
    }
  } catch {
    message.error('评论发表失败，请稍后重试')
  } finally {
    reviewForm.submitting = false
  }
}

async function deleteItemComment(skuId: string, c: ItemComment) {
  try {
    await reqCommentDelete([c.id])
    itemComments.value[skuId] = (itemComments.value[skuId] || []).filter(
      (x) => x.id !== c.id,
    )
    message.success('✓ 评论已删除')
  } catch {
    message.error('删除失败，请稍后重试')
  }
}

// ===== 加载（纯 API，无 mock） =====
async function loadDetail() {
  try {
    const result: any = await reqOrderDetail(orderNo.value)
    if (result.code === 200) {
      const data = result.data || {}
      const o = data.order || {}
      status.value = Number(o.status ?? -1)
      orderTime.value = String(o.createTime || '').replace('T', ' ')
      const list: any[] = data.items || []
      items.value = list.map((it: any) => ({
        name: it.spuName || it.skuName || '量子商品',
        icon: '◈',
        ph: 'p2',
        image: it.skuPic || '',
        skuId: it.skuId,
        spuId: it.spuId,
        qty: Number(it.skuQuantity ?? 1),
        price: Number(it.skuPrice ?? 0),
        param: String(it.skuAttrsVals || '').replace(/;/g, ' / '),
        spuBrand: it.spuBrand || '',
        brandId: it.brandId != null ? Number(it.brandId) : undefined,
        brandLogo: it.brandLogo || '',
      }))
      // 拉取各商品当前用户的评论（展示 + 可删除）
      loadItemComments()
      // 售后申请信息（售后流程区块）
      const ra: any = data.refundApply || null
      refundApply.value = ra
        ? {
            id: ra.id,
            reason: String(ra.reason || ''),
            returnAmount: Number(ra.returnAmount ?? 0),
            status: Number(ra.status ?? 0),
            createTime: String(ra.createTime || ''),
          }
        : null
      const freight = Number(o.freightAmount ?? 0)
      const coupon = Number(o.couponAmount ?? 0)
      const discount = Number(o.discountAmount ?? 0)
      payAmount.value = Number(o.payAmount ?? o.totalAmount ?? 0)
      couponAmount.value = Math.max(coupon, discount)
      detail.value = {
        recipient: o.receiverName || '',
        phone: o.receiverPhone || '',
        addr: `${o.receiverProvince || ''}${o.receiverCity || ''}${o.receiverRegion || ''}${o.receiverDetailAddress || ''}`,
        coupon:
          couponAmount.value > 0
            ? `-¥${fmt(couponAmount.value)}`
            : '不使用优惠券',
        ship: freight,
        pay: payTypeText(o.payType),
      }
    }
  } catch {
    /* 接口失败保持空态 */
  }
}

// ===== 操作 =====
// 已付款订单（1 待发货 / 2 已发货 / 3 已完成）可评价
const canReview = computed(
  () => status.value === 1 || status.value === 2 || status.value === 3,
)

// 商品名点击跳详情
function goDetail(it: OrderItem) {
  if (it.skuId != null && it.skuId !== '') {
    router.push({ path: '/details', query: { skuId: String(it.skuId) } })
  }
}

async function confirmReceive() {
  try {
    const res: any = await reqReceiveOrder(orderNo.value)
    if (res.code === 200) {
      status.value = 3
      message.success('✓ 已确认收货 · 订单已完成')
    } else {
      message.error(res.message || '确认收货失败')
    }
  } catch (e) {
    message.error((e as Error).message || '确认收货失败，请稍后重试')
  }
}
function reorder() {
  message.info('⚡ 已再次购买 · 商品已加入量子购物舱')
}
// ===== 申请退款 =====
const REFUND_REASONS = [
  '多拍/拍错',
  '不想要了',
  '商品质量问题',
  '价格问题',
  '发货太慢',
  '其他',
]
const refundVisible = ref(false)
const refundReason = ref('')
const refundDesc = ref('')
const refunding = ref(false)

async function submitRefund() {
  if (!refundReason.value) {
    message.warning('请选择退款原因')
    return
  }
  refunding.value = true
  try {
    const res: any = await reqRefundApply({
      orderSn: orderNo.value,
      reason: refundReason.value,
      description: refundDesc.value.trim(),
    })
    if (res.code === 200) {
      const appliedReason = refundReason.value
      message.success('✓ 退款申请已提交，请等待处理')
      refundVisible.value = false
      refundReason.value = ''
      refundDesc.value = ''
      // 立即标记售后中（按钮态切换，刷新后以详情接口为准）
      refundApply.value = {
        id: 0,
        reason: appliedReason || '售后申请',
        returnAmount: totalAmount.value,
        status: 0,
        createTime: '',
      }
    } else {
      message.error(res.message || '申请失败')
    }
  } catch (e) {
    message.error((e as Error).message || '申请失败，请稍后重试')
  } finally {
    refunding.value = false
  }
}

// ===== 删除确认 =====
const delVisible = ref(false)

async function confirmDelete() {
  delVisible.value = false
  if (userStore.token) {
    try {
      await reqDeleteOrder(orderNo.value)
    } catch {
      /* 忽略 */
    }
  }
  message.success('✓ 订单已删除')
  await router.push('/orders')
}
onMounted(loadDetail)
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
.d-wrap {
  max-width: 1224px;
  margin: 0 auto;
}

/* 分区卡片 */
.d-sec {
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 18px;
  background: var(--panel);
  backdrop-filter: blur(10px);
  margin-top: 18px;
  overflow: hidden;
}
.d-sec-head {
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
.d-sec-head .bar {
  width: 4px;
  height: 16px;
  border-radius: 3px;
  background: linear-gradient(180deg, #00f0ff, #a855f7);
  box-shadow: 0 0 8px var(--cyan);
}
.d-sec-head h3 {
  font-family: var(--font-h);
  font-size: 15px;
  letter-spacing: 2px;
  color: #fff;
}
.d-sec-head h3 small {
  font-family: var(--font-m);
  font-size: 9px;
  color: var(--dim);
  letter-spacing: 3px;
  font-weight: 400;
  margin-left: 8px;
}
.d-sec-body {
  padding: 20px 24px;
}

/* 订单状态条 */
.d-status {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 24px;
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 18px;
  background: linear-gradient(
    90deg,
    rgba(0, 240, 255, 0.08),
    rgba(168, 85, 247, 0.05)
  );
  backdrop-filter: blur(10px);
  margin-top: 18px;
}
.d-status .s-badge {
  font-family: var(--font-m);
  font-size: 12px;
  letter-spacing: 2px;
  padding: 6px 16px;
  border-radius: 16px;
  flex-shrink: 0;
}
.d-status .s-text {
  font-size: 15px;
  color: var(--dim);
  letter-spacing: 1px;
}
.d-status .s-text b {
  color: var(--txt);
}
.d-status .s-no {
  margin-left: auto;
  font-family: var(--font-m);
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 2px;
}
.ost-unpaid {
  color: var(--amber);
  padding: 5px 15px;
  border-radius: 5px;
  border: 1px solid rgba(255, 197, 61, 0.45);
  background: rgba(255, 197, 61, 0.08);
  text-shadow: 0 0 8px rgba(255, 197, 61, 0.5);
}
.ost-paid {
  color: var(--cyan);
  padding: 5px 15px;
  border-radius: 5px;
  border: 1px solid rgba(0, 240, 255, 0.45);
  background: rgba(0, 240, 255, 0.08);
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}
.ost-done {
  color: var(--green);
  padding: 5px 15px;
  border-radius: 5px;
  border: 1px solid rgba(57, 255, 136, 0.45);
  background: rgba(57, 255, 136, 0.08);
  text-shadow: 0 0 8px rgba(57, 255, 136, 0.5);
}
.ost-cancel {
  color: var(--dim);
  padding: 5px 15px;
  border-radius: 5px;
  border: 1px solid rgba(143, 163, 200, 0.3);
  background: rgba(143, 163, 200, 0.06);
}

/* 售后流程信息条 */
.as-info {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid rgba(0, 240, 255, 0.12);
  border-radius: 10px;
  background: rgba(0, 240, 255, 0.03);
  font-size: 13px;
  color: var(--dim);
}
.as-reason {
  color: var(--txt);
}
.as-amount {
  color: var(--amber);
  font-weight: 700;
}
.as-status {
  margin-left: auto;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  letter-spacing: 1px;
  padding: 3px 10px;
  border-radius: 8px;
  color: var(--amber);
  background: rgba(255, 197, 61, 0.08);
  border: 1px solid rgba(255, 197, 61, 0.35);
}
.as-status.ok {
  color: var(--green);
  background: rgba(57, 255, 136, 0.08);
  border-color: rgba(57, 255, 136, 0.35);
}
.as-status.bad {
  color: var(--magenta);
  background: rgba(255, 46, 196, 0.08);
  border-color: rgba(255, 46, 196, 0.35);
}
.as-tl {
  padding: 4px 6px;
}

/* 物流时间线 */
.tl {
  position: relative;
  padding-left: 28px;
}
.tl::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: rgba(0, 240, 255, 0.14);
}
.tl-item {
  position: relative;
  padding: 0 0 22px;
}
.tl-item:last-child {
  padding-bottom: 2px;
}
.tl-item::before {
  content: '';
  position: absolute;
  left: -25px;
  top: 3px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid rgba(0, 240, 255, 0.35);
  background: rgba(6, 10, 26, 0.9);
}
.tl-item.done::before {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}
.tl-item.cur::before {
  background: var(--amber);
  border-color: var(--amber);
  box-shadow: 0 0 14px rgba(255, 197, 61, 0.8);
  animation: tlPulse 1.6s infinite;
}
@keyframes tlPulse {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(255, 197, 61, 0.5);
  }
  50% {
    box-shadow: 0 0 18px rgba(255, 197, 61, 0.95);
  }
}
.tl-item .t-t {
  font-size: 14px;
  font-weight: 600;
  color: var(--txt);
  letter-spacing: 1px;
}
.tl-item.done .t-t {
  color: var(--dim);
}
.tl-item.cur .t-t {
  color: var(--amber);
}
.tl-item .t-s {
  font-family: var(--font-m);
  font-size: var(--font-size-sm);
  color: var(--dim);
  margin-top: 4px;
}

/* 收货信息 */
.dl {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.dl-item {
  border: 1px solid rgba(0, 240, 255, 0.12);
  border-radius: 12px;
  padding: 14px 16px;
  background: rgba(0, 240, 255, 0.03);
}
.dl-item .lk {
  font-family: var(--font-m);
  font-size: var(--font-size-sm);
  color: var(--dim);
  letter-spacing: 2px;
}
.dl-item .lv {
  font-size: 14px;
  color: var(--txt);
  margin-top: 6px;
  letter-spacing: 1px;
}
.dl-item .lv.mono {
  font-family: var(--font-m);
  font-size: 13px;
  letter-spacing: 2px;
}

/* 商品清单 */
.shop-card {
  border: 1px solid rgba(0, 240, 255, 0.12);
  border-radius: 14px;
  overflow: hidden;
  background: rgba(6, 10, 26, 0.4);
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
  overflow: hidden;
}
.shop-ico .shop-ico-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.shop-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--cyan);
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.35);
}
.shop-name.shop-link {
  text-decoration: none;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.4);
  transition: 0.2s;
}
.shop-name.shop-link:hover {
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
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
  grid-template-columns: 100px 1fr 100px 90px 110px 120px;
  align-items: center;
  gap: 14px;
  padding: 13px 20px;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.07);
}
.oitem:last-child {
  border-bottom: none;
}
.oicon {
  width: 100px;
  height: 100px;
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
  font-size: var(--font-size-base);
  font-weight: 600;
  letter-spacing: 1px;
  line-height: 1.4;
  cursor: pointer;
  width: fit-content;
  transition: 0.2s;
}
.oname:hover {
  color: var(--cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}
.oparams {
  font-family: var(--font-m);
  font-size: var(--font-size-sm);
  color: var(--amber);
  margin-top: 4px;
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
.oitem-review {
  height: 32px;
  padding: 0 22px;
  min-width: 96px;
  border-radius: 9px;
  border: 1px solid rgba(0, 240, 255, 0.4);
  background: rgba(0, 240, 255, 0.08);
  color: var(--cyan);
  font-family: var(--font-h);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: 0.22s;
}
.oitem-review:hover {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.45);
  border-color: transparent;
}
.oitem-review-full {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 1px;
  text-align: center;
}
/* 内联发表评论表单 */
.oitem-review-form {
  grid-column: 1 / -1;
  border: 1px solid rgba(0, 240, 255, 0.18);
  border-radius: 10px;
  padding: 12px 14px;
  background: rgba(0, 240, 255, 0.03);
}
.oitem-review-form .orf-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.oitem-review-form .orf-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--cyan);
  letter-spacing: 1px;
}
.oitem-review-form .orf-stars {
  display: flex;
  gap: 3px;
}
.oitem-review-form .orf-star {
  font-size: 18px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.18);
  cursor: pointer;
  transition: 0.15s;
}
.oitem-review-form .orf-star:hover,
.oitem-review-form .orf-star.on {
  color: var(--amber);
  text-shadow: 0 0 8px rgba(255, 197, 61, 0.6);
}
.oitem-review-form .orf-tip {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--magenta);
  letter-spacing: 1px;
}
.oitem-review-form textarea {
  width: 100%;
  margin-top: 10px;
  min-height: 60px;
  resize: vertical;
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 8px;
  background: rgba(4, 7, 18, 0.6);
  color: var(--txt);
  padding: 8px 10px;
  font-size: 13px;
  line-height: 1.6;
  outline: none;
  transition: 0.2s;
  font-family: inherit;
}
.oitem-review-form textarea:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
}
.oitem-review-form .orf-imgs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
  align-items: center;
}
.oitem-review-form .orf-img {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 240, 255, 0.2);
  background: rgba(6, 10, 26, 0.9);
}
.oitem-review-form .orf-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.oitem-review-form .orf-img-del {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: rgba(2, 16, 26, 0.8);
  color: #fff;
  font-size: var(--font-size-xs);
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.oitem-review-form .orf-img-add {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  border: 1px dashed rgba(0, 240, 255, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  color: var(--cyan);
  font-size: 15px;
  transition: 0.2s;
}
.oitem-review-form .orf-img-add:hover {
  border-color: var(--cyan);
  background: rgba(0, 240, 255, 0.06);
}
.oitem-review-form .orf-img-add small {
  font-family: var(--font-m);
  font-size: 9px;
  letter-spacing: 1px;
  color: var(--dim);
}
.oitem-review-form .orf-up {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  animation: orfBlink 1s ease-in-out infinite;
}
@keyframes orfBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

/* ===== 通用弹窗（申请退款） ===== */
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
  border: 1px solid rgba(0, 240, 255, 0.25);
  border-radius: 16px;
  background: var(--panel);
  box-shadow:
    0 18px 60px rgba(0, 0, 0, 0.6),
    0 0 30px rgba(0, 240, 255, 0.15);
  padding: 20px 22px;
}
.modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.modal-head h3 {
  font-size: 16px;
  font-weight: 800;
  color: var(--txt);
  letter-spacing: 1px;
}
.modal-head h3 small {
  display: block;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  margin-top: 3px;
}
.modal-close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(0, 240, 255, 0.3);
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  font-size: 12px;
  transition: 0.2s;
}
.modal-close:hover {
  color: var(--cyan);
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
.modal-foot .mbtn {
  height: 40px;
  padding: 0 22px;
  border-radius: 10px;
  cursor: pointer;
  font-family: var(--font-h);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  transition: 0.25s;
  border: none;
}
.modal-foot .mbtn.ghost {
  border: 1px solid rgba(0, 240, 255, 0.4);
  background: transparent;
  color: var(--cyan);
}
.modal-foot .mbtn.ghost:hover {
  background: rgba(0, 240, 255, 0.1);
}
.modal-foot .mbtn.primary {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.5);
}
.modal-foot .mbtn.primary:hover {
  filter: brightness(1.2);
}
.modal-foot .mbtn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: none;
  box-shadow: none;
}

/* 申请退款弹窗内容 */
.refund-body .rf-amount {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-top: 14px;
  padding: 12px 14px;
  border: 1px solid rgba(0, 240, 255, 0.14);
  border-radius: 10px;
  background: rgba(0, 240, 255, 0.03);
}
.refund-body .rf-lab {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
}
.refund-body .rf-val {
  margin-left: auto;
  font-family: var(--font-h);
  font-size: 22px;
  font-weight: 900;
  color: var(--amber);
  text-shadow: 0 0 14px rgba(255, 197, 61, 0.4);
}
.refund-body .rf-val small {
  font-size: 12px;
}
.refund-body .rf-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.refund-body .rf-reason {
  padding: 8px 16px;
  border-radius: 9px;
  border: 1px solid rgba(0, 240, 255, 0.22);
  background: rgba(0, 240, 255, 0.04);
  color: var(--dim);
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  font-weight: 600;
}
.refund-body .rf-reason:hover {
  color: var(--cyan);
}
.refund-body .rf-reason.active {
  color: #02101a;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: transparent;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
}
.refund-body textarea {
  width: 100%;
  margin-top: 14px;
  resize: vertical;
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 10px;
  background: rgba(4, 7, 18, 0.6);
  color: var(--txt);
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.6;
  outline: none;
  transition: 0.2s;
  font-family: inherit;
}
.refund-body textarea:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.2);
}
.oitem-review-form .orf-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
.oitem-review-form .orf-count {
  margin-right: auto;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
}
.oitem-review-form .orf-btn {
  height: 30px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: var(--font-h);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  transition: 0.2s;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
}
.oitem-review-form .orf-btn.ghost {
  background: transparent;
  border: 1px solid rgba(0, 240, 255, 0.35);
  color: var(--cyan);
}
.oitem-review-form .orf-btn.ghost:hover {
  background: rgba(0, 240, 255, 0.1);
}
.oitem-review-form .orf-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: none;
}
/* 我的评论（展示 + 删除） */
.oitem-comments {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid rgba(0, 240, 255, 0.14);
  border-radius: 10px;
  background: rgba(0, 240, 255, 0.03);
}
.oc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  flex-wrap: wrap;
}
.oc-stars {
  color: var(--amber);
  letter-spacing: 2px;
  font-size: 12px;
  flex-shrink: 0;
}
.oc-add {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  letter-spacing: 1px;
  padding: 2px 8px;
  border-radius: 7px;
  flex-shrink: 0;
  color: var(--magenta);
  background: rgba(255, 46, 196, 0.1);
  border: 1px solid rgba(255, 46, 196, 0.35);
}
.oc-content {
  flex: 1;
  min-width: 0;
  color: var(--dim);
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.oc-time {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 1px;
  flex-shrink: 0;
}
.oc-del {
  height: 26px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid rgba(255, 46, 196, 0.35);
  background: rgba(255, 46, 196, 0.06);
  color: var(--magenta);
  font-size: var(--font-size-xs);
  cursor: pointer;
  flex-shrink: 0;
  transition: 0.2s;
}
.oc-del:hover {
  background: rgba(255, 46, 196, 0.16);
  box-shadow: 0 0 10px rgba(255, 46, 196, 0.35);
}
.oc-imgs {
  display: flex;
  gap: 8px;
  width: 100%;
  padding-top: 2px;
}
.oc-imgs img {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(0, 240, 255, 0.18);
  background: rgba(6, 10, 26, 0.9);
}

/* 订单信息 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 40px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--dim);
  letter-spacing: 1px;
  padding: 9px 0;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.07);
}
.info-item b {
  color: var(--txt);
  font-weight: 600;
  text-align: right;
}
.info-item b.cyan {
  color: var(--cyan);
}
.info-item b.green {
  color: var(--green);
}
.info-item b.mono {
  font-family: var(--font-m);
  font-size: 13px;
  letter-spacing: 2px;
}
.amount-box {
  max-width: 520px;
  margin: 16px auto 0;
  border: 1px solid rgba(0, 240, 255, 0.14);
  border-radius: 14px;
  padding: 18px 24px;
  background: rgba(0, 240, 255, 0.03);
}
.amount-total {
  border-top: 1px solid rgba(0, 240, 255, 0.14);
  margin-top: 10px;
  padding-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.amount-total .lab {
  font-size: 14px;
  color: var(--dim);
  font-weight: 600;
  letter-spacing: 1px;
}
.amount-total .val {
  font-family: var(--font-h);
  font-size: 26px;
  font-weight: 900;
  color: var(--cyan);
  text-shadow: 0 0 16px rgba(0, 240, 255, 0.6);
}
.amount-total .val small {
  font-size: 13px;
  margin-right: 2px;
}

/* 底部操作栏 */
.d-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 999;
}
.d-bar-in {
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
.d-bar .back {
  color: var(--dim);
  font-size: 13px;
  letter-spacing: 1px;
  cursor: pointer;
  text-decoration: none;
  transition: 0.2s;
  font-family: var(--font-m);
  white-space: nowrap;
}
.d-bar .back:hover {
  color: var(--cyan);
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
}
.d-bar .db-total {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex: 1;
  justify-content: center;
  white-space: nowrap;
}
.d-bar .db-total .lab {
  font-size: 13px;
  color: var(--dim);
  letter-spacing: 1px;
}
.d-bar .db-total .val {
  font-family: var(--font-h);
  font-size: 26px;
  font-weight: 900;
  color: var(--cyan);
  text-shadow: 0 0 16px rgba(0, 240, 255, 0.6);
}
.d-bar .db-total .val small {
  font-size: 13px;
  margin-right: 1px;
}
.dbar-btn {
  flex-shrink: 0;
  padding: 0 26px;
  height: 50px;
  border-radius: 13px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  transition: 0.25s;
  border: 1px solid rgba(0, 240, 255, 0.35);
  background: rgba(0, 240, 255, 0.06);
  color: var(--cyan);
  font-family: var(--font-h);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}
.dbar-btn:hover {
  background: rgba(0, 240, 255, 0.14);
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.3);
}
.dbar-btn.warn {
  border-color: rgba(255, 197, 61, 0.5);
  background: rgba(255, 197, 61, 0.08);
  color: var(--amber);
}
.dbar-btn.warn:hover {
  background: rgba(255, 197, 61, 0.16);
  box-shadow: 0 0 14px rgba(255, 197, 61, 0.35);
}
.dbar-btn.disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.dbar-btn.disabled:hover {
  background: rgba(255, 197, 61, 0.08);
  box-shadow: none;
}
.dbar-btn.primary {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  border-color: transparent;
  font-weight: 700;
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.45);
}
.dbar-btn.primary:hover {
  filter: brightness(1.15);
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.8);
}
.dbar-btn.danger {
  border-color: rgba(255, 46, 196, 0.35);
  color: var(--magenta);
}
.dbar-btn.danger:hover {
  background: rgba(255, 46, 196, 0.12);
  box-shadow: 0 0 12px rgba(255, 46, 196, 0.3);
}
.d-bar .db-acts {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

/* ===== 删除确认内容样式 ===== */
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

@media (max-width: 1080px) {
  .dl {
    grid-template-columns: 1fr;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 760px) {
  .d-bar-in {
    flex-wrap: wrap;
    padding: 14px 18px;
    gap: 12px;
  }
  .d-bar .db-total {
    order: 1;
    flex-basis: 100%;
  }
  .d-bar .db-acts {
    order: 2;
    width: 100%;
  }
  .dbar-btn {
    flex: 1;
    padding: 0 10px;
  }
}
</style>
