<template>
  <!-- 分类导航（京东式超级菜单；分类数据优先走 /product/category/tree，失败回退内置静态数据） -->
  <nav class="nb-nav">
    <div class="cat-row">
      <div
        class="cat active cat-menu"
        @mouseenter="openMega"
        @mouseleave="scheduleClose"
      >
        <span class="ico">▣</span>
        商品分类
        <span class="caret">▾</span>
        <div class="mega">
          <div class="mega-cats">
            <div
              v-for="item in megaCats"
              :key="item.name"
              class="mega-cat"
              :class="{ active: activeCat === item.name }"
              @mouseenter="activeCat = item.name"
            >
              <span>{{ item.icon }} {{ item.name }}</span>
              <i class="mega-go">▸</i>
            </div>
          </div>
          <div class="mega-panel">
            <div
              v-for="item in megaCats"
              :key="item.name"
              class="mega-content"
              :class="{ active: activeCat === item.name }"
            >
              <div
                v-for="group in item.groups"
                :key="group.title"
                class="mega-group"
              >
                <router-link
                  class="mega-gt"
                  :to="
                    group.titleId
                      ? { path: '/list', query: { catalog2Id: group.titleId } }
                      : { path: '/list' }
                  "
                >
                  {{ group.title }}
                  <i class="mega-ar">›</i>
                </router-link>
                <div class="mega-links">
                  <router-link
                    v-for="link in group.links"
                    :key="link.name"
                    class="mega-link"
                    :to="
                      link.id
                        ? { path: '/list', query: { catalog3Id: link.id } }
                        : { path: '/list', query: { keyword: link.name } }
                    "
                  >
                    {{ link.name }}
                  </router-link>
                </div>
              </div>
              <router-link
                class="mega-all"
                :to="
                  activeCatId
                    ? { path: '/list', query: { catalog2Id: activeCatId } }
                    : { path: '/list', query: { keyword: item.name } }
                "
              >
                查看全部 {{ item.name }} 商品 ⟶
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <template v-for="cat in quickCats" :key="cat.name">
        <a
          v-if="isExternalLink(cat.link)"
          class="cat"
          :class="{ active: cat.active }"
          :href="cat.link"
          target="_blank"
          rel="noopener"
        >
          <span class="ico">{{ cat.icon }}</span>
          {{ cat.name }}
          <span v-if="cat.tag" class="tag-hot" :style="tagStyle(cat)">
            {{ cat.tag }}
          </span>
        </a>
        <router-link
          v-else
          class="cat"
          :class="{ active: cat.active }"
          :to="catNavTo(cat)"
        >
          <span class="ico">{{ cat.icon }}</span>
          {{ cat.name }}
          <span v-if="cat.tag" class="tag-hot" :style="tagStyle(cat)">
            {{ cat.tag }}
          </span>
        </router-link>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { CAT_MENU, type MegaCat } from '@/constants/nebula'
import { reqCategoryTree } from '@/api/category'
import { reqHomeNavList } from '@/api/home'

// ===== 超级菜单数据模型（静态数据与 API 分类树统一映射） =====
interface MegaLink {
  name: string
  id?: number
}
interface MegaGroup {
  title: string
  titleId?: number
  links: MegaLink[]
}
interface NavMegaCat {
  name: string
  icon: string
  groups: MegaGroup[]
  catId?: number
}

// 静态 CAT_MENU（兜底）→ 统一结构
function staticToNav(): NavMegaCat[] {
  return Object.entries(CAT_MENU).map(([name, v]: [string, MegaCat]) => ({
    name,
    icon: v.icon,
    groups: Object.entries(v.subs).map(([title, links]) => ({
      title,
      links: links.map((l) => ({ name: l })),
    })),
  }))
}

// API 分类树（/product/category/tree）→ 统一结构
function apiToNav(list: any[]): NavMegaCat[] {
  return list
    .filter((c) => c.name)
    .map((c) => ({
      name: c.name,
      icon: CAT_MENU[c.name]?.icon || '◈',
      catId: c.catId,
      groups: (c.children || [])
        .filter((c2: any) => c2.name)
        .map((c2: any) => ({
          title: c2.name,
          titleId: c2.catId,
          links: (c2.children || [])
            .filter((c3: any) => c3.name)
            .map((c3: any) => ({ name: c3.name, id: c3.catId })),
        })),
    }))
}

const megaCats = ref<NavMegaCat[]>(staticToNav())
const activeCat = ref<string>('')
const activeCatId = ref<number | undefined>(undefined)

function syncActive() {
  const first = megaCats.value[0]
  if (first) {
    activeCat.value = first.name
    activeCatId.value = first.catId
  }
}

