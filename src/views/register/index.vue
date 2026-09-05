<template>
  <div class="nb-register">
    <!-- 固定内容 header（登录/注册专用） -->
    <header class="auth-header">
      <div class="wrap header-in">
        <router-link class="logo" to="/">
          <div class="logo-mark"></div>
          <div>
            <div class="logo-name">NEBULA MART</div>
            <div class="logo-sub">星环商城 · CYBER 2088</div>
          </div>
        </router-link>
        <router-link class="back-home" to="/">⟵ 返回首页</router-link>
      </div>
    </header>
    <div class="wrap">
      <div class="auth-wrap">
        <div class="auth-card">
          <div class="auth-head">
            <div class="logo-mark"></div>
            <h2>
              注册星环账号
              <b>NEBULA MART</b>
            </h2>
            <p>JOIN US · 新用户注册即送 ¥888 星元礼包</p>
          </div>

          <div class="form-panel">
            <div class="f-item">
              <div class="f-label">手机号 PHONE</div>
              <input
                name="form.phone"
                v-model.trim="form.phone"
                placeholder="11 位星网号码"
                maxlength="11"
              />
              <div v-if="errors.phone" class="hint show">
                {{ errors.phone }}
              </div>
            </div>
            <div class="f-item">
              <div class="f-label">图片验证码 CAPTCHA</div>
              <div class="cap-row">
                <input
                  name="form.captcha"
                  v-model.trim="form.captcha"
                  placeholder="输入右侧验证码（不区分大小写）"
                  maxlength="4"
                />
                <img
                  v-if="captchaImg"
                  :src="captchaImg"
                  alt="验证码"
                  class="cap-img"
                  title="点击刷新"
                  @click="loadCaptcha"
                />
                <canvas
                  v-else
                  ref="capCanvasRef"
                  width="110"
                  height="40"
                  @click="loadCaptcha"
                ></canvas>
              </div>
              <div v-if="errors.captcha" class="hint show">
                {{ errors.captcha }}
              </div>
            </div>
            <div class="f-item">
              <div class="f-label">短信验证码 SMS CODE</div>
              <div class="cap-row">
                <input
                  name="form.code"
                  v-model.trim="form.code"
                  placeholder="6 位验证码"
                  maxlength="6"
                />
                <button
                  class="get-code"
                  :disabled="countdown > 0"
                  @click="sendSms"
                >
                  {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                </button>
              </div>
              <div v-if="errors.code" class="hint show">{{ errors.code }}</div>
            </div>
            <div class="f-item">
              <div class="f-label">设置密码 PASSWORD</div>
              <input
                name="form.password"
                v-model="form.password"
                type="password"
                placeholder="6-20 位，含字母与数字"
                maxlength="20"
              />
              <div v-if="errors.password" class="hint show">
                {{ errors.password }}
              </div>
            </div>
            <div class="f-item">
              <div class="f-label">确认密码 CONFIRM</div>
              <input
                name="form.confirm"
                v-model="form.confirm"
                type="password"
                placeholder="再次输入密码"
                maxlength="20"
                @keyup.enter="handleRegister"
              />
              <div v-if="errors.confirm" class="hint show">
                {{ errors.confirm }}
              </div>
            </div>

            <label class="agree">
              <input name="agreed" v-model="agreed" type="checkbox" />
              <span class="box"></span>
              我已阅读并同意
              <span class="link" @click="openDoc('user')">《星环商城用户协议》</span>
              与
              <span class="link" @click="openDoc('privacy')">《量子隐私政策》</span>
            </label>

            <button class="submit" :disabled="loading" @click="handleRegister">
              {{ loading ? '量子引擎注册中…' : '注 册' }}
            </button>

            <div class="auth-foot">
              <span>已有星环账号？</span>
              <router-link to="/login">立即登录 ⟶</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 协议 / 隐私政策模态框 ===== -->
    <div v-if="docVisible" class="doc-mask" @click.self="closeDoc">
      <div class="doc-modal">
        <div class="doc-head">
          <h3>
            {{ docTitle }}
            <small>{{ docSub }}</small>
          </h3>
          <button class="doc-close" @click="closeDoc">✕</button>
        </div>
        <div class="doc-body" v-html="docBody"></div>
        <div class="doc-foot">
          <button class="doc-ok" @click="closeDoc">✓ 我已阅读</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import { reqCaptcha, reqSendSmsCode, reqRegister } from '@/api/user'
import message from '@/utils/message'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  phone: '',
  captcha: '',
  code: '',
  password: '',
  confirm: '',
})
const errors = reactive<Record<string, string>>({})
const agreed = ref(false)
const loading = ref(false)

