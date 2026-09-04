<template>
  <div class="nb-profile">
    <div class="wrap">
      <div class="crumbs">
        <router-link to="/">Nebula Home</router-link>
        <span class="sep">/</span>
        <span class="cur">个人信息</span>
      </div>
      <div class="page-head sec-head">
        <div class="sec-title">
          <h2>
            👤 个人信息
            <small>PERSONAL INFO · 星环 ID</small>
          </h2>
        </div>
      </div>

      <div class="ac-wrap">
        <!-- ===== 会员档案横幅 ===== -->
        <div class="profile-banner">
          <div
            class="avatar-wrap"
            title="点击更换头像"
            @click="avatarVisible = true"
          >
            <div class="avatar">
              <img
                v-if="avatarImg"
                :src="avatarImg"
                alt="头像"
                class="avatar-img"
              />
              <template v-else>{{ avatarGlyph }}</template>
            </div>
            <div class="avatar-edit">✎</div>
          </div>
          <div class="pb-info">
            <div class="pb-name">
              <span class="n">
                {{ profile.nickname || userStore.username || '星舰领航员' }}
              </span>
              <span class="lv">Lv.7 星际尊享会员</span>
              <button class="logout" @click="handleLogout">⏻ 退出登录</button>
            </div>
            <div class="pb-sign">
              {{ profile.signature || '穿梭 42 个星系的购物狂 · 星环 2088' }}
            </div>
            <div class="pb-stats">
              <div class="pb-stat">
                <div class="sv">{{ fmtNum(memberStats.integration) }}</div>
                <div class="sl">积分 POINTS</div>
              </div>
              <div class="pb-stat">
                <div class="sv">4</div>
                <div class="sl">优惠券 COUPONS</div>
              </div>
              <div class="pb-stat">
                <div class="sv">¥{{ fmtNum(memberStats.balance) }}</div>
                <div class="sl">星元余额 BALANCE</div>
              </div>
              <div class="pb-stat">
                <div class="sv">12</div>
                <div class="sl">订单 ORDERS</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== 会员成长 ===== -->
        <section class="ac-sec">
          <div class="ac-sec-head">
            <div class="bar"></div>
            <h3>
              会员成长
              <small>LEVEL GROWTH</small>
            </h3>
          </div>
          <div class="ac-sec-body">
            <div class="grow-row">
              <span class="grow-level">Lv.7 → Lv.8</span>
              <div class="grow-bar">
                <i :style="{ width: growPct + '%' }"></i>
              </div>
              <span class="grow-val">
                成长值
                <b>{{ fmtNum(memberStats.growth) }}</b>
                / {{ fmtNum(GROWTH_TARGET) }} · 距升级还需
                {{ fmtNum(growRemain) }}
              </span>
            </div>
          </div>
        </section>

        <!-- ===== 个人信息编辑 ===== -->
        <section class="ac-sec">
          <div class="ac-sec-head">
            <div class="bar"></div>
            <h3>
              个人信息编辑
              <small>PROFILE EDIT</small>
            </h3>
          </div>
          <div class="ac-sec-body">
            <div class="pf-grid">
              <div class="pf-item">
                <div class="pl">昵称 NICKNAME</div>
                <input
                  name="profile.nickname"
                  v-model.trim="profile.nickname"
                  maxlength="12"
                />
              </div>
              <div class="pf-item">
                <div class="pl">性别 GENDER</div>
                <select name="profile.gender" v-model="profile.gender">
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="保密">保密</option>
                </select>
              </div>
              <div class="pf-item">
                <div class="pl">生日 BIRTHDAY</div>
                <input
                  name="profile.birthday"
                  v-model="profile.birthday"
                  type="date"
                />
              </div>
              <div class="pf-item">
                <div class="pl">电子邮箱 EMAIL</div>
                <input
                  name="profile.email"
                  v-model.trim="profile.email"
                  type="email"
                  placeholder="pilot@nebula.mart"
                />
              </div>
              <div class="pf-item">
                <div class="pl">联系电话 PHONE</div>
                <input
                  name="profile.phone"
                  v-model.trim="profile.phone"
                  maxlength="11"
                />
              </div>
              <div class="pf-item">
                <div class="pl">所在星系 GALAXY</div>
                <select name="profile.galaxy" v-model="profile.galaxy">
                  <option>地球 · 太阳系</option>
                  <option>月球 · 地月环</option>
                  <option>火星 · 奥林帕斯</option>
                  <option>半人马座 α</option>
                </select>
              </div>
              <div class="pf-item full">
                <div class="pl">个性签名 SIGNATURE</div>
                <input
                  name="profile.signature"
                  v-model.trim="profile.signature"
                  maxlength="30"
                  placeholder="一句话介绍自己…"
                />
              </div>
            </div>
            <div class="pf-save">
              <button class="sbtn" @click="saveProfile">✓ 保存修改</button>
            </div>
          </div>
        </section>

        <!-- ===== 我的优惠券 ===== -->
        <section class="ac-sec">
          <div class="ac-sec-head">
            <div class="bar"></div>
            <h3>
              我的优惠券
              <small>MY COUPONS</small>
            </h3>
          </div>
          <div class="ac-sec-body">
            <div class="coupon-grid">
              <div
                v-for="(c, i) in coupons"
                :key="i"
                class="coupon"
                :class="c.status"
              >
                <span class="cs" :class="c.status">{{ c.statusLabel }}</span>
                <div class="cv">{{ c.v }}</div>
                <div class="cd">
                  <div class="t">{{ c.t }}</div>
                  <div class="d">{{ c.d }}</div>
                  <span
                    v-if="c.status === 'usable'"
                    class="use"
                    @click="receiveCoupon(c, i)"
                  >
                    立即领取 ⟶
                  </span>
                </div>
              </div>
            </div>
            <div v-if="coupons.length === 0" class="sec-empty">
              <div class="empty-orb"><span>🎫</span></div>
              <div class="empty-t">NO SIGNAL · 暂无优惠券</div>
              <div class="empty-s">暂无可用的优惠券，去商品库逛逛吧</div>
            </div>
          </div>
        </section>

        <!-- ===== 收货地址管理 ===== -->
        <section class="ac-sec">
          <div class="ac-sec-head">
            <div class="bar"></div>
            <h3>
              收货地址管理
              <small>ADDRESS BOOK</small>
            </h3>
            <button class="head-btn" @click="openAddrModal()">
              ＋ 新增地址
            </button>
          </div>
          <div class="ac-sec-body">
            <div class="addr-list">
              <div
                v-for="a in addresses"
                :key="a.id"
                class="addr-item"
                :class="{ def: Number(a.defaultStatus) === 1 }"
              >
                <div v-if="Number(a.defaultStatus) === 1" class="def-corner">
                  <span>默</span>
                </div>
                <div class="addr-main">
                  <div class="an">
                    {{ a.name }}
                    <span v-if="Number(a.defaultStatus) === 1" class="def-tag">
                      默认
                    </span>
                  </div>
                  <div class="ap">{{ maskPhone(a.phone || a.mobile) }}</div>
                  <div class="at">{{ addrText(a) }}</div>
                </div>
                <div class="addr-ops">
                  <button
                    v-if="Number(a.defaultStatus) !== 1"
                    class="op"
                    @click="setDefault(a)"
                  >
                    设为默认
                  </button>
                  <button class="op" @click="openAddrModal(a)">编辑</button>
                  <button class="op danger" @click="deleteAddr(a)">删除</button>
                </div>
              </div>
            </div>
            <div v-if="addresses.length === 0" class="sec-empty">
              <div class="empty-orb"><span>📍</span></div>
              <div class="empty-t">NO SIGNAL · 暂无收货地址</div>
              <div class="empty-s">
                还没有收货地址，点击右上角「新增地址」添加吧
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- ===== 头像选择模态框 ===== -->
    <div
      v-if="avatarVisible"
      class="modal-mask show"
      @click.self="avatarVisible = false"
    >
      <div class="modal">
        <div class="modal-head">
          <h3>
            ◈ 更换头像
            <small>CHOOSE AVATAR · 量子形象舱</small>
          </h3>
          <button class="modal-close" @click="avatarVisible = false">✕</button>
        </div>
        <div class="avatar-pick">
          <div
            v-for="g in AVATARS"
            :key="g"
            class="avatar-opt"
            :class="{ active: avatarGlyph === g }"
            @click="pickAvatar(g)"
          >
            {{ g }}
          </div>
        </div>
        <div class="avatar-upload">
          <button class="up-btn" @click="fileInput?.click()">⬆ 上传图片</button>
          <input
            name="fld1"
            ref="fileInput"
            type="file"
            accept="image/*"
            class="up-input"
            @change="onFileChange"
          />
        </div>
      </div>
    </div>

    <!-- ===== 地址编辑模态框 ===== -->
    <div
      v-if="addrModalVisible"
      class="modal-mask show"
      @click.self="addrModalVisible = false"
    >
      <div class="modal">
        <div class="modal-head">
          <h3>
            {{ editAddrId ? '✎ 编辑地址' : '＋ 新增收货地址' }}
            <small>ADDRESS · 轨道坐标录入</small>
          </h3>
          <button class="modal-close" @click="addrModalVisible = false">
            ✕
          </button>
        </div>
        <div class="modal-body">
          <div class="af-row">
            <div class="af-field">
              <div class="af-label">收货人 NAME</div>
              <input
                name="addrForm.name"
                v-model.trim="addrForm.name"
                maxlength="12"
                placeholder="星际公民名"
              />
            </div>
            <div class="af-field">
              <div class="af-label">联系电话 PHONE</div>
              <input
                name="addrForm.phone"
                v-model.trim="addrForm.phone"
                maxlength="11"
                placeholder="星网号码"
              />
            </div>
          </div>
          <div class="af-row">
            <div class="af-field">
              <div class="af-label">省份 PROVINCE</div>
              <input
                name="addrForm.province"
                v-model.trim="addrForm.province"
                maxlength="12"
                placeholder="如 广东省"
              />
            </div>
            <div class="af-field">
              <div class="af-label">城市 CITY</div>
              <input
                name="addrForm.city"
                v-model.trim="addrForm.city"
                maxlength="12"
                placeholder="如 深圳市"
              />
            </div>
            <div class="af-field">
              <div class="af-label">区县 REGION</div>
              <input
                name="addrForm.region"
                v-model.trim="addrForm.region"
                maxlength="12"
                placeholder="如 龙华区"
              />
            </div>
          </div>
          <div class="af-field">
            <div class="af-label">详细地址 DETAIL</div>
            <input
              name="addrForm.addr"
              v-model.trim="addrForm.addr"
              maxlength="40"
              placeholder="街道 · 小区 · 门牌号"
            />
          </div>
          <label class="af-def">
            <input
              name="addrForm.isDefault"
              v-model="addrForm.isDefault"
              type="checkbox"
            />
            <span class="box"></span>
            设为默认收货地址
          </label>
        </div>
        <div class="modal-foot">
          <button class="mbtn ghost" @click="addrModalVisible = false">
            取消
          </button>
          <button class="mbtn primary" @click="saveAddress">✓ 保存地址</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import {
  reqUserInfo,
  reqUpdateUserInfo,
  reqOssPolicy,
  reqProfileAddressList,
  reqProfileAddressAdd,
  reqProfileAddressUpdate,
  reqProfileAddressDelete,
  reqProfileAddressSetDefault,
} from '@/api/user'
import { reqMemberCouponList, reqReceiveCoupon } from '@/api/coupon'
import axios from 'axios'
import message from '@/utils/message'

