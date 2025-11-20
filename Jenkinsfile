pipeline {
    agent any

    environment {
        AWS_REGION = "ap-south-1"
        AWS_ACCOUNT_ID = "525390918172"
        ECR_URL = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    }

    stages {

        stage('Build Backend Image') {
            steps {
                bat 'docker build -t backend-app ./backend'
            }
        }

        stage('Build Frontend Image') {
            steps {
                bat 'docker build -t frontend-app ./frontend'
            }
        }

        stage('Login to AWS ECR') {
            steps {
                bat """
                aws ecr get-login-password --region %AWS_REGION% |
                docker login --username AWS --password-stdin %ECR_URL%
                """
            }
        }

        stage('Tag Images') {
            steps {
                bat """
                docker tag backend-app %ECR_URL%/backend-app:latest
                docker tag frontend-app %ECR_URL%/frontend-app:latest
                """
            }
        }

        stage('Push Images to ECR') {
            steps {
                bat """
                docker push %ECR_URL%/backend-app:latest
                docker push %ECR_URL%/frontend-app:latest
                """
            }
        }
    }
}

