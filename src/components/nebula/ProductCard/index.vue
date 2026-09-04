<template>
  <div class="pcard" @click="goDetail">
    <div class="pimg">
      <span v-if="product.tag" class="tag" :class="product.tagType || 'red'">
        {{ product.tag }}
      </span>
      <img v-if="product.image" :src="product.image" alt="" class="pimg-real" />
      <div v-else class="ph" :class="product.phClass || ''">
        <span v-if="product.icon?.length === 1">{{ product.icon }}</span>
        <template v-else>{{ product.icon }}</template>
      </div>
    </div>
    <div class="pinfo">
      <div class="pcat">{{ product.category || product.pcat }}</div>
      <div class="pname">
        <span v-if="nameHasHighlight" v-html="product.name"></span>
        <template v-else>{{ product.name }}</template>
      </div>
      <div class="rating">
        <span class="stars">{{ starsText }}</span>
        <span class="score">{{ product.score ?? '4.9' }}</span>
        <span v-if="product.sales">· 已售 {{ product.sales }}</span>
      </div>
      <div class="pfoot">
        <div class="price">
          <small>¥</small>
          {{ priceText }}
          <span v-if="product.oldPrice" class="old">
            ¥{{ product.oldPrice }}
          </span>
        </div>
        <button
          v-if="seckill"
          class="addbtn kill"
          :disabled="
            queueing || product.soldOut || product.offShelf || product.reserve
          "
          @click.stop="handleKill"
        >
          {{ killText }}
          <span class="addbtn-tip">{{ killText }}</span>
        </button>
        <button
          v-else
          class="addbtn"
          aria-label="加入购物车"
          @click.stop="handleAdd"
        >
          ＋
          <span class="addbtn-tip">加入购物车</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import useCartStore from '@/store/modules/cart'
import { reqAddToCart } from '@/api/cart'
import { seckillKillWithQueue } from '@/utils/seckillQueue'
import message from '@/utils/message'

// 商品卡片数据结构（兼容后端商品/搜索返回字段）
export interface ProductCardItem {
  id?: string | number
  skuId?: string | number
  name: string
  category?: string
  pcat?: string
  icon?: string
  image?: string
  phClass?: string
  tag?: string
  tagType?: 'red' | 'grn' | 'blu'
  score?: number | string
  sales?: string
  price: number | string
  oldPrice?: number | string
  /** 秒杀模式：killId = promotionSessionId-skuId，randomCode 为秒杀随机码 */
  killId?: string
  randomCode?: string
  /** 已售罄：按钮置灰不可点击 */
  soldOut?: boolean
  /** 已下架：按钮置灰不可点击（与售罄区分文案） */
  offShelf?: boolean
  /** 预约中（场次未开始）：按钮显示「预约」置灰 */
  reserve?: boolean
}

const props = defineProps<{
  product: ProductCardItem
  /** 秒杀卡片：加号变为立即秒杀，点击直接下单进支付 */
  seckill?: boolean
}>()

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const queueing = ref(false)

const priceText = computed(() =>
  Number(props.product.price).toLocaleString('zh-CN'),
)
// 秒杀按钮文案（按钮与悬浮气泡共用）
const killText = computed(() => {
  const p = props.product
  return queueing.value
    ? '排队中…'
    : p.reserve
      ? '预约'
      : p.offShelf
        ? '已下架'
        : p.soldOut
          ? '已抢完'
          : '立即秒杀'
})
// 搜索高亮：标题含 <em class="hl"> 时用 v-html 渲染
const nameHasHighlight = computed(() => props.product.name.includes('<em'))
const starsText = computed(() => {
  const score = Number(props.product.score ?? 4.9)
  const full = Math.round(score)
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full))
})

function goDetail() {
  const skuId = props.product.skuId ?? props.product.id
  if (skuId !== undefined && skuId !== null && skuId !== '') {
    // 秒杀卡片跳秒杀详情（参数/细节图），普通商品跳商品详情
    const target = props.seckill ? '/seckillDetail' : '/details'
    router.push({ path: target, query: { skuId: String(skuId) } })
  }
}

async function handleAdd() {
  const skuId = props.product.skuId ?? props.product.id
  if (skuId === undefined || skuId === null || skuId === '') {
    message.info('该商品暂不支持加购')
    return
  }
  if (!userStore.token) {
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath },
    })
    return
  }
  try {
    await reqAddToCart({ skuId: String(skuId), num: 1 })
    message.success('已加入购物车 ✓')
    await cartStore.refreshCartCount()
  } catch (e) {
    message.error((e as Error).message || '加购失败')
  }
}

// 秒杀直购：默认数量 1，无需选参数；淘宝式排队——kill 扣库存后异步建单，轮询到订单落库才跳支付
async function handleKill() {
  if (!userStore.token) {
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath },
    })
    return
  }
  const { killId, randomCode } = props.product
  if (!killId || !randomCode) {
    message.info('秒杀未开始或已结束')
    return
  }
  if (props.product.reserve) {
    message.info('该场次尚未开始，可先预约')
    return
  }
  if (props.product.offShelf) {
    message.info('该商品已下架')
    return
  }
  if (props.product.soldOut) {
    message.info('该商品已抢完')
    return
  }
  if (queueing.value) return
  queueing.value = true
  try {
    const orderSn = await seckillKillWithQueue({
      killId,
      key: randomCode,
      num: 1,
    })
    if (orderSn) {
      message.success('⚡ 抢购成功！正在跳转收银台…')
      // 带上商品信息：秒杀单 MQ 异步落库，收银台明细可能未补全，由 pay 页兜底展示
      router.push({
        path: '/pay',
        query: {
          orderSn,
          skuId: String(props.product.skuId ?? ''),
          name: props.product.name || '',
          image: props.product.image || '',
          price: String(props.product.price ?? ''),
        },
      })
    } else {
      message.error('手慢了，抢购失败或订单生成超时')
    }
  } catch (e) {
    message.error((e as Error).message || '秒杀失败，稍后再试')
  } finally {
    queueing.value = false
  }
}
</script>

<style scoped>
.pimg-real {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* 搜索命中词高亮（v-html 注入的内容需要 :deep） */
.pname :deep(.hl) {
  color: var(--cyan);
  font-style: normal;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.7);
}
</style>