const router = useRouter()
const userStore = useUserStore()

const AVATARS = ['◬', '◉', '⚡', '✦', '☾', '◆', '◌', '◫', '✺', '▣']
const avatarGlyph = ref('◬')
const avatarImg = ref('')
const avatarVisible = ref(false)

function pickAvatar(g: string) {
  avatarGlyph.value = g
  avatarImg.value = ''
  avatarVisible.value = false
}

// ===== 头像上传（OSS 直传） =====
const fileInput = ref<HTMLInputElement | null>(null)

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) uploadAvatar(file)
  input.value = ''
}

async function uploadAvatar(file: File) {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowed.includes(file.type)) {
    message.warning('图片格式错误，仅支持 jpg/png/gif/webp')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    message.warning('图片大小不能超过 2MB')
    return
  }
  try {
    const res: any = await reqOssPolicy()
    const p = res.data || {}
    if (!p.host || !p.policy) throw new Error('获取上传签名失败')
    const safeName = file.name.replace(/[^\w.\-]/g, '')
    const key = `${p.dir}${Date.now()}_${safeName}`
    const form = new FormData()
    form.append('key', key)
    form.append('policy', p.policy)
    form.append('OSSAccessKeyId', p.accessid)
    form.append('signature', p.signature)
    form.append('file', file)
    // OSS 直传（独立 axios，不走全局拦截器）
    await axios.post(p.host, form)
    const url = `${p.host}/${key}`
    avatarImg.value = url
    avatarGlyph.value = ''
    avatarVisible.value = false
    message.success('✓ 头像已更新')
    localStorage.setItem('nebula_avatar', url)
    if (userStore.token) {
      try {
        await reqUpdateUserInfo({ header: url })
      } catch {
        /* 本地已生效 */
      }
    }
  } catch (e) {
    message.error((e as Error).message || '头像上传失败，请重试')
  }
}

