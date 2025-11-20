pipeline {
    agent {
        docker {
            image 'docker:24.0.2'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    stages {

        stage('Check Docker') {
            steps {
                sh 'docker version'
            }
        }

        stage('Build Backend') {
            steps {
                sh 'docker build -t backend-app -f backend/Dockerfile .'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker build -t frontend-app -f frontend/Dockerfile .'
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                aws ecr get-login-password --region ap-south-1 | \
                docker login --username AWS --password-stdin <ECR_URL>
                '''
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                docker tag backend-app 525390918172.dkr.ecr.ap-south-1.amazonaws.com/chat-backend:latest
docker tag frontend-app 525390918172.dkr.ecr.ap-south-1.amazonaws.com/chat-frontend:latest

docker push 525390918172.dkr.ecr.ap-south-1.amazonaws.com/chat-backend:latest
docker push 525390918172.dkr.ecr.ap-south-1.amazonaws.com/chat-frontend:latest

                '''
            }
        }
    }
}


