# 优选商城前端（mall-ui）

基于 Vue 3 + TypeScript + Vite 构建的商城 Web 前端，使用 Element Plus 组件库与 Pinia 状态管理。

## ✨ 功能特性

- 🏠 首页（轮播、三级菜单、秒杀、商品列表）
- 🛒 购物车（需登录访问，未登录自动跳转登录页）
- 📄 商品列表 / 商品详情（图片详情、评论、售后图标）
- 🔐 用户认证
  - 登录页 `/login`：品牌展示区 + 表单卡片，表单校验、记住账号、回车登录、微信/QQ 登录入口
  - 注册页 `/register`：密码强度实时指示、二次密码确认、协议勾选校验，注册成功自动回跳登录
  - 路由守卫：未登录访问受限页面自动跳转登录，已登录访问登录/注册页自动回首页
- 📱 响应式布局

## 🛠 技术栈

| 分类     | 选型                                               |
| -------- | -------------------------------------------------- |
| 框架     | Vue 3（`<script setup>` SFC）+ TypeScript          |
| 构建     | Vite                                               |
| UI 组件  | Element Plus（按需自动导入）                       |
| 状态管理 | Pinia                                              |
| 路由     | Vue Router（Hash 模式）                            |
| HTTP     | Axios（请求/响应拦截器、统一错误处理）             |
| 图标     | unplugin-icons（Element Plus 图标集）              |
| 代码规范 | ESLint + Prettier + Stylelint + Commitlint + Husky |

## 🚀 快速开始

> 要求：Node.js ≥ 20.19（Vite 8 要求），包管理器必须为 **pnpm**（`preinstall` 脚本会强制校验）。

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务器（自动打开浏览器）
pnpm dev

# 3. 构建生产包（vue-tsc 类型检查 + vite 打包）
pnpm build

# 4. 本地预览构建产物
pnpm preview
```

### 其他脚本

| 命令                     | 说明                   |
| ------------------------ | ---------------------- |
| `pnpm build:test`        | 以 test 模式构建       |
| `pnpm build:pro`         | 以 production 模式构建 |
| `pnpm lint` / `pnpm fix` | ESLint 检查 / 自动修复 |
| `pnpm lint:style`        | Stylelint 样式检查修复 |
| `pnpm format`            | Prettier 全量格式化    |

## 📁 目录结构

```
mall-ui
├── src
│   ├── api                # 接口定义（按模块划分）
│   │   └── user           # 用户模块：登录 / 注册 / 用户信息 / 登出
│   ├── assets             # 静态资源与全局样式（scss）
│   ├── components         # 公共组件（Header / Footer / Menu / Carousel 等）
│   ├── hooks              # 组合式函数
│   ├── router             # 路由配置与全局守卫
│   ├── store              # Pinia 仓库（user / category / spu / setting）
│   ├── utils              # 工具函数（request / token / time）
│   └── views              # 页面
│       ├── home           # 首页
│       ├── list           # 商品列表
│       ├── details        # 商品详情
│       ├── cart           # 购物车（需登录）
│       ├── login          # 登录页
│       └── register       # 注册页
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
└── vite.config.ts         # Vite 配置（别名 @、代理、自动导入）
```

## ⚙️ 环境变量

变量以 `VITE_` 前缀暴露给前端：

| 变量                | 说明                                 |
| ------------------- | ------------------------------------ |
| `VITE_APP_TITLE`    | 应用标题                             |
| `VITE_APP_BASE_API` | 接口基础路径（默认 `/api`）          |
| `VITE_SERVE`        | 后端服务地址（开发环境作为代理目标） |

开发环境代理：`/api` 前缀的请求会被代理到 `VITE_SERVE`，并重写去掉 `/api` 前缀。

## 🔌 用户认证接口约定

| 接口                 | 方法 | 说明                                                               |
| -------------------- | ---- | ------------------------------------------------------------------ |
| `/api/user/login`    | POST | 登录，入参 `{ username, password }`，成功返回 `{ code: 0, token }` |
| `/api/user/register` | POST | 注册，入参 `{ username, password }`，成功返回 `{ code: 0 }`        |
| `/api/user/info`     | GET  | 获取用户信息，请求头携带 `token`                                   |
| `/api/user/logout`   | POST | 退出登录                                                           |

> 登录成功后 token 持久化到 `localStorage`，请求拦截器会自动附加到请求头 `token` 字段。

## 🤝 贡献规范

- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范（husky + commitlint 强制校验）
- 提交前自动执行 Prettier 格式化
- 建议使用 pnpm 安装依赖，禁止混用 npm/yarn

## 📄 License

本项目采用 [CC0 1.0 Universal](LICENSE)（公有领域贡献）许可，你可以在任何用途下自由使用、修改与再分发本项目，无需署名也无需保留版权声明。详情见 `LICENSE` 文件。