// ===== 个人信息（API 优先，本地存储兜底） =====
const profile = reactive({
  nickname: '',
  gender: '保密',
  birthday: '',
  email: '',
  phone: '',
  galaxy: '地球 · 太阳系',
  signature: '',
})

// 会员统计（/member/info）
const memberStats = reactive({ integration: 0, growth: 0, balance: 0 })
const GROWTH_TARGET = 20000
const growPct = computed(() =>
  Math.min(100, (memberStats.growth / GROWTH_TARGET) * 100),
)
const growRemain = computed(() =>
  Math.max(0, GROWTH_TARGET - memberStats.growth),
)

const GENDER_TEXT: Record<number, string> = { 0: '保密', 1: '男', 2: '女' }
const GENDER_CODE: Record<string, number> = { 保密: 0, 男: 1, 女: 2 }
const genderText = (g: any) => GENDER_TEXT[Number(g)] ?? '保密'

const fmtNum = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const STORAGE_KEY = 'nebula_profile'

async function loadProfile() {
  if (userStore.token) {
    try {
      const result: any = await reqUserInfo()
      if (result.code === 200) {
        const m = result.data || {}
        profile.nickname = m.nickname || m.username || ''
        profile.gender = genderText(m.gender)
        profile.birthday = m.birth ? String(m.birth).slice(0, 10) : ''
        profile.email = m.email || ''
        profile.phone = m.mobile || ''
        profile.signature = m.sign || ''
        if (m.header) avatarImg.value = String(m.header)
        else avatarImg.value = localStorage.getItem('nebula_avatar') || ''
        memberStats.integration = Number(m.integration ?? 0)
        memberStats.growth = Number(m.growth ?? 0)
        memberStats.balance = Number(m.balance ?? 0)
        return
      }
    } catch {
      /* 接口失败落本地 */
    }
  }
  // 本地存储兜底（未登录/接口失败）
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) Object.assign(profile, JSON.parse(raw))
  } catch {
    /* ignore */
  }
  if (!profile.nickname) profile.nickname = userStore.username || '星舰领航员'
  if (!avatarImg.value)
    avatarImg.value = localStorage.getItem('nebula_avatar') || ''
}

