<template>
  <!-- 特性条（固定内容，多页面共用） -->
  <div v-reveal class="features">
    <div class="wrap">
      <div v-for="f in FEATURES" :key="f.title" class="feat">
        <div class="fi">{{ f.icon }}</div>
        <div>
          <div class="ft">{{ f.title }}</div>
          <div class="fs">{{ f.sub }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FEATURES } from '@/constants/nebula'
</script>
