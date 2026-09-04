// 滚动显现指令：元素进入视口时添加 .in（配合 nebula.scss 的 .reveal 样式）
import type { Directive, DirectiveBinding } from 'vue'

interface RevealHTMLElement extends HTMLElement {
  __revealObserver__?: IntersectionObserver
  __revealInited__?: boolean
}

const reveal: Directive<RevealHTMLElement, boolean | undefined> = {
  mounted(
    el: RevealHTMLElement,
    binding: DirectiveBinding<boolean | undefined>,
  ) {
    // 默认开启；v-reveal="false" 时跳过（如首屏元素）
    if (binding.value === false) return
    if (el.__revealInited__) return
    el.__revealInited__ = true
    el.classList.add('reveal')

    const show = () => {
      el.classList.add('in')
      el.__revealObserver__?.disconnect()
    }

    // 已在视口内（首屏）直接显示，避免先隐藏再显现的闪烁
    const rect = el.getBoundingClientRect()
    const inViewport =
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.width > 0 &&
      rect.height > 0
    if (inViewport) {
      // 下一帧再加 in，让 reveal 过渡动画生效
      requestAnimationFrame(show)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) show()
        })
      },
      { threshold: 0.08 },
    )
    el.__revealObserver__ = io
    io.observe(el)
  },
  unmounted(el: RevealHTMLElement) {
    el.__revealObserver__?.disconnect()
  },
}

export default reveal
