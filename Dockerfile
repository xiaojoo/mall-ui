# syntax=docker/dockerfile:1
# ============================================================================
# mall-web 前端 多阶段构建镜像
#   stage 1: node:20-alpine  构建 dist（pnpm，由 corepack 启用）
#   stage 2: nginx:alpine    服务静态文件 + /api 反代网关（镜像即前端 nginx）
#
# 构建参数：
#   BUILD_MODE        pro | test     对应 pnpm build:pro / build:test
#   API_PROXY_TARGET  nginx /api 反代目标（网关），运行时通过环境变量替换进
#                    /etc/nginx/templates/default.conf.template
# ============================================================================

# ---------- 构建阶段 ----------
FROM node:20-alpine AS build
# pnpm-lock.yaml 为 lockfileVersion 9（pnpm 10 格式），固定 pnpm@10
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

# 先只拷清单做依赖层缓存（锁文件不变则依赖层命中缓存）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# 再拷源码并构建
COPY . .
ARG BUILD_MODE=pro
RUN pnpm build:${BUILD_MODE}

# ---------- 运行阶段（nginx） ----------
FROM nginx:alpine
ARG API_PROXY_TARGET=http://mall-gateway:88
ENV API_PROXY_TARGET=${API_PROXY_TARGET}

# nginx 官方镜像会自动把 /etc/nginx/templates/*.template 渲染到 /etc/nginx/conf.d/*
# 仅替换已定义的环境变量(API_PROXY_TARGET)，nginx 运行期变量($uri/$host 等)不受影响
COPY deploy/default.conf.template /etc/nginx/templates/default.conf.template

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q --spider http://127.0.0.1/ || exit 1
