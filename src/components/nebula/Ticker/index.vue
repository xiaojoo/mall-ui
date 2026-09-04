<template>
  <!-- 跑马灯公告（内容来自 /product/home ticker，失败回退内置） -->
  <div v-reveal class="ticker">
    <div class="ticker-track">
      <span v-for="(item, i) in doubledItems" :key="i">{{ item }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TICKER_ITEMS } from '@/constants/nebula'

const props = defineProps<{ items?: string[] }>()

// 内容复制一份实现无缝滚动（CSS animation 平移 -50%）
const doubledItems = computed(() => {
  const list =
    props.items && props.items.length > 0 ? props.items : TICKER_ITEMS
  return [...list, ...list]
})
</script>
