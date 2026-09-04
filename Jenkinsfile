/*
 * mall-web 前端 Jenkins 流水线
 * ------------------------------------------------------------
 * 环境前提：
 *  1) Jenkins 运行在 Docker 中，并已挂载 /var/run/docker.sock，
 *     使本流水线的「部署阶段」能直接操作宿主机上的 docker。
 *  2) 目标 nginx 容器已在运行（复用现有部署，本流水线仅把构建产物
 *     docker cp 进该容器的静态目录，再执行 nginx -s reload）。
 *  3) 构建阶段在 node:20 容器内执行（自带 npm/node，
 *     pnpm 通过 corepack 启用；项目 preinstall 脚本强制要求 pnpm）。
 *
 * 用法：在 Jenkins 创建「流水线」任务，Jenkinsfile 选本仓库即可；
 * 或在任务设置里用 SCM 路径指向本文件。
 */

pipeline {
  agent any // 默认节点：需要装有 docker CLI（用于部署阶段的 docker cp / exec）

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '15'))
  }

  parameters {
    choice(
      name: 'BUILD_MODE',
      choices: ['production', 'test'],
      description: '构建模式：production -> pnpm build（默认生产）；test -> pnpm build:test'
    )
    string(
      name: 'NGINX_CONTAINER',
      defaultValue: 'mall-nginx',
      description: '已运行的 nginx 容器名或 ID'
    )
    string(
      name: 'NGINX_HTML_DIR',
      defaultValue: '/usr/share/nginx/html',
      description: 'nginx 容器内的静态文件根目录'
    )
    string(
      name: 'PNPM_VERSION',
      defaultValue: '10',
      description: '通过 corepack 启用的 pnpm 版本号'
    )
    booleanParam(
      name: 'DEPLOY',
      defaultValue: true,
      description: '是否执行部署（false 则只构建不部署，用于验证产物）'
    )
    string(
      name: 'HEALTH_CHECK_URL',
      defaultValue: '',
      description: '可选：部署后健康检查的完整 URL（留空则跳过）'
    )
  }

  environment {
    // 关闭非交互提示；按需开启离线缓存可改用 --prefer-offline
    CI = 'true'
  }

  stages {
    stage('Build (Docker)') {
      agent { docker { image 'node:20' } }

      steps {
        script {
          // corepack 启用并固定 pnpm 版本（Node 20.19+ 自带 corepack）
          sh 'corepack enable'
          sh "corepack prepare pnpm@${params.PNPM_VERSION} --activate"
          sh 'node -v && pnpm -v'
        }
        // preinstall 脚本会校验必须是 pnpm，故此处必须用 pnpm
        sh 'pnpm install --frozen-lockfile'
        script {
          def cmd = (params.BUILD_MODE == 'test') ? 'pnpm build:test' : 'pnpm build'
          echo "==> 执行构建：${cmd}"
          sh cmd
        }
        sh 'test -d dist && echo "[OK] dist 目录存在"'
        archiveArtifacts artifacts: 'dist/**', fingerprint: true
        stash includes: 'dist/**', name: 'dist'
      }
    }

    stage('Deploy to Nginx') {
      when { expression { params.DEPLOY } }

      steps {
        // 若构建节点与部署节点不同，先把 dist 取回工作区
        unstash 'dist'

        sh '''
          set -e
          echo "==> 校验 docker 与 nginx 容器"
          docker version >/dev/null
          docker container inspect "${NGINX_CONTAINER}" >/dev/null
        '''

        sh '''
          set -e
          TS=$(date +%Y%m%d%H%M%S)
          CT="${NGINX_CONTAINER}"
          HTML="${NGINX_HTML_DIR}"

          echo "==> 备份当前静态文件到工作区"
          docker cp "$CT:$HTML" "./backup-$TS" || true

          echo "==> 清空旧的静态文件（保留目录本身）"
          docker exec "$CT" sh -c "set -e; cd '$HTML' && (find . -mindepth 1 -maxdepth 1 -exec rm -rf {} +)"

          echo "==> 拷贝新构建产物"
          docker cp "dist/." "$CT:$HTML/"

          echo "==> 重载 nginx 配置"
          docker exec "$CT" nginx -s reload
          echo "[OK] 部署完成"
        '''
      }
    }

    stage('Smoke Check') {
      when {
        expression {
          params.DEPLOY && params.HEALTH_CHECK_URL != null && !params.HEALTH_CHECK_URL.trim().isEmpty()
        }
      }

      steps {
        sh "curl -fsS -o /dev/null -w '%{http_code}\\n' '${params.HEALTH_CHECK_URL.trim()}'"
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'backup-*/', allowEmptyArchive: true
      deleteDir()
    }
  }
}
