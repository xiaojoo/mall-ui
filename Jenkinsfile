/*
 * mall-web 前端 Jenkins 流水线（适配 mall 后端 Docker 环境）
 * ------------------------------------------------------------
 * 参考后端环境（见 mall 仓库 install-infra-basic.sh / install-nginx.sh / Jenkinsfile.docker）：
 *   - nginx 容器名：nginx，宿主端口 8088 -> 容器 80
 *   - 前端静态：宿主目录 /data/mall/web 绑定挂载到容器 /usr/share/nginx/html（只读 :ro）
 *   - nginx 已配置 /api/ 反向代理到网关 mall-gateway:88（网关再经 Nacos 路由到各服务）
 *   - 前端构建产物(dist)只要放到宿主 /data/mall/web，nginx 即可直接服务，无需改 nginx 配置。
 *
 * 因此本流水线：
 *   - 构建阶段：node:20 容器内用 pnpm 打 dist（项目 preinstall 强制要求 pnpm）。
 *   - 部署阶段：把 dist 同步到【宿主】FRONTEND_ROOT（= /data/mall/web）。
 *       ⚠️ nginx 的 html 挂载是只读(:ro)，不能 docker cp 进容器，必须写宿主目录。
 *       需确保 Jenkins 代理能访问该宿主路径，二选一：
 *          a) 把 /data/mall/web 挂进 Jenkins 代理容器；或
 *          b) 用 rsync over ssh 到目标机（自行替换下方 rsync 目标）。
 *   - 备份：从容器读取当前静态目录（只读挂载不影响读取），留作回滚。
 *
 * 用法：Jenkins 新建 Pipeline -> Pipeline script from SCM -> 本仓库 / Jenkinsfile
 */
pipeline {
  agent any // 默认节点：需要装有 docker CLI（用于备份/可选 reload），并需能访问宿主 FRONTEND_ROOT

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
      name: 'FRONTEND_ROOT',
      defaultValue: '/data/mall/web',
      description: '宿主前端静态根目录（nginx 绑定挂载来源，部署目标）'
    )
    string(
      name: 'NGINX_CONTAINER',
      defaultValue: 'nginx',
      description: 'mall 的 nginx 容器名（用于读取备份/可选 reload）'
    )
    string(
      name: 'NGINX_HTML_DIR',
      defaultValue: '/usr/share/nginx/html',
      description: 'nginx 容器内静态根目录（挂载点，用于读取备份）'
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
    booleanParam(
      name: 'RELOAD_NGINX',
      defaultValue: false,
      description: '是否在部署后执行 nginx reload（静态文件不需要；仅当 nginx 配置变更时才需要）'
    )
    string(
      name: 'HEALTH_CHECK_URL',
      defaultValue: '',
      description: '可选：部署后健康检查的完整 URL，例如 http://<服务器IP>:8088/ （留空则跳过）'
    )
  }

  environment {
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
        unstash 'dist'

        // 1) 备份：从容器读取当前静态目录（只读挂载不影响读取）
        sh "docker cp ${params.NGINX_CONTAINER}:${params.NGINX_HTML_DIR} ./backup-${env.BUILD_NUMBER} || true"

        // 2) 部署到宿主前端根目录（nginx 通过 bind mount 对外服务，需写宿主路径）
        script {
          def root = params.FRONTEND_ROOT
          if (!root?.trim()) { error('FRONTEND_ROOT 不能为空') }
          sh """
            set -e
            if command -v rsync >/dev/null 2>&1; then
              echo '==> 使用 rsync 同步'
              rsync -a --delete dist/ '${root.trim()}'/
            else
              echo '==> rsync 不可用，使用 find+cp'
              mkdir -p '${root.trim()}'
              find '${root.trim()}'/ -mindepth 1 -maxdepth 1 -exec rm -rf {} +
              cp -a dist/. '${root.trim()}'/
            fi
            echo '[OK] 部署完成 -> '${root.trim()}
          """
        }

        // 3) 可选 reload（静态文件由 nginx 直接读取，无需 reload；仅配置变更时才需要）
        script {
          if (params.RELOAD_NGINX) {
            sh "docker exec ${params.NGINX_CONTAINER} nginx -t && docker exec ${params.NGINX_CONTAINER} nginx -s reload"
          }
        }
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
