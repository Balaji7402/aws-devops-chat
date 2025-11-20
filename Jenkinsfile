pipeline {
    agent any

    environment {
        AWS_REGION = "ap-south-1"
        ECR_BACKEND = "<YOUR_ECR_BACKEND_URL>"
        ECR_FRONTEND = "<YOUR_ECR_FRONTEND_URL>"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                bat '''
                docker build -t backend-app -f backend/Dockerfile .
                docker build -t frontend-app -f frontend/Dockerfile .
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'aws-access-key',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )]) {
                    bat '''
                    aws configure set aws_access_key_id %AWS_ACCESS_KEY_ID%
                    aws configure set aws_secret_access_key %AWS_SECRET_ACCESS_KEY%
                    aws configure set region ap-south-1

                    aws ecr get-login-password --region ap-south-1 > pass.txt
                    set /p PASS=<pass.txt

                    docker login -u AWS -p %PASS% https://%ECR_BACKEND%
                    docker login -u AWS -p %PASS% https://%ECR_FRONTEND%
                    '''
                }
            }
        }

        stage('Tag & Push to ECR') {
            steps {
                bat '''
                docker tag backend-app %ECR_BACKEND%:latest
                docker tag frontend-app %ECR_FRONTEND%:latest

                docker push %ECR_BACKEND%:latest
                docker push %ECR_FRONTEND%:latest
                '''
            }
        }

        stage('Deploy to Local Environment') {
            steps {
                bat '''
                docker compose down
                docker compose up -d --build
                '''
            }
        }
    }

    post {
        always {
            echo "Pipeline finished."
        }
    }
}

