<template>
  <!-- 顶部工具条 -->
  <div class="utility">
    <div class="wrap">
      <div class="ut-left">
        <template v-if="userStore.token">
          <span class="ut-avatar">
            <img v-if="userStore.avatar && !avatarBroken" :src="userStore.avatar" alt="头像" @error="avatarBroken = true" />
            <b v-else-if="userStore.username" class="ut-avatar-fallback">{{ userStore.username.charAt(0).toUpperCase() }}</b>
            <template v-else>◬</template>
          </span>
          <router-link class="ut-link" to="/home">
            <b class="ut-user">{{ userStore.username || '星舰会员' }}</b>
          </router-link>
          <span class="ut-link ut-logout" @click="handleLogout">⏻ 退出</span>
        </template>
      </div>
      <div class="ut-right">
        <template v-if="userStore.token">
          <router-link class="ut-link" to="/profile">👤 个人信息</router-link>
          <router-link class="ut-link" to="/orders">📝 我的订单</router-link>
          <router-link class="ut-link" to="/cart">🛒 购物车</router-link>
          <router-link class="ut-link" to="/reviews">💬 商品评论</router-link>
        </template>
        <template v-else>
          <router-link class="ut-link" to="/login">登录</router-link>
          <span class="ut-auth-sep">|</span>
          <router-link class="ut-link" to="/register">注册</router-link>
        </template>
        <span class="ut-info">⚡ 极速达 7×24h</span>
      </div>
    </div>
  </div>

  <!-- 主头部：仅首页 / 商品详情显示 -->
  <header v-if="showMainHeader" class="nb-header">
    <div class="wrap header-row">
      <router-link class="logo" to="/">
        <div class="logo-mark"></div>
        <div>
          <div class="logo-name">NEBULA MART</div>
          <div class="logo-sub">星环商城 · CYBER 2088</div>
        </div>
      </router-link>
      <div class="search">
        <span class="s-ico">⌕</span>
        <input
          name="keyword"
          v-model.trim="keyword"
          type="text"
          placeholder="搜索全息设备 / 量子芯片 / 机甲外骨骼…"
          @keyup.enter="doSearch()"
          @focus="onFocus"
          @blur="onBlur"
        />
        <button
          v-if="keyword"
          type="button"
          class="s-clear"
          title="清除"
          @click="clearKeyword"
        >
          ✕
        </button>
        <button class="s-btn" @click="doSearch()">SCAN</button>

        <!-- 搜索联想下拉（防抖调搜索 API，失败本地兜底） -->
        <transition name="sd-fade">
          <div v-if="suggestVisible" class="search-drop">
            <div
              v-for="s in suggestions"
              :key="s.name"
              class="sd-item"
              @mousedown.prevent="doSearch(s.name)"
            >
              <span class="sd-ico">⌕</span>
              <div class="sd-main">
                <div class="sd-name">{{ s.name }}</div>
                <div v-if="s.cat" class="sd-cat">{{ s.cat }}</div>
              </div>
            </div>
            <div v-if="suggestions.length === 0" class="sd-empty">
              NO SIGNAL · 无匹配商品
            </div>
          </div>
        </transition>
      </div>
      <div class="h-actions">
        <router-link class="hbtn" :to="userStore.token ? '/profile' : '/login'">
          👤 账户
        </router-link>
        <router-link class="hbtn" to="/favorites">
          ♡ 心愿单
          <span v-if="favStore.favCount > 0" class="badge">
            {{ favStore.favCount }}
          </span>
        </router-link>
        <router-link class="hbtn" to="/cart">
          🛒 购物车
          <span v-if="cartStore.cartCount > 0" class="badge">
            {{ cartStore.cartCount }}
          </span>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import useCartStore from '@/store/modules/cart'
import useFavoritesStore from '@/store/modules/favorites'
import { reqSearchSku } from '@/api/search'
import { PRODUCTS_LIST } from '@/constants/mock'
import message from '@/utils/message'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()
const favStore = useFavoritesStore()
const avatarBroken = ref(false)
// 头像地址变化(如重新登录/刷新资料)时重置错误状态
watch(() => userStore.avatar, () => { avatarBroken.value = false })

