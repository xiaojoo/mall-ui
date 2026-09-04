<template>
  <div class="nb-details">
    <div class="wrap">
      <!-- ===== 面包屑 ===== -->
      <div class="crumbs">
        <router-link to="/">Nebula Home</router-link>
        <span class="sep">/</span>
        <router-link to="/list">全部商品</router-link>
        <span class="sep">/</span>
        <span class="cur">{{ curCrumb }}</span>
      </div>

      <div class="pd-layout">
        <!-- ===== 细节图画廊 ===== -->
        <div class="g-col">
          <div ref="gMainRef" class="g-main">
            <span class="g-tag">-{{ discount }}%</span>
            <canvas ref="mainCvRef" width="520" height="420"></canvas>
            <div ref="zoomMaskRef" class="zoom-mask"></div>
            <span class="g-zoom">◉ 悬停查看放大细节</span>
          </div>
          <div class="g-thumbs-wrap">
            <button
              class="gt-arrow l"
              :class="{ show: thumbsScrollable }"
              :disabled="thumbsAtStart"
              @click="scrollThumbs(-320)"
            >
              ◀
            </button>
            <div ref="thumbsRef" class="g-thumbs" @scroll="updateArrows">
              <div
                v-for="(v, i) in viewList"
                :key="i"
                class="g-thumb"
                :class="{ active: view === i }"
                @click="switchView(i)"
              >
                <canvas ref="thumbCvs" :width="96" :height="88"></canvas>
                <div class="gt-l">{{ v.d.split(' · ')[0] }}</div>
              </div>
            </div>
            <button
              class="gt-arrow r"
              :class="{ show: thumbsScrollable }"
              :disabled="thumbsAtEnd"
              @click="scrollThumbs(320)"
            >
              ▶
            </button>
          </div>
          <!-- 京东式放大预览 -->
          <div ref="lensRef" class="zoom-lens">
            <div class="zl-hint">
              <div class="ic">◉</div>
              悬停主图 · 量子放大预览
            </div>
            <canvas ref="lensCvRef" width="560" height="452"></canvas>
            <div class="zl-l">×2.8 量子放大预览</div>
          </div>
        </div>

        <!-- ===== 销售信息 ===== -->
        <div ref="pdInfoRef" class="pd-info">
          <div class="pd-shop">
            <span class="si">
              <img v-if="shopLogo" :src="shopLogo" alt="" class="si-img" />
              <span v-else>◈</span>
            </span>
            <router-link
              v-if="shopBrandId"
              class="sl shop-link"
              :to="{ path: '/shop', query: { brandId: shopBrandId } }"
              title="进入店铺"
            >
              {{ shopName }}
            </router-link>
            <span v-else class="sl">{{ shopName }}</span>
            <span class="sc">量子直营 · 正品保障</span>
          </div>
          <h1 class="pd-name">{{ productName }}</h1>
          <div class="pd-sub">{{ productSub }}</div>
          <div class="pd-rate">
            <span class="stars">{{ starsText }}</span>
            <span class="score">{{ productScore }}</span>
            <span class="sep"></span>
            <span>
              评价
              <b>{{ reviewCount }}</b>
            </span>
            <span class="sep"></span>
            <span>
              已售
              <b>{{ salesText }}</b>
            </span>
            <span class="sep"></span>
            <span>
              好评率
              <b>98%</b>
            </span>
          </div>
          <div class="pd-price">
            <span class="now">
              <small>¥</small>
              {{ fmt(nowPrice) }}
            </span>
            <span class="old">¥{{ fmt(oldPrice) }}</span>
            <span class="disc-tag">-{{ discount }}%</span>
            <div class="ver-extra">
              当前配置：
              <b>{{ curConfigText }}</b>
            </div>
          </div>
          <div class="pd-attr">
            <!-- API 销售属性（配色 / 版本等动态组） -->
            <template v-if="saleAttrRows.length">
              <div v-for="sa in saleAttrRows" :key="sa.attrId" class="row">
                <div class="al">{{ sa.attrName }}</div>
                <div class="opts">
                  <div
                    v-for="v in sa.attrValues"
                    :key="v"
                    class="pd-opt"
                    :class="{ active: selAttrVal(sa.attrId) === v }"
                    @click="pickAttrVal(sa.attrId, v)"
                  >
                    {{ v }}
                  </div>
                </div>
              </div>
            </template>
            <!-- 兜底 mock 配色 / 版本 -->
            <template v-else>
              <div class="row">
                <div class="al">配色</div>
                <div class="opts">
                  <div
                    v-for="o in COLORS"
                    :key="o.n"
                    class="pd-opt"
                    :class="{ active: selColor === o.n }"
                    @click="pickColor(o.n)"
                  >
                    <span class="dot" :style="{ background: o.c }"></span>
                    {{ o.n }}
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="al">版本</div>
                <div class="opts">
                  <div
                    v-for="o in VERS"
                    :key="o.n"
                    class="pd-opt"
                    :class="{ active: selVer === o.n }"
                    @click="pickVer(o.n)"
                  >
                    {{ o.n }}
                    <small
                      v-if="o.extra > 0"
                      style="font-size: var(--font-size-xs); opacity: 0.8"
                    >
                      +¥{{ o.extra }}
                    </small>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div class="pd-qty">
            <div class="al">数量</div>
            <div class="qty-box">
              <button @click="qty > 1 && qty--">−</button>
              <span>{{ qty }}</span>
              <button @click="qty++">＋</button>
            </div>
          </div>
          <div class="pd-svc">
            <span>
              <b>✓</b>
              正品保障
            </span>
            <span>
              <b>⚡</b>
              2 小时极速达
            </span>
            <span>
              <b>⟲</b>
              7 星无理由退换
            </span>
            <span>
              <b>🛡</b>
              量子加密支付
            </span>
          </div>
          <div class="pd-acts">
            <button class="favor" :class="{ on: fav }" @click="toggleFav">
              {{ fav ? '♥' : '♡' }}
            </button>
            <button class="pd-btn cart" @click="addCart">⟡ 加入购物车</button>
            <button class="pd-btn buy" @click="buyNow">立即购买 ⟶</button>
          </div>
        </div>
      </div>

      <!-- ===== 详情页签 ===== -->
      <div class="pd-tabs">
        <div
          class="pd-tab"
          :class="{ active: tab === 'detail' }"
          @click="tab = 'detail'"
        >
          商品详情
        </div>
        <div
          class="pd-tab"
          :class="{ active: tab === 'spec' }"
          @click="tab = 'spec'"
        >
          规格参数
        </div>
        <div
          class="pd-tab"
          :class="{ active: tab === 'svc' }"
          @click="tab = 'svc'"
        >
          售后保障
        </div>
        <div
          class="pd-tab"
          :class="{ active: tab === 'rev' }"
          @click="tab = 'rev'"
        >
          商品评论
          <span class="cnt">({{ topReviews.length }})</span>
        </div>
      </div>

      <div v-show="tab === 'detail'" class="pd-tabpane active">
        <!-- 接口 spu 介绍图（decript 逗号拼接的图片地址） -->
        <div v-if="detailImages.length" class="detail-imgs">
          <div v-for="(u, i) in detailImages" :key="i" class="detail-img">
            <img
              :src="u"
              :alt="`商品介绍图${i + 1}`"
              loading="lazy"
              class="detail-img-real"
            />
          </div>
        </div>
        <!-- 无图回退全息 canvas 详情图 -->
        <div v-else class="detail-imgs">
          <div v-for="(d, i) in DETAILS" :key="i" class="detail-img">
            <canvas ref="detailCvs" :width="900" :height="340"></canvas>
            <div class="di-c">
              <span class="t">{{ d.t }}</span>
              <span class="d">{{ d.d }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-show="tab === 'spec'" class="pd-tabpane active">
        <!-- 规格参数：分类全量参数 + 商品已有值 + 销售属性选中值（对齐原 mall-ui 逻辑） -->
        <template v-if="specEntries.length">
          <table class="spec-table">
            <tr v-for="(e, i) in specEntries" :key="i">
              <td>{{ e.name }}</td>
              <td>{{ e.value }}</td>
            </tr>
          </table>
        </template>
        <!-- 无接口数据回退 mock 规格 -->
        <table v-else class="spec-table">
          <tr v-for="row in specRows" :key="row[0]">
            <td>{{ row[0] }}</td>
            <td>{{ row[1] }}</td>
          </tr>
        </table>
      </div>
      <div v-show="tab === 'svc'" class="pd-tabpane active">
        <div class="svc-grid">
          <div v-for="s in SVCS" :key="s.t" class="svc-item">
            <div class="si">{{ s.i }}</div>
            <div class="st">{{ s.t }}</div>
            <div class="sd">{{ s.d }}</div>
          </div>
        </div>
      </div>
      <div v-show="tab === 'rev'" class="pd-tabpane active">
        <!-- 发表评论（仅购买并支付成功后可评价） -->
        <div v-if="canComment" class="rev-write">
          <div class="rw-head">
            <div class="rw-av">
              <img v-if="myAvatarUrl" :src="myAvatarUrl" alt="头像" />
              <span v-else>{{ myAvatarText }}</span>
            </div>
            <div class="rw-info">
              <div class="rw-name">
                {{ myName }}
                <span class="rw-mode" :class="writeMode">
                  {{ writeModeText }}
                </span>
              </div>
              <div class="rw-stars">
                <span
                  v-for="s in 5"
                  :key="s"
                  class="rw-star"
                  :class="{ on: writeStars >= s }"
                  @click="writeStars = s"
                >
                  ★
                </span>
                <span class="rw-star-tip">{{ starTip }}</span>
              </div>
            </div>
          </div>
          <div v-if="writeMode === 'full'" class="rw-full">
            ⚠ 你已评价 2 条，达上限，可回复其他买家继续交流
          </div>
          <textarea
            v-model.trim="writeContent"
            maxlength="300"
            id="review-write-input"
            name="reviewContent"
            class="rw-input"
            :disabled="writeMode === 'full'"
            :placeholder="writePlaceholder"
          ></textarea>
          <div class="rw-imgs">
            <div v-for="(u, i) in writeImages" :key="u" class="rw-img">
              <img :src="u" alt="评论图片预览" />
              <button
                class="rw-img-del"
                title="移除"
                @click="writeImages.splice(i, 1)"
              >
                ✕
              </button>
            </div>
            <label
              v-if="writeImages.length < MAX_WRITE_IMGS && !uploading"
              class="rw-img-add"
            >
              <input
                type="file"
                name="reviewImages"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                hidden
                @change="onWriteImgChange"
              />
              <span>📷</span>
              <small>图片</small>
            </label>
            <span v-if="uploading" class="rw-uploading">✦ 上传中…</span>
          </div>
          <div class="rw-foot">
            <span class="rw-tag">⚙ {{ curConfigText }}</span>
            <span class="rw-count">{{ writeContent.length }}/300</span>
            <button
              class="rw-btn"
              :disabled="
                submitting || uploading || !writeContent || writeMode === 'full'
              "
              @click="submitComment"
            >
              {{ submitting ? '✦ 发表中…' : writeBtnText }}
            </button>
          </div>
        </div>
        <!-- 未购买/未登录：不可评价提示 -->
        <div v-else class="rev-locked" @click="goLoginIfNeeded">
          <span class="rl-ic">🔒</span>
          <div>
            <div class="rl-t">{{ paidCheckText }}</div>
            <div class="rl-s">购买并支付成功后才能评价该商品</div>
          </div>
        </div>

        <div class="rev-sum">
          <div class="big">
            <div class="n">{{ revSummary.score }}</div>
            <div class="l">综合评分</div>
          </div>
          <div class="rev-bars">
            <div v-for="(bar, i) in revSummary.bars" :key="i" class="rev-bar">
              <span>{{ bar[0] }}★</span>
              <div class="b"><i :style="{ width: bar[1] + '%' }"></i></div>
              <span>{{ bar[1] }}%</span>
            </div>
          </div>
        </div>
        <div class="rev-filters">
          <div
            v-for="f in revFilters"
            :key="f.key"
            class="rev-f"
            :class="{ active: revFilter === f.key }"
            @click="setRevFilter(f.key)"
          >
            {{ f.label }}
          </div>
        </div>
        <div class="rev-list">
          <div v-for="(r, i) in filteredReviews" :key="i" class="rev-card">
            <div class="rev-top">
              <div class="rev-av">
                <img v-if="r.avImg" :src="r.avImg" alt="头像" />
                <span v-else>{{ r.av }}</span>
              </div>
              <div>
                <div class="rev-name">{{ r.name }}</div>
                <div class="rev-stars">
                  {{ '★'.repeat(r.stars) }}{{ '☆'.repeat(5 - r.stars) }}
                </div>
              </div>
              <span class="rev-type" :class="r.typeClass">
                {{ r.typeText }}
              </span>
              <span v-if="r.isAdditional" class="rev-add">追加</span>
              <span v-if="r.attr" class="rev-attr">{{ r.attr }}</span>
              <span class="rev-time">{{ r.time }}</span>
            </div>
            <div class="rev-content">{{ r.content }}</div>
            <div v-if="r.resources.length" class="rev-img">
              <img
                v-for="(u, j) in r.resources"
                :key="j"
                :src="u"
                :alt="`评论图片${j + 1}`"
                loading="lazy"
              />
            </div>
            <div v-else class="rev-img">
              <i></i>
              <i></i>
            </div>
            <div class="rev-help">
              <span :class="{ liked: isLiked(r) }" @click="likeComment(r)">
                {{ isLiked(r) ? '👍 已赞' : '👍 有用' }} ({{ r.help }})
              </span>
              <span @click="openReply(r)">
                💬 回复 ({{ Math.max(r.replyCount, repliesOf(r.id).length) }})
              </span>
              <span @click="openReport(r)">📋 举报</span>
            </div>
            <!-- 回复输入框（单开） -->
            <div
              v-if="replyTarget && replyTarget.id === r.id"
              class="rev-reply-box"
            >
              <textarea
                :ref="setReplyInputEl"
                v-model.trim="replyText"
                maxlength="200"
                rows="2"
                name="replyContent"
                :placeholder="`回复 @${r.name}…`"
              ></textarea>
              <div class="rr-foot">
                <span class="rr-count">{{ replyText.length }}/200</span>
                <button class="rr-btn ghost" @click="replyTarget = null">
                  取消
                </button>
                <button
                  class="rr-btn"
                  :disabled="replySending || !replyText"
                  @click="submitReply"
                >
                  {{ replySending ? '发送中…' : '发送' }}
                </button>
              </div>
            </div>
            <!-- 嵌套回复列表 -->
            <div v-if="repliesOf(r.id).length" class="rev-replies">
              <div v-for="rp in repliesOf(r.id)" :key="rp.id" class="rev-reply">
                <div class="rr-top">
                  <div class="rr-av">
                    <img v-if="rp.avImg" :src="rp.avImg" alt="头像" />
                    <span v-else>{{ rp.av }}</span>
                  </div>
                  <div class="rr-name">{{ rp.name }}</div>
                  <span class="rr-time">{{ rp.time }}</span>
                </div>
                <div class="rr-content">{{ rp.content }}</div>
              </div>
            </div>
          </div>
        </div>
        <!-- 评论分页（仅多页时展示） -->
        <div
          v-if="reviewList.length > 0 && commentTotalPages > 1"
          class="rev-pag"
        >
          <span class="rp-info">
            共 {{ topReviews.length }} 条 · {{ commentTotalPages }} 页
          </span>
          <button
            class="rp-btn"
            :disabled="commentPage <= 1"
            @click="goCommentPage(commentPage - 1)"
          >
            ◀
          </button>
          <button
            v-for="p in commentPageWindow"
            :key="p"
            class="rp-btn"
            :class="{ active: p === commentPage }"
            @click="goCommentPage(p)"
          >
            {{ p }}
          </button>
          <button
            class="rp-btn"
            :disabled="commentPage >= commentTotalPages"
            @click="goCommentPage(commentPage + 1)"
          >
            ▶
          </button>
        </div>
        <div v-if="filteredReviews.length === 0" class="rev-empty show">
          NO SIGNAL · 该分类下暂无评论
        </div>
      </div>

      <!-- ===== 举报弹窗 ===== -->
      <div
        v-if="reportTarget"
        class="modal-mask"
        @click.self="reportTarget = null"
      >
        <div class="modal">
          <div class="modal-head">
            <h3>
              📋 举报评论
              <small>REPORT · 量子安全中心</small>
            </h3>
            <button class="modal-close" @click="reportTarget = null">✕</button>
          </div>
          <div class="rp-txt">
            举报「
            <b>{{ reportTarget.name }}</b>
            」的这条评论，请选择举报原因：
          </div>
          <div class="rp-reasons">
            <div
              v-for="rs in REPORT_REASONS"
              :key="rs"
              class="rp-reason"
              :class="{ active: reportReason === rs }"
              @click="reportReason = rs"
            >
              {{ rs }}
            </div>
          </div>
          <div class="modal-foot">
            <button class="mbtn ghost" @click="reportTarget = null">
              取消
            </button>
            <button
              class="mbtn primary"
              :disabled="reporting || !reportReason"
              @click="submitReport"
            >
              {{ reporting ? '提交中…' : '✓ 提交举报' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ===== 相关推荐 ===== -->
      <section class="sec">
        <div class="sec-head">
          <div class="sec-title">
            <h2>
              🧿 看了又看
              <small>YOU MAY ALSO LIKE · 量子引擎推荐</small>
            </h2>
          </div>
        </div>
        <div class="prod-grid">
          <ProductCard v-for="p in related" :key="String(p.id)" :product="p" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '@/components/nebula/ProductCard/index.vue'
import { MOCK_PRODUCTS } from '@/constants/mock'
import { drawProduct, drawThumb } from '@/utils/nebula-canvas'
import {
  reqProductDetail,
  reqAttrGroupWithAttr,
  reqCommentList,
  reqCommentSave,
  reqCommentUpdate,
  reqCommentReportSave,
  reqCommentPaidCheck,
  reqUploadImage,
} from '@/api/product'
import { reqAddToCart } from '@/api/cart'
import { reqFavDeleteBySpu, reqFavSave, reqFavStatus } from '@/api/favorites'
import useUserStore from '@/store/modules/user'
import useCartStore from '@/store/modules/cart'
import useFavoritesStore from '@/store/modules/favorites'
import message from '@/utils/message'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const favStore = useFavoritesStore()
const cartStore = useCartStore()

// ===== 商品数据（mock 默认，接口有值则覆盖） =====
const COLORS = [
  { n: '星云蓝', c: '#00f0ff' },
  { n: '霓虹紫', c: '#a855f7' },
  { n: '幻影绿', c: '#39ff88' },
  { n: '赛博红', c: '#ff2ec4' },
]
const VERS = [
  { n: '标准版', extra: 0 },
  { n: '旗舰版', extra: 500 },
  { n: '星际版', extra: 2000 },
]
const BASE = ref(899)
const OLD = ref(2999)

const productName = ref('全息投影腕带 HX-7 星际版')
const productSub = ref('量子微投影 · 星域网 6G · 96 小时续航 · 钛合金纳米机身')

// 店铺品牌 id（详情接口 info.brandId，用于跳转店铺页）
const shopBrandId = ref<number | null>(null)
// 店铺名（详情接口 brandName；接口缺失时保留兜底文案）
const shopName = ref('NEBULA 星环官方旗舰店')
// 店铺 logo（详情接口 brandLogo，作为店铺图标）
const shopLogo = ref('')
const productScore = ref('4.9')
const salesText = ref('2.1w')
const reviewCount = computed(() =>
  topReviews.value.length > 0 ? `${topReviews.value.length}+` : '0',
)
const curCrumb = ref('全息设备 · 全息投影腕带 HX-7 星际版')

const selColor = ref('星云蓝')
const selVer = ref('标准版')
function pickColor(n: string) {
  selColor.value = n
  syncPrice()
}

function pickVer(n: string) {
  selVer.value = n
  syncPrice()
}

// ===== API 销售属性（配色 / 版本等动态组） =====
interface SaleAttrRow {
  attrId: number
  attrName: string
  attrValues: string[]
}
const saleAttrRows = ref<SaleAttrRow[]>([])
const selectedAttrs = ref<Record<number, string>>({})

function selAttrVal(attrId: number) {
  return selectedAttrs.value[attrId] || ''
}

function pickAttrVal(attrId: number, v: string) {
  selectedAttrs.value[attrId] = v
}

const curConfigText = computed(() => {
  if (saleAttrRows.value.length > 0) {
    return saleAttrRows.value
      .map(
        (a) =>
          `${a.attrName}：${selAttrVal(a.attrId) || a.attrValues[0] || '—'}`,
      )
      .join(' · ')
  }
  return `${selColor.value} · ${selVer.value}`
})

const qty = ref(1)
const fav = ref(false)
const curSpuId = ref<number | string>('')

const nowPrice = computed(
  () => BASE.value + (VERS.find((v) => v.n === selVer.value)?.extra || 0),
)
const oldPrice = computed(
  () => OLD.value + (VERS.find((v) => v.n === selVer.value)?.extra || 0),
)
const discount = computed(() =>
  Math.round((1 - nowPrice.value / oldPrice.value) * 100),
)
const starsText = computed(
  () =>
    '★'.repeat(Math.round(Number(productScore.value) || 4)) +
    '☆'.repeat(5 - Math.round(Number(productScore.value) || 4)),
)

const fmt = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
function syncPrice() {
  /* 价格由 computed 自动联动 */
}

// ===== 画廊 =====
interface GalleryView {
  type: 'img' | 'canvas'
  url?: string
  c: string
  label: string
  rot: number
  zoom: number
  d: string
}

const VIEWS: GalleryView[] = [
  {
    type: 'canvas',
    c: '#00f0ff',
    label: 'HX-7',
    rot: -0.3,
    zoom: 1,
    d: '正面 · 全息屏幕',
  },
  {
    type: 'canvas',
    c: '#a855f7',
    label: 'HX-7',
    rot: 0.5,
    zoom: 1,
    d: '45° · 纳米机身',
  },
  {
    type: 'canvas',
    c: '#39ff88',
    label: 'HX-7',
    rot: -0.5,
    zoom: 1.5,
    d: '微距 · 量子核心',
  },
  {
    type: 'canvas',
    c: '#ff2ec4',
    label: 'HX-7',
    rot: 0.3,
    zoom: 1.35,
    d: '暗光 · 屏幕显示',
  },
  {
    type: 'canvas',
    c: '#00f0ff',
    label: 'HX-7',
    rot: 0.9,
    zoom: 1,
    d: '侧面 · 磁吸表带',
  },
  {
    type: 'canvas',
    c: '#a855f7',
    label: 'HX-7',
    rot: -0.9,
    zoom: 1,
    d: '俯视 · 表盘',
  },
  {
    type: 'canvas',
    c: '#39ff88',
    label: 'HX-7',
    rot: 2.1,
    zoom: 1.3,
    d: '翻转 · 量子芯',
  },
  {
    type: 'canvas',
    c: '#ff2ec4',
    label: 'HX-7',
    rot: -1.2,
    zoom: 1.15,
    d: '夜景 · 屏幕显示',
  },
]
const view = ref(0)

// 接口返回真实图片时优先展示（缩略图/主图都用图片），否则全息 canvas 绘制
const realImages = ref<string[]>([])
const viewList = computed<GalleryView[]>(() => {
  if (realImages.value.length > 0) {
    return realImages.value.map((url, i) => ({
      type: 'img' as const,
      url,
      c: '#00f0ff',
      label: `IMG-${i + 1}`,
      rot: 0,
      zoom: 1,
      d: `商品图片 ${i + 1}`,
    }))
  }
  return VIEWS
})

const mainCvRef = ref<HTMLCanvasElement | null>(null)
const gMainRef = ref<HTMLElement | null>(null)
const thumbsRef = ref<HTMLElement | null>(null)
const thumbCvs = ref<HTMLCanvasElement[]>([])
const lensRef = ref<HTMLElement | null>(null)
const lensCvRef = ref<HTMLCanvasElement | null>(null)
const zoomMaskRef = ref<HTMLElement | null>(null)
const pdInfoRef = ref<HTMLElement | null>(null)
const detailCvs = ref<HTMLCanvasElement[]>([])

const thumbsScrollable = ref(false)
const thumbsAtStart = ref(true)
const thumbsAtEnd = ref(false)
const ZOOM = 2.8
let lensRaf: number | null = null

function renderMain() {
  const v = viewList.value[view.value]
  const cv = mainCvRef.value
  if (!v || !cv) return
  if (v.type === 'img' && v.url) {
    drawImageToCanvas(cv, v.url)
  } else {
    drawProduct(cv, v.c, v.label, v.rot, v.zoom, v.d)
  }
}

function renderThumbs() {
  nextTick(() => {
    viewList.value.forEach((v, i) => {
      const cv = thumbCvs.value[i]
      if (!cv) return
      if (v.type === 'img' && v.url) drawImageToCanvas(cv, v.url)
      else drawThumb(cv, v.c, v.label, v.rot)
    })
    updateArrows()
  })
}

// 真实图片画到 canvas（cover 适配），复用现有放大镜/画布管线
const imgCache = new Map<string, HTMLImageElement>()
function drawImageToCanvas(cv: HTMLCanvasElement, url: string) {
  const ctx = cv.getContext('2d')
  if (!ctx) return
  const draw = (img: HTMLImageElement) => {
    ctx.clearRect(0, 0, cv.width, cv.height)
    const scale = Math.max(cv.width / img.width, cv.height / img.height)
    const dw = img.width * scale
    const dh = img.height * scale
    ctx.drawImage(img, (cv.width - dw) / 2, (cv.height - dh) / 2, dw, dh)
  }
  const cached = imgCache.get(url)
  if (cached?.complete && cached.naturalWidth > 0) {
    draw(cached)
    return
  }
  const img = new Image()
  img.onload = () => {
    imgCache.set(url, img)
    draw(img)
  }
  img.onerror = () => {
    drawProduct(cv, '#00f0ff', 'IMG', 0, 1, 'NO SIGNAL')
  }
  img.src = url
}

function updateArrows() {
  const box = thumbsRef.value
  if (!box) return
  thumbsScrollable.value = box.scrollWidth > box.clientWidth + 4
  thumbsAtStart.value = box.scrollLeft <= 0
  thumbsAtEnd.value = box.scrollLeft + box.clientWidth >= box.scrollWidth - 4
}

function scrollThumbs(delta: number) {
  thumbsRef.value?.scrollBy({ left: delta, behavior: 'smooth' })
}

function switchView(i: number) {
  view.value = i
  renderMain()
  hideLens()
}

// ===== 放大预览 =====
function sizeLens() {
  const i = pdInfoRef.value?.getBoundingClientRect()
  const lens = lensRef.value
  const lc = lensCvRef.value
  if (!i || !lens || !lc) return
  lens.style.left = i.left + 'px'
  lens.style.top = i.top + 'px'
  lens.style.width = i.width + 'px'
  lens.style.height = i.height + 'px'
  lc.width = Math.round(i.width)
  lc.height = Math.round(i.height)
}

function showLens() {
  sizeLens()
  lensRef.value?.classList.add('show')
  if (zoomMaskRef.value) zoomMaskRef.value.style.display = 'block'
}

function paintLens(x: number, y: number) {
  const cv = mainCvRef.value
  const lc = lensCvRef.value
  const mask = zoomMaskRef.value
  if (!cv || !lc || !mask) return
  const lensCtx = lc.getContext('2d')
  if (!lensCtx) return
  const b = cv.getBoundingClientRect()
  const mx = x - b.left
  const my = y - b.top
  const iw = cv.width
  const ih = cv.height
  const sx = (mx / b.width) * iw
  const sy = (my / b.height) * ih
  const lw = iw / ZOOM
  const lh = ih / ZOOM
  const ox = Math.max(0, Math.min(sx - lw / 2, iw - lw))
  const oy = Math.max(0, Math.min(sy - lh / 2, ih - lh))
  lensCtx.clearRect(0, 0, lc.width, lc.height)
  lensCtx.imageSmoothingEnabled = true
  const scale = Math.max(lc.width / lw, lc.height / lh)
  const dw = lw * scale
  const dh = lh * scale
  lensCtx.drawImage(
    cv,
    ox,
    oy,
    lw,
    lh,
    (lc.width - dw) / 2,
    (lc.height - dh) / 2,
    dw,
    dh,
  )
  const mw = (lw / iw) * b.width
  const mh = (lh / ih) * b.height
  mask.style.width = mw + 'px'
  mask.style.height = mh + 'px'
  mask.style.left = (ox / iw) * b.width + 'px'
  mask.style.top = (oy / ih) * b.height + 'px'
}

function hideLens() {
  if (lensRaf) {
    cancelAnimationFrame(lensRaf)
    lensRaf = null
  }
  lensRef.value?.classList.remove('show')
  if (zoomMaskRef.value) zoomMaskRef.value.style.display = 'none'
}

// 滚轮滚动：鼠标已不在原大图位置，立即收起放大镜（防止弹框追着滚动位移）
function onWheel() {
  hideLens()
}

// 兜底：页面/容器发生滚动（滚动条拖拽、键盘滚动等）时同样收起
function onPageScroll() {
  if (lensRef.value?.classList.contains('show')) hideLens()
}

function onMouseMove(e: MouseEvent) {
  const lens = lensRef.value
  if (!lens) return
  if (!lens.classList.contains('show')) {
    sizeLens()
    lens.classList.add('show')
    // 首次悬停可能因鼠标已在大图上而错过 mouseenter，这里同样要亮出方框
    if (zoomMaskRef.value) zoomMaskRef.value.style.display = 'block'
  }
  if (!lensRaf) {
    lensRaf = requestAnimationFrame(() => {
      paintLens(e.clientX, e.clientY)
      lensRaf = null
    })
  }
}

// ===== 详情大图 / 规格 / 售后 =====
const DETAILS = [
  {
    c: '#00f0ff',
    label: 'HX-7',
    rot: -0.3,
    zoom: 1,
    t: '流线型机身 · 正面视角',
    d: '钛合金纳米机身 · 厚度仅 11mm',
  },
  {
    c: '#a855f7',
    label: 'HX-7',
    rot: 0.5,
    zoom: 1,
    t: '人体工学 · 45° 视角',
    d: '磁吸快拆表带 · 多场景佩戴',
  },
  {
    c: '#39ff88',
    label: 'HX-7',
    rot: -0.4,
    zoom: 1.6,
    t: '量子核心 · 微距细节',
    d: 'Q1 量子芯片 · 96 小时续航',
  },
]
const specRows = ref<string[][]>([
  ['品牌', 'NEBULA · 星环官方'],
  ['型号', 'HX-7 星际版'],
  ['配色', '星云蓝'],
  ['版本', '标准版'],
  ['屏幕', '全息微投影 · 3000nit'],
  ['芯片', '量子核心 Q1 双核'],
  ['续航', '96 小时 · 快充 10 分钟'],
  ['尺寸', '42 × 38 × 11 mm'],
  ['重量', '58g'],
  ['材质', '钛合金 + 纳米玻璃'],
  ['防护', 'IP68 · 星尘级防水'],
  ['连接', '星域网 6G · 蓝牙 6.0'],
  ['支付', '脑波支付 · NFC 量子闪付'],
])
const SVCS = [
  { i: '🛡', t: '正品保障', d: '官方直营 · 假一赔十 · 量子溯源芯片验证' },
  { i: '⚡', t: '极速配送', d: '城市 2 小时达 · 跨星 48 小时 · 全程轨道追踪' },
  { i: '⟲', t: '7 星无理由退换', d: '签收后 7 日内无理由退换 · 运费全免' },
  { i: '🧠', t: '脑波质保', d: '整机 3 年量子质保 · 屏幕永久免费换新' },
  { i: '✉', t: '专属客服', d: '7×24h 量子客服 · 5 分钟极速响应' },
  { i: '🔒', t: '隐私加密', d: '数据 AES-4096 加密 · 本地存储不云传' },
]

// ===== 评论（接口加载，无数据保持空态） =====
interface Review {
  id: number | string
  name: string
  av: string
  avImg: string
  stars: number
  time: string
  attr: string
  content: string
  help: number
  replyCount: number
  resources: string[]
  typeText: string
  typeClass: string
  parentId: number | string | null
  isReply: boolean
  isAdditional: boolean
}
const reviewList = ref<Review[]>([])
// 顶级评论（过滤回复，分页/筛选/汇总均基于顶级评论）
const topReviews = computed(() => reviewList.value.filter((r) => !r.isReply))
const repliesOf = (id: number | string) =>
  reviewList.value.filter((r) => r.isReply && String(r.parentId) === String(id))
// 汇总（评分 + 星级分布），有数据按真实计算，无数据保持默认
const revSummary = ref({
  score: '4.9',
  bars: [
    [5, 82],
    [4, 14],
    [3, 3],
    [2, 1],
    [1, 0],
  ] as number[][],
})
const revFilters = [
  { key: 'all', label: '全部' },
  { key: 'good', label: '好评' },
  { key: 'mid', label: '中评' },
  { key: 'bad', label: '差评' },
  { key: 'add', label: '追加' },
]
const revFilter = ref('all')

// 评论分页（前端分页：一次拉取上限 100 条，每页 5 条）
const COMMENT_PAGE_SIZE = 5
const commentPage = ref(1)
const commentTotalPages = computed(() =>
  Math.max(1, Math.ceil(topReviews.value.length / COMMENT_PAGE_SIZE)),
)
const commentPageWindow = computed(() => {
  const pages = commentTotalPages.value
  const win: number[] = []
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - commentPage.value) <= 1)
      win.push(i)
  }
  return win
})
function goCommentPage(p: number) {
  if (p < 1 || p > commentTotalPages.value) return
  commentPage.value = p
}
function setRevFilter(key: string) {
  revFilter.value = key
  commentPage.value = 1
}