// 加载分类：API 优先，失败/空回退静态
async function loadCategories() {
  try {
    const result: any = await reqCategoryTree()
    const list: any[] = result?.data || []
    if (list.length > 0) {
      megaCats.value = apiToNav(list)
    }
  } catch {
    /* 保持静态兜底 */
  }
  syncActive()
}

const megaOpen = ref(false)
let resizeHandler: (() => void) | null = null

// ===== 快捷导航（cat-row：全息设备 … 新品首发）=====
// API 优先（/coupon/homenav/list，mall-coupon 管理）；失败/为空回退内置静态
const STATIC_QUICK_CATS = [
  { name: '全息设备', icon: '⌬', tag: 'HOT' },
  { name: '量子计算', icon: '◈' },
  { name: '机甲外骨骼', icon: '⬡' },
  { name: '神经接口', icon: '✦' },
  { name: '智能义体', icon: '◉' },
  { name: '太空装备', icon: '✧' },
  { name: '能量补给', icon: '⚡' },
  { name: '新品首发', icon: '▸', tag: '新品' },
]

interface QuickCat {
  name: string
  icon: string
  hot?: boolean
  /** 标签文字（HOT/新品/爆款…；空=不显示） */
  tag?: string
  /** 标签颜色（CSS 颜色值；空=默认绿色） */
  tagColor?: string
  active?: boolean
  /** 配置的跳转链接（外链或站内路径；空=按名称跳列表筛选） */
  link?: string
}

const quickCats = ref<QuickCat[]>(STATIC_QUICK_CATS)

async function loadQuickCats() {
  try {
    const result: any = await reqHomeNavList()
    const list: any[] = result?.data || []
    if (list.length > 0) {
      quickCats.value = list
        .map((n: any) => ({
          name: String(n.name || '').trim(),
          icon: String(n.icon || '◈'),
          hot: Number(n.hot) === 1,
          tag:
            String(n.tag || (Number(n.hot) === 1 ? 'HOT' : '') || '').trim() ||
            undefined,
          tagColor: n.tagColor ? String(n.tagColor) : undefined,
          link: n.link ? String(n.link).trim() : undefined,
        }))
        .filter((x: QuickCat) => x.name)
    }
  } catch {
    /* 保持静态兜底 */
  }
}

// 外链判断（https:// 或 http://）
function isExternalLink(link?: string) {
  return !!link && /^https?:\/\//i.test(link)
}

// 跳转目标：配置了站内链接→用配置；否则按名称传参到列表页筛选
function catNavTo(cat: QuickCat) {
  if (cat.link) {
    return cat.link
  }
  return { path: '/list', query: { keyword: cat.name } }
}

// 标签徽标颜色：优先配置色，默认绿色
function tagStyle(cat: QuickCat) {
  return cat.tagColor ? { background: cat.tagColor } : undefined
}

function openMega() {
  megaOpen.value = true
  ;(document.querySelector('.cat-menu') as HTMLElement | null)?.classList.add(
    'open',
  )
}

function scheduleClose() {
  megaOpen.value = false
  ;(
    document.querySelector('.cat-menu') as HTMLElement | null
  )?.classList.remove('open')
}

// 导航下划线宽度 = 图标+文字宽度（移植 quantum fitCatLines）
function fitCatLines() {
  document.querySelectorAll('.nb-nav .cat').forEach((cat) => {
    const el = cat as HTMLElement
    let minL = Infinity
    let maxR = 0
    el.childNodes.forEach((ch) => {
      if (ch.nodeType === 1) {
        const node = ch as HTMLElement
        if (
          node.classList.contains('caret') ||
          node.classList.contains('tag-hot')
        )
          return
        const r = node.getBoundingClientRect()
        if (r.width === 0 && r.height === 0) return
        minL = Math.min(minL, r.left)
        maxR = Math.max(maxR, r.right)
      } else if (ch.nodeType === 3 && ch.textContent?.trim()) {
        const b = new Range()
        b.selectNodeContents(ch)
        const r = b.getBoundingClientRect()
        minL = Math.min(minL, r.left)
        maxR = Math.max(maxR, r.right)
      }
    })
    if (minL < Infinity) el.style.setProperty('--catline-w', `${maxR - minL}px`)
  })
}

onMounted(() => {
  void loadCategories()
  void loadQuickCats()
  void nextTick(() => {
    fitCatLines()
    resizeHandler = fitCatLines
    window.addEventListener('load', fitCatLines)
    window.addEventListener('resize', fitCatLines)
    if (document.fonts?.ready) {
      document.fonts.ready.then(fitCatLines)
    }
  })
})

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    window.removeEventListener('load', resizeHandler)
  }
})
</script>
