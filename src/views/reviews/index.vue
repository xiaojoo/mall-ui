<template>
  <div class="nb-reviews">
    <!-- 页面搜索 header：搜索评价数据 -->
    <PageSearchHeader v-model="reviewKw" placeholder="搜索商品 / 评价内容…" />
    <div class="wrap">
      <div class="crumbs">
        <router-link to="/">Nebula Home</router-link>
        <span class="sep">/</span>
        <span class="cur">评论管理</span>
      </div>
      <div class="page-head sec-head">
        <div class="sec-title">
          <h2>
            💬 评论管理
            <small>MY REVIEWS · 评价中心</small>
          </h2>
        </div>
      </div>

      <div class="rev-wrap">
        <!-- 统计条 -->
        <div class="rev-stats">
          <div class="rs">
            <div class="sv">{{ reviews.length }}</div>
            <div class="sl">全部评价</div>
          </div>
          <span class="sep"></span>
          <div class="rs amber">
            <div class="sv">{{ statGood }}</div>
            <div class="sl">好评</div>
          </div>
          <span class="sep"></span>
          <div class="rs amber">
            <div class="sv">{{ statMid }}</div>
            <div class="sl">中评</div>
          </div>
          <span class="sep"></span>
          <div class="rs grey">
            <div class="sv">{{ statBad }}</div>
            <div class="sl">差评</div>
          </div>
          <span class="sep"></span>
          <div class="rs green">
            <div class="sv">{{ goodRate }}%</div>
            <div class="sl">好评率</div>
          </div>
        </div>

        <!-- 筛选页签 -->
        <div class="rev-tabs">
          <div
            v-for="t in tabs"
            :key="t.key"
            class="rev-tab"
            :class="{ active: filter === t.key }"
            @click="filter = t.key"
          >
            {{ t.label }}
            <span class="cnt">({{ tabCount(t.key) }})</span>
          </div>
        </div>

        <!-- 评价列表：按商品分组，一个商品一个卡片 -->
        <div class="rev-groups">
          <div v-for="g in pageGroups" :key="g.key" class="prod-card">
            <!-- 商品头部 -->
            <div class="pc-head">
              <div class="pc-img">
                <img v-if="g.img" :src="g.img" :alt="g.name" />
                <span v-else>◈</span>
              </div>
              <div class="pc-info">
                <router-link
                  class="pc-name"
                  :to="{
                    path: '/details',
                    query: { skuId: g.skuId || '', spuId: g.spuId || '' },
                  }"
                  :title="`查看 ${g.name} 详情`"
                >
                  {{ g.name }}
                </router-link>
                <div class="pc-meta">
                  <span>💬 {{ g.reviews.length }} 条评价</span>
                  <span class="pc-star">{{ groupAvg(g.reviews) }}★</span>
                  <span class="pc-good">{{ groupGood(g.reviews) }}% 好评</span>
                  <router-link
                    class="pc-go"
                    :to="{
                      path: '/details',
                      query: { skuId: g.skuId || '', spuId: g.spuId || '' },
                    }"
                  >
                    查看详情 →
                  </router-link>
                </div>
              </div>
            </div>
            <!-- 该商品下的评论 -->
            <div class="pc-reviews">
              <div v-for="r in g.reviews" :key="r.id" class="rev-card">
                <div class="rc-top">
                  <div class="rc-icon">
                    <div class="ph" :class="r.ph || ''">{{ r.icon }}</div>
                  </div>
                  <div class="rc-info">
                    <div class="rc-name">{{ r.name }}</div>
                    <div class="rc-attr">{{ r.attr }}</div>
                    <div class="rc-order" v-if="r.order">
                      订单号 {{ r.order }}
                    </div>
                  </div>
                  <span class="rc-status" :class="r.status">
                    {{ r.status === 'pub' ? '已发布' : '待审核' }}
                  </span>
                </div>
                <div class="rc-body">
                  <span class="rc-stars">
                    {{ '★'.repeat(r.stars) }}{{ '☆'.repeat(5 - r.stars) }}
                  </span>
                  <span class="rc-time">{{ r.time }}</span>
                  <div class="rc-content">{{ r.content }}</div>
                  <div v-if="r.resources.length" class="rc-imgs">
                    <img
                      v-for="(u, j) in r.resources"
                      :key="j"
                      :src="u"
                      :alt="`评论图片${j + 1}`"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div class="rc-ops">
                  <button class="rc-op" @click="openEdit(r)">✎ 编辑评价</button>
                  <button class="rc-op danger" @click="removeReview(r)">
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="!loading && filteredGroups.length === 0"
          class="rev-empty show"
        >
          <div class="empty-orb"><span>💬</span></div>
          <div class="empty-t">NO SIGNAL · 暂无此类评价</div>
          <div class="empty-s">该分类下暂无评价记录</div>
        </div>

        <!-- 分页（仅多页时展示） -->
        <div v-if="groupTotalPages > 1" class="rev-pag">
          <span class="rp-info">
            共 {{ filteredGroups.length }} 个商品 · {{ groupTotalPages }} 页
          </span>
          <button
            class="rp-btn"
            :disabled="groupPage <= 1"
            @click="goGroupPage(groupPage - 1)"
          >
            ◀
          </button>
          <button
            v-for="p in groupPageWindow"
            :key="p"
            class="rp-btn"
            :class="{ active: p === groupPage }"
            @click="goGroupPage(p)"
          >
            {{ p }}
          </button>
          <button
            class="rp-btn"
            :disabled="groupPage >= groupTotalPages"
            @click="goGroupPage(groupPage + 1)"
          >
            ▶
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑评价模态框 -->
    <div
      v-if="editVisible"
      class="modal-mask show"
      @click.self="editVisible = false"
    >
      <div class="modal">
        <div class="modal-head">
          <h3>
            ✎ 编辑评价
            <small>EDIT REVIEW · 量子评价舱</small>
          </h3>
          <button class="modal-close" @click="editVisible = false">✕</button>
        </div>
        <div class="me-info">
          <div class="ic">{{ editItem?.icon }}</div>
          <div>
            <div class="n">{{ editItem?.name }}</div>
            <div class="a">{{ editItem?.attr }}</div>
          </div>
        </div>
        <div class="me-stars">
          <span
            v-for="s in 5"
            :key="s"
            class="me-star"
            :class="{ on: editStars >= s }"
            @click="editStars = s"
          >
            ★
          </span>
        </div>
        <div class="me-field">
          <div class="me-label">评价内容 CONTENT</div>
          <textarea
            name="editContent"
            v-model.trim="editContent"
            maxlength="300"
            placeholder="分享你的星际购物体验…"
          ></textarea>
        </div>
        <div class="modal-foot">
          <button class="mbtn ghost" @click="editVisible = false">取消</button>
          <button class="mbtn primary" @click="saveEdit">✓ 保存评价</button>
        </div>
      </div>
    </div>

    <!-- ===== 删除确认弹窗（通用组件） ===== -->
    <ConfirmDialog
      :visible="!!delTarget"
      title="⚠ 删除评价"
      subtitle="DELETE REVIEW · 删除后不可恢复"
      confirm-text="✓ 确认删除"
      danger
      @confirm="confirmDelete"
      @cancel="delTarget = null"
    >
      <div class="del-txt">
        确定要删除「
        <b>{{ delTarget?.name }}</b>
        」这条评价吗？
        <br />
        删除后不可恢复。
      </div>
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import ConfirmDialog from '@/components/nebula/ConfirmDialog/index.vue'
import PageSearchHeader from '@/components/nebula/PageSearchHeader/index.vue'
import {
  reqCommentList,
  reqCommentUpdate,
  reqCommentDelete,
  reqProductDetail,
} from '@/api/product'
import useUserStore from '@/store/modules/user'
import message from '@/utils/message'

