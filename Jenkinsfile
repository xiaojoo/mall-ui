/*
 * mall-web 前端 Jenkins 流水线（适配 mall 后端 Docker 环境）
 * ------------------------------------------------------------
 * 后端环境（见 mall 仓库 install-infra-basic.sh / install-nginx.sh / Jenkinsfile.docker）：
 *   - nginx 容器名：nginx，宿主端口 8088 -> 容器 80
 *   - 前端静态：宿主目录 /data/mall/web 绑定挂载到容器 /usr/share/nginx/html（只读 :ro）
 *   - nginx 已配置 /api/ 反向代理到网关 mall-gateway:88（网关再经 Nacos 路由到各服务）
 *   - 前端构建产物(dist)只需放到宿主 /data/mall/web，nginx 即可直接服务，无需改/重载 nginx。
 *
 * 部署方式（满足「把 /data/mall/web 挂进 Jenkins 代理容器」）：
 *   - 部署阶段运行在一个 Jenkins 的 Docker 代理容器里，并额外挂载宿主目录：
 *       -v /data/mall/web:/data/mall/web
 *   - 因此对 FRONTEND_ROOT(= /data/mall/web) 的写入，会直接落到宿主（nginx 的绑定挂载源）。
 *   - nginx 的 html 挂载是只读(:ro)，所以不能 docker cp 进容器；本流水线改为纯文件操作
 *     （备份 + 清空 + 拷贝），部署阶段无需 docker CLI / docker.sock。
 *   - 前提：Jenkins 所用的 Docker 守护进程宿主上存在 /data/mall/web（后端 install 脚本已创建）。
 *
 * 用法：Jenkins 新建 Pipeline -> Pipeline script from SCM -> 本仓库 / Jenkinsfile
 */
pipeline {
  agent any // 全局节点：仅用于调度；各阶段各用不同的 Docker 代理容器

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
      description: '宿主前端静态根目录（nginx 绑定挂载来源；已挂进部署代理容器，替换/reload nginx 后直接生效）'
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

      // 部署代理容器：挂载宿主 /data/mall/web，写入即落到 nginx 绑定挂载源
      agent {
        docker {
          image 'alpine:latest'
          args '-v /data/mall/web:/data/mall/web'
        }
      }

      steps {
        unstash 'dist'

        script {
          def root = params.FRONTEND_ROOT
          if (!root?.trim()) { error('FRONTEND_ROOT 不能为空') }
          sh """
            set -e
            ROOT='${root.trim()}'

            echo '==> 校验挂载点'
            [ -d "\$ROOT" ] || mkdir -p "\$ROOT"
            mountpoint -q "\$ROOT" 2>/dev/null && echo "  \$ROOT 为挂载点(写入将落到宿主)" || echo "  \$ROOT 目录可写"

            echo '==> 备份当前静态文件'
            TS=\$(date +%Y%m%d%H%M%S)
            cp -a "\$ROOT" "./backup-\$TS" 2>/dev/null || true

            echo '==> 清空旧的静态文件'
            find "\$ROOT"/ -mindepth 1 -maxdepth 1 -exec rm -rf {} +

            echo '==> 拷贝新构建产物'
            cp -a dist/. "\$ROOT"/
            echo '[OK] 部署完成 -> '\$ROOT
          """
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
