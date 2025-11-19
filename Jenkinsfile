pipeline {
  agent any

  environment {
    AWS_REGION = "ap-south-1"
    AWS_ACCOUNT_ID = "${env.AWS_ACCOUNT_ID ?: ''}"

    ECR_BACKEND = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/chat-backend"
    ECR_FRONTEND = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/chat-frontend"

    IMAGE_TAG = "${env.GIT_COMMIT ?: 'latest'}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Images') {
      steps {
        sh '''
          echo "Building backend image..."
          docker build -t ${ECR_BACKEND}:${IMAGE_TAG} ./backend
          docker tag ${ECR_BACKEND}:${IMAGE_TAG} ${ECR_BACKEND}:latest

          echo "Building frontend image..."
          docker build -t ${ECR_FRONTEND}:${IMAGE_TAG} ./frontend
          docker tag ${ECR_FRONTEND}:${IMAGE_TAG} ${ECR_FRONTEND}:latest
        '''
      }
    }

    stage('Login to ECR') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'aws-access-key',
          usernameVariable: 'AWS_ACCESS_KEY_ID',
          passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {

          sh '''
            export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
            export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}

            echo "Logging in to AWS ECR..."
            aws ecr get-login-password --region ${AWS_REGION} \
            | docker login --username AWS --password-stdin \
              ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
          '''
        }
      }
    }

    stage('Push Images to ECR') {
      steps {
        sh '''
          echo "Pushing backend image..."
          docker push ${ECR_BACKEND}:${IMAGE_TAG} || true
          docker push ${ECR_BACKEND}:latest || true

          echo "Pushing frontend image..."
          docker push ${ECR_FRONTEND}:${IMAGE_TAG} || true
          docker push ${ECR_FRONTEND}:latest || true
        '''
      }
    }

    stage('Deploy to EC2 / Local') {
      steps {
        script {

          // local deploy if Jenkins has docker access
          if (fileExists('/var/run/docker.sock')) {
            sh '''
              echo "Deploying locally on Jenkins server..."
              cd ~/aws-devops-chat

              docker pull ${ECR_BACKEND}:latest || true
              docker pull ${ECR_FRONTEND}:latest || true

              if [ -f docker-compose.prod.yml ]; then
                docker compose -f docker-compose.prod.yml up -d --pull always
              else
                docker compose up -d --pull always
              fi
            '''
          }

          // remote EC2 deploy
          else {
            sshagent (credentials: ['ec2-deploy-ssh']) {
              sh '''
                echo "Deploying to EC2 via SSH..."

                ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << 'EOF'
                  export AWS_REGION=${AWS_REGION}
                  export AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}

                  aws ecr get-login-password --region ${AWS_REGION} \
                  | docker login --username AWS --password-stdin \
                    ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                  cd ~/aws-devops-chat

                  docker-compose down || true
                  docker-compose pull || true
                  docker-compose up -d
                EOF
              '''
            }
          }

        }
      }
    }

  }

  post {
    always {
      echo 'Pipeline finished.'
    }
  }
}