interface Review {
  id: number
  name: string
  icon: string
  ph?: string
  attr: string
  order: string
  stars: number
  time: string
  status: 'pub' | 'audit'
  content: string
  spuId: number | string
  skuId: number | string
  resources: string[]
}

// 按商品分组：一个商品一张卡片，卡片头展示商品图/名称（点击回详情）
interface ReviewGroup {
  key: string
  spuId: number | string
  skuId: number | string
  name: string
  img: string
  reviews: Review[]
}

const userStore = useUserStore()
const reviews = ref<Review[]>([])
const loading = ref(true)
const filter = ref('all')

// ===== 加载评价（纯 API：pms_spu_comment 商品评价表） =====
async function loadComments() {
  loading.value = true
  if (!userStore.token) {
    reviews.value = []
    loading.value = false
    return
  }
  try {
    const result: any = await reqCommentList({ page: 1, limit: 100 })
    if (result.code === 200) {
      const list: any[] = result.data?.list || []
      reviews.value = list.map((c: any) => ({
        id: c.id,
        name: c.spuName || '量子商品',
        icon: '◈',
        ph: 'p2',
        attr: String(c.spuAttributes || ''),
        order: '',
        stars: Number(c.star ?? 5),
        time: String(c.createTime || '').slice(0, 10),
        status: Number(c.showStatus) === 1 ? 'pub' : 'audit',
        content: String(c.content || ''),
        spuId: c.spuId || '',
        skuId: c.skuId || '',
        resources: parseCommentResources(c.resources),
      }))
      // 商品图（按分组 key 取第一张）
      loadProdImgs()
    } else {
      reviews.value = []
    }
  } catch {
    reviews.value = []
  } finally {
    loading.value = false
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

const statGood = computed(
  () => reviews.value.filter((r) => r.stars >= 4).length,
)
const statMid = computed(
  () => reviews.value.filter((r) => r.stars === 3).length,
)
const statBad = computed(() => reviews.value.filter((r) => r.stars <= 2).length)
const goodRate = computed(() =>
  reviews.value.length
    ? Math.round((statGood.value / reviews.value.length) * 100)
    : 0,
)

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'good', label: '好评' },
  { key: 'mid', label: '中评' },
  { key: 'bad', label: '差评' },
]
const tabCount = (key: string) =>
  key === 'all'
    ? reviews.value.length
    : key === 'good'
      ? statGood.value
      : key === 'mid'
        ? statMid.value
        : statBad.value

