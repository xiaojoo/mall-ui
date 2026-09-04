// ============================================================
// NEBULA 全息产品 Canvas 绘制（移植自 quantum nebula-product-detail.html）
// 用程序化绘制替代商品图，无需真实图片资源
// ============================================================

export interface ProductView {
  c: string
  label: string
  rot: number
  zoom: number
  d: string
}

function rgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

// 主图画布：全息表盘产品
export function drawProduct(
  cv: HTMLCanvasElement,
  color: string,
  label: string,
  rot: number,
  zoom: number,
  zoomLabel?: string,
): void {
  const ctx = cv.getContext('2d')
  if (!ctx) return
  const W = cv.width
  const H = cv.height
  ctx.clearRect(0, 0, W, H)
  const g = ctx.createRadialGradient(
    W / 2,
    H * 0.42,
    20,
    W / 2,
    H * 0.42,
    W * 0.58,
  )
  g.addColorStop(0, 'rgba(10,16,40,.95)')
  g.addColorStop(1, 'rgba(4,7,18,.98)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(0,240,255,.06)'
  ctx.lineWidth = 1
  for (let i = 1; i < 6; i++) {
    ctx.beginPath()
    ctx.arc(W / 2, H * 0.45, i * W * 0.09, 0, 7)
    ctx.stroke()
  }
  const cg = ctx.createRadialGradient(
    W / 2,
    H * 0.45,
    10,
    W / 2,
    H * 0.45,
    W * 0.4,
  )
  cg.addColorStop(0, rgba(color, 0.5))
  cg.addColorStop(1, rgba(color, 0))
  ctx.fillStyle = cg
  ctx.beginPath()
  ctx.arc(W / 2, H * 0.45, W * 0.4, 0, 7)
  ctx.fill()
  ctx.save()
  ctx.translate(W / 2, H * 0.48)
  ctx.rotate(rot)
  ctx.lineWidth = W * 0.15 * zoom
  ctx.strokeStyle = rgba(color, 0.92)
  ctx.shadowColor = color
  ctx.shadowBlur = W * 0.09 * zoom
  ctx.beginPath()
  ctx.ellipse(0, 0, W * 0.3 * zoom, W * 0.34 * zoom, 0, 0, 7)
  ctx.stroke()
  ctx.shadowBlur = 0
  ctx.fillStyle = 'rgba(5,9,24,.92)'
  ctx.beginPath()
  ctx.ellipse(0, 0, W * 0.175 * zoom, W * 0.205 * zoom, 0, 0, 7)
  ctx.fill()
  ctx.strokeStyle = rgba(color, 0.85)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(0, 0, W * 0.175 * zoom, W * 0.205 * zoom, 0, 0, 7)
  ctx.stroke()
  ctx.fillStyle = '#e8f1ff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${W * 0.05 * zoom}px "Share Tech Mono",monospace`
  ctx.fillText(label, 0, -W * 0.055 * zoom)
  ctx.font = `${W * 0.028 * zoom}px "Share Tech Mono",monospace`
  ctx.fillStyle = rgba(color, 0.95)
  ctx.fillText('◈ QUANTUM CORE ◈', 0, W * 0.06 * zoom)
  ctx.restore()
  if (zoom > 1.3) {
    ctx.strokeStyle = rgba(color, 0.5)
    ctx.lineWidth = 1.5
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(W * 0.12 + i * W * 0.16, H * 0.9)
      ctx.lineTo(W * 0.12 + i * W * 0.16 + W * 0.05, H * 0.82)
      ctx.stroke()
    }
  }
  void zoomLabel
}

// 缩略图画布
export function drawThumb(
  cv: HTMLCanvasElement,
  color: string,
  label: string,
  rot: number,
): void {
  const ctx = cv.getContext('2d')
  if (!ctx) return
  const W = cv.width
  const H = cv.height
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(6,10,26,.9)'
  ctx.fillRect(0, 0, W, H)
  const cg = ctx.createRadialGradient(W / 2, H / 2, 4, W / 2, H / 2, W * 0.5)
  cg.addColorStop(0, rgba(color, 0.4))
  cg.addColorStop(1, rgba(color, 0))
  ctx.fillStyle = cg
  ctx.fillRect(0, 0, W, H)
  ctx.save()
  ctx.translate(W / 2, H / 2)
  ctx.rotate(rot)
  ctx.lineWidth = W * 0.16
  ctx.strokeStyle = rgba(color, 0.95)
  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.ellipse(0, 0, W * 0.26, H * 0.3, 0, 0, 7)
  ctx.stroke()
  ctx.shadowBlur = 0
  ctx.fillStyle = '#e8f1ff'
  ctx.font = `bold ${W * 0.12}px "Share Tech Mono",monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 0, 0)
  ctx.restore()
}
