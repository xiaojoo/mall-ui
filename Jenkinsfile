// ============================================================================
// mall-web 前端 Jenkins 流水线（镜像 + 仓库 + SSH 部署，主流方案）
//
// 流程：Checkout(内置) -> 初始化(取 tag) -> 构建 Docker 镜像(多阶段: node 构建 + nginx 服务)
//       -> (可选)推送镜像仓库 -> (可选)通过 SSH 部署容器到 Docker 主机
//
// 前置条件：
//   1. Jenkins 插件：Pipeline、Credentials Binding、SSH Agent、Timestamper、Git
//   2. Jenkins Agent 节点需具备：git、docker CLI（构建/推送/部署用；无需预装 node/pnpm，
//      因为构建在镜像内的 node:20-alpine 里完成）。
//   3. Jenkins 凭据：
//        - username/password 类型，ID=registry-credentials（镜像仓库账号，仅用 REGISTRY_URL + PUSH_REGISTRY 时）
//        - SSH Username with private key，ID=deploy-ssh-key（用于 SSH 到部署主机执行 docker）
//   4. 任务里启用“参数化构建”，按下方 parameters 填值（本项目未硬编码任何服务器地址/密码）。
//
// 说明：
//   * REGISTRY_URL 非空 + PUSH_REGISTRY 开启 -> 镜像推送，部署主机 docker pull；
//   * REGISTRY_URL 为空 -------> 走 docker save | ssh docker load 传输，无需额外镜像仓库。
//
// nginx 默认把 /api/ 反代到网关（API_PROXY_TARGET），静态文件来自 dist。
// ============================================================================
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    parameters {
        choice(name: 'BUILD_MODE', choices: ['pro', 'test'], description: '构建模式，对应 pnpm build:pro / build:test')
        string(name: 'IMAGE_TAG', defaultValue: '', description: '镜像标签，留空则使用 Git 短 SHA')
        string(name: 'APP_NAME', defaultValue: 'mall-web', description: '容器名/镜像名前缀')
        string(name: 'REGISTRY_URL', defaultValue: '', description: '镜像仓库地址，例如 registry.example.com/library；留空=不做仓库推送(用 docker save|load)')
        booleanParam(name: 'PUSH_REGISTRY', defaultValue: false, description: '是否推送镜像到 REGISTRY_URL（需配置仓库凭据 registry-credentials）')
        string(name: 'DEPLOY_HOST', defaultValue: '', description: '部署目标主机 IP/域名；留空则跳过部署')
        string(name: 'DEPLOY_USER', defaultValue: 'root', description: 'SSH 部署用户')
        string(name: 'DEPLOY_SSH_PORT', defaultValue: '22', description: 'SSH 端口')
        string(name: 'HOST_PORT', defaultValue: '8088', description: '宿主机端口映射(容器80)。若外层由其它 nginx/ingress 按容器名或网络访问，可留空')
        string(name: 'DOCKER_NETWORK', defaultValue: 'mall-net', description: '容器接入的自定义 docker 网络（与网关/后端同网即可被代理访问）')
        string(name: 'API_PROXY_TARGET', defaultValue: 'http://mall-gateway:88', description: 'nginx /api 反代目标（网关地址/服务名）')
    }

    environment {
        // 凭据 ID（需在 Jenkins 凭据中配置，ID 本身非机密）
        REGISTRY_CREDENTIALS_ID = 'registry-credentials'
        DEPLOY_SSH_CREDENTIALS_ID = 'deploy-ssh-key'
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('初始化') {
            steps {
                script {
                    def shortSha = env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'build'
                    def tag = params.IMAGE_TAG.trim()
                    def reg = params.REGISTRY_URL.trim()
                    def host = params.DEPLOY_HOST.trim()
                    env.IMAGE_TAG = tag.isEmpty() ? shortSha : tag
                    env.IMAGE_NAME = reg.isEmpty() ? params.APP_NAME : "${reg}/${params.APP_NAME}"
                    echo "=> 镜像: ${env.IMAGE_NAME}:${env.IMAGE_TAG}  模式: ${params.BUILD_MODE}  部署主机: ${host.isEmpty() ? '(未配置,跳过部署)' : host}"
                }
            }
        }

        stage('构建 Docker 镜像') {
            steps {
                sh "docker build -f Dockerfile --build-arg BUILD_MODE=${params.BUILD_MODE} --build-arg API_PROXY_TARGET=${params.API_PROXY_TARGET} -t ${env.IMAGE_NAME}:${env.IMAGE_TAG} ."
            }
        }

        stage('推送镜像仓库') {
            when {
                expression { params.PUSH_REGISTRY && params.REGISTRY_URL?.trim()?.length() > 0 }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: env.REGISTRY_CREDENTIALS_ID,
                                                  usernameVariable: 'REG_USER',
                                                  passwordVariable: 'REG_PASS')]) {
                    sh """
                        set -e
                        echo "\${REG_PASS}" | docker login "${params.REGISTRY_URL}" -u "\${REG_USER}" --password-stdin
                        docker tag ${env.IMAGE_NAME}:${env.IMAGE_TAG} ${env.IMAGE_NAME}:latest
                        docker push ${env.IMAGE_NAME}:${env.IMAGE_TAG}
                        docker push ${env.IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('部署到 Docker 主机') {
            when {
                expression { params.DEPLOY_HOST?.trim()?.length() > 0 }
            }
            steps {
                sshagent([env.DEPLOY_SSH_CREDENTIALS_ID]) {
                    script {
                        def remote = "${params.DEPLOY_USER}@${params.DEPLOY_HOST}"
                        def sshOpts = "-p ${params.DEPLOY_SSH_PORT} -o StrictHostKeyChecking=no"

                        // 无仓库时：把本地镜像直接传到部署主机
                        if (params.REGISTRY_URL?.trim()?.length() == 0) {
                            sh "docker save ${env.IMAGE_NAME}:${env.IMAGE_TAG} | ssh ${sshOpts} ${remote} 'docker load'"
                        }

                        // 远程运行脚本：停旧容器 -> 确网 -> 拉/载镜像 -> 启新容器
                        def runScript = """
                            set -e
                            APP="${params.APP_NAME}"
                            IMG="${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                            NET="${params.DOCKER_NETWORK}"
                            PORT="${params.HOST_PORT}"
                            REG="${params.REGISTRY_URL}"
                            docker rm -f "\$APP" 2>/dev/null || true
                            docker network inspect "\$NET" >/dev/null 2>&1 || docker network create "\$NET"
                            if [ -n "\$REG" ]; then docker pull "\$IMG"; fi
                            PUBLISH=""
                            [ -n "\$PORT" ] && PUBLISH="-p \${PORT}:80"
                            docker run -d --name "\$APP" --restart unless-stopped \$PUBLISH --network "\$NET" "\$IMG"
                            echo "=> deployed: \$(docker ps --filter name=\$APP --format '{{.Names}} -> {{.Status}} | {{.Image}}')"
                        """
                        sh "ssh ${sshOpts} ${remote} 'bash -s' <<'REMOTE'\n${runScript}\nREMOTE"
                    }
                }
            }
        }
    }

    post {
        always {
            deleteDir()
        }
    }
}