// ===== 协议 / 隐私政策弹框 =====
const docVisible = ref(false)
const docTitle = ref('')
const docSub = ref('')
const docBody = ref('')

const DOCS: Record<string, { title: string; sub: string; body: string }> = {
  user: {
    title: '《星环商城用户协议》',
    sub: 'USER AGREEMENT',
    body: `
      <h4>一、协议确认</h4>
      欢迎注册<b>NEBULA MART 星环商城</b>。在完成注册前，请您仔细阅读并充分理解本协议全部条款。
      <h4>二、账号注册</h4>
      您需使用真实有效的手机号完成注册；同一星网身份仅可注册一个账号。请妥善保管账号密码，因保管不善导致的损失由您自行承担。
      <h4>三、量子购物服务</h4>
      本商城提供全息预览、量子推荐、轨道配送、脑波支付等服务；商品价格与库存以量子引擎实时数据为准。
      <h4>四、会员与积分</h4>
      会员等级依据成长值动态评定；积分仅限本商城使用，不可转让、不可兑换星元现金。
      <h4>五、责任声明</h4>
      因星际网络波动、星门拥堵等不可抗力造成的交易延迟，商城不承担相应责任，但将尽力保障您的权益。`,
  },
  privacy: {
    title: '《量子隐私政策》',
    sub: 'PRIVACY POLICY',
    body: `
      <h4>一、信息收集</h4>
      我们仅收集提供服务所必需的<b>手机号、收货地址、订单信息</b>等数据。
      <h4>二、信息使用</h4>
      您的数据将用于订单履约、量子推荐与安全风控，绝不会向第三方出售您的个人数据。
      <h4>三、量子加密</h4>
      全部数据传输经 <b>AES-4096</b> 量子加密通道保护；支付信息不落盘存储。
      <h4>四、您的权利</h4>
      您可随时在「个人信息」页查看、修改或导出您的数据，或申请注销账号。
      <h4>五、更新与联系</h4>
      本政策更新将提前 7 日在星环公告区公示；如有疑问请联系 7×24h 量子客服。`,
  },
}

function openDoc(key: 'user' | 'privacy') {
  const d = DOCS[key]
  docTitle.value = d.title
  docSub.value = d.sub
  docBody.value = d.body
  docVisible.value = true
}

function closeDoc() {
  docVisible.value = false
}

// ===== 验证码 =====
const captchaImg = ref('')
const captchaKey = ref('')
const capCanvasRef = ref<HTMLCanvasElement | null>(null)
let localCaptcha = ''

async function loadCaptcha() {
  try {
    const res: any = await reqCaptcha()
    const data = res?.data || {}
    captchaKey.value = data.key || ''
    // 兼容裸 base64 / 带 data: 前缀两种返回
    const raw = String(data.img || data.image || '')
    captchaImg.value = raw.startsWith('data:')
      ? raw
      : raw
        ? `data:image/png;base64,${raw}`
        : ''
    if (captchaImg.value) {
      form.captcha = ''
      return
    }
    throw new Error('no img')
  } catch {
    captchaImg.value = ''
    drawLocalCaptcha()
  }
}

