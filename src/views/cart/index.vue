<template>
  <div class="nb-cart">
    <!-- 页面搜索 header -->
    <PageSearchHeader placeholder="搜索购物车商品…" />
    <div class="wrap">
      <div class="crumbs">
        <router-link to="/">Nebula Home</router-link>
        <span class="sep">/</span>
        <span class="cur">量子购物舱</span>
      </div>
      <div class="page-head sec-head">
        <div class="sec-title">
          <h2>
            🛒 量子购物舱
            <small>QUANTUM CART · 星际购物清单</small>
          </h2>
        </div>
      </div>

      <div class="cart-wrap">
        <div class="cart-main">
          <div class="cart-head">
            <label class="chk-all">
              <input
                name="fld1"
                type="checkbox"
                :checked="allSelected"
                @change="handleSelectAll"
              />
              <span class="box"></span>
              全选 · 已选
              <b>{{ selectedCount }}</b>
              件 · 共
              <b>{{ allProducts.length }}</b>
              件
            </label>
            <span class="cart-clear" @click="clearChecked">清空已选 ✕</span>
          </div>
          <div class="col-head">
            <span></span>
            <span class="ch-t2">
              <i>◈</i>
              商品
            </span>
            <span class="ch-t4">单价</span>
            <span class="ch-t5">数量</span>
            <span class="ch-t6">小计</span>
            <span class="ch-op">操作</span>
          </div>

          <!-- 按商家分组 -->
          <div v-for="shop in stores" :key="shop.name" class="shop-card">
            <div class="shop-head">
              <label class="s-chk">
                <input
                  name="fld2"
                  type="checkbox"
                  :checked="
                    shop.products.every((p) => p.sel) &&
                    shop.products.length > 0
                  "
                  @change="
                    handleStoreSelect(
                      shop,
                      ($event.target as HTMLInputElement).checked,
                    )
                  "
                />
                <span class="box"></span>
              </label>
              <span class="shop-ico">◈</span>
              <span class="shop-name">{{ shop.name }}</span>
              <span class="shop-count">{{ shop.products.length }} 件商品</span>
              <router-link class="shop-link" to="/list">进店 ⟶</router-link>
            </div>
            <div class="shop-items">
              <div v-for="p in shop.products" :key="String(p.id)" class="citem">
                <label class="cchk">
                  <input
                    name="fld3"
                    type="checkbox"
                    :checked="p.sel"
                    @change="
                      handleItemSelect(
                        p,
                        ($event.target as HTMLInputElement).checked,
                      )
                    "
                  />
                  <span class="box"></span>
                </label>
                <div class="cicon">
                  <img
                    v-if="p.image"
                    :src="p.image"
                    :alt="p.name"
                    class="cicon-img"
                  />
                  <div v-else class="ph" :class="p.phClass || ''">
                    {{ p.icon }}
                  </div>
                </div>
                <div class="cinfo">
                  <div class="cname" @click="goDetail(p)">{{ p.name }}</div>
                  <div class="ccat" @click="openParamModal(p)">
                    {{ p.brand || 'NEBULA' }} ·
                    {{ (p.cat || '量子商品').toUpperCase() }}
                    <span class="ccat-edit">✎ 参数</span>
                  </div>
                  <div v-if="p.spec" class="cparams">{{ p.spec }}</div>
                </div>
                <div class="cprice">
                  <small>¥</small>
                  {{ fmt(p.price) }}
                </div>
                <div class="cqty">
                  <button
                    class="qbtn minus"
                    :disabled="p.qty <= 1"
                    @click="decrease(p)"
                  >
                    −
                  </button>
                  <span class="qnum">{{ p.qty }}</span>
                  <button class="qbtn plus" @click="increase(p)">＋</button>
                </div>
                <div class="csub">¥{{ fmt(p.price * p.qty) }}</div>
                <button class="cdel" @click="removeItem(p)">✕</button>
              </div>
            </div>
          </div>

          <div
            v-if="!loading && allProducts.length === 0"
            class="empty-cart show"
          >
            <div class="empty-orb"><span>🛒</span></div>
            <div class="empty-t">NO SIGNAL · 购物舱为空</div>
            <div class="empty-s">
              量子购物车中暂无商品，前往商品库扫描心仪装备吧
            </div>
            <router-link class="btn btn-primary btn-sm" to="/list">
              ⟶ 去逛逛
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 结算舱（固定底部） ===== -->
    <div class="sum-wrap">
      <aside class="sum-panel">
        <div class="sum-stats">
          <div class="sum-stat">
            <div class="sl">已选商品</div>
            <div class="sv">{{ selectedCount }} 件</div>
          </div>
          <div class="sum-stat">
            <div class="sl">商品金额</div>
            <div class="sv">¥{{ fmt(totalPrice) }}</div>
          </div>
          <div class="sum-stat">
            <div class="sl">已优惠</div>
            <div class="sv green">-¥{{ fmt(discount) }}</div>
          </div>
          <div class="sum-stat">
            <div class="sl">应付总额</div>
            <div class="sv cyan">
              <small>¥</small>
              {{ fmt(totalPrice) }}
            </div>
          </div>
        </div>
        <button
          class="checkout"
          :disabled="selectedCount === 0"
          @click="goCheckout"
        >
          ⟶ 立即结算
        </button>
      </aside>
    </div>

    <!-- ===== 商品参数模态框 ===== -->
    <div
      v-if="paramVisible"
      class="modal-mask show"
      @click.self="paramVisible = false"
    >
      <div class="modal">
        <div class="modal-head">
          <h3>
            ◈ 商品参数
            <small>PRODUCT PARAMETERS · 量子配置舱</small>
          </h3>
          <button class="modal-close" @click="paramVisible = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="mp-info">
            <div class="mp-icon">
              <img
                v-if="editItem?.image"
                :src="editItem.image"
                :alt="editItem.name"
                class="mp-icon-img"
              />
              <div v-else class="ph" :class="editItem?.phClass || ''">
                {{ editItem?.icon }}
              </div>
            </div>
            <div>
              <div class="mp-name">{{ editItem?.name }}</div>
              <div class="mp-cat">
                {{ editItem?.brand }} ·
                {{ (editItem?.cat || '').toUpperCase() }}
              </div>
            </div>
          </div>
          <div class="mp-field" v-for="a in editAttrs" :key="a.attrId">
            <div class="mp-label">{{ a.attrName }}</div>
            <div class="mp-opts">
              <button
                v-for="v in a.values"
                :key="v"
                class="mp-opt"
                :class="{ active: a.value === v }"
                @click="a.value = v"
              >
                {{ v }}
              </button>
            </div>
          </div>
          <div class="mp-field">
            <div class="mp-label">数量 QUANTITY</div>
            <div class="cqty" style="justify-content: flex-start">
              <button
                class="qbtn minus"
                :disabled="editQty <= 1"
                @click="editQty > 1 && editQty--"
              >
                −
              </button>
              <span class="qnum">{{ editQty }}</span>
              <button class="qbtn plus" @click="editQty++">＋</button>
            </div>
          </div>
          <div class="mp-field">
            <div class="mp-label">备注 NOTE</div>
            <input
              name="editNote"
              v-model.trim="editNote"
              type="text"
              placeholder="量子加密备注…（限 30 字）"
              maxlength="30"
            />
          </div>
        </div>
        <div class="modal-foot">
          <button class="mbtn ghost" @click="paramVisible = false">取消</button>
          <button class="mbtn primary" @click="saveParam">✓ 保存修改</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageSearchHeader from '@/components/nebula/PageSearchHeader/index.vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import useCartStore from '@/store/modules/cart'
