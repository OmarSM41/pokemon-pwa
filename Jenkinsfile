pipeline {
    agent any

    environment {
        VERCEL_TOKEN = credentials('VERCEL_TOKEN')
    }

    tools {
        nodejs 'node18'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/OmarSM41/pokemon-pwa-probando.git'
            }
        }

        stage('Verify Node') {
            steps {
                bat '''
                    node -v
                    npm -v
                '''
            }
        }

        stage('Install dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build PWA') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Deploy to Vercel') {
            steps {
                bat '''
                    npm install -g vercel
                    vercel deploy --prod --token %VERCEL_TOKEN% --yes
                '''
            }
        }
    }
}