// 主头部只在 首页 / 商品列表 / 商品详情 显示（utility 工具条始终显示）
const showMainHeader = computed(() => {
  const n = String(route.name)
  return (
    ['home', 'list', 'details'].includes(n) ||
    ['/', '/home', '/list', '/details'].includes(route.path)
  )
})

const keyword = ref('')
const suggestions = ref<Array<{ name: string; cat?: string }>>([])
const suggestVisible = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let searchSeq = 0

// 输入防抖：300ms 后请求搜索联想
watch(keyword, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  const v = val.trim()
  if (!v) {
    suggestions.value = []
    suggestVisible.value = false
    return
  }
  debounceTimer = setTimeout(() => loadSuggestions(v), 300)
})

async function loadSuggestions(v: string) {
  const seq = ++searchSeq
  let list: Array<{ name: string; cat?: string }> = []
  try {
    const res: any = await reqSearchSku({ keyword: v, pageNum: 1 })
    const items: any[] = res?.data?.products || []
    list = items
      .slice(0, 8)
      .map((it) => ({
        name: String(it.skuTitle || '').replace(/<[^>]+>/g, ''),
        cat: it.skuCategoryName || '',
      }))
      .filter((it) => it.name)
  } catch {
    /* 走本地兜底 */
  }
  // API 无结果/失败 → 本地商品库按名称过滤
  if (list.length === 0) {
    list = PRODUCTS_LIST.filter((p) => p.name.includes(v))
      .slice(0, 8)
      .map((p) => ({ name: p.name, cat: p.cat }))
  }
  if (seq !== searchSeq) return
  suggestions.value = list
  suggestVisible.value = true
}

function doSearch(val?: string) {
  const v = (val ?? keyword.value).trim()
  if (!v) return
  suggestions.value = []
  suggestVisible.value = false
  router.push({ path: '/list', query: { keyword: v } })
}

// 清除搜索关键词
function clearKeyword() {
  keyword.value = ''
  suggestions.value = []
  suggestVisible.value = false
}

function onFocus() {
  if (keyword.value.trim() && suggestions.value.length > 0) {
    suggestVisible.value = true
  }
}

function onBlur() {
  // 延迟关闭，让 mousedown 点击联想项先触发搜索
  setTimeout(() => {
    suggestVisible.value = false
  }, 150)
}

onMounted(() => {
  // 已登录则拉取会员信息（昵称/头像）
  if (userStore.token) {
    userStore.userInfo().catch(() => {})
  }
})

// 登录态变化（密码/短信/微信/微博登录、退出登录）→ 同步购物车与心愿单角标
watch(
  () => userStore.token,
  (t) => {
    if (!t) {
      cartStore.cartCount = 0
      favStore.favCount = 0
      return
    }
    cartStore.refreshCartCount()
    favStore.refreshFavCount()
  },
  { immediate: true },
)

// 退出登录
async function handleLogout() {
  await userStore.userLogOut()
  message.success('已退出登录')
  router.push('/home')
}

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<style scoped>
/* ===== 搜索联想下拉 ===== */
.search {
  flex: 1;
  position: relative;
  max-width: 600px;
}
.search-drop {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 60;
  background: rgba(6, 10, 26, 0.97);
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
  backdrop-filter: blur(14px);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.6),
    0 0 24px rgba(0, 240, 255, 0.12);
}
.sd-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  cursor: pointer;
  transition: 0.15s;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.07);
}
.sd-item:last-child {
  border-bottom: none;
}
.sd-item:hover {
  background: rgba(0, 240, 255, 0.1);
}
.sd-ico {
  color: var(--cyan);
  font-size: 14px;
  flex-shrink: 0;
  text-shadow: 0 0 8px var(--cyan);
}
.sd-main {
  min-width: 0;
}
.sd-name {
  font-size: 14px;
  color: var(--txt);
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sd-cat {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--cyan);
  letter-spacing: 2px;
  margin-top: 2px;
}
.sd-empty {
  padding: 16px;
  text-align: center;
  font-family: var(--font-m);
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 2px;
}
.sd-fade-enter-active,
.sd-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.sd-fade-enter-from,
.sd-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