import {
  reqCartList,
  reqCheckCart,
  reqUpdateCart,
  reqDeleteCart,
} from '@/api/cart'
import { reqProductDetail } from '@/api/product'
import message from '@/utils/message'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const COLORS = ['星云蓝', '霓虹紫', '幻影绿', '赛博红']
const VERSIONS = ['标准版', '旗舰版', '星际版']

// ===== 购物车项 =====
interface CartItem {
  id: string | number
  name: string
  shop: string
  cat: string
  brand: string
  price: number
  old: number
  icon: string
  phClass?: string
  image?: string
  qty: number
  sel: boolean
  color: string
  ver: string
  note: string
  spec: string
}

const stores = ref<Array<{ name: string; products: CartItem[] }>>([])
const loading = ref(true)

const allProducts = computed(() => stores.value.flatMap((s) => s.products))
const selectedProducts = computed(() => allProducts.value.filter((p) => p.sel))
const selectedCount = computed(() => selectedProducts.value.length)
const allSelected = computed(
  () => allProducts.value.length > 0 && allProducts.value.every((p) => p.sel),
)
const totalPrice = computed(() =>
  selectedProducts.value.reduce((sum, p) => sum + p.price * p.qty, 0),
)
const originalTotal = computed(() =>
  selectedProducts.value.reduce((sum, p) => sum + p.old * p.qty, 0),
)
const discount = computed(() =>
  Math.max(0, originalTotal.value - totalPrice.value),
)

