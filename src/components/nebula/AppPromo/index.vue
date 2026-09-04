<template>
  <!-- 大促横条（多页面共用；内容自取 /product/home promo，失败回退内置） -->
  <div v-reveal class="promo">
    <div class="wrap">
      <div>
        <h3>
          🎆
          <span class="m1">{{ data.title1 }}</span>
          ·
          <span class="m2">{{ data.title2 }}</span>
        </h3>
        <p>{{ data.description }}</p>
      </div>
      <div class="promo-code">
        <div class="codebox">{{ data.code }}</div>
        <router-link class="btn btn-primary" :to="data.btnLink">
          {{ data.btnText }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { reqHomeData } from '@/api/home'

// 内置兜底：与原硬编码内容一致
const DEFAULT_PROMO = {
  title1: '618 星际狂欢节',
  title2: '全场低至 1 折',
  description:
    '新用户注册立得 ¥888 星元 · 会员加赠量子加速券 · 满 5000 减 800 上不封顶',
  code: 'NEBULA-618',
  btnText: '立即抢购 ⟶',
  btnLink: '/list',
}

// 组件自取接口数据（所有使用页统一生效）；btnText/btnTo 页面级覆盖优先级最高
const props = defineProps<{ promo?: any; btnText?: string; btnTo?: string }>()
const localPromo = ref<any>(null)

onMounted(() => {
  reqHomeData()
    .then((res: any) => {
      const list: any[] = res?.data?.promo || []
      if (list.length > 0) {
        localPromo.value = list[0]
      }
    })
    .catch(() => {
      /* 保持内置兜底 */
    })
})

const data = computed(() => {
  const p = props.promo || localPromo.value || {}
  return {
    title1: p.title1 || DEFAULT_PROMO.title1,
    title2: p.title2 || DEFAULT_PROMO.title2,
    description: p.description || DEFAULT_PROMO.description,
    code: p.code || DEFAULT_PROMO.code,
    btnText: props.btnText || p.btnText || DEFAULT_PROMO.btnText,
    btnLink: props.btnTo || p.btnLink || DEFAULT_PROMO.btnLink,
  }
})
</script>
