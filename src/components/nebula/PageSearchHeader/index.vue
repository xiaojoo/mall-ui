<template>
  <header class="ps-header">
    <div class="wrap ps-in">
      <router-link class="logo" to="/">
        <div class="logo-mark"></div>
        <div>
          <div class="logo-name">NEBULA MART</div>
          <div class="logo-sub">星环商城 · CYBER 2088</div>
        </div>
      </router-link>
      <div class="ps-search" :class="{ 'has-value': kw }">
        <span class="ps-ico">⌕</span>
        <input
          name="page-search-kw"
          :value="kw"
          :placeholder="placeholder"
          @input="onInput"
          @keyup.enter="onSearch"
        />
        <button
          v-if="kw"
          type="button"
          class="ps-clear"
          title="清除"
          @click="clearKw"
        >
          ✕
        </button>
        <button type="button" class="ps-btn" @click="onSearch">SEARCH</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// 页面数据搜索 header：logo + 搜索框（搜索当前页面数据，如订单/评价/收藏…）
// submitOnly=true：点击 SEARCH / 回车才触发搜索（不实时过滤）
const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    submitOnly?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: '搜索当前页面数据…',
    submitOnly: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'search', v: string): void
}>()

const kw = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => {
    kw.value = v
  },
)

function onInput(e: Event) {
  kw.value = (e.target as HTMLInputElement).value
  if (!props.submitOnly) emit('update:modelValue', kw.value)
}

function onSearch() {
  emit('search', kw.value)
}

function clearKw() {
  kw.value = ''
  if (!props.submitOnly) emit('update:modelValue', '')
  emit('search', '')
}
</script>

<style scoped>
.ps-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(4, 7, 18, 0.82);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.45);
}
.ps-in {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  gap: 24px;
}
/* 搜索框：与首页 nb-header 同款样式 */
.ps-search {
  position: relative;
  flex: 1;
  max-width: 600px;
}
.ps-search input {
  width: 100%;
  height: 44px;
  padding: 0 138px 0 46px;
  border-radius: 24px;
  background: rgba(10, 16, 40, 0.7);
  border: 1px solid var(--line);
  color: var(--txt);
  font-family: var(--font-b);
  font-size: 15px;
  letter-spacing: 1px;
  outline: none;
  transition: 0.3s;
  box-shadow: inset 0 0 18px rgba(0, 240, 255, 0.06);
}
.ps-search input::placeholder {
  color: var(--dim);
}
.ps-search input:focus {
  border-color: var(--cyan);
  box-shadow:
    0 0 0 3px rgba(0, 240, 255, 0.14),
    0 0 24px rgba(0, 240, 255, 0.35);
  background: rgba(8, 14, 34, 0.92);
}
/* 有内容：整框高亮 */
.ps-search.has-value input {
  border-color: var(--cyan);
  background: rgba(8, 14, 34, 0.92);
  box-shadow:
    0 0 0 3px rgba(0, 240, 255, 0.14),
    0 0 24px rgba(0, 240, 255, 0.35),
    inset 0 0 18px rgba(0, 240, 255, 0.1);
}
.ps-ico {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--cyan);
  font-size: 17px;
  text-shadow: 0 0 8px var(--cyan);
  pointer-events: none;
}
.ps-clear {
  position: absolute;
  right: 122px;
  z-index: 2;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 240, 255, 0.12);
  color: var(--cyan);
  font-size: var(--font-size-xs);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  line-height: 1;
}
.ps-clear:hover {
  background: rgba(255, 46, 196, 0.18);
  color: var(--magenta);
}
.ps-btn {
  position: absolute;
  right: 5px;
  top: 5px;
  height: 34px;
  padding: 0 20px;
  border: none;
  border-radius: 17px;
  cursor: pointer;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  font-family: var(--font-h);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.5);
  transition: 0.25s;
}
.ps-btn:hover {
  filter: brightness(1.25);
  box-shadow: 0 0 22px rgba(0, 240, 255, 0.8);
}
/* 有内容：放大镜变亮 */
.ps-search.has-value .ps-ico {
  color: #fff;
  text-shadow:
    0 0 10px var(--cyan),
    0 0 20px rgba(0, 240, 255, 0.6);
}
/* 有内容：✕ 清除按钮变亮 */
.ps-search.has-value .ps-clear {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}
.ps-search.has-value .ps-clear:hover {
  background: linear-gradient(90deg, #ff2ec4, #ff6b3d);
  color: #02101a;
}

@media (max-width: 760px) {
  .ps-in {
    height: 56px;
    gap: 12px;
  }
  .ps-search {
    max-width: none;
  }
  .ps-btn {
    padding: 0 14px;
  }
}
</style>