const fmt = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

function groupByShop(list: CartItem[]) {
  const map = new Map<string, CartItem[]>()
  list.forEach((item) => {
    const key = item.shop || item.brand || '其他'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  })
  stores.value = [...map.entries()].map(([name, products]) => ({
    name,
    products,
  }))
}

// ===== 加载：仅后端接口数据，无数据/失败展示空态 =====
async function loadCart() {
  loading.value = true
  if (!userStore.token) {
    // 未登录：不回落 mock，直接空态
    loading.value = false
    return
  }
  try {
    const result: any = await reqCartList()
    const list: any[] = result?.data || []
    if (list.length > 0) {
      const items: CartItem[] = list.map((item) => {
        const specArr: string[] = item.skuAttrValues || []
        const spec = specArr.join(' / ')
        return {
          id: String(item.skuId),
          name: item.title || '',
          shop: item.brandName || '其他',
          cat: item.brandName || '',
          brand: item.brandName || '',
          price: Number(item.price ?? 0),
          old: Number(item.price ?? 0),
          icon: '◈',
          phClass: 'p2',
          image: item.image || '',
          qty: Number(item.count ?? 1),
          sel: item.check !== false,
          color: '',
          ver: '',
          note: '',
          spec,
        }
      })
      groupByShop(items)
    }
    // 接口返回空列表：保持空态，不回落 mock
  } catch {
    // 接口失败：保持空态，不回落 mock
  } finally {
    loading.value = false
  }
}

// ===== 操作（同步后端） =====
function handleSelectAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  allProducts.value.forEach((p) => {
    p.sel = checked
  })
  if (userStore.token) {
    allProducts.value.forEach((p) => {
      reqCheckCart({ skuId: p.id, checked: checked ? 1 : 0 }).catch(() => {})
    })
  }
}

function handleStoreSelect(
  shop: { name: string; products: CartItem[] },
  checked: boolean,
) {
  shop.products.forEach((p) => {
    p.sel = checked
    if (userStore.token) {
      reqCheckCart({ skuId: p.id, checked: checked ? 1 : 0 }).catch(() => {})
    }
  })
}

function handleItemSelect(p: CartItem, checked: boolean) {
  p.sel = checked
  if (userStore.token) {
    reqCheckCart({ skuId: p.id, checked: checked ? 1 : 0 }).catch(() => {})
  }
}

function decrease(p: CartItem) {
  if (p.qty <= 1) return
  p.qty--
  if (userStore.token) {
    reqUpdateCart({ skuId: p.id, num: p.qty }).catch(() => {})
  }
}

function increase(p: CartItem) {
  p.qty++
  if (userStore.token) {
    reqUpdateCart({ skuId: p.id, num: p.qty }).catch(() => {})
  }
}

