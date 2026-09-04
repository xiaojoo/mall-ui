<template>
  <div class="nb-checkout">
    <!-- 页面搜索 header -->
    <PageSearchHeader placeholder="搜索商品清单…" />
    <div class="wrap">
      <div class="crumbs">
        <router-link to="/">Nebula Home</router-link>
        <span class="sep">/</span>
        <router-link to="/cart">购物舱</router-link>
        <span class="sep">/</span>
        <span class="cur">确认订单</span>
      </div>
      <div class="page-head sec-head">
        <div class="sec-title">
          <h2>
            ◈ 确认订单
            <small>ORDER CONFIRM · 轨道坐标核验</small>
          </h2>
        </div>
      </div>

      <div class="ord-wrap">
        <!-- ===== 收货地址 ===== -->
        <section class="ord-sec">
          <div class="ord-sec-head">
            <div class="bar"></div>
            <h3>
              收货地址
              <small>DELIVERY ADDRESS</small>
            </h3>
            <button class="addr-add" @click="openAddrModal">＋ 新增地址</button>
          </div>
          <div class="ord-sec-body">
            <div class="addr-grid">
              <div
                v-for="a in addresses"
                :key="a.id"
                class="addr-card"
                :class="{
                  active: selectedAddrId === a.id,
                  def: Number(a.defaultStatus) === 1,
                }"
                @click="selectedAddrId = a.id"
              >
                <div v-if="Number(a.defaultStatus) === 1" class="def-corner">
                  <span>默</span>
                </div>
                <div class="addr-name">
                  {{ a.name }}
                </div>
                <div class="addr-phone">
                  {{ maskPhone(a.phone || a.mobile) }}
                </div>
                <div class="addr-text">{{ addrText(a) }}</div>
                <span class="addr-edit" @click.stop="openAddrModal(a)">
                  ✎ 编辑
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== 商品清单 ===== -->
        <section class="ord-sec">
          <div class="ord-sec-head">
            <div class="bar"></div>
            <h3>
              商品清单
              <small>ORDER ITEMS · 按商家分组</small>
            </h3>
          </div>
          <div class="ord-sec-body">
            <div v-for="shop in shopGroups" :key="shop.name" class="shop-card">
              <div class="shop-head">
                <span class="shop-ico">
                  <img
                    v-if="shop.brandLogo"
                    :src="shop.brandLogo"
                    alt=""
                    class="shop-ico-img"
                  />
                  <span v-else>◈</span>
                </span>
                <router-link
                  v-if="shop.brandId"
                  class="shop-name shop-link"
                  :to="{ path: '/shop', query: { brandId: shop.brandId } }"
                  title="进入店铺"
                >
                  {{ shop.name }}
                </router-link>
                <span v-else class="shop-name">{{ shop.name }}</span>
                <span class="shop-count">
                  共 {{ shop.items.reduce((s, i) => s + i.count, 0) }} 件
                </span>
              </div>
              <div v-for="(it, i) in shop.items" :key="i" class="oitem">
                <div class="oicon">
                  <img
                    v-if="it.image"
                    :src="it.image"
                    :alt="it.title || it.name"
                    class="oicon-img"
                  />
                  <div v-else class="ph">{{ it.icon || '◈' }}</div>
                </div>
                <div>
                  <div class="oname">{{ it.title || it.name }}</div>
                  <div
                    class="oparams clickable"
                    title="点击更换商品参数"
                    @click="openSpecModal(it)"
                  >
                    {{ specText(it) }}
                    <span class="oparams-edit">✎ 更换</span>
                  </div>
                </div>
                <div class="oprice">
                  <small>¥</small>
                  {{ fmt(it.price) }}
                </div>
                <div class="oqty">×{{ it.count }}</div>
                <div class="osub">¥{{ fmt(it.price * it.count) }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== 配送 · 支付 · 优惠 ===== -->
        <section class="ord-sec">
          <div class="ord-sec-head">
            <div class="bar"></div>
            <h3>
              配送 · 支付 · 优惠
              <small>DELIVERY · PAYMENT · COUPON</small>
            </h3>
          </div>
          <div class="ord-sec-body">
            <div class="opt-block">
              <div class="opt-label">优惠券 COUPON</div>
              <div class="opt-pills">
                <div
                  v-for="c in couponOptions"
                  :key="c.id"
                  class="opt-pill"
                  :class="{ active: coupon === c.id }"
                  @click="coupon = c.id"
                >
                  <span class="oi">▤</span>
                  <div>
                    <div class="ot">{{ c.name }}</div>
                    <div class="od">{{ c.desc }}</div>
                  </div>
                  <span v-if="c.label" class="of">{{ c.label }}</span>
                </div>
                <div v-if="couponOptions.length === 1" class="opt-none">
                  暂无可用优惠券
                </div>
              </div>
            </div>

            <button
              class="opt-more"
              :class="{ open: moreOpen }"
              @click="moreOpen = !moreOpen"
            >
              <span>
                {{
                  moreOpen ? '收起选项 LESS OPTIONS' : '更多选项 MORE OPTIONS'
                }}
              </span>
              <i class="caret">▾</i>
            </button>

            <div class="opt-extra" :class="{ open: moreOpen }">
              <div class="opt-block">
                <div class="opt-label">配送方式 DELIVERY</div>
                <div class="opt-pills">
                  <div
                    v-for="d in DELIVERY"
                    :key="d.id"
                    class="opt-pill"
                    :class="{ active: delivery === d.id }"
                    @click="delivery = d.id"
                  >
                    <span class="oi">{{ d.icon }}</span>
                    <div>
                      <div class="ot">{{ d.name }}</div>
                      <div class="od">{{ d.desc }}</div>
                    </div>
                    <span v-if="d.fee > 0" class="of">+¥{{ d.fee }}</span>
                  </div>
                </div>
              </div>
              <div class="opt-block">
                <div class="opt-label">支付方式 PAYMENT</div>
                <div class="opt-pills">
                  <div
                    v-for="p in PAYS"
                    :key="p.id"
                    class="opt-pill"
                    :class="{ active: pay === p.id }"
                    @click="pay = p.id"
                  >
                    <span class="oi">{{ p.icon }}</span>
                    <div>
                      <div class="ot">{{ p.name }}</div>
                      <div class="od">{{ p.desc }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="opt-block">
                <div class="opt-label">发票 INVOICE</div>
                <div class="opt-pills">
                  <div
                    class="opt-pill"
                    :class="{ active: invoice === 0 }"
                    @click="invoice = 0"
                  >
                    <span class="oi">⊘</span>
                    <div>
                      <div class="ot">不开发票</div>
                      <div class="od">无需电子凭证</div>
                    </div>
                  </div>
                  <div
                    class="opt-pill"
                    :class="{ active: invoice === 1 }"
                    @click="invoice = 1"
                  >
                    <span class="oi">▤</span>
                    <div>
                      <div class="ot">电子发票</div>
                      <div class="od">发送至邮箱/星讯</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== 金额结算 ===== -->
        <section class="ord-sec">
          <div class="ord-sec-head">
            <div class="bar"></div>
            <h3>
              金额结算
              <small>AMOUNT SUMMARY</small>
            </h3>
          </div>
          <div class="ord-sec-body">
            <div class="sum-rows">
              <div class="sum-row">
                商品金额
                <b>¥{{ fmt(goodsAmount) }}</b>
              </div>
              <div class="sum-row">
                商品优惠
                <b class="green">-¥{{ fmt(0) }}</b>
              </div>
              <div class="sum-row">
                运费
                <b>¥{{ fmt(shipFee) }}</b>
              </div>
              <div class="sum-row">
                优惠券
                <b class="green">-¥{{ fmt(couponDisc) }}</b>
              </div>
              <div class="sum-total">
                <span class="lab">应付总额</span>
                <span class="val">
                  <small>¥</small>
                  {{ fmt(payTotal) }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- ===== 底部提交栏 ===== -->
    <div class="ord-bar">
      <div class="ord-bar-in">
        <router-link class="back" to="/cart">⟵ 返回购物车</router-link>
        <div class="ob-total">
          <span class="lab">应付总额</span>
          <span class="val">
            <small>¥</small>
            {{ fmt(payTotal) }}
          </span>
        </div>
        <button
          class="submit"
          :disabled="submitting || payWaitVisible"
          @click="submitOrder"
        >
          {{
            submitting
              ? '量子引擎支付中…'
              : payWaitVisible
                ? '等待支付…'
                : '⟶ 立即支付'
          }}
        </button>
      </div>
    </div>

    <!-- ===== 等待支付模态框（提交后 60s 自动跳我的订单） ===== -->
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

    <!-- ===== 地址添加模态框 ===== -->
    <div
      v-if="addrModalVisible"
      class="modal-mask show"
      @click.self="addrModalVisible = false"
    >
      <div class="modal">
        <div class="modal-head">
          <h3>
            {{ editAddrId ? '✎ 编辑收货地址' : '＋ 新增收货地址' }}
            <small>
              {{
                editAddrId
                  ? 'EDIT ADDRESS · 轨道坐标修正'
                  : 'NEW ADDRESS · 轨道坐标录入'
              }}
            </small>
          </h3>
          <button class="modal-close" @click="addrModalVisible = false">
            ✕
          </button>
        </div>
        <div class="modal-body">
          <div class="af-row">
            <div class="af-field">
              <div class="af-label">收货人 NAME</div>
              <input
                name="addrForm.name"
                v-model.trim="addrForm.name"
                type="text"
                placeholder="星际公民名"
                maxlength="12"
              />
            </div>
            <div class="af-field">
              <div class="af-label">联系电话 PHONE</div>
              <input
                name="addrForm.phone"
                v-model.trim="addrForm.phone"
                type="text"
                placeholder="星网号码"
                maxlength="11"
              />
            </div>
          </div>
          <div class="af-row">
            <div class="af-field">
              <div class="af-label">省份 PROVINCE</div>
              <input
                name="addrForm.province"
                v-model.trim="addrForm.province"
                type="text"
                placeholder="如 广东省"
                maxlength="12"
              />
            </div>
            <div class="af-field">
              <div class="af-label">城市 CITY</div>
              <input
                name="addrForm.city"
                v-model.trim="addrForm.city"
                type="text"
                placeholder="如 深圳市"
                maxlength="12"
              />
            </div>
            <div class="af-field">
              <div class="af-label">区县 REGION</div>
              <input
                name="addrForm.region"
                v-model.trim="addrForm.region"
                type="text"
                placeholder="如 龙华区"
                maxlength="12"
              />
            </div>
          </div>
          <div class="af-field">
            <div class="af-label">详细地址 DETAIL</div>
            <input
              name="addrForm.addr"
              v-model.trim="addrForm.addr"
              type="text"
              placeholder="街道 · 小区 · 门牌号"
              maxlength="40"
            />
          </div>
          <label class="af-def">
            <input
              name="addrForm.isDefault"
              v-model="addrForm.isDefault"
              type="checkbox"
            />
            <span class="box"></span>
            设为默认收货地址
          </label>
        </div>
        <div class="modal-foot">
          <button class="mbtn ghost" @click="addrModalVisible = false">
            取消
          </button>
          <button class="mbtn primary" @click="saveAddress">✓ 保存地址</button>
        </div>
      </div>
    </div>

    <!-- ===== 更换商品参数模态框 ===== -->
    <div
      v-if="specModalVisible"
      class="modal-mask show"
      @click.self="closeSpecModal"
    >
      <div class="modal spec-modal">
        <div class="modal-head">
          <h3>
            ⟳ 更换商品参数
            <small>SWITCH SPEC · 重新选择后按新 SKU 结算</small>
          </h3>
          <button class="modal-close" @click="closeSpecModal">✕</button>
        </div>
        <div class="modal-body">
          <!-- 商品信息：图片 / 名称 / 当前参数 -->
          <div v-if="specTarget" class="spec-info">
            <div class="si-img">
              <img
                v-if="specTarget.image"
                :src="specTarget.image"
                :alt="specTarget.title || specTarget.name"
              />
              <span v-else>{{ specTarget.icon || '◈' }}</span>
            </div>
            <div class="si-detail">
              <div class="si-name">
                {{ specTarget.title || specTarget.name }}
              </div>
              <div class="si-cur">
                <span class="si-cur-lab">当前参数</span>
                {{ specText(specTarget) }}
              </div>
            </div>
          </div>
          <div v-if="specLoading" class="spec-loading">◉ 加载参数中…</div>
          <template v-else>
            <div v-if="specRows.length === 0" class="spec-empty">
              该商品无可更换参数
            </div>
            <div v-for="row in specRows" :key="row.attrId" class="spec-row">
              <div class="spec-al">{{ row.attrName }}</div>
              <div class="spec-opts">
                <div
                  v-for="o in row.attrValues"
                  :key="o.value"
                  class="spec-opt"
                  :class="{
                    active: specSelected[row.attrId] === o.value,
                    disabled: !specSelectable(row, o.value),
                  }"
                  @click="pickSpec(row, o.value)"
                >
                  {{ o.value }}
                </div>
              </div>
            </div>
            <div class="spec-hint" :class="{ invalid: !specResolvedSkuId }">
              {{
                specResolvedSkuId
                  ? '✓ 组合有效'
                  : '⚠ 当前组合无对应 SKU，请调整'
              }}
            </div>
          </template>
        </div>
        <div class="modal-foot">
          <button class="mbtn ghost" @click="closeSpecModal">取消</button>
          <button
            class="mbtn primary"
            :disabled="specSaving || !specResolvedSkuId"
            @click="confirmSpecChange"
          >
            {{ specSaving ? '◉ 处理中…' : '✓ 确认更换' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import PageSearchHeader from '@/components/nebula/PageSearchHeader/index.vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import useCartStore from '@/store/modules/cart'
import {
  reqOrderConfirm,
  reqSubmitOrder,
  reqPayForm,
  reqPayQuery,
} from '@/api/order'
import { reqMemberUsableCoupon } from '@/api/coupon'
import { reqProfileAddressAdd, reqProfileAddressUpdate } from '@/api/user'
import { reqProductDetail } from '@/api/product'
import { reqAddToCart, reqCheckCart, reqDeleteCart } from '@/api/cart'
import message from '@/utils/message'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

// ===== mock 数据（接口不可达时兜底，与 quantum 一致） =====
const DELIVERY = [
  {
    id: 'orbit',
    name: '量子轨道速递',
    desc: '轨道舱直达 · 2-48h',
    fee: 0,
    icon: '⚡',
  },
  {
    id: 'rapid',
    name: '星际极速达',
    desc: '曲率引擎护航 · 4h',
    fee: 20,
    icon: '🚀',
  },
  {
    id: 'mars',
    name: '火星分仓直发',
    desc: '奥林帕斯基地 · 3-5天',
    fee: 10,
    icon: '🛰',
  },
]
const PAYS = [
  { id: 'brain', name: '脑波支付', desc: '0.1S 免触控', icon: '🧠' },
  { id: 'card', name: '量子银行卡', desc: 'AES-4096 加密', icon: '◈' },
  { id: 'star', name: '星元余额', desc: '余额 ¥88,888', icon: '✦' },
]
// ===== 优惠券（真实接口：当前会员可用券，非 mock） =====
interface CouponOption {
  id: string
  name: string
  disc: number
  label: string
  desc: string
}
const usableCoupons = ref<CouponOption[]>([])
const couponOptions = computed<CouponOption[]>(() => [
  { id: 'none', name: '不使用优惠券', disc: 0, label: '', desc: '保持原价' },
  ...usableCoupons.value,
])

// 结算页可用券：按订单商品 skuId + 商品总额过滤（已领取未使用/门槛满足/适用范围匹配）
async function loadUsableCoupons() {
  const skuIds = items.value
    .map((it) => Number(it.skuId))
    .filter((id) => id > 0)
  if (skuIds.length === 0) {
    usableCoupons.value = []
    return
  }
  try {
    const res: any = await reqMemberUsableCoupon({
      amount: goodsAmount.value,
      skuIds: skuIds.join(','),
    })
    if (res.code === 200) {
      const list: any[] = res.data || []
      usableCoupons.value = list.map((c) => ({
        id: String(c.id),
        name: c.couponName || '优惠券',
        disc: Number(c.amount ?? 0),
        label: `-¥${Math.round(Number(c.amount ?? 0))}`,
        desc: `满 ${Math.round(Number(c.minPoint ?? 0))} 可用`,
      }))
      // 已选券不在可用列表时回到不使用
      if (
        coupon.value !== 'none' &&
        !usableCoupons.value.some((c) => c.id === coupon.value)
      ) {
        coupon.value = 'none'
      }
    }
  } catch {
    usableCoupons.value = []
  }
}

interface OrderItem {
  skuId: number | string
  title: string
  name?: string
  image?: string
  skuAttrValues?: string[]
  price: number
  count: number
  shop?: string
  /** 品牌 id（店铺跳转） */
  brandId?: number
  /** 品牌 logo（店铺图标） */
  brandLogo?: string
  icon?: string
}

const addresses = ref<any[]>([])
const items = ref<OrderItem[]>([])
const selectedAddrId = ref<number | null>(null)
const orderToken = ref('')
const freightAmount = ref(0)
const payPrice = ref(0)
const totalPrice = ref(0)
const loading = ref(true)

// 选项状态
const delivery = ref('orbit')
const pay = ref('brain')
const coupon = ref('none')
const invoice = ref(0)
const moreOpen = ref(false)
const submitting = ref(false)

// ===== mock 兜底 =====
const MOCK_ITEMS: OrderItem[] = [
  {
    skuId: 1,
    title: '全息投影腕带 HX-7 星际版',
    shop: 'NEBULA 星环官方旗舰店',
    price: 899,
    count: 2,
    icon: '◬',
    skuAttrValues: ['颜色：星云蓝', '版本：标准版'],
  },
  {
    skuId: 10,
    title: '神经链接头盔 N-3 冥想舱',
    shop: 'NEBULA 星环官方旗舰店',
    price: 1299,
    count: 2,
    icon: '▣',
    skuAttrValues: ['颜色：霓虹紫', '版本：旗舰版'],
  },
  {
    skuId: 22,
    title: '城市巡逻无人机 X-2 自动巡航',
    shop: 'NEBULA 星环官方旗舰店',
    price: 2899,
    count: 1,
    icon: '◮',
    skuAttrValues: ['颜色：幻影绿', '版本：标准版'],
  },
  {
    skuId: 4,
    title: '量子计算芯片 Q-9000 双核',
    shop: 'QUANTEX 量子科技旗舰店',
    price: 6499,
    count: 1,
    icon: '◉',
    skuAttrValues: ['颜色：星云蓝', '版本：星际版'],
  },
  {
    skuId: 11,
    title: '脑波传感耳机 Wave-2',
    shop: 'VOLTAIC 沃尔泰克能源店',
    price: 699,
    count: 3,
    icon: '◌',
    skuAttrValues: ['颜色：霓虹紫', '版本：标准版'],
  },
]
const MOCK_ADDRESSES = [
  {
    id: 1,
    name: '江舰',
    phone: '188****2048',
    text: '星舰基地 · 地球-火星环线 3 号舱 206 室',
    defaultStatus: 1,
    province: '星舰基地',
    city: '',
    region: '',
    detailAddress: '地球-火星环线 3 号舱 206 室',
  },
  {
    id: 2,
    name: '林星',
    phone: '139****7721',
    text: '月球基地 · 静海 7 区公寓 88 层',
    defaultStatus: 0,
    province: '月球基地',
    city: '',
    region: '',
    detailAddress: '静海 7 区公寓 88 层',
  },
  {
    id: 3,
    name: '王宙',
    phone: '176****5510',
    text: '火星城市 · 奥林帕斯 12 栋 3001',
    defaultStatus: 0,
    province: '火星城市',
    city: '',
    region: '',
    detailAddress: '奥林帕斯 12 栋 3001',
  },
]

// ===== 计算 =====
const shopGroups = computed(() => {
  const map = new Map<string, OrderItem[]>()
  items.value.forEach((it) => {
    const key = it.shop || '其他'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(it)
  })
  return [...map.entries()].map(([name, list]) => ({
    name,
    items: list,
    brandId: list.find((i) => i.brandId != null)?.brandId,
    brandLogo: list.find((i) => i.brandLogo)?.brandLogo || '',
  }))
})

const goodsAmount = computed(() =>
  items.value.reduce((s, i) => s + i.price * i.count, 0),
)
// 运费以后端确认接口返回为准（与订单金额校验口径一致）
const shipFee = computed(() => freightAmount.value || 0)
const couponDisc = computed(() => {
  const c = couponOptions.value.find((x) => x.id === coupon.value)
  return c?.disc || 0
})
const payTotal = computed(() =>
  Math.max(0, goodsAmount.value + shipFee.value - couponDisc.value),
)

const fmt = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const maskPhone = (phone: string) => {
  if (!phone || phone.length < 7) return phone || ''
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}
const addrText = (a: any) =>
  a.text ||
  `${a.province || ''}${a.city || ''}${a.region || ''}${a.detailAddress || ''}`
const specText = (it: OrderItem) =>
  (it.skuAttrValues || []).join(' / ') || `${it.shop || ''}`

// ===== 立即购买/再次购买（写入 mall_buy_now，直购模式不走购物车） =====
function getBuyNowItems(): Array<{
  skuId: number
  count: number
  skuAttrValues: string[]
}> | null {
  try {
    const raw = sessionStorage.getItem('mall_buy_now')
    if (!raw) return null
    const buy = JSON.parse(raw)
    // 再次购买：多商品列表
    if (Array.isArray(buy.items) && buy.items.length > 0) {
      return buy.items.map((i: any) => ({
        skuId: Number(i.skuId),
        count: Number(i.count ?? i.num ?? 1),
        skuAttrValues: Array.isArray(i.skuAttrValues) ? i.skuAttrValues : [],
      }))
    }
    // 立即购买：单商品（详情页/收藏页写入）
    if (!buy?.skuId) return null
    return [
      {
        skuId: Number(buy.skuId),
        count: Number(buy.num || 1),
        skuAttrValues: Array.isArray(buy.skuAttrValues)
          ? buy.skuAttrValues
          : [],
      },
    ]
  } catch {
    return null
  }
}

// ===== 更换商品参数（点击商品规格进入弹框） =====
interface SpecRow {
  attrId: number
  attrName: string
  attrValues: Array<{ value: string; skuIds: string }>
}
const specModalVisible = ref(false)
const specLoading = ref(false)
const specSaving = ref(false)
const specTarget = ref<OrderItem | null>(null)
const specRows = ref<SpecRow[]>([])
const specSelected = ref<Record<number, string>>({})

function closeSpecModal() {
  if (specSaving.value) return
  specModalVisible.value = false
  specTarget.value = null
  specRows.value = []
  specSelected.value = {}
}

async function openSpecModal(it: OrderItem) {
  specTarget.value = it
  specModalVisible.value = true
  specLoading.value = true
  specRows.value = []
  specSelected.value = {}
  try {
    const res: any = await reqProductDetail(it.skuId)
    const saleAttr: any[] = res?.data?.saleAttr || []
    specRows.value = saleAttr
      .map((a: any, idx: number) => ({
        attrId: Number(a.attrId) > 0 ? Number(a.attrId) : -(idx + 1),
        attrName: String(a.attrName || '').trim(),
        attrValues: (a.attrValues || [])
          .map((v: any) => ({
            value: String(v?.attrValue ?? v ?? '').trim(),
            skuIds: String(v?.skuIds ?? '').trim(),
          }))
          .filter((v: any) => v.value),
      }))
      .filter((a) => a.attrName && a.attrValues.length > 0)
    // 预选当前参数（skuAttrValues 形如 "名：值"）
    const cur = new Map<string, string>()
    ;(it.skuAttrValues || []).forEach((t) => {
      const idx = t.indexOf('：')
      if (idx > 0) cur.set(t.slice(0, idx).trim(), t.slice(idx + 1).trim())
    })
    specRows.value.forEach((a) => {
      const v = cur.get(a.attrName)
      specSelected.value[a.attrId] =
        v && a.attrValues.some((x) => x.value === v) ? v : a.attrValues[0].value
    })
  } catch {
    message.error('加载商品参数失败')
  } finally {
    specLoading.value = false
  }
}

// 已选组合能否对应到具体 SKU（各属性取值 skuIds 的交集）
const specResolvedSkuId = computed<number | null>(() => {
  let common: Set<string> | null = null
  for (const a of specRows.value) {
    const v = specSelected.value[a.attrId]
    const row = a.attrValues.find((x) => x.value === v)
    const ids = row?.skuIds
      ? row.skuIds
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
    if (ids.length === 0) {
      common = null
      break
    }
    const set = new Set(ids)
    if (common === null) {
      common = set
    } else {
      const next: string[] = []
      common.forEach((x) => {
        if (set.has(x)) next.push(x)
      })
      common = new Set(next)
    }
    if (common.size === 0) {
      common = null
      break
    }
  }
  if (!common || common.size !== 1) return null
  const id = Number([...common][0])
  return Number.isFinite(id) ? id : null
})

// 选中某个取值后，组合的 SKU 交集是否仍非空（纯计算，不污染状态）
function specSelectable(row: SpecRow, value: string): boolean {
  if (specRows.value.length <= 1) return true
  let common: Set<string> | null = null
  for (const a of specRows.value) {
    const v = a.attrId === row.attrId ? value : specSelected.value[a.attrId]
    const r = a.attrValues.find((x) => x.value === v)
    const ids = r?.skuIds
      ? r.skuIds
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
    if (ids.length === 0) return false
    const set = new Set(ids)
    if (common === null) {
      common = set
    } else {
      const next: string[] = []
      common.forEach((x) => {
        if (set.has(x)) next.push(x)
      })
      common = new Set(next)
    }
    if (common.size === 0) return false
  }
  return common !== null && common.size > 0
}

function pickSpec(row: SpecRow, value: string) {
  if (!specSelectable(row, value)) {
    message.info('该组合无对应 SKU')
    return
  }
  specSelected.value[row.attrId] = value
}

async function confirmSpecChange() {
  const it = specTarget.value
  const newSkuId = specResolvedSkuId.value
  if (!it || !newSkuId) {
    message.warning('当前组合无对应 SKU，请调整')
    return
  }
  if (newSkuId === Number(it.skuId)) {
    closeSpecModal()
    message.info('参数未变化')
    return
  }
  const newAttrs = specRows.value.map(
    (a) => `${a.attrName}：${specSelected.value[a.attrId]}`,
  )
  specSaving.value = true
  try {
    if (getBuyNowItems()) {
      // 直购模式：更新立即购买数据后重新确认
      const raw = JSON.parse(sessionStorage.getItem('mall_buy_now') || '{}')
      if (Array.isArray(raw.items)) {
        // 再次购买（多商品）：只替换当前商品，保留其他商品
        const idx = raw.items.findIndex(
          (x: any) => Number(x.skuId) === Number(it.skuId),
        )
        if (idx > -1) {
          raw.items[idx] = {
            skuId: newSkuId,
            count: it.count || 1,
            skuAttrValues: newAttrs,
          }
          sessionStorage.setItem('mall_buy_now', JSON.stringify(raw))
        }
      } else {
        sessionStorage.setItem(
          'mall_buy_now',
          JSON.stringify({
            skuId: newSkuId,
            num: it.count || 1,
            skuAttrValues: newAttrs,
          }),
        )
      }
    } else {
      // 购物车模式：新增新 SKU 行并选中，删除旧 SKU 行
      await reqAddToCart({
        skuId: newSkuId,
        num: it.count || 1,
        skuAttrValues: newAttrs.join(';'),
      })
      await reqCheckCart({ skuId: newSkuId, checked: 1 })
      await reqDeleteCart(it.skuId)
    }
    closeSpecModal()
    await loadConfirm()
    message.success('✓ 已更换参数')
  } catch {
    message.error('更换参数失败，请重试')
  } finally {
    specSaving.value = false
  }
}

// ===== 加载确认数据 =====
async function loadConfirm() {
  loading.value = true
  try {
    const buyNowItems = getBuyNowItems()
    const payload: Record<string, unknown> = {}
    if (buyNowItems) payload.items = buyNowItems
    const result: any = await reqOrderConfirm(payload)
    if (result.code === 200 && result.data) {
      const data = result.data
      addresses.value = data.memberAddressVos || []
      items.value = (data.items || []).map((it: any) => ({
        skuId: it.skuId,
        title: it.title || '',
        image: it.image || '',
        skuAttrValues: it.skuAttrValues || [],
        price: Number(it.price ?? 0),
        count: Number(it.count ?? 1),
        shop: it.spuBrand || it.brandName || it.shopName || '其他',
        brandId: it.brandId != null ? Number(it.brandId) : undefined,
        brandLogo: it.brandLogo || '',
      }))
      orderToken.value = data.orderToken || ''
      totalPrice.value = Number(data.total ?? 0)
      freightAmount.value = Number(data.freightAmount ?? 0)
      payPrice.value = Number(data.payPrice ?? data.total ?? 0)
      // 可用优惠券（真实接口）
      loadUsableCoupons()
      if (addresses.value.length > 0) {
        const def = addresses.value.find((a) => Number(a.defaultStatus) === 1)
        selectedAddrId.value = (def || addresses.value[0]).id
      }
      return
    }
    throw new Error(result.message || 'no data')
  } catch {
    // 接口不可达 → mock 兜底
    addresses.value = MOCK_ADDRESSES
    items.value = MOCK_ITEMS
    selectedAddrId.value =
      MOCK_ADDRESSES.find((a) => a.defaultStatus === 1)?.id ?? 1
    orderToken.value = ''
  } finally {
    loading.value = false
  }
}

// ===== 提交订单 =====
async function submitOrder() {
  if (items.value.length === 0) {
    message.warning('没有可结算的商品')
    return
  }
  if (selectedAddrId.value == null) {
    message.warning('请选择收货地址')
    return
  }
  submitting.value = true
  // 用户手势内同步打开空白窗口（避免浏览器拦截弹窗），支付表单写入该窗口
  const payWin = window.open('', '_blank')
  try {
    const buyNowItems = getBuyNowItems()
    const submitPayload: Record<string, unknown> = {
      addrId: selectedAddrId.value,
      payType: 1,
      orderToken: orderToken.value,
      // 含优惠券后的应付金额（与后端重算口径一致）
      payPrice: payTotal.value,
      couponId: coupon.value === 'none' ? null : Number(coupon.value),
    }
    if (buyNowItems) submitPayload.items = buyNowItems
    const result: any = await reqSubmitOrder(submitPayload)
    const data = result.data || {}
    if (result.code === 200 && data.code === 0) {
      sessionStorage.removeItem('mall_buy_now')
      cartStore.refreshCartCount()
      const orderSn = data.order?.orderSn ? String(data.order.orderSn) : ''
      if (orderSn) {
        // 新窗口写入支付宝表单（不在当前页跳转）
        await payNow(orderSn, payWin)
        // 弹等待支付框：60s 轮询支付宝结果，状态展示在弹窗上，结束后跳我的订单
        startPayWait(orderSn)
      } else {
        router.push('/orders')
      }
    } else if (data.code === 1) {
      message.error('订单已过期，请重新确认')
      loadConfirm()
    } else if (data.code === 2) {
      message.error('商品价格已变动，请重新确认')
      loadConfirm()
    } else {
      // 后端明确返回失败（系统异常/库存不足/业务拒绝等）→ 报错留在结算页，不伪装成功
      message.error(result?.message || '订单提交失败，请稍后重试')
    }
  } catch (e) {
    // 网络/网关异常 → 明确报错，不伪造订单号跳转
    message.error((e as Error)?.message || '订单提交失败，请检查网络后重试')
  } finally {
    submitting.value = false
  }
}

// 立即支付：后端返回支付宝自动提交表单（HTML），写入新打开的空白窗口
// （不再整页替换当前文档，支付宝收银台在新窗口/新标签页打开）
async function payNow(orderSn: string, win: Window | null) {
  try {
    const res: any = await reqPayForm(orderSn)
    if (res.code === 200 && res.data) {
      if (win) {
        win.document.open()
        win.document.write(res.data)
        win.document.close()
        return true
      }
      message.error('浏览器拦截了支付窗口，请允许弹窗后重试')
      return false
    }
    message.error(res?.message || '支付表单生成失败')
  } catch {
    message.error('支付发起失败')
  }
  // 表单生成失败兜底：跳收银台页，由该页手动拉起支付并轮询结果
  router.push({ path: '/pay', query: { orderSn } })
  return false
}

// ===== 等待支付（60s 自动跳我的订单） =====
const payWaitVisible = ref(false)
const payWaitLeft = ref(60)
const payWaitStatus = ref('')
let payWaitTimer: ReturnType<typeof setInterval> | null = null
let payPollTimer: ReturnType<typeof setInterval> | null = null

function startPayWait(orderSn: string) {
  payWaitVisible.value = true
  payWaitLeft.value = 60
  payWaitStatus.value = ''
  if (payWaitTimer) clearInterval(payWaitTimer)
  payWaitTimer = setInterval(() => {
    payWaitLeft.value--
    if (payWaitLeft.value <= 0) goOrders()
  }, 1000)
  // 倒计时期间轮询支付宝成功数据：结果状态显示在弹窗上；未成功不改订单状态
  if (payPollTimer) clearInterval(payPollTimer)
  payPollTimer = setInterval(async () => {
    try {
      const res: any = await reqPayQuery(orderSn)
      if (res?.code === 200) {
        const status = Number(res.data)
        if (status === 1) {
          // 支付宝确认成功：状态显示在弹窗上，等倒计时结束跳转
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

// ===== 地址 =====
const addrModalVisible = ref(false)
// null = 新增；有值 = 编辑该地址
const editAddrId = ref<number | null>(null)
const addrForm = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  region: '',
  addr: '',
  isDefault: false,
})

function openAddrModal(a?: any) {
  editAddrId.value = a?.id ?? null
  addrForm.name = a?.name || ''
  addrForm.phone = a?.phone || a?.mobile || ''
  addrForm.province = a?.province || ''
  addrForm.city = a?.city || ''
  addrForm.region = a?.region || ''
  // 结构化地址取 detailAddress；无省市区结构的（mock）整串放详细地址
  addrForm.addr =
    a?.detailAddress ||
    (a && !a.province && !a.city && !a.region ? addrText(a) : '')
  addrForm.isDefault = Number(a?.defaultStatus) === 1
  addrModalVisible.value = true
}

async function saveAddress() {
  if (!addrForm.name || !addrForm.phone || !addrForm.addr) {
    message.warning('⚠ 请完整填写收货人 / 电话 / 详细地址')
    return
  }
  const payload = {
    name: addrForm.name,
    phone: addrForm.phone,
    province: addrForm.province,
    city: addrForm.city,
    region: addrForm.region,
    detailAddress: addrForm.addr,
    defaultStatus: addrForm.isDefault ? 1 : 0,
  }
  if (userStore.token) {
    try {
      const res: any = editAddrId.value
        ? await reqProfileAddressUpdate({ id: editAddrId.value, ...payload })
        : await reqProfileAddressAdd(payload)
      if (res.code === 200) {
        message.success(
          editAddrId.value ? '✓ 地址已更新' : '✓ 新地址已录入轨道坐标舱',
        )
        addrModalVisible.value = false
        await loadConfirm()
        return
      }
      throw new Error(res.message)
    } catch {
      /* 落 mock */
    }
  }
  // 本地更新 / 新增
  if (editAddrId.value) {
    const target = addresses.value.find((a) => a.id === editAddrId.value)
    if (target) {
      if (payload.defaultStatus)
        addresses.value.forEach((a) => (a.defaultStatus = 0))
      Object.assign(target, {
        ...payload,
        text: undefined,
      })
    }
  } else {
    const na = {
      id: Date.now(),
      ...payload,
      text: undefined,
    }
    if (na.defaultStatus) addresses.value.forEach((a) => (a.defaultStatus = 0))
    addresses.value.push(na)
    selectedAddrId.value = na.id
  }
  addrModalVisible.value = false
  message.success(
    editAddrId.value ? '✓ 地址已更新' : '✓ 新地址已录入轨道坐标舱',
  )
}

onMounted(loadConfirm)

onBeforeUnmount(() => {
  if (payWaitTimer) {
    clearInterval(payWaitTimer)
    payWaitTimer = null
  }
  stopPayPolling()
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

/* 分区卡片 */
.ord-sec {
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 18px;
  background: var(--panel);
  backdrop-filter: blur(10px);
  margin-top: 18px;
  overflow: hidden;
}
.ord-sec-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  background: linear-gradient(
    90deg,
    rgba(0, 240, 255, 0.06),
    rgba(168, 85, 247, 0.04)
  );
}
.ord-sec-head .bar {
  width: 4px;
  height: 16px;
  border-radius: 3px;
  background: linear-gradient(180deg, #00f0ff, #a855f7);
  box-shadow: 0 0 8px var(--cyan);
}
.ord-sec-head h3 {
  font-family: var(--font-h);
  font-size: 15px;
  letter-spacing: 2px;
  color: #fff;
}
.ord-sec-head h3 small {
  font-family: var(--font-m);
  font-size: 9px;
  color: var(--dim);
  letter-spacing: 3px;
  font-weight: 400;
  margin-left: 8px;
}
.ord-sec-body {
  padding: 20px 24px;
}

/* ===== 收货地址 ===== */
.addr-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.addr-card {
  position: relative;
  border: 1px solid rgba(0, 240, 255, 0.18);
  border-radius: 14px;
  padding: 16px 18px;
  cursor: pointer;
  transition: 0.25s;
  background: rgba(0, 240, 255, 0.03);
}
.addr-card:hover {
  border-color: rgba(0, 240, 255, 0.45);
}
.addr-card.active {
  border-color: var(--cyan);
  background: rgba(0, 240, 255, 0.08);
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.2);
}
.addr-card.active::after {
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
.addr-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--txt);
  letter-spacing: 1px;
}
.addr-name .tag {
  font-family: var(--font-m);
  font-size: 9px;
  color: #02101a;
  background: var(--green);
  padding: 2px 7px;
  border-radius: 8px;
  margin-left: 8px;
  letter-spacing: 1px;
  box-shadow: 0 0 8px rgba(57, 255, 136, 0.5);
}
.addr-phone {
  font-family: var(--font-m);
  font-size: 12px;
  color: var(--dim);
  margin-top: 5px;
  letter-spacing: 2px;
}
.addr-text {
  font-size: 13px;
  color: var(--dim);
  margin-top: 8px;
  line-height: 1.6;
}
.addr-edit {
  position: absolute;
  bottom: 12px;
  right: 14px;
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 1px;
  cursor: pointer;
  transition: 0.2s;
  border-bottom: 1px dashed var(--dim);
}
.addr-edit:hover {
  color: var(--cyan);
  border-color: var(--cyan);
}
.ord-sec-head .addr-add {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 9px;
  border: 1px solid rgba(0, 240, 255, 0.35);
  color: var(--cyan);
  font-size: 12px;
  cursor: pointer;
  background: rgba(0, 240, 255, 0.06);
  letter-spacing: 1px;
  transition: 0.2s;
  font-family: var(--font-m);
}
.ord-sec-head .addr-add:hover {
  background: rgba(0, 240, 255, 0.14);
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.35);
}
.addr-card.def {
  padding-left: 40px;
}
.def-corner {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-top: 32px solid var(--green);
  border-right: 32px solid transparent;
  border-radius: 14px 0 0 0;
  box-shadow: 0 0 12px rgba(57, 255, 136, 0.35);
}
.def-corner span {
  position: absolute;
  top: -27px;
  left: 4px;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: #02101a;
  font-weight: 700;
  letter-spacing: 1px;
}

/* ===== 商品清单 ===== */
.shop-card {
  border: 1px solid rgba(0, 240, 255, 0.12);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 12px;
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
  grid-template-columns: 100px 1fr 100px 90px 110px;
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
.oparams.clickable {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border: 1px dashed rgba(255, 176, 46, 0.4);
  border-radius: 8px;
  transition: 0.2s;
}
.oparams.clickable:hover {
  border-color: var(--cyan);
  color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.25);
}
.oparams-edit {
  font-size: var(--font-size-xs);
  opacity: 0.7;
}
/* ===== 更换商品参数模态框 ===== */
.spec-modal {
  width: 480px;
}
/* 商品信息（图片/名称/当前参数） */
.spec-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 12px;
  background: rgba(0, 240, 255, 0.03);
  margin-bottom: 16px;
}
.spec-info .si-img {
  width: 58px;
  height: 58px;
  border-radius: 10px;
  overflow: hidden;
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
  color: var(--cyan);
  font-size: 20px;
}
.spec-info .si-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.spec-info .si-detail {
  min-width: 0;
}
.spec-info .si-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--txt);
  letter-spacing: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.spec-info .si-cur {
  margin-top: 5px;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.spec-info .si-cur-lab {
  color: var(--cyan);
  margin-right: 6px;
}
.spec-loading,
.spec-empty {
  text-align: center;
  padding: 40px 0;
  color: var(--dim);
  font-family: var(--font-m);
  letter-spacing: 2px;
}
.spec-row {
  margin-bottom: 16px;
}
.spec-al {
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 2px;
  margin-bottom: 8px;
}
.spec-opts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.spec-opt {
  padding: 9px 18px;
  border-radius: 10px;
  border: 1px solid rgba(0, 240, 255, 0.25);
  background: rgba(0, 240, 255, 0.05);
  color: var(--txt);
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  letter-spacing: 1px;
}
.spec-opt:hover {
  border-color: var(--cyan);
  color: var(--cyan);
}
.spec-opt.active {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  border-color: transparent;
  font-weight: 700;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.4);
}
.spec-opt.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.spec-opt.disabled:hover {
  border-color: rgba(0, 240, 255, 0.25);
  color: var(--txt);
}
.spec-hint {
  margin-top: 6px;
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--green);
}
.spec-hint.invalid {
  color: var(--magenta);
}
.mbtn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
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

/* ===== 配送/支付/优惠 ===== */
.opt-block {
  padding: 16px 0;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.08);
}
.opt-block:last-child {
  border-bottom: none;
}
.opt-label {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.opt-label::before {
  content: '';
  width: 3px;
  height: 11px;
  border-radius: 2px;
  background: linear-gradient(180deg, #00f0ff, #a855f7);
  box-shadow: 0 0 6px var(--cyan);
}
.opt-pills {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.opt-none {
  font-family: var(--font-m);
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 1px;
  padding: 12px 18px;
  border: 1px dashed rgba(0, 240, 255, 0.2);
  border-radius: 12px;
}
.opt-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.22s;
  border: 1px solid rgba(0, 240, 255, 0.2);
  background: rgba(0, 240, 255, 0.04);
}
.opt-pill:hover {
  border-color: rgba(0, 240, 255, 0.5);
}
.opt-pill.active {
  border-color: var(--cyan);
  background: rgba(0, 240, 255, 0.1);
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.22);
}
.opt-pill .oi {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: rgba(0, 240, 255, 0.08);
  border: 1px solid rgba(0, 240, 255, 0.25);
  color: var(--cyan);
}
.opt-pill .ot {
  font-size: 14px;
  font-weight: 700;
  color: var(--txt);
  letter-spacing: 1px;
}
.opt-pill .od {
  font-size: 12px;
  color: var(--dim);
  margin-top: 2px;
  font-family: var(--font-m);
  letter-spacing: 1px;
}
.opt-pill .of {
  margin-left: auto;
  font-family: var(--font-h);
  font-size: 13px;
  font-weight: 700;
  color: var(--green);
}
.opt-pill.active::after {
  content: '✓';
  margin-left: auto;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  font-size: var(--font-size-xs);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}
.opt-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 6px;
  border: 1px dashed rgba(0, 240, 255, 0.3);
  border-radius: 10px;
  background: transparent;
  color: var(--dim);
  font-family: var(--font-m);
  font-size: 12px;
  letter-spacing: 2px;
  cursor: pointer;
  transition: 0.25s;
}
.opt-more:hover {
  color: var(--cyan);
  border-color: var(--cyan);
  background: rgba(0, 240, 255, 0.05);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.15);
}
.opt-more .caret {
  font-style: normal;
  color: var(--cyan);
  transition: transform 0.3s;
  display: inline-block;
}
.opt-more.open .caret {
  transform: rotate(180deg);
}
.opt-extra {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition:
    max-height 0.4s ease,
    opacity 0.4s ease;
}
.opt-extra.open {
  max-height: 640px;
  opacity: 1;
}

/* ===== 金额结算 ===== */
.sum-rows {
  max-width: 560px;
  margin: 0 auto;
}
.sum-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--dim);
  margin-bottom: 13px;
  letter-spacing: 1px;
}
.sum-row b {
  color: var(--txt);
  font-weight: 600;
}
.sum-row .green {
  color: var(--green);
}
.sum-total {
  border-top: 1px solid rgba(0, 240, 255, 0.14);
  margin-top: 8px;
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.sum-total .lab {
  font-size: 15px;
  color: var(--dim);
  letter-spacing: 1px;
  font-weight: 600;
}
.sum-total .val {
  font-family: var(--font-h);
  font-size: 28px;
  font-weight: 900;
  color: var(--cyan);
  text-shadow: 0 0 16px rgba(0, 240, 255, 0.6);
}
.sum-total .val small {
  font-size: 14px;
  margin-right: 2px;
}

/* ===== 底部提交栏 ===== */
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
.ord-bar .submit:hover {
  filter: brightness(1.2);
  transform: translateY(-2px);
  box-shadow: 0 0 34px rgba(0, 240, 255, 0.85);
}
.ord-bar .submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== 地址模态框 ===== */
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
  width: 520px;
  max-width: calc(100vw - 40px);
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(6, 10, 26, 0.97);
  backdrop-filter: blur(20px);
  padding: 26px 30px;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(0, 240, 255, 0.12);
  animation: modalIn 0.25s ease;
}
@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.modal-head h3 {
  font-family: var(--font-h);
  font-size: 17px;
  letter-spacing: 2px;
  color: #fff;
}
.modal-head h3 small {
  display: block;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 3px;
  font-weight: 400;
  margin-top: 4px;
}
.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid rgba(0, 240, 255, 0.3);
  background: rgba(0, 240, 255, 0.06);
  color: var(--cyan);
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}
.modal-close:hover {
  background: rgba(255, 46, 196, 0.12);
  border-color: var(--magenta);
  color: var(--magenta);
}
.af-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.af-field {
  margin-bottom: 16px;
}
.af-label {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.af-label::before {
  content: '';
  width: 3px;
  height: 11px;
  border-radius: 2px;
  background: linear-gradient(180deg, #00f0ff, #a855f7);
  box-shadow: 0 0 6px var(--cyan);
}
.af-field input {
  width: 100%;
  height: 42px;
  border-radius: 10px;
  border: 1px solid rgba(0, 240, 255, 0.25);
  background: rgba(6, 10, 26, 0.7);
  color: var(--txt);
  padding: 0 14px;
  font-family: var(--font-b);
  font-size: 14px;
  outline: none;
  transition: 0.2s;
  box-sizing: border-box;
}
.af-field input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
.af-def {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--dim);
  cursor: pointer;
  user-select: none;
  margin-bottom: 6px;
}
.af-def input {
  display: none;
}
.af-def .box {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1px solid rgba(0, 240, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #02101a;
  transition: 0.2s;
  background: rgba(0, 240, 255, 0.04);
}
.af-def input:checked + .box {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}
.af-def input:checked + .box::after {
  content: '✓';
}
.modal-foot {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}
.mbtn {
  height: 44px;
  padding: 0 26px;
  border-radius: 11px;
  cursor: pointer;
  font-family: var(--font-h);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  transition: 0.25s;
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

@media (max-width: 1080px) {
  .addr-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 760px) {
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
  .oitem {
    grid-template-columns: 56px 1fr;
    grid-template-rows: auto auto;
    row-gap: 8px;
  }
  .oitem .oprice {
    grid-column: 2;
    grid-row: 2;
    text-align: left;
  }
  .oitem .oqty {
    grid-column: 2;
    grid-row: 2;
    justify-self: center;
  }
  .oitem .osub {
    grid-column: 2;
    grid-row: 2;
    justify-self: end;
  }
}
</style>