const filteredReviews = computed(() => {
  const f = revFilter.value
  let all = topReviews.value
  if (f === 'add') {
    // 只看追加评论
    all = all.filter((r) => r.isAdditional)
  } else {
    // 追加评论不参与好评/中评/差评统计
    all = all.filter((r) => !r.isAdditional)
    if (f === 'good') all = all.filter((r) => r.stars >= 4)
    if (f === 'mid') all = all.filter((r) => r.stars === 3)
    if (f === 'bad') all = all.filter((r) => r.stars <= 2)
  }
  const start = (commentPage.value - 1) * COMMENT_PAGE_SIZE
  return all.slice(start, start + COMMENT_PAGE_SIZE)
})

async function loadComments(spuId?: number | string, skuId?: number | string) {
  try {
    const params: Record<string, unknown> = { page: 1, limit: 100 }
    if (spuId) params.spuId = spuId
    else if (skuId) params.skuId = skuId
    const res: any = await reqCommentList(params)
    if (res.code === 200) {
      const list: any[] = res.data?.list || []
      reviewList.value = list.map((c: any) => {
        const st = Number(c.star ?? 5)
        const icon = String(c.memberIcon || '')
        const isUrl = /^https?:\/\//.test(icon)
        return {
          id: c.id,
          name: c.memberNickName || '量子会员',
          av: isUrl ? '✦' : icon || '✦',
          avImg: isUrl ? icon : '',
          stars: st,
          time: String(c.createTime || '').slice(0, 10),
          attr: String(c.spuAttributes || ''),
          content: String(c.content || ''),
          help: Number(c.likesCount ?? 0),
          replyCount: Number(c.replyCount ?? 0),
          resources: parseCommentResources(c.resources),
          typeText: st >= 4 ? '好评' : st === 3 ? '中评' : '差评',
          typeClass: st >= 4 ? 'good' : st === 3 ? 'mid' : 'bad',
          parentId: c.parentId ? Number(c.parentId) : null,
          isReply: Number(c.commentType) === 1 || !!c.parentId,
          isAdditional: Number(c.commentType) === 2,
        }
      })
      commentPage.value = 1
      // 评分汇总：仅统计正式评论，追加评论（commentType=2）不参与
      const roots = topReviews.value.filter((r) => !r.isAdditional)
      if (roots.length > 0) {
        const n = roots.length
        const avg = roots.reduce((s, r) => s + r.stars, 0) / n
        const pct = (cnt: number) => Math.round((cnt / n) * 100)
        const bars: number[][] = []
        for (let st = 5; st >= 1; st--) {
          bars.push([st, pct(roots.filter((r) => r.stars === st).length)])
        }
        revSummary.value = { score: avg.toFixed(1), bars }
      }
    }
  } catch {
    /* 保持空态 */
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

// ===== 发表评论 =====
const writeStars = ref(5)
const writeContent = ref('')
const submitting = ref(false)

// 购买校验：仅购买并支付成功的商品可评价（后端 save 同样强制，fail-closed）
// 默认锁定，查询通过后才显示表单
const canComment = ref(false)
const paidCheckText = ref('购买并支付成功后才能评价该商品')

async function checkCanComment() {
  if (!curSkuId.value) return
  if (!userStore.token) {
    canComment.value = false
    paidCheckText.value = '登录后可评价该商品'
    return
  }
  try {
    const res: any = await reqCommentPaidCheck(curSkuId.value)
    canComment.value = !!res.data
    paidCheckText.value = '购买并支付成功后才能评价该商品'
  } catch {
    canComment.value = false // 接口异常默认不可评价
  }
}

function goLoginIfNeeded() {
  if (!userStore.token) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
  }
}

const starTip = computed(
  () =>
    [
      '',
      '差评 · 不太满意',
      '差评 · 有点失望',
      '中评 · 一般般',
      '好评 · 不错',
      '好评 · 超赞',
    ][writeStars.value] || '',
)

const myName = computed(() => userStore.username || '量子会员')
const myAvatarText = computed(() =>
  userStore.username ? userStore.username.slice(0, 1).toUpperCase() : '✦',
)
const myAvatarUrl = computed(() =>
  userStore.avatar && /^https?:\/\//.test(userStore.avatar)
    ? userStore.avatar
    : '',
)

// ===== 追加评论模式 =====
// 同一用户同一商品最多评价 2 条：第 1 条正式评论，第 2 条自动为追加评论（不参与评分/差评统计）
const myCommentCount = computed(
  () => topReviews.value.filter((r) => r.name === myName.value).length,
)
const writeMode = computed(() =>
  myCommentCount.value >= 2
    ? 'full'
    : myCommentCount.value === 1
      ? 'add'
      : 'new',
)
const writeModeText = computed(() =>
  writeMode.value === 'full'
    ? '已评价 2 条'
    : writeMode.value === 'add'
      ? '✚ 追加评论'
      : '',
)
const writePlaceholder = computed(() =>
  writeMode.value === 'add'
    ? '补充你的星际购物体验…（追加评论不参与评分统计）'
    : '分享你的星际购物体验…（300 字以内）',
)
const writeBtnText = computed(() =>
  writeMode.value === 'add' ? '✚ 追加评论' : '✦ 发表评论',
)

// ===== 评论图片上传（OSS 直传，同头像上传） =====
const MAX_WRITE_IMGS = 3
const writeImages = ref<string[]>([])
const uploading = ref(false)

async function onWriteImgChange(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = ''
  if (files.length === 0) return
  const remain = MAX_WRITE_IMGS - writeImages.value.length
  if (remain <= 0) {
    message.warning(`最多上传 ${MAX_WRITE_IMGS} 张图片`)
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
    uploading.value = true
    try {
      const res: any = await reqUploadImage(f)
      if (res.code === 200 && res.data) {
        writeImages.value.push(res.data)
      } else {
        message.error(res.message || '图片上传失败')
      }
    } catch (err) {
      message.error((err as Error).message || '图片上传失败，请重试')
    } finally {
      uploading.value = false
    }
  }
}

async function submitComment() {
  if (!userStore.token) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  const content = writeContent.value.trim()
  if (!content) {
    message.warning('请先写下你的评价内容')
    return
  }
  if (writeMode.value === 'full') {
    message.warning('你已评价 2 条，达上限')
    return
  }
  if (!curSpuId.value && !curSkuId.value) {
    message.warning('商品信息加载中，请稍候再试')
    return
  }
  submitting.value = true
  try {
    const res: any = await reqCommentSave({
      skuId: curSkuId.value ? Number(curSkuId.value) : null,
      spuId: curSpuId.value ? Number(curSpuId.value) : null,
      spuName: productName.value,
      memberNickName: myName.value,
      memberIcon: myAvatarUrl.value || '',
      star: writeStars.value,
      content,
      spuAttributes: buildAttrValues().join(';'),
      resources: writeImages.value.length
        ? JSON.stringify(
            writeImages.value.map((u) => ({ type: 'image', url: u })),
          )
        : '',
      // 第 2 条默认追加评论（后端同样强制，前端先行）
      commentType: writeMode.value === 'add' ? 2 : 0,
      showStatus: 1,
      likesCount: 0,
      replyCount: 0,
    })
    if (res.code === 200) {
      message.success(
        writeMode.value === 'add' ? '✓ 追加评论成功' : '✓ 评论发表成功',
      )
      writeContent.value = ''
      writeStars.value = 5
      writeImages.value = []
      loadComments(curSpuId.value || undefined, curSkuId.value || undefined)
    } else {
      message.error(res.message || '评论发表失败')
    }
  } catch {
    message.error('评论发表失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// ===== 点赞（有用） =====
// 会话内已赞集合，防止重复点赞
const likedIds = ref<Set<string>>(new Set())
const isLiked = (r: Review) => likedIds.value.has(String(r.id))

async function likeComment(r: Review) {
  if (isLiked(r)) return
  if (!userStore.token) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  likedIds.value.add(String(r.id))
  const prev = r.help
  r.help += 1
  try {
    const res: any = await reqCommentUpdate({ id: r.id, likesCount: r.help })
    if (res.code !== 200) throw new Error(res.message || '点赞失败')
  } catch {
    r.help = prev
    likedIds.value.delete(String(r.id))
    message.error('点赞失败，请稍后重试')
  }
}

// ===== 回复 =====
const replyTarget = ref<Review | null>(null)
const replyText = ref('')
const replySending = ref(false)
const replyInputEl = ref<HTMLTextAreaElement | null>(null)
function setReplyInputEl(el: unknown) {
  replyInputEl.value = (el as HTMLTextAreaElement | null) ?? null
}

function openReply(r: Review) {
  if (!userStore.token) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  replyTarget.value = r
  replyText.value = ''
  nextTick(() => replyInputEl.value?.focus())
}

async function submitReply() {
  const t = replyTarget.value
  if (!t) return
  const content = replyText.value.trim()
  if (!content) {
    message.warning('请先输入回复内容')
    return
  }
  replySending.value = true
  try {
    const res: any = await reqCommentSave({
      skuId: curSkuId.value ? Number(curSkuId.value) : null,
      spuId: curSpuId.value ? Number(curSpuId.value) : null,
      spuName: productName.value,
      parentId: t.id,
      memberNickName: myName.value,
      memberIcon: myAvatarUrl.value || '',
      content,
      showStatus: 1,
      likesCount: 0,
      replyCount: 0,
      commentType: 1,
    })
    if (res.code === 200) {
      // 父评论回复数 +1（失败不阻塞，列表重载时以实际为准）
      reqCommentUpdate({ id: t.id, replyCount: t.replyCount + 1 }).catch(
        () => {},
      )
      message.success('✓ 回复成功')
      replyTarget.value = null
      replyText.value = ''
      loadComments(curSpuId.value || undefined, curSkuId.value || undefined)
    } else {
      message.error(res.message || '回复失败')
    }
  } catch {
    message.error('回复失败，请稍后重试')
  } finally {
    replySending.value = false
  }
}

// ===== 举报 =====
const REPORT_REASONS = [
  '广告营销',
  '色情低俗',
  '人身攻击',
  '虚假信息',
  '违法有害',
  '其他',
]
const reportTarget = ref<Review | null>(null)
const reportReason = ref('')
const reporting = ref(false)

function openReport(r: Review) {
  if (!userStore.token) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  reportTarget.value = r
  reportReason.value = ''
}

async function submitReport() {
  const t = reportTarget.value
  if (!t) return
  if (!reportReason.value) {
    message.warning('请选择举报原因')
    return
  }
  reporting.value = true
  try {
    const res: any = await reqCommentReportSave({
      commentId: t.id,
      spuId: curSpuId.value ? Number(curSpuId.value) : null,
      spuName: productName.value,
      memberNickName: myName.value,
      reason: reportReason.value,
      status: 0,
    })
    if (res.code === 200) {
      message.success('✓ 举报已提交，平台将尽快处理')
      reportTarget.value = null
    } else {
      message.error(res.message || '举报提交失败')
    }
  } catch {
    message.error('举报提交失败，请稍后重试')
  } finally {
    reporting.value = false
  }
}

// ===== 页签 =====
const tab = ref('detail')

// ===== 相关推荐 =====
const related = MOCK_PRODUCTS.slice(0, 4)

// ===== 操作 =====
// 收藏时打包当前选择的商品参数（API 销售属性优先，兜底用配色/版本）
function buildFavParams(): string {
  if (saleAttrRows.value.length > 0) {
    const map: Record<string, string> = {}
    saleAttrRows.value.forEach((a) => {
      const v = selAttrVal(a.attrId) || a.attrValues[0] || ''
      if (v) map[a.attrName] = v
    })
    return JSON.stringify(map)
  }
  return JSON.stringify({ 配色: selColor.value, 版本: selVer.value })
}

// 从收藏页回跳：按参数名回显之前的商品选择（找不到对应项则忽略）
function applyFavParams(raw?: string) {
  if (!raw) return
  let map: Record<string, string>
  try {
    map = JSON.parse(raw)
  } catch {
    return
  }
  if (!map || typeof map !== 'object') return
  if (saleAttrRows.value.length > 0) {
    saleAttrRows.value.forEach((a) => {
      const v = map[a.attrName]
      if (v && a.attrValues.includes(v)) pickAttrVal(a.attrId, v)
    })
  } else {
    if (map['配色'] && COLORS.some((o) => o.n === map['配色'])) {
      selColor.value = map['配色']
    }
    if (map['版本'] && VERS.some((o) => o.n === map['版本'])) {
      selVer.value = map['版本']
    }
  }
}

async function toggleFav() {
  if (!userStore.token) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  if (!curSpuId.value) {
    message.info('商品信息加载中，请稍候再试')
    return
  }
  try {
    if (fav.value) {
      const res: any = await reqFavDeleteBySpu(curSpuId.value)
      if (res.code !== 200) {
        message.error(res.message || '取消收藏失败')
        return
      }
      fav.value = false
      message.info('已取消收藏')
      favStore.refreshFavCount()
    } else {
      const res: any = await reqFavSave({
        spuId: curSpuId.value,
        spuName: productName.value,
        spuImg: realImages.value[0] || '',
        skuParams: buildFavParams(),
      })
      if (res.code !== 200) {
        message.error(res.message || '收藏失败')
        return
      }
      fav.value = true
      message.success('✓ 已加入心愿单')
      favStore.refreshFavCount()
    }
  } catch {
    message.error('操作失败，请稍后重试')
  }
}

const curSkuId = computed(() => String(route.query.skuId || ''))

function buildAttrValues(): string[] {
  const parts: string[] = []
  if (saleAttrRows.value.length > 0) {
    saleAttrRows.value.forEach((a) => {
      const v = selAttrVal(a.attrId) || a.attrValues[0] || ''
      if (a.attrName && v) parts.push(`${a.attrName}：${v}`)
    })
  }
  if (parts.length === 0) {
    parts.push(`颜色：${selColor.value}`)
    parts.push(`版本：${selVer.value}`)
  }
  return parts
}

async function addCart() {
  if (!curSkuId.value) {
    message.warning('商品信息缺失，请从商品列表进入')
    return
  }
  if (!userStore.token) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  try {
    const res: any = await reqAddToCart({
      skuId: curSkuId.value,
      num: qty.value,
      skuAttrValues: buildAttrValues().join(';'),
    })
    if (res.code === 200) {
      message.success(
        `✓ 已加入量子购物舱 · ${curConfigText.value} ×${qty.value}`,
      )
      cartStore.refreshCartCount()
    } else {
      message.error(res.message || '加入购物车失败')
    }
  } catch (e) {
    message.error((e as Error).message || '加入购物车失败，请稍后重试')
  }
}

function buyNow() {
  if (!curSkuId.value) {
    message.warning('商品信息缺失，请从商品列表进入')
    return
  }
  if (!userStore.token) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  sessionStorage.setItem(
    'mall_buy_now',
    JSON.stringify({
      skuId: Number(curSkuId.value),
      num: qty.value,
      skuAttrValues: buildAttrValues(),
    }),
  )
  sessionStorage.setItem('mall_checkout_allowed', '1')
  router.push('/checkout')
}

// ===== 接口加载 =====
const specGroups = ref<
  Array<{
    groupName: string
    attrs: Array<{
      attrId: number | string
      attrName: string
      attrValue: string
    }>
  }>
>([])
// 分类全量规格参数（reqAttrGroupWithAttr），用于规格参数全量展示
const categoryAttrGroups = ref<any[]>([])
const detailHtml = ref('')

// 商品介绍图：desc.decript 以逗号拼接多个图片地址（兼容 <img> HTML）
const detailImages = computed(() => {
  const decript = detailHtml.value
  if (!decript) return []
  const htmlImgs = Array.from(
    decript.matchAll(/<img[^>]+src=["']([^"']+)["']/gi),
  ).map((m) => m[1])
  if (htmlImgs.length > 0) return htmlImgs
  return decript
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
})

// 规格参数（对齐原 mall-ui 逻辑）：
// 1. 分类全量参数逐条展示，商品有值填 API 值，没有显示 —
// 2. 销售属性显示选中值
// 3. 无分类全量参数时直接用商品已有规格（groupAttrs）
const specEntries = computed(() => {
  const entries: Array<{ name: string; value: string }> = []
  // 商品已有属性值映射 attrId -> attrValue（详情接口 groupAttrs）
  const productAttrMap: Record<string, string> = {}
  specGroups.value.forEach((g) => {
    g.attrs.forEach((a) => {
      if (a.attrId != null) productAttrMap[String(a.attrId)] = a.attrValue || ''
    })
  })
  // 分类全量参数（不显示分组名）
  const catGroups = categoryAttrGroups.value
  if (Array.isArray(catGroups) && catGroups.length > 0) {
    catGroups.forEach((group: any) => {
      ;(group.attrs || []).forEach((attr: any) => {
        if (attr && attr.attrName) {
          entries.push({
            name: String(attr.attrName),
            value: productAttrMap[String(attr.attrId)] || '—',
          })
        }
      })
    })
  } else {
    // 无分类全量参数时，直接用商品已有规格
    specGroups.value.forEach((g) => {
      g.attrs.forEach((a) => {
        if (a.attrName)
          entries.push({ name: a.attrName, value: a.attrValue || '—' })
      })
    })
  }
  // 销售属性（显示选中值）
  saleAttrRows.value
    .filter((a) => a.attrId > 0 && a.attrName)
    .forEach((a) => {
      entries.push({
        name: a.attrName,
        value: selAttrVal(a.attrId) || a.attrValues.join('、'),
      })
    })
  return entries
})

function fmtSales(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

async function loadDetail() {
  if (!curSkuId.value) return
  try {
    const result: any = await reqProductDetail(curSkuId.value)
    if (result.code === 200) {
      const data = result.data || {}
      const info = data.info || {}
      // 1. 基本信息
      const name = String(info.skuName || info.skuTitle || '').trim()
      if (name) {
        productName.value = name
        curCrumb.value = name
      }
      if (info.skuSubtitle) productSub.value = String(info.skuSubtitle)
      if (info.brandId != null) shopBrandId.value = Number(info.brandId)
      if (data.brandName) shopName.value = String(data.brandName)
      if (data.brandLogo) shopLogo.value = String(data.brandLogo)
      if (info.price) {
        BASE.value = Number(info.price)
        OLD.value = Math.round(Number(info.price) * 2)
      }
      if (info.saleCount != null)
        salesText.value = fmtSales(Number(info.saleCount))
      // 2. 图片（sku 图片列表，缺省用主图）
      const imgs: any[] = data.images || []
      const urls = imgs.map((im: any) => im.imgUrl).filter(Boolean)
      if (urls.length > 0) {
        realImages.value = urls
        // 视图索引越界时回到第一张
        if (view.value >= urls.length) view.value = 0
      } else if (info.skuDefaultImg) {
        realImages.value = [String(info.skuDefaultImg)]
        if (view.value >= 1) view.value = 0
      }
      // 3. 销售属性（配色 / 版本等动态组）
      const saleAttr: any[] = data.saleAttr || []
      if (saleAttr.length > 0) {
        saleAttrRows.value = saleAttr
          .map((a: any, idx: number) => ({
            attrId: Number(a.attrId) > 0 ? Number(a.attrId) : -(idx + 1),
            attrName: String(a.attrName || '').trim(),
            attrValues: (a.attrValues || [])
              .map((v: any) => String(v?.attrValue ?? v ?? '').trim())
              .filter(Boolean),
          }))
          .filter((a) => a.attrName && a.attrValues.length > 0)
        const next: Record<number, string> = {}
        saleAttrRows.value.forEach((a) => {
          next[a.attrId] = a.attrValues[0]
        })
        selectedAttrs.value = next
      }
      // 3.5 收藏回显：从收藏页跳转带 favParams，按参数名回显选择
      applyFavParams(String(route.query.favParams || ''))
      // 4. spu 介绍（详情图地址，逗号拼接）
      if (data.desc?.decript) detailHtml.value = String(data.desc.decript)
      // 5. 规格参数分组
      const groups: any[] = data.groupAttrs || []
      if (groups.length > 0) {
        specGroups.value = groups
          .map((g: any) => ({
            groupName: String(g.groupName || '').trim(),
            attrs: (g.attrs || [])
              .map((a: any) => ({
                attrId: a.attrId,
                attrName: String(a.attrName || ''),
                attrValue: String(a.attrValue ?? ''),
              }))
              .filter((a: any) => a.attrName),
          }))
          .filter((g) => g.groupName && g.attrs.length > 0)
      }
      // 6. 分类全量规格参数（规格参数页签全量展示用）
      const catalogId = info.catalogId
      if (catalogId) {
        try {
          const cres: any = await reqAttrGroupWithAttr(catalogId)
          categoryAttrGroups.value = cres?.data || []
        } catch {
          categoryAttrGroups.value = []
        }
      } else {
        categoryAttrGroups.value = []
      }
      // 7. 商品评论（按 spuId 过滤，缺省用 skuId）
      loadComments(info.spuId || curSkuId.value, curSkuId.value)
      // 7.5 购买校验（决定是否展示发表评论表单）
      checkCanComment()
      // 8. 收藏状态（JWT 登录后查询；未登录默认未收藏）
      curSpuId.value = info.spuId ? String(info.spuId) : ''
      if (userStore.token && curSpuId.value) {
        try {
          const favRes: any = await reqFavStatus(curSpuId.value)
          if (favRes.code === 200) fav.value = !!favRes.data
        } catch {
          fav.value = false
        }
      } else {
        fav.value = false
      }
    }
  } catch {
    /* 保持 mock */
  }
}

// ===== 生命周期 =====
onMounted(async () => {
  // 登录态下刷新会员昵称 / 头像（用于发表评论预填）
  if (userStore.token) userStore.userInfo().catch(() => {})
  await loadDetail()
  // 从订单详情等入口带 tab 参数直达对应页签（如 ?tab=rev 直达评论）
  if (route.query.tab === 'rev') tab.value = 'rev'
  await nextTick()
  renderMain()
  renderThumbs()
  // 详情大图
  DETAILS.forEach((d, i) => {
    const cv = detailCvs.value[i]
    if (cv) drawProduct(cv, d.c, d.label, d.rot, d.zoom)
  })
  // 放大镜事件
  const gMain = gMainRef.value
  if (gMain) {
    gMain.addEventListener('mouseenter', showLens)
    gMain.addEventListener('mousemove', onMouseMove)
    gMain.addEventListener('mouseleave', hideLens)
    gMain.addEventListener('wheel', onWheel, { passive: true })
  }
  window.addEventListener('scroll', onPageScroll, true)
  window.addEventListener('resize', onResize)
})

function onResize() {
  if (lensRef.value?.classList.contains('show')) sizeLens()
}

onBeforeUnmount(() => {
  const gMain = gMainRef.value
  if (gMain) {
    gMain.removeEventListener('mouseenter', showLens)
    gMain.removeEventListener('mousemove', onMouseMove)
    gMain.removeEventListener('mouseleave', hideLens)
    gMain.removeEventListener('wheel', onWheel)
  }
  window.removeEventListener('scroll', onPageScroll, true)
  window.removeEventListener('resize', onResize)
  if (lensRaf) cancelAnimationFrame(lensRaf)
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

/* ===== 详情主区 ===== */
.pd-layout {
  display: grid;
  grid-template-columns: 560px 1fr;
  gap: 34px;
  margin-top: 20px;
  align-items: start;
}

/* ===== 图画廊 ===== */
.g-main {
  position: relative;
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 18px;
  overflow: hidden;
  background: var(--panel);
  backdrop-filter: blur(10px);
  cursor: crosshair;
}
.g-main canvas {
  width: 100%;
  display: block;
}
.g-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 3;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  letter-spacing: 2px;
  padding: 5px 14px;
  border-radius: 14px;
  color: #02101a;
  background: linear-gradient(90deg, #ff2ec4, #ff6b3d);
  box-shadow: 0 0 14px rgba(255, 46, 196, 0.6);
}
.g-zoom {
  position: absolute;
  bottom: 14px;
  right: 16px;
  z-index: 3;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
}
.zoom-mask {
  position: absolute;
  z-index: 4;
  border: 1px dashed rgba(0, 240, 255, 0.75);
  background: rgba(0, 240, 255, 0.14);
  border-radius: 18px;
  pointer-events: none;
  display: none;
}
.g-col {
  position: relative;
}
.zoom-lens {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 60;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--cyan);
  background: #04060f;
  box-shadow:
    0 14px 44px rgba(0, 0, 0, 0.6),
    0 0 26px rgba(0, 240, 255, 0.25);
  display: none;
  align-items: center;
  justify-content: center;
}
.zoom-lens.show {
  display: flex;
  animation: lensIn 0.2s ease;
}
@keyframes lensIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.zoom-lens canvas {
  width: 100%;
  height: 100%;
  display: none;
}
.zoom-lens.show canvas {
  display: block;
}
.zoom-lens .zl-l {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(4, 7, 18, 0.85);
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--cyan);
  text-align: center;
  letter-spacing: 2px;
  padding: 4px 0;
}
.zoom-lens .zl-hint {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--dim);
  font-family: var(--font-m);
  font-size: 12px;
  letter-spacing: 2px;
}
.zoom-lens .zl-hint .ic {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: 1px dashed rgba(0, 240, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--cyan);
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.15);
  animation: orbFloat 4s ease-in-out infinite;
}
.zoom-lens.show .zl-hint {
  display: none;
}
.g-thumbs-wrap {
  position: relative;
  margin-top: 12px;
}
.g-thumbs {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 2px 2px 6px;
  scrollbar-width: none;
}
.g-thumbs::-webkit-scrollbar {
  display: none;
}
.g-thumb {
  flex: 0 0 auto;
  width: 116px;
  border: 1px solid rgba(0, 240, 255, 0.18);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: 0.22s;
  background: var(--panel);
}
.g-thumb:hover {
  border-color: rgba(0, 240, 255, 0.5);
}
.g-thumb.active {
  border-color: var(--cyan);
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.35);
}
.g-thumb canvas {
  width: 100%;
  display: block;
}
.g-thumb .gt-l {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  text-align: center;
  padding: 5px 0 7px;
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gt-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(0, 240, 255, 0.45);
  background: rgba(5, 9, 24, 0.92);
  color: var(--cyan);
  cursor: pointer;
  z-index: 6;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  transition: 0.2s;
}
.gt-arrow:hover {
  background: rgba(0, 240, 255, 0.22);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.4);
}
.gt-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.gt-arrow.l {
  left: -4px;
}
.gt-arrow.r {
  right: -4px;
}
.gt-arrow.show {
  display: flex;
}

/* ===== 销售信息 ===== */
.pd-shop {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-m);
  font-size: var(--font-size-lg);
  color: var(--dim);
  letter-spacing: 2px;
}
.pd-shop .si {
  width: 26px;
  height: 26px;
  border-radius: 8px;
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
  font-size: 12px;
  overflow: hidden;
}
.pd-shop .si .si-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pd-shop .sl {
  color: var(--cyan);
  cursor: pointer;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.4);
  text-decoration: none;
}
.pd-shop .shop-link:hover {
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
}
.pd-shop .sc {
  margin-left: auto;
  font-size: var(--font-size-xs);
}
.pd-name {
  font-family: var(--font-h);
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #fff;
  margin-top: 12px;
  line-height: 1.4;
  text-shadow: 0 0 18px rgba(0, 240, 255, 0.25);
}
.pd-sub {
  font-size: 14px;
  color: var(--dim);
  margin-top: 8px;
  letter-spacing: 1px;
}
.pd-rate {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 14px;
  padding: 12px 16px;
  border: 1px solid rgba(0, 240, 255, 0.12);
  border-radius: 12px;
  background: rgba(0, 240, 255, 0.03);
  font-size: 13px;
  color: var(--dim);
}
.pd-rate .stars {
  color: var(--amber);
  letter-spacing: 2px;
  font-size: 14px;
  text-shadow: 0 0 8px rgba(255, 197, 61, 0.5);
}
.pd-rate .score {
  color: var(--amber);
  font-weight: 700;
  font-size: 15px;
}
.pd-rate .sep {
  width: 1px;
  height: 16px;
  background: rgba(0, 240, 255, 0.2);
}
.pd-price {
  margin-top: 16px;
  padding: 18px 20px;
  border-radius: 14px;
  background:
    radial-gradient(
      400px 120px at 10% 50%,
      rgba(255, 46, 196, 0.08),
      transparent 60%
    ),
    linear-gradient(90deg, rgba(255, 46, 196, 0.05), rgba(0, 240, 255, 0.04));
}
.pd-price .now {
  font-family: var(--font-h);
  font-size: 38px;
  font-weight: 900;
  color: var(--cyan);
  text-shadow: 0 0 22px rgba(0, 240, 255, 0.55);
}
.pd-price .now small {
  font-size: 17px;
  margin-right: 3px;
}
.pd-price .old {
  font-size: var(--font-size-xl);
  color: var(--dim);
  text-decoration: line-through;
  margin-left: 12px;
}
.pd-price .disc-tag {
  display: inline-block;
  margin-left: 12px;
  padding: 3px 10px;
  border-radius: 10px;
  font-family: var(--font-m);
  font-size: var(--font-size-sm);
  color: #02101a;
  background: linear-gradient(90deg, #ff2ec4, #ff6b3d);
  box-shadow: 0 0 12px rgba(255, 46, 196, 0.5);
}
.pd-price .ver-extra {
  margin-top: 8px;
  font-family: var(--font-m);
  font-size: var(--font-size-sm);
  color: var(--dim);
  letter-spacing: 1px;
}
.pd-price .ver-extra b {
  color: var(--amber);
}

/* ===== 销售属性 ===== */
.pd-attr {
  margin-top: 18px;
}
.pd-attr .row {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 14px;
}
.pd-attr .al {
  width: 80px;
  flex-shrink: 0;
  font-family: var(--font-m);
  font-size: var(--font-size-sm);
  color: var(--dim);
  letter-spacing: 2px;
}
.pd-attr .opts {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.pd-opt {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
  border: 1px solid rgba(0, 240, 255, 0.25);
  background: rgba(0, 240, 255, 0.04);
  font-size: 14px;
  font-weight: 600;
  color: var(--dim);
}
.pd-opt .dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.pd-opt:hover {
  border-color: rgba(0, 240, 255, 0.55);
}
.pd-opt.active {
  color: #02101a;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: transparent;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.5);
  font-weight: 700;
}
.pd-opt.active .dot {
  border-color: rgba(2, 16, 26, 0.5);
}

/* ===== 数量 ===== */
.pd-qty {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}
.pd-qty .al {
  font-family: var(--font-m);
  font-size: var(--font-size-sm);
  color: var(--dim);
  letter-spacing: 2px;
}
.qty-box {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 10px;
  overflow: hidden;
}
.qty-box button {
  width: 38px;
  height: 38px;
  border: none;
  background: rgba(0, 240, 255, 0.06);
  color: var(--cyan);
  cursor: pointer;
  font-size: 16px;
  transition: 0.2s;
}
.qty-box button:hover {
  background: rgba(0, 240, 255, 0.18);
}
.qty-box span {
  width: 52px;
  text-align: center;
  font-family: var(--font-h);
  font-size: 15px;
  color: var(--txt);
}
.pd-svc {
  display: flex;
  gap: 18px;
  margin-top: 18px;
  flex-wrap: wrap;
}
.pd-svc span {
  font-size: 13px;
  color: var(--dim);
  letter-spacing: 1px;
}
.pd-svc span b {
  color: var(--green);
  font-weight: 600;
  margin-right: 4px;
}
.pd-acts {
  display: flex;
  gap: 14px;
  margin-top: 22px;
}
.pd-acts .favor {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  border: 1px solid rgba(255, 46, 196, 0.4);
  background: rgba(255, 46, 196, 0.06);
  color: var(--magenta);
  font-size: 20px;
  cursor: pointer;
  transition: 0.22s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pd-acts .favor:hover,
.pd-acts .favor.on {
  background: rgba(255, 46, 196, 0.16);
  box-shadow: 0 0 14px rgba(255, 46, 196, 0.4);
}
.pd-btn {
  flex: 1;
  height: 52px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-family: var(--font-h);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 3px;
  transition: 0.25s;
}
.pd-btn.cart {
  border: 1px solid rgba(0, 240, 255, 0.6);
  background: rgba(0, 240, 255, 0.08);
  color: var(--cyan);
}
.pd-btn.cart:hover {
  background: rgba(0, 240, 255, 0.16);
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.35);
}
.pd-btn.buy {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  box-shadow: 0 0 22px rgba(0, 240, 255, 0.5);
}
.pd-btn.buy:hover {
  filter: brightness(1.15);
  box-shadow: 0 0 34px rgba(0, 240, 255, 0.85);
}

/* ===== 详情页签 ===== */
.pd-tabs {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.12);
  padding-bottom: 0;
}
.pd-tab {
  padding: 13px 26px;
  font-size: 15px;
  font-weight: 700;
  color: var(--dim);
  cursor: pointer;
  letter-spacing: 2px;
  position: relative;
  transition: 0.2s;
}
.pd-tab:hover {
  color: var(--txt);
}
.pd-tab.active {
  color: var(--cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}
.pd-tab::after {
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
.pd-tab.active::after {
  transform: scaleX(1);
}
.pd-tab .cnt {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  margin-left: 6px;
}
.pd-tab.active .cnt {
  color: var(--cyan);
}
.pd-tabpane {
  padding: 26px 0 0;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* 详情大图 */
.detail-imgs {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.detail-img {
  border: 1px solid rgba(0, 240, 255, 0.14);
  border-radius: 16px;
  overflow: hidden;
  background: var(--panel);
}
.detail-img canvas {
  width: 100%;
  display: block;
}
/* 接口 spu 介绍图 */
.detail-img-real {
  width: 100%;
  display: block;
}
.detail-img .di-c {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 18px;
  border-top: 1px solid rgba(0, 240, 255, 0.08);
}
.detail-img .di-c .t {
  font-size: 14px;
  font-weight: 600;
  color: var(--txt);
  letter-spacing: 1px;
}
.detail-img .di-c .d {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 1px;
}

/* 规格参数 */
.spec-table {
  width: 100%;
  border-collapse: collapse;
}
.spec-table td {
  padding: 13px 20px;
  font-size: 14px;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.08);
}
.spec-table tr:last-child td {
  border-bottom: none;
}
.spec-table td:first-child {
  width: 200px;
  color: var(--dim);
  font-family: var(--font-m);
  font-size: 12px;
  letter-spacing: 2px;
  background: rgba(0, 240, 255, 0.03);
}
.spec-table td:last-child {
  color: var(--txt);
}

/* 售后保障 */
.svc-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.svc-item {
  border: 1px solid rgba(0, 240, 255, 0.14);
  border-radius: 14px;
  padding: 20px;
  background: rgba(0, 240, 255, 0.03);
  text-align: center;
}
.svc-item .si {
  width: 44px;
  height: 44px;
  margin: 0 auto 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: var(--cyan);
}
.svc-item .st {
  font-size: 15px;
  font-weight: 700;
  color: var(--txt);
  letter-spacing: 1px;
}
.svc-item .sd {
  font-size: 12px;
  color: var(--dim);
  margin-top: 6px;
  line-height: 1.6;
}

/* 商品评论 */
/* 不可评价提示 */
.rev-locked {
  margin-bottom: 18px;
  border: 1px dashed rgba(0, 240, 255, 0.22);
  border-radius: 14px;
  padding: 18px 20px;
  background: rgba(0, 240, 255, 0.02);
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: 0.25s;
}
.rev-locked:hover {
  border-color: rgba(0, 240, 255, 0.45);
  background: rgba(0, 240, 255, 0.05);
}
.rev-locked .rl-ic {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: rgba(0, 240, 255, 0.08);
  border: 1px solid rgba(0, 240, 255, 0.25);
}
.rev-locked .rl-t {
  font-size: 14px;
  font-weight: 700;
  color: var(--txt);
  letter-spacing: 1px;
}
.rev-locked .rl-s {
  font-size: 12px;
  color: var(--dim);
  margin-top: 4px;
  letter-spacing: 1px;
}

/* 发表评论 */
.rev-write {
  margin-bottom: 18px;
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 14px;
  padding: 18px 20px;
  background: rgba(0, 240, 255, 0.03);
}
.rev-write .rw-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rev-write .rw-av {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    rgba(0, 240, 255, 0.3),
    rgba(168, 85, 247, 0.3)
  );
  border: 1px solid rgba(0, 240, 255, 0.4);
  font-size: 17px;
  color: var(--cyan);
}
.rev-write .rw-av img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.rev-write .rw-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--txt);
  display: flex;
  align-items: center;
  gap: 8px;
}
.rev-write .rw-mode {
  display: none;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  letter-spacing: 2px;
  padding: 2px 8px;
  border-radius: 7px;
}
.rev-write .rw-mode.add {
  display: inline-block;
  color: var(--magenta);
  background: rgba(255, 46, 196, 0.1);
  border: 1px solid rgba(255, 46, 196, 0.4);
}
.rev-write .rw-mode.full {
  display: inline-block;
  color: var(--dim);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.rev-write .rw-full {
  margin-top: 12px;
  font-size: 12px;
  color: var(--amber);
  letter-spacing: 1px;
  border: 1px dashed rgba(255, 197, 61, 0.35);
  border-radius: 8px;
  padding: 8px 12px;
  background: rgba(255, 197, 61, 0.05);
}
.rev-write .rw-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.rev-write .rw-stars {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
}
.rev-write .rw-star {
  font-size: 20px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.18);
  cursor: pointer;
  transition: 0.15s;
}
.rev-write .rw-star:hover,
.rev-write .rw-star.on {
  color: var(--amber);
  text-shadow: 0 0 8px rgba(255, 197, 61, 0.6);
}
.rev-write .rw-star-tip {
  margin-left: 6px;
  font-size: 12px;
  color: var(--dim);
  font-family: var(--font-m);
  letter-spacing: 1px;
}
.rev-write .rw-input {
  width: 100%;
  margin-top: 12px;
  min-height: 84px;
  resize: vertical;
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 10px;
  background: rgba(4, 7, 18, 0.6);
  color: var(--txt);
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.7;
  outline: none;
  transition: 0.2s;
  font-family: inherit;
}
.rev-write .rw-input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.2);
}
.rev-write .rw-input::placeholder {
  color: var(--dim);
  opacity: 0.7;
}
.rev-write .rw-imgs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
  align-items: center;
}
.rev-write .rw-img {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(0, 240, 255, 0.2);
  background: rgba(6, 10, 26, 0.9);
}
.rev-write .rw-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.rev-write .rw-img-del {
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
.rev-write .rw-img-add {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  border: 1px dashed rgba(0, 240, 255, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  color: var(--cyan);
  font-size: 16px;
  transition: 0.2s;
}
.rev-write .rw-img-add:hover {
  border-color: var(--cyan);
  background: rgba(0, 240, 255, 0.06);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.25);
}
.rev-write .rw-img-add small {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  letter-spacing: 1px;
  color: var(--dim);
}
.rev-write .rw-uploading {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  animation: rwBlink 1s ease-in-out infinite;
}
@keyframes rwBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}
.rev-write .rw-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.rev-write .rw-tag {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--cyan);
  background: rgba(0, 240, 255, 0.07);
  padding: 4px 10px;
  border-radius: 8px;
  letter-spacing: 1px;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rev-write .rw-count {
  margin-left: auto;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
}
.rev-write .rw-btn {
  height: 36px;
  padding: 0 22px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  font-family: var(--font-h);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  cursor: pointer;
  transition: 0.22s;
}
.rev-write .rw-btn:hover {
  filter: brightness(1.15);
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.5);
}
.rev-write .rw-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: none;
  box-shadow: none;
}