function drawLocalCaptcha() {
  const cv = capCanvasRef.value
  if (!cv) return
  const ctx = cv.getContext('2d')
  if (!ctx) return
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  ctx.fillStyle = 'rgba(6,10,26,.9)'
  ctx.fillRect(0, 0, 110, 40)
  for (let i = 0; i < 4; i++) {
    const ch = chars[Math.floor(Math.random() * chars.length)]
    code += ch
    ctx.fillStyle = ['#00f0ff', '#a855f7', '#ff2ec4', '#39ff88'][
      Math.floor(Math.random() * 4)
    ]
    ctx.font = `bold ${20 + Math.random() * 6}px "Share Tech Mono",monospace`
    ctx.save()
    ctx.translate(16 + i * 24, 26)
    ctx.rotate((Math.random() - 0.5) * 0.5)
    ctx.fillText(ch, 0, 0)
    ctx.restore()
  }
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(0,240,255,${0.15 + Math.random() * 0.25})`
    ctx.beginPath()
    ctx.moveTo(Math.random() * 110, Math.random() * 40)
    ctx.lineTo(Math.random() * 110, Math.random() * 40)
    ctx.stroke()
  }
  localCaptcha = code
}

// ===== 短信 =====
const countdown = ref(0)
let smsTimer: ReturnType<typeof setInterval> | null = null

async function sendSms() {
  if (!/^1\d{10}$/.test(form.phone)) {
    errors.phone = '请输入 11 位星网号码'
    return
  }
  errors.phone = ''
  try {
    await reqSendSmsCode(form.phone)
    message.success('✓ 验证码已发送，请注意查收')
  } catch {
    message.info('（演示模式）验证码：123456')
  }
  countdown.value = 60
  if (smsTimer) clearInterval(smsTimer)
  smsTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && smsTimer) clearInterval(smsTimer)
  }, 1000)
}

// ===== 校验 =====
function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!/^1\d{10}$/.test(form.phone)) errors.phone = '手机号格式不正确'
  if (
    !captchaImg.value &&
    form.captcha.toUpperCase() !== localCaptcha.toUpperCase()
  )
    errors.captcha = '验证码错误'
  if (!form.code) errors.code = '请输入短信验证码'
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(form.password))
    errors.password = '密码需 6-20 位且包含字母和数字'
  if (form.confirm !== form.password) errors.confirm = '两次输入的密码不一致'
  if (!agreed.value) {
    message.warning('请先阅读并同意用户协议')
    return false
  }
  return Object.keys(errors).length === 0
}

// ===== 注册 =====
async function handleRegister() {
  if (!validate()) return
  loading.value = true
  try {
    const res: any = await reqRegister({
      username: form.phone,
      mobile: form.phone,
      password: form.password,
      code: form.code,
      captchaKey: captchaKey.value || undefined,
      captchaCode: form.captcha || undefined,
    })
    if (res.code === 200) {
      message.success('✓ 注册成功，请登录')
      router.push('/login')
    } else {
      message.error(res.message || '注册失败')
      loadCaptcha()
    }
  } catch (e) {
    message.error((e as Error).message || '注册失败，请稍后重试')
    loadCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(loadCaptcha)
onBeforeUnmount(() => {
  if (smsTimer) clearInterval(smsTimer)
})
</script>

<style scoped>
/* ===== 注册页布局（复用登录页视觉体系） ===== */
.auth-wrap {
  display: flex;
  justify-content: center;
  padding: 44px 0 10px;
}
.auth-card {
  width: 560px;
  max-width: 100%;
  border: 1px solid var(--line);
  border-radius: 22px;
  overflow: hidden;
  background: var(--panel);
  backdrop-filter: blur(14px);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(0, 240, 255, 0.08);
}
.auth-head {
  text-align: center;
  padding: 28px 0 6px;
}
.auth-head .logo-mark {
  width: 56px;
  height: 56px;
  margin: 0 auto 14px;
}
.auth-head h2 {
  font-family: var(--font-h);
  font-size: 21px;
  font-weight: 900;
  letter-spacing: 3px;
  color: #fff;
}
.auth-head h2 b {
  background: linear-gradient(90deg, #00f0ff, #a855f7, #ff2ec4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.4));
}
.auth-head p {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 3px;
  margin-top: 6px;
}
.form-panel {
  padding: 24px 44px 34px;
}

.f-item {
  margin-bottom: 16px;
}
.f-label {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.f-label::before {
  content: '';
  width: 3px;
  height: 11px;
  border-radius: 2px;
  background: linear-gradient(180deg, #00f0ff, #a855f7);
  box-shadow: 0 0 6px var(--cyan);
}
.f-item input {
  width: 100%;
  height: 44px;
  border-radius: 10px;
  border: 1px solid rgba(0, 240, 255, 0.25);
  background: rgba(6, 10, 26, 0.7);
  color: var(--txt);
  padding: 0 14px;
  font-family: var(--font-b);
  font-size: 15px;
  outline: none;
  transition: 0.2s;
  box-sizing: border-box;
}
.f-item input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
.cap-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.cap-row input {
  flex: 1;
}
.cap-row canvas,
.cap-img {
  height: 44px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid rgba(0, 240, 255, 0.25);
  flex-shrink: 0;
}

/* 验证提示 */
.hint {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--magenta);
  margin-top: 7px;
  letter-spacing: 1px;
  text-shadow: 0 0 8px rgba(255, 46, 196, 0.3);
  animation: hintIn 0.2s ease;
}
@keyframes hintIn {
  from {
    opacity: 0;
    transform: translateY(-3px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.hint::before {
  content: '⚠';
  flex-shrink: 0;
}

.get-code {
  height: 44px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid rgba(0, 240, 255, 0.4);
  color: var(--cyan);
  background: rgba(0, 240, 255, 0.06);
  cursor: pointer;
  font-size: 13px;
  letter-spacing: 1px;
  white-space: nowrap;
  transition: 0.2s;
  font-family: var(--font-b);
}
.get-code:hover:not(:disabled) {
  background: rgba(0, 240, 255, 0.14);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
.get-code:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.agree {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--dim);
  cursor: pointer;
  user-select: none;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.agree input {
  display: none;
}
.agree .box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 240, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  color: #02101a;
  transition: 0.2s;
  background: rgba(0, 240, 255, 0.04);
  flex-shrink: 0;
}
.agree input:checked + .box {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: var(--cyan);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}
.agree input:checked + .box::after {
  content: '✓';
}
.agree .link {
  color: var(--cyan);
  cursor: pointer;
}
.agree .link:hover {
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
}

.submit {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  font-family: var(--font-h);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 4px;
  box-shadow: 0 0 22px rgba(0, 240, 255, 0.45);
  transition: 0.25s;
}
.submit:hover {
  filter: brightness(1.15);
  transform: translateY(-2px);
  box-shadow: 0 0 34px rgba(0, 240, 255, 0.8);
}
.submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.auth-foot {
  text-align: center;
  margin-top: 22px;
  font-size: 14px;
  color: var(--dim);
  letter-spacing: 1px;
}
.auth-foot a {
  color: var(--cyan);
  text-decoration: none;
  font-weight: 700;
  margin-left: 6px;
}
.auth-foot a:hover {
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
}

/* ===== 协议 / 隐私政策模态框 ===== */
.doc-mask {
  position: fixed;
  inset: 0;
  background: rgba(3, 5, 14, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.doc-modal {
  width: 560px;
  max-width: 100%;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: linear-gradient(160deg, #0c1130, #0a0e26);
  padding: 24px 26px;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(0, 240, 255, 0.12);
  animation: docIn 0.25s ease;
}
@keyframes docIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.doc-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.doc-head h3 {
  font-family: var(--font-h);
  font-size: 17px;
  letter-spacing: 2px;
  color: #fff;
}
.doc-head h3 small {
  display: block;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 3px;
  font-weight: 400;
  margin-top: 4px;
}
.doc-close {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid rgba(0, 240, 255, 0.3);
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
  flex-shrink: 0;
}
.doc-close:hover {
  background: rgba(255, 46, 196, 0.12);
  border-color: var(--magenta);
  color: var(--magenta);
}
.doc-body {
  max-height: 46vh;
  overflow-y: auto;
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--dim);
  padding-right: 6px;
}
.doc-body h4 {
  color: var(--cyan);
  font-size: 14px;
  letter-spacing: 2px;
  margin: 14px 0 6px;
  font-family: var(--font-h);
}
.doc-body b {
  color: var(--txt);
}
.doc-foot {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}
.doc-ok {
  padding: 9px 22px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  font-family: var(--font-m);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  transition: 0.25s;
}
.doc-ok:hover {
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.6);
}

@media (max-width: 520px) {
  .form-panel {
    padding: 20px 20px 26px;
  }
}
</style>