async function removeItem(p: CartItem) {
  const shop = stores.value.find((s) => s.products.some((x) => x.id === p.id))
  if (shop) {
    shop.products = shop.products.filter((x) => x.id !== p.id)
    stores.value = stores.value.filter((s) => s.products.length > 0)
  }
  if (userStore.token) {
    try {
      await reqDeleteCart(p.id)
      await cartStore.refreshCartCount()
    } catch {
      /* 忽略 */
    }
  }
}

function clearChecked() {
  const selected = allProducts.value.filter((p) => p.sel)
  if (selected.length === 0) return
  selected.forEach((p) => removeItem(p))
  message.success('已清空所选商品')
}

// ===== 参数模态框 =====
const paramVisible = ref(false)
const editItem = ref<CartItem | null>(null)
const editQty = ref(1)
const editNote = ref('')
// 动态属性组：API 项为真实销售属性（机身颜色/屏幕刷新率…），无 spec 时回退静态配色/版本
interface EditAttr {
  attrId: number
  attrName: string
  values: string[]
  value: string
}
const editAttrs = ref<EditAttr[]>([])

// 解析 "机身颜色：金色 / 屏幕刷新率：120Hz" → [{name, value}]
function parseSpecPairs(spec: string): Array<{ name: string; value: string }> {
  if (!spec) return []
  return spec
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.split(/[：:]/)
      return { name: (m[0] || '').trim(), value: (m[1] || '').trim() }
    })
    .filter((x) => x.name)
}

async function openParamModal(p: CartItem) {
  editItem.value = p
  editQty.value = p.qty
  editNote.value = p.note || ''
  if (p.spec) {
    // API 项：从现有规格解析，并尝试拉详情补全可选项
    const pairs = parseSpecPairs(p.spec)
    const current = new Map(pairs.map((x) => [x.name, x.value]))
    let rows: EditAttr[] = pairs
      .map((x, i) => ({
        attrId: -(i + 1),
        attrName: x.name,
        values: x.value ? [x.value] : [],
        value: x.value,
      }))
      .filter((x) => x.value)
    try {
      const res: any = await reqProductDetail(p.id)
      const saleAttr: any[] = res?.data?.saleAttr || []
      if (saleAttr.length > 0) {
        rows = saleAttr
          .map((a: any, i: number) => {
            const name = String(a.attrName || '').trim()
            const values = (a.attrValues || [])
              .map((v: any) => String(v?.attrValue ?? v ?? '').trim())
              .filter(Boolean)
            return {
              attrId: Number(a.attrId) > 0 ? Number(a.attrId) : -(i + 1),
              attrName: name,
              values,
              value: current.get(name) || values[0] || '',
            }
          })
          .filter((a: EditAttr) => a.attrName && a.values.length > 0)
      }
    } catch {
      /* 详情拉取失败用解析行兜底 */
    }
    editAttrs.value = rows
  } else {
    // 无 spec 项：静态配色/版本兜底
    editAttrs.value = [
      {
        attrId: -1,
        attrName: '配色',
        values: COLORS,
        value: p.color || COLORS[0],
      },
      {
        attrId: -2,
        attrName: '版本',
        values: VERSIONS,
        value: p.ver || VERSIONS[0],
      },
    ]
  }
  paramVisible.value = true
}

async function saveParam() {
  const it = editItem.value
  if (!it) return
  it.qty = editQty.value
  it.note = editNote.value
  const parts: string[] = editAttrs.value
    .filter((a) => a.attrName && a.value)
    .map((a) => `${a.attrName}：${a.value}`)
  it.spec = parts.join(' / ')
  // 同步颜色/版本字段（展示用）
  it.color = editAttrs.value.find((a) => a.attrName.includes('色'))?.value || ''
  it.ver = editAttrs.value.find((a) => a.attrName.includes('版'))?.value || ''
  paramVisible.value = false
  if (userStore.token) {
    try {
      await reqUpdateCart({
        skuId: it.id,
        num: it.qty,
        skuAttrValues: parts.join(';'),
      })
    } catch {
      /* 本地已更新 */
    }
  }
  message.success(`✓ 商品参数已更新 · ${parts.join(' / ') || '—'}`)
}

