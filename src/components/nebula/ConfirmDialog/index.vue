<template>
  <div v-if="visible" class="nc-mask" @click.self="handleCancel">
    <div class="nc-modal">
      <div class="nc-head">
        <h3>
          {{ title }}
          <small v-if="subtitle">{{ subtitle }}</small>
        </h3>
        <button type="button" class="nc-close" @click="handleCancel">✕</button>
      </div>
      <div class="nc-body">
        <!-- 自定义内容；未传时用 message 文本 -->
        <slot>
          <div class="nc-txt">{{ message }}</div>
        </slot>
      </div>
      <div class="nc-foot">
        <button type="button" class="nc-btn ghost" @click="handleCancel">
          {{ cancelText }}
        </button>
        <button
          type="button"
          class="nc-btn primary"
          :class="{ danger }"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean
    title?: string
    subtitle?: string
    message?: string
    confirmText?: string
    cancelText?: string
    danger?: boolean
  }>(),
  {
    title: '确认操作',
    subtitle: '',
    message: '确定执行该操作吗？',
    confirmText: '✓ 确认',
    cancelText: '取消',
    danger: false,
  },
)

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function handleCancel() {
  emit('update:visible', false)
  emit('cancel')
}

function handleConfirm() {
  emit('confirm')
}
</script>

<style scoped>
.nc-mask {
  position: fixed;
  inset: 0;
  background: rgba(3, 5, 14, 0.72);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nc-modal {
  width: 440px;
  max-width: calc(100vw - 40px);
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(6, 10, 26, 0.97);
  backdrop-filter: blur(20px);
  padding: 26px 30px;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(255, 46, 196, 0.12);
  animation: ncIn 0.25s ease;
}
@keyframes ncIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.nc-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.nc-head h3 {
  font-family: var(--font-h);
  font-size: 17px;
  letter-spacing: 2px;
  color: #fff;
}
.nc-head h3 small {
  display: block;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 3px;
  font-weight: 400;
  margin-top: 4px;
}
.nc-close {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid rgba(255, 46, 196, 0.35);
  background: rgba(255, 46, 196, 0.06);
  color: var(--magenta);
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}
.nc-close:hover {
  background: rgba(255, 46, 196, 0.14);
  border-color: var(--magenta);
}
.nc-txt {
  font-size: 14px;
  color: var(--dim);
  line-height: 1.9;
  letter-spacing: 1px;
  padding: 6px 2px;
}
.nc-foot {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}
.nc-btn {
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
.nc-btn.ghost {
  border: 1px solid rgba(0, 240, 255, 0.4);
  background: transparent;
  color: var(--cyan);
}
.nc-btn.ghost:hover {
  background: rgba(0, 240, 255, 0.1);
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.3);
}
.nc-btn.primary {
  border: none;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.5);
}
.nc-btn.primary:hover {
  filter: brightness(1.15);
  box-shadow: 0 0 28px rgba(0, 240, 255, 0.85);
}
.nc-btn.primary.danger {
  background: linear-gradient(90deg, #ff2ec4, #ff6b3d);
  box-shadow: 0 0 18px rgba(255, 46, 196, 0.5);
}
.nc-btn.primary.danger:hover {
  filter: brightness(1.15);
  box-shadow: 0 0 28px rgba(255, 46, 196, 0.85);
}
</style>