const reviewKw = ref('')

// ===== 商品分组 + 商品图 =====
const prodImgMap = ref<Record<string, string>>({})

// 分组 key：spuId 优先，缺省用 skuId，再兜底商品名
const groupKeyOf = (r: Review) => String(r.spuId || r.skuId || r.name)

const groups = computed<ReviewGroup[]>(() => {
  const map = new Map<string, Review[]>()
  reviews.value.forEach((r) => {
    const key = groupKeyOf(r)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  })
  return Array.from(map.entries()).map(([key, list]) => ({
    key,
    spuId: list[0].spuId,
    skuId: list[0].skuId,
    name: list[0].name,
    img: prodImgMap.value[key] || '',
    reviews: list,
  }))
})

// 商品图：用组内第一条评论的 skuId 拉详情取首图（失败留占位）
async function loadProdImgs() {
  const keys = new Set(reviews.value.map(groupKeyOf))
  for (const key of keys) {
    if (prodImgMap.value[key]) continue
    const r = reviews.value.find((x) => groupKeyOf(x) === key)
    if (!r || !r.skuId) continue
    try {
      const res: any = await reqProductDetail(r.skuId)
      if (res.code === 200) {
        const data = res.data || {}
        const imgs: any[] = data.images || []
        const url =
          imgs.map((im) => im.imgUrl).find(Boolean) || data.info?.skuDefaultImg
        if (url) prodImgMap.value[key] = String(url)
      }
    } catch {
      /* 占位图 */
    }
  }
}

