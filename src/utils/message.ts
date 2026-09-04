// 全局提示消息（自研 toast，替代 ElMessage）
type MessageType = 'success' | 'error' | 'warning' | 'info'

const ICONS: Record<MessageType, string> = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'i',
}

const COLORS: Record<MessageType, string> = {
  success: '#67c23a',
  error: '#ff0f23',
  warning: '#e6a23c',
  info: '#909399',
}

let container: HTMLDivElement | null = null

function ensureContainer(): HTMLDivElement {
  if (!container) {
    container = document.createElement('div')
    container.className = 'app-message-container'
    document.body.appendChild(container)
  }
  return container
}

function show(type: MessageType, content: string, duration = 2500) {
  const box = document.createElement('div')
  box.className = `app-message app-message--${type}`
  box.innerHTML = `<span class="app-message-icon">${ICONS[type]}</span><span class="app-message-content">${content}</span>`
  box.style.setProperty('--msg-color', COLORS[type])
  ensureContainer().appendChild(box)

  // 进入动画（下一帧加类名触发过渡）
  requestAnimationFrame(() => box.classList.add('app-message--show'))

  // 自动消失
  setTimeout(() => {
    box.classList.remove('app-message--show')
    setTimeout(() => box.remove(), 250)
  }, duration)
}

export default {
  success: (content: string, duration?: number) =>
    show('success', content, duration),
  error: (content: string, duration?: number) =>
    show('error', content, duration),
  warning: (content: string, duration?: number) =>
    show('warning', content, duration),
  info: (content: string, duration?: number) => show('info', content, duration),
}