async function saveProfile() {
  if (userStore.token) {
    try {
      const payload: Record<string, unknown> = {
        nickname: profile.nickname,
        gender: GENDER_CODE[profile.gender] ?? 0,
        email: profile.email,
        mobile: profile.phone,
        sign: profile.signature,
      }
      if (profile.birthday) payload.birth = `${profile.birthday} 00:00:00`
      const res: any = await reqUpdateUserInfo(payload)
      if (res.code !== 200) throw new Error(res.message)
    } catch {
      /* 本地演示 */
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...profile }))
  message.success('✓ 个人信息已保存')
}

async function handleLogout() {
  await userStore.userLogOut()
  message.success('已退出登录')
  router.push('/home')
}

// ===== 优惠券（后端数据） =====
const coupons = ref<any[]>([])

const fmtYmd = (s: any) => (s ? String(s).slice(0, 10) : '')

// 后端 CouponEntity -> 展示字段
function couponView(c: any) {
  const now = Date.now()
  const start = c.startTime
    ? new Date(String(c.startTime).replace(' ', 'T')).getTime()
    : -Infinity
  const end = c.endTime
    ? new Date(String(c.endTime).replace(' ', 'T')).getTime()
    : Infinity
  let status = 'usable'
  let statusLabel = '可领取'
  if (c.claimed) {
    status = 'used'
    statusLabel = '已领取'
  } else if (now < start) {
    status = 'coming'
    statusLabel = '未开始'
  } else if (now > end) {
    status = 'expired'
    statusLabel = '已过期'
  }
  const minPoint = Number(c.minPoint)
  return {
    id: c.id,
    t: c.couponName || '优惠券',
    d: `${minPoint > 0 ? '满' + c.minPoint + '元可用' : '无门槛'} · 至 ${fmtYmd(
      c.endTime,
    )}`,
    v: c.amount != null ? `-¥${c.amount}` : '券',
    status,
    statusLabel,
  }
}

async function loadCoupons() {
  try {
    const res: any = await reqMemberCouponList()
    const list = res?.data
    coupons.value = Array.isArray(list) ? list.map(couponView) : []
  } catch (e) {
    console.error('优惠券加载失败:', e)
    coupons.value = []
  }
}

async function receiveCoupon(c: any, i: number) {
  try {
    const res: any = await reqReceiveCoupon(c.id)
    if (res?.code !== 200) {
      message.error(res?.msg || '领取失败')
      return
    }
    message.success('✓ 领取成功')
    coupons.value[i] = { ...c, status: 'used', statusLabel: '已领取' }
  } catch (e: any) {
    message.error(e?.message || '领取失败')
  }
}

// ===== 地址管理 =====
const addresses = ref<any[]>([])
const addrModalVisible = ref(false)
const editAddrId = ref<number | null>(null)
const addrForm = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  region: '',
  addr: '',
  isDefault: false,
})

const maskPhone = (phone: string) => {
  if (!phone || phone.length < 7) return phone || ''
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}
const addrText = (a: any) =>
  a.text ||
  `${a.province || ''}${a.city || ''}${a.region || ''}${a.detailAddress || ''}`

async function loadAddresses() {
  if (!userStore.token) {
    // 未登录：读取本地存储的地址（新增地址时写入），无则展示空态
    const raw = localStorage.getItem('nebula_addresses')
    if (raw) {
      try {
        addresses.value = JSON.parse(raw)
      } catch {
        addresses.value = []
      }
    } else {
      addresses.value = []
    }
    return
  }
  try {
    const result: any = await reqProfileAddressList()
    const list: any[] = Array.isArray(result) ? result : result?.data || []
    addresses.value = list
  } catch {
    addresses.value = []
  }
}