.rev-sum {
  display: flex;
  gap: 30px;
  align-items: center;
  padding: 20px 26px;
  border: 1px solid rgba(0, 240, 255, 0.14);
  border-radius: 14px;
  background: rgba(0, 240, 255, 0.03);
  margin-bottom: 18px;
}
.rev-sum .big {
  text-align: center;
}
.rev-sum .big .n {
  font-family: var(--font-h);
  font-size: 40px;
  font-weight: 900;
  color: var(--amber);
  text-shadow: 0 0 18px rgba(255, 197, 61, 0.5);
}
.rev-sum .big .l {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  margin-top: 4px;
}
.rev-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rev-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--dim);
  font-family: var(--font-m);
}
.rev-bar .b {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(0, 240, 255, 0.1);
  overflow: hidden;
}
.rev-bar .b i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #ffc53d, #ff9f1a);
  border-radius: 3px;
}
.rev-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.rev-f {
  padding: 7px 16px;
  border-radius: 9px;
  border: 1px solid rgba(0, 240, 255, 0.22);
  background: rgba(0, 240, 255, 0.04);
  color: var(--dim);
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  font-weight: 600;
}
.rev-f:hover {
  color: var(--cyan);
}
.rev-f.active {
  color: #02101a;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: transparent;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
}
.rev-list {
  display: flex;
  flex-direction: column;
}
.rev-card {
  padding: 18px 0;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.08);
}
.rev-card:last-child {
  border-bottom: none;
}
.rev-top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rev-av {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    rgba(0, 240, 255, 0.3),
    rgba(168, 85, 247, 0.3)
  );
  border: 1px solid rgba(0, 240, 255, 0.4);
  font-size: 17px;
}
.rev-av img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.rev-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--txt);
}
.rev-stars {
  color: var(--amber);
  font-size: 12px;
  letter-spacing: 2px;
}
.rev-time {
  margin-left: auto;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 1px;
}
.rev-attr {
  margin-left: auto;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--cyan);
  letter-spacing: 1px;
  background: rgba(0, 240, 255, 0.07);
  padding: 3px 10px;
  border-radius: 8px;
  max-width: 40%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rev-type {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  letter-spacing: 1px;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
}
.rev-type.good {
  color: var(--green);
  background: rgba(57, 255, 136, 0.08);
  border: 1px solid rgba(57, 255, 136, 0.3);
}
.rev-type.mid {
  color: var(--amber);
  background: rgba(255, 197, 61, 0.08);
  border: 1px solid rgba(255, 197, 61, 0.3);
}
.rev-type.bad {
  color: var(--magenta);
  background: rgba(255, 46, 196, 0.08);
  border: 1px solid rgba(255, 46, 196, 0.3);
}
.rev-add {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  letter-spacing: 1px;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
  color: var(--magenta);
  background: rgba(255, 46, 196, 0.1);
  border: 1px solid rgba(255, 46, 196, 0.35);
}
.rev-content {
  font-size: 14px;
  color: var(--dim);
  margin-top: 10px;
  line-height: 1.8;
  letter-spacing: 0.3px;
}
.rev-img {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.rev-img i {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  background: radial-gradient(
    circle at 50% 40%,
    rgba(0, 240, 255, 0.16),
    rgba(6, 10, 26, 0.9) 75%
  );
  border: 1px solid rgba(0, 240, 255, 0.18);
}
.rev-img img {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid rgba(0, 240, 255, 0.18);
  background: rgba(6, 10, 26, 0.9);
}
.rev-help {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: var(--dim);
  font-family: var(--font-m);
}
.rev-help span {
  cursor: pointer;
  transition: 0.2s;
}
.rev-help span:hover {
  color: var(--cyan);
}
.rev-help span.liked {
  color: var(--amber);
  text-shadow: 0 0 8px rgba(255, 197, 61, 0.5);
}

/* 回复输入框 */
.rev-reply-box {
  margin-top: 12px;
  border: 1px solid rgba(0, 240, 255, 0.18);
  border-radius: 10px;
  padding: 10px 12px;
  background: rgba(0, 240, 255, 0.03);
}
.rev-reply-box textarea {
  width: 100%;
  min-height: 54px;
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
.rev-reply-box textarea:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
}
.rev-reply-box textarea::placeholder {
  color: var(--dim);
  opacity: 0.7;
}
.rev-reply-box .rr-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
.rev-reply-box .rr-count {
  margin-right: auto;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
}
.rev-reply-box .rr-btn {
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
.rev-reply-box .rr-btn.ghost {
  background: transparent;
  border: 1px solid rgba(0, 240, 255, 0.35);
  color: var(--cyan);
}
.rev-reply-box .rr-btn.ghost:hover {
  background: rgba(0, 240, 255, 0.1);
}
.rev-reply-box .rr-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: none;
}

/* 嵌套回复列表 */
.rev-replies {
  margin-top: 12px;
  border-left: 2px solid rgba(0, 240, 255, 0.18);
  padding-left: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rev-reply {
  border: 1px solid rgba(0, 240, 255, 0.1);
  border-radius: 10px;
  padding: 10px 12px;
  background: rgba(0, 240, 255, 0.03);
}
.rev-reply .rr-top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rev-reply .rr-av {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    rgba(0, 240, 255, 0.3),
    rgba(168, 85, 247, 0.3)
  );
  border: 1px solid rgba(0, 240, 255, 0.4);
  font-size: 12px;
}
.rev-reply .rr-av img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.rev-reply .rr-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--cyan);
}
.rev-reply .rr-time {
  margin-left: auto;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 1px;
}
.rev-reply .rr-content {
  font-size: 13px;
  color: var(--dim);
  margin-top: 6px;
  line-height: 1.7;
}