// 商品名点击跳详情
function goDetail(p: CartItem) {
  router.push({ path: '/details', query: { skuId: String(p.id) } })
}

// ===== 结算 =====
function goCheckout() {
  if (selectedCount.value === 0) return
  if (!userStore.token) {
    router.push({ path: '/login', query: { redirect: '/cart' } })
    return
  }
  sessionStorage.setItem('mall_checkout_allowed', '1')
  router.push('/checkout')
}

onMounted(loadCart)
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

.cart-wrap {
  max-width: 1224px;
  margin: 0 auto;
  margin-top: 20px;
}

/* 列表头部 */
.cart-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 6px 14px;
}
.chk-all {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--dim);
  cursor: pointer;
  user-select: none;
}
.chk-all input {
  display: none;
}
.chk-all .box {
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
.chk-all input:checked + .box {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}
.chk-all input:checked + .box::after {
  content: '✓';
}
.cart-head .chk-all b {
  color: var(--cyan);
  font-weight: 600;
}
.cart-clear {
  color: var(--dim);
  font-size: 13px;
  cursor: pointer;
  letter-spacing: 1px;
  border-bottom: 1px dashed var(--dim);
  transition: 0.2s;
}
.cart-clear:hover {
  color: var(--magenta);
  border-color: var(--magenta);
}

/* 列头 */
.col-head {
  display: grid;
  grid-template-columns: 30px 72px 1fr 90px 120px 96px 50px;
  gap: 12px;
  align-items: center;
  padding: 18px 22px;
  margin-bottom: 14px;
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    rgba(0, 240, 255, 0.07),
    rgba(168, 85, 247, 0.05)
  );
  font-family: var(--font-m);
  font-size: 13px;
  font-weight: 700;
  color: var(--dim);
  letter-spacing: 3px;
}
.col-head i {
  font-style: normal;
  color: var(--cyan);
  margin-right: 6px;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
  font-size: 12px;
}
.col-head .ch-t2 {
  grid-column: 2/4;
}
.col-head .ch-t4,
.col-head .ch-t5 {
  text-align: center;
}
.col-head .ch-t6,
.col-head .ch-op {
  text-align: right;
}
.col-head .ch-op {
  opacity: 0.65;
}