function openAddrModal(addr?: any) {
  if (addr) {
    editAddrId.value = addr.id
    addrForm.name = addr.name || ''
    addrForm.phone = addr.phone || addr.mobile || ''
    addrForm.province = addr.province || ''
    addrForm.city = addr.city || ''
    addrForm.region = addr.region || ''
    addrForm.addr =
      addr.detailAddress ||
      (!addr.province && !addr.city && !addr.region ? addrText(addr) : '')
    addrForm.isDefault = Number(addr.defaultStatus) === 1
  } else {
    editAddrId.value = null
    addrForm.name = ''
    addrForm.phone = ''
    addrForm.province = ''
    addrForm.city = ''
    addrForm.region = ''
    addrForm.addr = ''
    addrForm.isDefault = false
  }
  addrModalVisible.value = true
}

async function saveAddress() {
  if (!addrForm.name || !addrForm.phone || !addrForm.addr) {
    message.warning('⚠ 请完整填写收货人 / 电话 / 地址')
    return
  }
  const payload = {
    name: addrForm.name,
    phone: addrForm.phone,
    province: addrForm.province,
    city: addrForm.city,
    region: addrForm.region,
    detailAddress: addrForm.addr,
    defaultStatus: addrForm.isDefault ? 1 : 0,
  }
  if (userStore.token) {
    try {
      if (editAddrId.value) {
        await reqProfileAddressUpdate({ id: editAddrId.value, ...payload })
      } else {
        await reqProfileAddressAdd(payload)
      }
      message.success('✓ 地址已保存')
      addrModalVisible.value = false
      await loadAddresses()
      return
    } catch {
      /* 落本地 */
    }
  }
  // 本地
  if (addrForm.isDefault) addresses.value.forEach((a) => (a.defaultStatus = 0))
  if (editAddrId.value) {
    const target = addresses.value.find((a) => a.id === editAddrId.value)
    if (target)
      Object.assign(target, {
        ...payload,
        text: undefined,
        phone: maskPhone(addrForm.phone),
      })
  } else {
    addresses.value.push({
      id: Date.now(),
      ...payload,
      text: undefined,
      phone: maskPhone(addrForm.phone),
    })
  }
  localStorage.setItem('nebula_addresses', JSON.stringify(addresses.value))
  addrModalVisible.value = false
  message.success('✓ 地址已保存')
}

async function deleteAddr(a: any) {
  if (userStore.token) {
    try {
      await reqProfileAddressDelete(a.id)
    } catch {
      /* ignore */
    }
  }
  addresses.value = addresses.value.filter((x) => x.id !== a.id)
  localStorage.setItem('nebula_addresses', JSON.stringify(addresses.value))
  message.success('✓ 地址已删除')
}

async function setDefault(a: any) {
  if (userStore.token) {
    try {
      await reqProfileAddressSetDefault(a.id)
    } catch {
      /* ignore */
    }
  }
  addresses.value.forEach((x) => (x.defaultStatus = x.id === a.id ? 1 : 0))
  localStorage.setItem('nebula_addresses', JSON.stringify(addresses.value))
  message.success('✓ 已设为默认地址')
}

onMounted(() => {
  loadProfile()
  loadCoupons()
  loadAddresses()
  if (userStore.token) {
    userStore.userInfo().catch(() => {})
  }
})
</script>

<style scoped>
/* ===== 面包屑 ===== */
.crumbs {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 0 0;
  margin-left: 15px;
  font-size: 13px;
  color: var(--dim);
  letter-spacing: 1px;
}
.crumbs a {
  color: var(--cyan);
  text-decoration: none;
  transition: 0.2s;
}
.crumbs a:hover {
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.7);
}
.crumbs .sep {
  color: var(--dim);
  opacity: 0.6;
}
.crumbs .cur {
  color: var(--txt);
}
.page-head {
  margin: 20px 0 0;
}
.ac-wrap {
  max-width: 1224px;
  margin: 0 auto;
}

/* 分区卡片 */
.ac-sec {
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 18px;
  background: var(--panel);
  backdrop-filter: blur(10px);
  margin-top: 18px;
  overflow: hidden;
}
.ac-sec-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 24px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  background: linear-gradient(
    90deg,
    rgba(0, 240, 255, 0.06),
    rgba(168, 85, 247, 0.04)
  );
}
.ac-sec-head .bar {
  width: 4px;
  height: 16px;
  border-radius: 3px;
  background: linear-gradient(180deg, #00f0ff, #a855f7);
  box-shadow: 0 0 8px var(--cyan);
}
.ac-sec-head h3 {
  font-family: var(--font-h);
  font-size: 15px;
  letter-spacing: 2px;
  color: #fff;
}
.ac-sec-head h3 small {
  font-family: var(--font-m);
  font-size: 9px;
  color: var(--dim);
  letter-spacing: 3px;
  font-weight: 400;
  margin-left: 8px;
}
.ac-sec-head .head-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 9px;
  border: 1px solid rgba(0, 240, 255, 0.35);
  color: var(--cyan);
  font-size: 12px;
  cursor: pointer;
  background: rgba(0, 240, 255, 0.06);
  letter-spacing: 1px;
  transition: 0.2s;
  font-family: var(--font-m);
}
.ac-sec-head .head-btn:hover {
  background: rgba(0, 240, 255, 0.14);
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.35);
}
.ac-sec-body {
  padding: 22px 24px;
}

