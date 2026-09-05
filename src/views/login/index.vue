<template>
  <div class="nb-login">
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
              欢迎登录
              <b>NEBULA MART</b>
            </h2>
            <p>星环商城 · CONNECTING 42 GALAXIES</p>
          </div>

          <div class="auth-body">
            <!-- 微信扫码 + 微博 -->
            <div class="qr-panel">
              <div class="qr-box">
                <img
                  v-if="wxQrUrl"
                  :src="wxQrUrl"
                  alt="微信登录二维码"
                  style="width: 100%; height: 100%"
                />
                <div v-else class="qr-loading">二维码加载中…</div>
              </div>
              <div class="qr-t">微信扫码登录</div>
              <div class="qr-s">使用「星讯」扫一扫 · 免输账号</div>
              <span class="qr-refresh" @click="loadWxQr">⟳ 刷新二维码</span>
              <div class="social-login">
                <button class="slog" @click="handleWeiboLogin">
                  <span class="wi">微</span>
                  微博登录
                </button>
                <button class="slog wechat" @click="loadWxQr">
                  <span class="wi">微</span>
                  微信登录
                </button>
              </div>
            </div>

            <!-- 表单 -->
            <div class="form-panel">
              <div class="auth-tabs">
                <div
                  class="atab"
                  :class="{ active: tab === 'pwd' }"
                  @click="tab = 'pwd'"
                >
                  密码登录
                </div>
                <div
                  class="atab"
                  :class="{ active: tab === 'sms' }"
                  @click="tab = 'sms'"
                >
                  验证码登录
                </div>
              </div>

              <!-- 密码登录 -->
              <div v-show="tab === 'pwd'" class="tab-pane active">
                <div class="f-item">
                  <div class="f-label">账号 ACCOUNT</div>
                  <input
                    name="pwdForm.username"
                    v-model.trim="pwdForm.username"
                    placeholder="手机号 / 星环ID / 邮箱"
                    maxlength="30"
                  />
                </div>
                <div class="f-item">
                  <div class="f-label">密码 PASSWORD</div>
                  <input
                    name="pwdForm.password"
                    v-model="pwdForm.password"
                    type="password"
                    placeholder="请输入密码"
                    @keyup.enter="handleLogin"
                  />
                </div>
                <div class="f-item">
                  <div class="f-label">图片验证码 CAPTCHA</div>
                  <div class="cap-row">
                    <input
                      name="pwdForm.captcha"
                      v-model.trim="pwdForm.captcha"
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
                      @click="drawLocalCaptcha"
                    ></canvas>
                  </div>
                </div>
                <div class="f-row">
                  <label class="chk">
                    <input name="remember" v-model="remember" type="checkbox" />
                    <span class="box"></span>
                    记住账号
                  </label>
                  <span class="link" @click="handleForgot">忘记密码？</span>
                </div>
                <button class="submit" :disabled="loading" @click="handleLogin">
                  {{ loading ? '量子引擎验证中…' : '登 录' }}
                </button>
              </div>

              <!-- 验证码登录 -->
              <div v-show="tab === 'sms'" class="tab-pane active">
                <div class="f-item">
                  <div class="f-label">手机号 PHONE</div>
                  <input
                    name="smsForm.phone"
                    v-model.trim="smsForm.phone"
                    placeholder="11 位星网号码"
                    maxlength="11"
                  />
                </div>
                <div class="f-item">
                  <div class="f-label">短信验证码 SMS CODE</div>
                  <div class="cap-row">
                    <input
                      name="smsForm.code"
                      v-model.trim="smsForm.code"
                      placeholder="6 位验证码"
                      maxlength="6"
                    />
                    <button
                      class="get-code"
                      :disabled="smsCountdown > 0"
                      @click="sendSmsCode"
                    >
                      {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
                    </button>
                  </div>
                </div>
                <div class="f-item">
                  <div class="f-label">图片验证码 CAPTCHA</div>
                  <div class="cap-row">
                    <input
                      name="smsForm.captcha"
                      v-model.trim="smsForm.captcha"
                      placeholder="输入右侧验证码"
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
                  </div>
                </div>
                <button
                  class="submit"
                  :disabled="loading"
                  @click="handleSmsLogin"
                >
                  {{ loading ? '量子引擎验证中…' : '验证码登录' }}
                </button>
              </div>

              <div class="auth-foot">
                <span>还没有星环账号？</span>
                <router-link to="/register">立即注册 ⟶</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode'
import useUserStore from '@/store/modules/user'
import { SET_TOKEN } from '@/utils/token'
import {
  reqCaptcha,
  reqWxQrCode,
  reqWxLoginStatus,
  reqSendSmsCode,
} from '@/api/user'
import message from '@/utils/message'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const tab = ref<'pwd' | 'sms'>('pwd')
const loading = ref(false)
const remember = ref(false)
const REMEMBER_KEY = 'nebula_remember'

const pwdForm = reactive({ username: '', password: '', captcha: '' })
const smsForm = reactive({ phone: '', code: '', captcha: '' })

// ===== 图片验证码（后端接口优先，失败本地 canvas 兜底） =====
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
      pwdForm.captcha = ''
      smsForm.captcha = ''
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

// 显示后端验证码图 → 交给后端校验；仅本地兜底图(无后端图)时前端比对本地码
const checkLocalCaptcha = () =>
  captchaImg.value
    ? true
    : pwdForm.captcha.toUpperCase() === localCaptcha.toUpperCase()

// ===== 登录 =====
async function handleLogin() {
  if (!pwdForm.username || !pwdForm.password) {
    message.warning('⚠ 请填写账号与密码')
    return
  }
  if (!checkLocalCaptcha()) {
    message.error('验证码错误')
    loadCaptcha()
    return
  }
  loading.value = true
  try {
    await userStore.userLogin({
      username: pwdForm.username,
      password: pwdForm.password,
      captchaKey: captchaKey.value || undefined,
      captchaCode: pwdForm.captcha || undefined,
    })
    if (remember.value) {
      localStorage.setItem(REMEMBER_KEY, pwdForm.username)
    } else {
      localStorage.removeItem(REMEMBER_KEY)
    }
    message.success('登录成功，欢迎回来！')
    userStore.userInfo().catch(() => {})
    const redirect = (route.query.redirect as string) || '/home'
    router.push(redirect)
  } catch (e) {
    message.error((e as Error).message || '登录失败，请稍后重试')
    loadCaptcha()
    pwdForm.captcha = ''
  } finally {
    loading.value = false
  }
}

// ===== 验证码登录（发送验证码 → 手机号+验证码登录） =====
const smsCountdown = ref(0)
let smsTimer: ReturnType<typeof setInterval> | null = null

async function sendSmsCode() {
  if (!/^1\d{10}$/.test(smsForm.phone)) {
    message.warning('⚠ 请输入 11 位星网号码')
    return
  }
  try {
    await reqSendSmsCode(smsForm.phone)
    message.success('✓ 验证码已发送，请注意查收')
  } catch {
    message.info('（演示模式）验证码：123456')
  }
  smsCountdown.value = 60
  if (smsTimer) clearInterval(smsTimer)
  smsTimer = setInterval(() => {
    smsCountdown.value--
    if (smsCountdown.value <= 0 && smsTimer) clearInterval(smsTimer)
  }, 1000)
}

async function handleSmsLogin() {
  if (!/^1\d{10}$/.test(smsForm.phone) || !smsForm.code) {
    message.warning('⚠ 请填写手机号与验证码')
    return
  }
  loading.value = true
  try {
    await userStore.userLogin({
      username: smsForm.phone,
      password: smsForm.code,
      captchaKey: captchaKey.value || undefined,
      captchaCode: smsForm.captcha || undefined,
    })
    message.success('登录成功，欢迎回来！')
    userStore.userInfo().catch(() => {})
    router.push((route.query.redirect as string) || '/home')
  } catch (e) {
    message.error((e as Error).message || '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function handleForgot() {
  message.info('请联系客服找回密码：400-000-0000')
}

// ===== 微博登录 =====
const WEIBO_CLIENT_ID = '2717647368'
const WEIBO_REDIRECT_URI = import.meta.env.VITE_WEIBO_REDIRECT_URI || 'http://auth.example.com/oauth2.0/weibo/success'
const WEIBO_REDIRECT_KEY = 'weibo_redirect'
function handleWeiboLogin() {
  const redirect = route.query.redirect as string
  if (redirect) {
    sessionStorage.setItem(WEIBO_REDIRECT_KEY, redirect)
  } else {
    sessionStorage.removeItem(WEIBO_REDIRECT_KEY)
  }
  const url =
    'https://api.weibo.com/oauth2/authorize' +
    `?client_id=${WEIBO_CLIENT_ID}` +
    '&response_type=code' +
    `&redirect_uri=${encodeURIComponent(WEIBO_REDIRECT_URI)}`
  window.location.href = url
}

// ===== 微信扫码登录 =====
const wxQrUrl = ref('')
const wxSessionId = ref(0)
let wxPollTimer: ReturnType<typeof setInterval> | null = null

async function loadWxQr() {
  wxQrUrl.value = ''
  wxSessionId.value = Math.floor(Date.now() / 1000) % 100000000
  try {
    const result: any = await reqWxQrCode(wxSessionId.value)
    const qrContent = result?.data || result
    wxQrUrl.value = await QRCode.toDataURL(
      String(qrContent || 'weixin://nebula-login'),
      {
        width: 200,
        margin: 1,
      },
    )
    startWxPoll()
  } catch {
    // 接口不可达：本地生成演示二维码
    wxQrUrl.value = await QRCode.toDataURL(
      `weixin://nebula-login?session=${wxSessionId.value}`,
      {
        width: 200,
        margin: 1,
      },
    )
    startWxPoll()
  }
}

function startWxPoll() {
  stopWxPoll()
  wxPollTimer = setInterval(async () => {
    try {
      const result: any = await reqWxLoginStatus(wxSessionId.value)
      const token = result?.data
      if (token) {
        stopWxPoll()
        userStore.token = String(token)
        SET_TOKEN(String(token))
        userStore.userInfo().catch(() => {})
        message.success('微信登录成功')
        router.push((route.query.redirect as string) || '/home')
      }
    } catch {
      /* 轮询失败忽略 */
    }
  }, 3000)
}

function stopWxPoll() {
  if (wxPollTimer) {
    clearInterval(wxPollTimer)
    wxPollTimer = null
  }
}

onMounted(() => {
  const saved = localStorage.getItem(REMEMBER_KEY)
  if (saved) {
    pwdForm.username = saved
    remember.value = true
  }
  loadCaptcha()
  loadWxQr()
})

onBeforeUnmount(() => {
  stopWxPoll()
  if (smsTimer) clearInterval(smsTimer)
})
</script>

<style scoped>
/* ===== 登录页布局 ===== */
.auth-wrap {
  display: flex;
  justify-content: center;
  padding: 44px 0 10px;
}
.auth-card {
  width: 880px;
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
  font-size: 22px;
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
.auth-body {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 0;
  margin-top: 14px;
}

/* 扫码区 */
.qr-panel {
  padding: 26px 24px;
  border-right: 1px solid rgba(0, 240, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 240, 255, 0.02);
}
.qr-box {
  width: 190px;
  height: 190px;
  border-radius: 14px;
  padding: 8px;
  background: #fff;
  box-shadow: 0 0 26px rgba(0, 240, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.qr-box canvas,
.qr-box img {
  width: 100%;
  height: 100%;
  display: block;
}
.qr-loading {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
}
.qr-t {
  font-size: 15px;
  font-weight: 700;
  color: var(--txt);
  margin-top: 16px;
  letter-spacing: 1px;
}
.qr-s {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  margin-top: 6px;
  letter-spacing: 2px;
}
.qr-refresh {
  margin-top: 8px;
  font-size: var(--font-size-xs);
  color: var(--cyan);
  cursor: pointer;
  letter-spacing: 1px;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.4);
}
.social-login {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  width: 100%;
}
.slog {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 8px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid rgba(255, 150, 60, 0.4);
  color: #ffb35c;
  background: rgba(255, 150, 60, 0.08);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: 0.22s;
}
.slog:hover {
  background: rgba(255, 150, 60, 0.16);
  box-shadow: 0 0 12px rgba(255, 150, 60, 0.3);
}
.slog .wi {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(135deg, #ff6b3d, #ff9f1a);
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.slog.wechat {
  border-color: rgba(57, 255, 136, 0.4);
  color: var(--green);
  background: rgba(57, 255, 136, 0.08);
}
.slog.wechat:hover {
  background: rgba(57, 255, 136, 0.16);
  box-shadow: 0 0 12px rgba(57, 255, 136, 0.3);
}
.slog.wechat .wi {
  background: linear-gradient(135deg, #39ff88, #00c9a7);
}

/* 表单区 */
.form-panel {
  padding: 24px 40px 30px;
}
.auth-tabs {
  display: flex;
  gap: 26px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.12);
  margin-bottom: 22px;
}
.atab {
  padding: 10px 2px 12px;
  font-size: 15px;
  font-weight: 700;
  color: var(--dim);
  cursor: pointer;
  letter-spacing: 2px;
  position: relative;
  transition: 0.2s;
}
.atab.active {
  color: var(--cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}
.atab::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: linear-gradient(90deg, #00f0ff, #ff2ec4);
  transform: scaleX(0);
  transition: 0.25s;
  box-shadow: 0 0 8px var(--cyan);
}
.atab.active::after {
  transform: scaleX(1);
}
.tab-pane {
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
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
.f-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.chk {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--dim);
  cursor: pointer;
  user-select: none;
}
.chk input {
  display: none;
}
.chk .box {
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
}
.chk input:checked + .box {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: var(--cyan);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}
.chk input:checked + .box::after {
  content: '✓';
}
.link {
  font-size: 13px;
  color: var(--cyan);
  cursor: pointer;
  letter-spacing: 1px;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.4);
}
.link:hover {
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

@media (max-width: 900px) {
  .auth-body {
    grid-template-columns: 1fr;
  }
  .qr-panel {
    border-right: none;
    border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  }
}
@media (max-width: 520px) {
  .form-panel {
    padding: 20px 20px 26px;
  }
}
</style>