/* 商家卡片 */
.shop-card {
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 18px;
  background: var(--panel);
  backdrop-filter: blur(10px);
  margin-bottom: 14px;
  overflow: hidden;
  transition: 0.3s;
  animation: cartIn 0.3s ease;
}
@keyframes cartIn {
  from {
    opacity: 0;
    transform: translateX(-14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.shop-card:hover {
  border-color: rgba(0, 240, 255, 0.4);
  box-shadow: 0 0 22px rgba(0, 240, 255, 0.12);
}
.shop-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 22px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  background: linear-gradient(
    90deg,
    rgba(0, 240, 255, 0.07),
    rgba(168, 85, 247, 0.05)
  );
}
.shop-head .s-chk {
  display: flex;
  align-items: center;
}
.shop-head .s-chk input {
  display: none;
}
.shop-head .s-chk .box {
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
  cursor: pointer;
}
.shop-head .s-chk input:checked + .box {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}
.shop-head .s-chk input:checked + .box::after {
  content: '✓';
}
.shop-ico {
  width: 32px;
  height: 32px;
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
  font-size: 15px;
  text-shadow: 0 0 10px var(--cyan);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.25);
}
.shop-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--cyan);
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
}
.shop-count {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
}
.shop-link {
  margin-left: auto;
  font-size: 12px;
  color: var(--dim);
  text-decoration: none;
  letter-spacing: 1px;
  transition: 0.2s;
  border: 1px solid rgba(0, 240, 255, 0.25);
  padding: 5px 12px;
  border-radius: 14px;
  font-family: var(--font-m);
}
.shop-link:hover {
  color: var(--cyan);
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
.shop-items {
  padding: 4px 22px;
}

/* 商品行 */
.citem {
  display: grid;
  grid-template-columns: 30px 100px 1fr 90px 120px 96px 30px;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.08);
}
.citem:last-child {
  border-bottom: none;
}
.citem .cchk {
  display: flex;
  align-items: center;
  justify-content: center;
}
.citem .cchk input {
  display: none;
}
.citem .cchk .box {
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
  cursor: pointer;
}
.citem .cchk input:checked + .box {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}
.citem .cchk input:checked + .box::after {
  content: '✓';
}
.cicon {
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
.cicon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.cicon .ph {
  width: 44px;
  height: 44px;
  border-radius: 12px;
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
    0 0 18px rgba(0, 240, 255, 0.35),
    inset 0 0 12px rgba(255, 255, 255, 0.15);
  font-family: var(--font-h);
  font-size: 19px;
  color: #fff;
  text-shadow: 0 0 12px var(--cyan);
}
.cicon .ph.p2 {
  border-radius: 50%;
  background: linear-gradient(
    145deg,
    rgba(255, 46, 196, 0.4),
    rgba(168, 85, 247, 0.35)
  );
}
.cicon .ph.p3 {
  border-radius: 6px;
  transform: rotate(45deg);
}
.cicon .ph.p4 {
  border-radius: 50% 50% 10px 10px;
  background: linear-gradient(
    145deg,
    rgba(57, 255, 136, 0.4),
    rgba(0, 240, 255, 0.35)
  );
}
.cinfo {
  min-width: 0;
}
.cname {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
  line-height: 1.4;
  cursor: pointer;
  width: fit-content;
  transition: 0.2s;
}
.cname:hover {
  color: var(--cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}
.ccat {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--cyan);
  letter-spacing: 2px;
  margin-top: 4px;
  cursor: pointer;
  width: fit-content;
  transition: 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ccat:hover {
  color: var(--txt);
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
}
.ccat .ccat-edit {
  font-style: normal;
  color: var(--amber);
  font-size: var(--font-size-xs);
  opacity: 0.9;
}
.cparams {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--amber);
  margin-top: 5px;
  letter-spacing: 1px;
}
.cprice {
  text-align: center;
  font-size: 14px;
  color: var(--dim);
}
.cprice small {
  font-size: var(--font-size-xs);
  margin-right: 1px;
}
.cqty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.qbtn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(0, 240, 255, 0.3);
  background: rgba(0, 240, 255, 0.06);
  color: var(--cyan);
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.qbtn:hover {
  background: rgba(0, 240, 255, 0.18);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
}
.qbtn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.qnum {
  min-width: 32px;
  text-align: center;
  font-family: var(--font-h);
  font-size: 14px;
  color: var(--txt);
}
.csub {
  text-align: right;
  font-family: var(--font-h);
  font-size: 15px;
  font-weight: 700;
  color: var(--green);
  text-shadow: 0 0 12px rgba(57, 255, 136, 0.4);
}
.cdel {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
  justify-self: end;
}
.cdel:hover {
  color: var(--magenta);
  background: rgba(255, 46, 196, 0.1);
  text-shadow: 0 0 8px rgba(255, 46, 196, 0.7);
}

/* ===== 结算舱 ===== */
.sum-wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 999;
}
.sum-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  border-top: 1px solid rgba(0, 240, 255, 0.22);
  border-radius: 18px 18px 0 0;
  background: rgba(5, 9, 24, 0.94);
  backdrop-filter: blur(16px);
  padding: 20px 44px;
  box-shadow:
    0 -12px 40px rgba(0, 0, 0, 0.5),
    0 0 24px rgba(0, 240, 255, 0.08);
}
.sum-stats {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex: 1;
  min-width: 0;
}
.sum-stat {
  text-align: center;
}
.sum-stat .sl {
  font-family: var(--font-m);
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 2px;
}
.sum-stat .sv {
  font-family: var(--font-h);
  font-size: 21px;
  font-weight: 700;
  color: var(--txt);
  margin-top: 5px;
}
.sum-stat .sv.green {
  color: var(--green);
  text-shadow: 0 0 12px rgba(57, 255, 136, 0.4);
}
.sum-stat .sv.cyan {
  color: var(--cyan);
  font-size: 29px;
  text-shadow: 0 0 16px rgba(0, 240, 255, 0.6);
}
.sum-stat .sv small {
  font-size: 14px;
  margin-right: 2px;
}
.sum-panel .checkout {
  flex-shrink: 0;
  width: 320px;
  height: 54px;
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
.sum-panel .checkout:hover:not(:disabled) {
  filter: brightness(1.2);
  transform: translateY(-2px);
  box-shadow: 0 0 34px rgba(0, 240, 255, 0.85);
}
.sum-panel .checkout:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===== 空购物车 ===== */
.empty-cart {
  text-align: center;
  padding: 80px 20px;
  border: 1px dashed rgba(0, 240, 255, 0.3);
  border-radius: 18px;
  background: rgba(6, 10, 26, 0.5);
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

/* ===== 参数模态框 ===== */
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
  width: 540px;
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
  margin-bottom: 18px;
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
.mp-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border: 1px solid rgba(0, 240, 255, 0.14);
  border-radius: 14px;
  background: rgba(0, 240, 255, 0.04);
  margin-bottom: 16px;
}
.mp-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
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
.mp-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.mp-icon .ph {
  width: 40px;
  height: 40px;
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
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.35);
  font-family: var(--font-h);
  font-size: 18px;
  color: #fff;
  text-shadow: 0 0 12px var(--cyan);
}
.mp-name {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
}
.mp-cat {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--cyan);
  letter-spacing: 2px;
  margin-top: 4px;
}
.mp-field {
  margin-bottom: 16px;
}
.mp-label {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  margin-bottom: 9px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.mp-label::before {
  content: '';
  width: 3px;
  height: 11px;
  border-radius: 2px;
  background: linear-gradient(180deg, #00f0ff, #a855f7);
  box-shadow: 0 0 6px var(--cyan);
}
.mp-opts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.mp-opt {
  padding: 8px 16px;
  border-radius: 9px;
  border: 1px solid rgba(0, 240, 255, 0.25);
  background: rgba(0, 240, 255, 0.05);
  color: var(--dim);
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  font-weight: 600;
  letter-spacing: 1px;
}
.mp-opt:hover {
  color: var(--cyan);
  border-color: var(--cyan);
}
.mp-opt.active {
  color: #02101a;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: transparent;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
  font-weight: 700;
}
.mp-field input {
  width: 100%;
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(0, 240, 255, 0.25);
  background: rgba(6, 10, 26, 0.7);
  color: var(--txt);
  padding: 0 14px;
  font-family: var(--font-b);
  font-size: 14px;
  outline: none;
  transition: 0.2s;
}
.mp-field input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
.modal-foot {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 4px;
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

@media (max-width: 760px) {
  .cart-wrap {
    max-width: 100%;
  }
  .col-head {
    display: none;
  }
  .citem {
    grid-template-columns: 26px 56px 1fr 30px;
    grid-template-rows: auto auto;
    row-gap: 10px;
  }
  .citem .cicon {
    grid-column: 2;
    grid-row: 1;
  }
  .citem .cinfo {
    grid-column: 3;
    grid-row: 1;
  }
  .citem .cdel {
    grid-column: 4;
    grid-row: 1;
  }
  .citem .cprice {
    grid-column: 2;
    grid-row: 2;
    text-align: left;
  }
  .citem .cqty {
    grid-column: 3;
    grid-row: 2;
    justify-self: start;
  }
  .citem .csub {
    grid-column: 3;
    grid-row: 2;
    justify-self: end;
  }
  .sum-panel {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 16px;
  }
  .sum-panel .checkout {
    width: 100%;
  }
  .sum-stats {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