/* 举报弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(3, 5, 14, 0.72);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}
.modal {
  width: 420px;
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
.rp-txt {
  font-size: 13px;
  color: var(--dim);
  margin-top: 14px;
  line-height: 1.7;
}
.rp-txt b {
  color: var(--cyan);
}
.rp-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.rp-reason {
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
.rp-reason:hover {
  color: var(--cyan);
}
.rp-reason.active {
  color: #02101a;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: transparent;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
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
  border: none;
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
.rev-empty {
  display: none;
  text-align: center;
  padding: 40px;
  color: var(--dim);
  font-family: var(--font-m);
  letter-spacing: 2px;
  font-size: 13px;
}
.rev-empty.show {
  display: block;
}

/* 评论分页 */
.rev-pag {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 22px;
  align-items: center;
  flex-wrap: wrap;
}
.rp-info {
  font-family: var(--font-m);
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 2px;
  margin-right: 8px;
}
.rp-btn {
  min-width: 38px;
  height: 38px;
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
.rp-btn:hover {
  color: var(--cyan);
  border-color: var(--cyan);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.3);
}
.rp-btn.active {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  border-color: transparent;
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.6);
  font-weight: 700;
}
.rp-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

@media (max-width: 1080px) {
  .pd-layout {
    grid-template-columns: 1fr;
  }
  .svc-grid {
    grid-template-columns: 1fr 1fr;
  }
  .zoom-lens {
    display: none !important;
  }
}
@media (max-width: 760px) {
  .svc-grid {
    grid-template-columns: 1fr;
  }
  .pd-tabs {
    overflow-x: auto;
  }
}
</style>