const groupAvg = (list: Review[]) =>
  list.length
    ? (list.reduce((s, r) => s + r.stars, 0) / list.length).toFixed(1)
    : '0.0'
const groupGood = (list: Review[]) =>
  list.length
    ? Math.round((list.filter((r) => r.stars >= 4).length / list.length) * 100)
    : 0

// 筛选：按商品分组过滤，商品名命中则整组保留，否则按评论内容/属性匹配
const filteredGroups = computed<ReviewGroup[]>(() => {
  const f = filter.value
  const kw = reviewKw.value.trim().toLowerCase()
  return groups.value.flatMap((g) => {
    const nameHit = !!kw && g.name.toLowerCase().includes(kw)
    const list = g.reviews.filter((r) => {
      if (f === 'good' && r.stars < 4) return false
      if (f === 'mid' && r.stars !== 3) return false
      if (f === 'bad' && r.stars > 2) return false
      if (
        kw &&
        !nameHit &&
        !r.content.toLowerCase().includes(kw) &&
        !r.attr.toLowerCase().includes(kw)
      )
        return false
      return true
    })
    return list.length ? [{ ...g, reviews: list }] : []
  })
})

// ===== 分页（按商品分组，每页 5 个商品） =====
const GROUP_PAGE_SIZE = 5
const groupPage = ref(1)
const groupTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredGroups.value.length / GROUP_PAGE_SIZE)),
)
const groupPageWindow = computed(() => {
  const pages = groupTotalPages.value
  const win: number[] = []
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - groupPage.value) <= 1)
      win.push(i)
  }
  return win
})
const pageGroups = computed(() => {
  const start = (groupPage.value - 1) * GROUP_PAGE_SIZE
  return filteredGroups.value.slice(start, start + GROUP_PAGE_SIZE)
})
function goGroupPage(p: number) {
  if (p < 1 || p > groupTotalPages.value) return
  groupPage.value = p
}

// 筛选/搜索变化时回到第一页
watch(filter, () => {
  groupPage.value = 1
})
watch(reviewKw, () => {
  groupPage.value = 1
})

// ===== 编辑评价 =====
const editVisible = ref(false)
const editItem = ref<Review | null>(null)
const editStars = ref(5)
const editContent = ref('')

function openEdit(r: Review) {
  editItem.value = r
  editStars.value = r.stars
  editContent.value = r.content
  editVisible.value = true
}

async function saveEdit() {
  const r = editItem.value
  if (!r) return
  r.stars = editStars.value
  r.content = editContent.value
  if (userStore.token) {
    try {
      await reqCommentUpdate({ id: r.id, star: r.stars, content: r.content })
    } catch {
      /* 本地已更新 */
    }
  }
  editVisible.value = false
  message.success('✓ 评价已更新')
}

const delTarget = ref<Review | null>(null)

function removeReview(r: Review) {
  delTarget.value = r
}

async function confirmDelete() {
  const r = delTarget.value
  if (!r) return
  delTarget.value = null
  if (userStore.token) {
    try {
      await reqCommentDelete([r.id])
    } catch {
      /* 本地已移除 */
    }
  }
  reviews.value = reviews.value.filter((x) => x.id !== r.id)
  message.success('✓ 评价已删除')
}

onMounted(loadComments)
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
.rev-wrap {
  max-width: 1224px;
  margin: 0 auto;
}

/* 统计条 */
.rev-stats {
  display: flex;
  gap: 34px;
  align-items: center;
  margin-top: 22px;
  padding: 20px 28px;
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 16px;
  background: var(--panel);
  backdrop-filter: blur(10px);
}
.rev-stats .rs {
  text-align: center;
}
.rev-stats .rs .sv {
  font-family: var(--font-h);
  font-size: 24px;
  font-weight: 900;
  color: var(--cyan);
  text-shadow: 0 0 14px rgba(0, 240, 255, 0.5);
}
.rev-stats .rs .sl {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  margin-top: 5px;
}
.rev-stats .rs.amber .sv {
  color: var(--amber);
  text-shadow: 0 0 14px rgba(255, 197, 61, 0.5);
}
.rev-stats .rs.green .sv {
  color: var(--green);
  text-shadow: 0 0 14px rgba(57, 255, 136, 0.5);
}
.rev-stats .rs.grey .sv {
  color: var(--dim);
}
.rev-stats .sep {
  width: 1px;
  height: 34px;
  background: rgba(0, 240, 255, 0.15);
}