/* 空状态（对齐 reviews 页样式） */
.sec-empty {
  text-align: center;
  padding: 56px 20px;
  border: 1px dashed rgba(0, 240, 255, 0.3);
  border-radius: 18px;
  background: rgba(6, 10, 26, 0.5);
  margin-top: 18px;
}
.sec-empty .empty-orb {
  width: 84px;
  height: 84px;
  margin: 0 auto 18px;
  border-radius: 50%;
  border: 1px dashed rgba(0, 240, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  color: var(--cyan);
  text-shadow: 0 0 18px var(--cyan);
  animation: nb-spin 14s linear infinite;
}
.sec-empty .empty-orb span {
  animation: nb-spin 14s linear infinite reverse;
}
.sec-empty .empty-t {
  font-family: var(--font-h);
  font-size: 19px;
  letter-spacing: 3px;
  color: var(--txt);
}
.sec-empty .empty-s {
  color: var(--dim);
  font-size: 14px;
  margin: 10px 0 24px;
  letter-spacing: 1px;
}
@keyframes nb-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 会员档案横幅 */
.profile-banner {
  display: flex;
  align-items: center;
  gap: 26px;
  padding: 30px 34px;
  border: 1px solid rgba(0, 240, 255, 0.16);
  border-radius: 20px;
  margin-top: 18px;
  background:
    radial-gradient(
      500px 200px at 85% 10%,
      rgba(168, 85, 247, 0.18),
      transparent 60%
    ),
    radial-gradient(
      400px 200px at 8% 90%,
      rgba(0, 240, 255, 0.12),
      transparent 60%
    ),
    linear-gradient(115deg, rgba(10, 14, 34, 0.9), rgba(14, 10, 36, 0.9));
  backdrop-filter: blur(12px);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.4);
}
.avatar-wrap {
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
}
.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    circle at 35% 30%,
    rgba(255, 255, 255, 0.25),
    rgba(0, 240, 255, 0.45) 45%,
    rgba(168, 85, 247, 0.4) 80%
  );
  border: 2px solid rgba(0, 240, 255, 0.6);
  box-shadow:
    0 0 30px rgba(0, 240, 255, 0.4),
    inset 0 0 24px rgba(255, 255, 255, 0.12);
  font-size: 44px;
  transition: 0.25s;
  overflow: hidden;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.avatar-wrap:hover .avatar {
  box-shadow: 0 0 44px rgba(0, 240, 255, 0.65);
}
.avatar-edit {
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.7);
  border: 2px solid rgba(4, 7, 18, 0.9);
}
.pb-info {
  flex: 1;
  min-width: 0;
}
.pb-name {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.pb-name .n {
  font-family: var(--font-h);
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #fff;
  text-shadow: 0 0 18px rgba(0, 240, 255, 0.4);
}
.pb-name .lv {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  letter-spacing: 2px;
  padding: 5px 14px;
  border-radius: 16px;
  color: #3a2a00;
  background: linear-gradient(90deg, #ffc53d, #ff9f1a);
  box-shadow: 0 0 14px rgba(255, 197, 61, 0.5);
  font-weight: 700;
}
.pb-name .logout {
  margin-left: auto;
  padding: 7px 16px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 12px;
  letter-spacing: 1px;
  transition: 0.2s;
  border: 1px solid rgba(255, 46, 196, 0.35);
  color: var(--magenta);
  background: rgba(255, 46, 196, 0.05);
  font-family: var(--font-m);
}
.pb-name .logout:hover {
  background: rgba(255, 46, 196, 0.12);
  box-shadow: 0 0 10px rgba(255, 46, 196, 0.3);
}
.pb-sign {
  font-size: 14px;
  color: var(--dim);
  margin-top: 10px;
  letter-spacing: 1px;
}
.pb-stats {
  display: flex;
  gap: 34px;
  margin-top: 18px;
  flex-wrap: wrap;
}
.pb-stat {
  text-align: center;
}
.pb-stat .sv {
  font-family: var(--font-h);
  font-size: 20px;
  font-weight: 700;
  color: var(--cyan);
  text-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
}
.pb-stat .sl {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  margin-top: 4px;
}

/* 会员成长 */
.grow-row {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}
.grow-level {
  font-family: var(--font-h);
  font-size: 15px;
  font-weight: 700;
  color: var(--amber);
  letter-spacing: 1px;
  white-space: nowrap;
}
.grow-bar {
  flex: 1;
  min-width: 200px;
  height: 10px;
  border-radius: 6px;
  background: rgba(0, 240, 255, 0.1);
  overflow: hidden;
}
.grow-bar i {
  display: block;
  height: 100%;
  width: 0;
  border-radius: 6px;
  transition: width 0.8s ease;
  background: linear-gradient(90deg, #00f0ff, #a855f7, #ff2ec4);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
}
.grow-val {
  font-family: var(--font-m);
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 1px;
  white-space: nowrap;
}
.grow-val b {
  color: var(--cyan);
}

/* 资料表单 */
.pf-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 30px;
}
.pf-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pf-item .pl {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.pf-item .pl::before {
  content: '';
  width: 3px;
  height: 11px;
  border-radius: 2px;
  background: linear-gradient(180deg, #00f0ff, #a855f7);
  box-shadow: 0 0 6px var(--cyan);
}
.pf-item input,
.pf-item select {
  width: 100%;
  height: 42px;
  border-radius: 10px;
  border: 1px solid rgba(0, 240, 255, 0.25);
  background: rgba(6, 10, 26, 0.7);
  color: var(--txt);
  padding: 0 14px;
  font-family: var(--font-b);
  font-size: 14px;
  outline: none;
  transition: 0.2s;
  box-sizing: border-box;
}
.pf-item input:focus,
.pf-item select:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
.pf-item select option {
  background: #0a1026;
}
.pf-item.full {
  grid-column: 1/-1;
}
.pf-save {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.pf-save .sbtn {
  height: 44px;
  padding: 0 30px;
  border-radius: 11px;
  cursor: pointer;
  font-family: var(--font-h);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  transition: 0.25s;
  border: none;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.45);
}
.pf-save .sbtn:hover {
  filter: brightness(1.15);
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.8);
}

/* 优惠券 */
.coupon-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.coupon {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 14px;
  border: 1px solid rgba(0, 240, 255, 0.16);
  background: rgba(0, 240, 255, 0.03);
  overflow: hidden;
  transition: 0.25s;
}
.coupon:hover {
  border-color: rgba(0, 240, 255, 0.4);
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.15);
}
.coupon.used,
.coupon.expired {
  opacity: 0.55;
}
.coupon.coming {
  opacity: 0.8;
}
.coupon .cv {
  font-family: var(--font-h);
  font-size: 26px;
  font-weight: 900;
  color: var(--cyan);
  text-shadow: 0 0 14px rgba(0, 240, 255, 0.5);
  min-width: 74px;
  text-align: center;
}
.coupon .cd {
  flex: 1;
  min-width: 0;
}
.coupon .cd .t {
  font-size: 15px;
  font-weight: 700;
  color: var(--txt);
  letter-spacing: 1px;
}
.coupon .cd .d {
  font-size: 12px;
  color: var(--dim);
  margin-top: 5px;
  line-height: 1.5;
}
.coupon .cs {
  position: absolute;
  top: 0;
  right: 0;
  padding: 3px 12px;
  border-radius: 0 0 0 12px;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  letter-spacing: 2px;
  color: #02101a;
  font-weight: 700;
}
.coupon .cs.usable {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
}
.coupon .cs.used {
  background: rgba(143, 163, 200, 0.5);
}
.coupon .cs.expired {
  background: rgba(255, 46, 196, 0.5);
}
.coupon .cs.coming {
  background: rgba(255, 190, 60, 0.75);
}
.coupon .use {
  margin-top: 8px;
  display: inline-flex;
  padding: 5px 14px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid rgba(0, 240, 255, 0.4);
  color: var(--cyan);
  background: rgba(0, 240, 255, 0.06);
  letter-spacing: 1px;
  transition: 0.2s;
}
.coupon .use:hover {
  background: rgba(0, 240, 255, 0.15);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

/* 地址管理 */
.addr-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.addr-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border: 1px solid rgba(0, 240, 255, 0.14);
  border-radius: 14px;
  background: rgba(0, 240, 255, 0.03);
  transition: 0.25s;
}
.addr-item:hover {
  border-color: rgba(0, 240, 255, 0.4);
}
.addr-item.def {
  padding-left: 44px;
}
.def-corner {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-top: 26px solid var(--green);
  border-right: 26px solid transparent;
  border-radius: 14px 0 0 0;
}
.def-corner span {
  position: absolute;
  top: -22px;
  left: 3px;
  font-family: var(--font-m);
  font-size: 8px;
  color: #02101a;
  font-weight: 700;
}
.addr-main {
  flex: 1;
  min-width: 0;
}
.addr-main .an {
  font-size: 15px;
  font-weight: 700;
  color: var(--txt);
  letter-spacing: 1px;
}
.addr-main .def-tag {
  font-family: var(--font-m);
  font-size: 9px;
  color: #02101a;
  background: var(--green);
  padding: 2px 7px;
  border-radius: 8px;
  margin-left: 8px;
  letter-spacing: 1px;
}
.addr-main .ap {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  margin-top: 4px;
  letter-spacing: 2px;
}
.addr-main .at {
  font-size: 13px;
  color: var(--dim);
  margin-top: 6px;
  line-height: 1.5;
}
.addr-ops {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.addr-ops .op {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  letter-spacing: 1px;
  transition: 0.2s;
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: var(--dim);
  background: transparent;
}
.addr-ops .op:hover {
  color: var(--cyan);
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.25);
}
.addr-ops .op.danger {
  border-color: rgba(255, 46, 196, 0.3);
  color: var(--magenta);
}
.addr-ops .op.danger:hover {
  background: rgba(255, 46, 196, 0.1);
  box-shadow: 0 0 10px rgba(255, 46, 196, 0.3);
}
.addr-add {
  margin-top: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px dashed rgba(0, 240, 255, 0.4);
  color: var(--cyan);
  font-size: 13px;
  cursor: pointer;
  transition: 0.25s;
  background: transparent;
  letter-spacing: 1px;
}
.addr-add:hover {
  background: rgba(0, 240, 255, 0.08);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.25);
}

/* 模态框 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(3, 5, 14, 0.72);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  width: 520px;
  max-width: calc(100vw - 40px);
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(6, 10, 26, 0.97);
  backdrop-filter: blur(20px);
  padding: 26px 30px;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(0, 240, 255, 0.12);
  animation: modalIn 0.25s ease;
}
@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.modal-head h3 {
  font-family: var(--font-h);
  font-size: 17px;
  letter-spacing: 2px;
  color: #fff;
}
.modal-head h3 small {
  display: block;
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 3px;
  font-weight: 400;
  margin-top: 4px;
}
.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid rgba(0, 240, 255, 0.3);
  background: rgba(0, 240, 255, 0.06);
  color: var(--cyan);
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}
.modal-close:hover {
  background: rgba(255, 46, 196, 0.12);
  border-color: var(--magenta);
  color: var(--magenta);
}
.avatar-pick {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.avatar-opt {
  height: 64px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  cursor: pointer;
  transition: 0.2s;
  border: 1px solid rgba(0, 240, 255, 0.25);
  background: rgba(0, 240, 255, 0.04);
}
.avatar-opt:hover {
  border-color: var(--cyan);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.3);
}
.avatar-opt.active {
  border-color: var(--cyan);
  background: rgba(0, 240, 255, 0.12);
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.4);
}
.avatar-upload {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed rgba(0, 240, 255, 0.15);
  display: flex;
  justify-content: center;
}
.up-btn {
  padding: 11px 26px;
  border-radius: 11px;
  border: 1px solid rgba(0, 240, 255, 0.4);
  background: rgba(0, 240, 255, 0.06);
  color: var(--cyan);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: 0.22s;
  font-family: var(--font-m);
}
.up-btn:hover {
  background: rgba(0, 240, 255, 0.14);
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.35);
}
.up-input {
  display: none;
}
.af-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.af-field {
  margin-bottom: 16px;
}
.af-label {
  font-family: var(--font-m);
  font-size: var(--font-size-xs);
  color: var(--dim);
  letter-spacing: 2px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.af-label::before {
  content: '';
  width: 3px;
  height: 11px;
  border-radius: 2px;
  background: linear-gradient(180deg, #00f0ff, #a855f7);
  box-shadow: 0 0 6px var(--cyan);
}
.af-field input {
  width: 100%;
  height: 42px;
  border-radius: 10px;
  border: 1px solid rgba(0, 240, 255, 0.25);
  background: rgba(6, 10, 26, 0.7);
  color: var(--txt);
  padding: 0 14px;
  font-family: var(--font-b);
  font-size: 14px;
  outline: none;
  transition: 0.2s;
  box-sizing: border-box;
}
.af-field input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
.af-def {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--dim);
  cursor: pointer;
  user-select: none;
  margin-bottom: 6px;
}
.af-def input {
  display: none;
}
.af-def .box {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1px solid rgba(0, 240, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #02101a;
  transition: 0.2s;
  background: rgba(0, 240, 255, 0.04);
}
.af-def input:checked + .box {
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  border-color: var(--cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}
.af-def input:checked + .box::after {
  content: '✓';
}
.modal-foot {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}
.mbtn {
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
.mbtn.ghost {
  border: 1px solid rgba(0, 240, 255, 0.4);
  background: transparent;
  color: var(--cyan);
}
.mbtn.ghost:hover {
  background: rgba(0, 240, 255, 0.1);
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.3);
}
.mbtn.primary {
  border: none;
  background: linear-gradient(90deg, #00f0ff, #3d7bff);
  color: #02101a;
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.5);
}
.mbtn.primary:hover {
  filter: brightness(1.2);
  box-shadow: 0 0 28px rgba(0, 240, 255, 0.85);
}

@media (max-width: 1080px) {
  .coupon-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 760px) {
  .profile-banner {
    flex-wrap: wrap;
  }
  .pf-grid {
    grid-template-columns: 1fr;
  }
  .addr-item {
    flex-wrap: wrap;
  }
}
</style>
