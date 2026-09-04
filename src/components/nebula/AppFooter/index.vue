<template>
  <!-- 页脚 -->
  <footer class="nb-footer">
    <div class="wrap">
      <div class="foot-grid">
        <div class="foot-col foot-about">
          <div class="logo" style="margin-bottom: 6px">
            <div class="logo-mark" style="width: 38px; height: 38px"></div>
            <div>
              <div class="logo-name" style="font-size: 18px">NEBULA MART</div>
              <div class="logo-sub">星环商城 · CYBER 2088</div>
            </div>
          </div>
          <p>
            连接 42
            个星系的智能购物网络。由量子推荐引擎驱动，为每一位置身定制属于你的未来购物矩阵。
          </p>
          <div class="social">
            <div class="si">𝕏</div>
            <div class="si">▶</div>
            <div class="si">◎</div>
            <div class="si">✆</div>
          </div>
        </div>
        <div v-for="(col, i) in footerCols" :key="i" class="foot-col">
          <h4>{{ col.title }}</h4>
          <template v-for="(link, j) in col.links" :key="j">
            <router-link v-if="!isExternal(link.url)" :to="link.url">
              {{ link.name }}
            </router-link>
            <a v-else :href="link.url" target="_blank" rel="noopener">
              {{ link.name }}
            </a>
          </template>
        </div>
      </div>
      <div class="foot-bottom">
        <div class="fb-l">
          © 2088
          <b>NEBULA MART</b>
          星环商城 · 星际联网备案号 星ICP备20880088号 · 由量子引擎渲染
        </div>
        <div class="fb-r">
          <span>帮助中心</span>
          <span>商家入驻</span>
          <span>反诈中心</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { reqFooterLinks } from '@/api/footer'

interface FooterLink {
  groupName: string
  groupSort?: number
  name: string
  url: string
}
interface FooterCol {
  title: string
  links: FooterLink[]
}

// 内置兜底：接口失败/未配置时展示（与原静态页脚一致）
const FALLBACK_COLS: FooterCol[] = [
  {
    title: '购物指南',
    links: [
      { groupName: '购物指南', name: '购物流程', url: '/list' },
      { groupName: '购物指南', name: '会员体系', url: '/profile' },
      { groupName: '购物指南', name: '星元充值', url: '/profile' },
      { groupName: '购物指南', name: '脑波支付', url: '/cart' },
      { groupName: '购物指南', name: '联系客服', url: '/profile' },
    ],
  },
  {
    title: '配送服务',
    links: [
      { groupName: '配送服务', name: '轨道快递', url: '/list' },
      { groupName: '配送服务', name: '星际速运', url: '/list' },
      { groupName: '配送服务', name: '火星分仓', url: '/list' },
      { groupName: '配送服务', name: '月球自提', url: '/list' },
      { groupName: '配送服务', name: '运费查询', url: '/list' },
    ],
  },
  {
    title: '关于我们',
    links: [
      { groupName: '关于我们', name: '企业介绍', url: '/' },
      { groupName: '关于我们', name: '加入星环', url: '/' },
      { groupName: '关于我们', name: '新闻中心', url: '/' },
      { groupName: '关于我们', name: '隐私协议', url: '/' },
      { groupName: '关于我们', name: '资质认证', url: '/' },
    ],
  },
]

const footerCols = ref<FooterCol[]>(FALLBACK_COLS)

// 站内路径（/ 开头）走 router-link，外部链接新窗口打开
const isExternal = (url: string) => /^https?:\/\//i.test(url)

// 按 groupName 分组（保留接口返回顺序）
function groupLinks(list: FooterLink[]): FooterCol[] {
  const order: string[] = []
  const map = new Map<string, FooterLink[]>()
  for (const l of list) {
    if (!map.has(l.groupName)) {
      order.push(l.groupName)
      map.set(l.groupName, [])
    }
    map.get(l.groupName)!.push(l)
  }
  return order.map((g) => ({ title: g, links: map.get(g) || [] }))
}

onMounted(async () => {
  try {
    const res: any = await reqFooterLinks()
    const list: FooterLink[] = res?.data?.footerLinks || []
    if (list.length > 0) {
      footerCols.value = groupLinks(list)
    }
  } catch {
    /* 接口失败保留内置兜底 */
  }
})
</script>