/* 筛选页签 */
.rev-tabs {
  display: flex;
  gap: 10px;
  margin-top: 18px;
  flex-wrap: wrap;
}
.rev-tab {
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
.rev-tab:hover {
  color: var(--cyan);
  border-color: var(--cyan);
}
.rev-tab.active {
  color: #02101a;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: transparent;
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.45);
  font-weight: 700;
}
.rev-tab .cnt {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  margin-left: 6px;
}

/* 评价列表 */
.rev-groups {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 18px;
}
.prod-card {
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 16px;
  background: var(--panel);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: 0.3s;
  animation: cardIn 0.3s ease;
}
.prod-card:hover {
  border-color: rgba(0, 240, 255, 0.4);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);
}
.pc-head {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 22px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(0, 240, 255, 0.03);
}
.pc-img {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  flex-shrink: 0;
  overflow: hidden;
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
  font-size: 22px;
}
.pc-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pc-info {
  min-width: 0;
  flex: 1;
}
.pc-name {
  display: inline-block;
  font-size: 15px;
  font-weight: 700;
  color: var(--txt);
  text-decoration: none;
  letter-spacing: 1px;
  transition: 0.2s;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pc-name:hover {
  color: var(--cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}
.pc-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 6px;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 1px;
  flex-wrap: wrap;
}
.pc-meta .pc-star {
  color: var(--amber);
}
.pc-meta .pc-good {
  color: var(--green);
}
.pc-meta .pc-go {
  margin-left: auto;
  color: var(--cyan);
  opacity: 0.85;
  transition: 0.2s;
  text-decoration: none;
  cursor: pointer;
}
.pc-name:hover + .pc-meta .pc-go,
.pc-head:hover .pc-go {
  opacity: 1;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
}
.pc-go:hover {
  opacity: 1;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.8);
}
.pc-reviews {
  padding: 6px 22px 10px;
  display: flex;
  flex-direction: column;
}
.pc-reviews .rev-card {
  border: none;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.08);
  border-radius: 0;
  background: transparent;
  backdrop-filter: none;
  padding: 16px 0;
  animation: none;
}
.pc-reviews .rev-card:last-child {
  border-bottom: none;
}
.pc-reviews .rev-card:hover {
  border-color: transparent;
  box-shadow: none;
  background: rgba(0, 240, 255, 0.02);
}
.rev-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 18px;
}
.rev-card {
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 16px;
  background: var(--panel);
  backdrop-filter: blur(10px);
  padding: 18px 22px;
  transition: 0.3s;
  animation: cardIn 0.3s ease;
}
@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.rev-card:hover {
  border-color: rgba(0, 240, 255, 0.4);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);
}
.rc-top {
  display: flex;
  align-items: center;
  gap: 14px;
}
.rc-icon {
  width: 56px;
  height: 56px;
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
}
.rc-icon .ph {
  width: 36px;
  height: 36px;
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
  font-size: 15px;
  color: #fff;
  text-shadow: 0 0 10px var(--cyan);
}
.rc-info {
  flex: 1;
  min-width: 0;
}
.rc-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--txt);
  letter-spacing: 1px;
}
.rc-attr {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  margin-top: 4px;
  letter-spacing: 1px;
}
.rc-order {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  margin-top: 3px;
  letter-spacing: 1px;
}
.rc-status {
  margin-left: auto;
  flex-shrink: 0;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  letter-spacing: 2px;
  padding: 4px 12px;
  border-radius: 12px;
}
.rc-status.pub {
  color: var(--green);
  border: 1px solid rgba(57, 255, 136, 0.4);
  background: rgba(57, 255, 136, 0.06);
}
.rc-status.audit {
  color: var(--amber);
  border: 1px solid rgba(255, 197, 61, 0.4);
  background: rgba(255, 197, 61, 0.06);
}
.rc-body {
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(0, 240, 255, 0.03);
  border: 1px solid rgba(0, 240, 255, 0.08);
}
.rc-stars {
  color: var(--amber);
  font-size: 14px;
  letter-spacing: 2px;
  text-shadow: 0 0 8px rgba(255, 197, 61, 0.5);
}
.rc-time {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  margin-left: 12px;
  letter-spacing: 1px;
}
.rc-content {
  font-size: 14px;
  color: var(--dim);
  margin-top: 9px;
  line-height: 1.8;
  letter-spacing: 0.3px;
}
.rc-imgs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}
.rc-imgs img {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid rgba(0, 240, 255, 0.18);
  background: rgba(6, 10, 26, 0.9);
}
.rc-ops {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  justify-content: flex-end;
}
.rc-op {
  padding: 7px 16px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 13px;
  letter-spacing: 1px;
  transition: 0.2s;
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: var(--dim);
  background: rgba(0, 240, 255, 0.04);
}
.rc-op:hover {
  color: var(--cyan);
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.25);
}
.rc-op.danger {
  border-color: rgba(255, 46, 196, 0.3);
  color: var(--magenta);
}
.rc-op.danger:hover {
  background: rgba(255, 46, 196, 0.1);
  box-shadow: 0 0 10px rgba(255, 46, 196, 0.3);
}

/* 空状态 */
.rev-empty {
  text-align: center;
  padding: 70px 20px;
  border: 1px dashed rgba(0, 240, 255, 0.3);
  border-radius: 18px;
  background: rgba(6, 10, 26, 0.5);
  margin-top: 18px;
}

/* 分页 */
.rev-pag {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
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

/* 删除确认内容样式 */
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
  letter-spacing: 1px;
  margin: 0 4px;
}

/* 编辑模态框 */
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
  margin-bottom: 16px;
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
.me-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(0, 240, 255, 0.14);
  border-radius: 12px;
  background: rgba(0, 240, 255, 0.04);
  margin-bottom: 16px;
}
.me-info .ic {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    circle at 50% 40%,
    rgba(0, 240, 255, 0.16),
    rgba(6, 10, 26, 0.9) 75%
  );
  border: 1px solid rgba(0, 240, 255, 0.2);
  font-size: 18px;
}
.me-info .n {
  font-size: 14px;
  font-weight: 700;
  color: var(--txt);
}
.me-info .a {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  margin-top: 3px;
  letter-spacing: 1px;
}
.me-stars {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}
.me-star {
  font-size: 30px;
  color: rgba(143, 163, 200, 0.3);
  cursor: pointer;
  transition: 0.2s;
  text-shadow: none;
}
.me-star.on {
  color: var(--amber);
  text-shadow: 0 0 14px rgba(255, 197, 61, 0.6);
}
.me-field {
  margin-bottom: 14px;
}
.me-label {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.me-label::before {
  content: '';
  width: 3px;
  height: 11px;
  border-radius: 2px;
  background: linear-gradient(180deg, #00f0ff, #a855f7);
  box-shadow: 0 0 6px var(--cyan);
}
.me-field textarea {
  width: 100%;
  height: 110px;
  border-radius: 10px;
  border: 1px solid rgba(0, 240, 255, 0.25);
  background: rgba(6, 10, 26, 0.7);
  color: var(--txt);
  padding: 12px 14px;
  font-family: var(--font-b);
  font-size: 14px;
  outline: none;
  transition: 0.2s;
  box-sizing: border-box;
  resize: none;
  line-height: 1.7;
  letter-spacing: 0.3px;
}
.me-field textarea:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
.modal-foot {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 6px;
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
</style>
