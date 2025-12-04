pipeline {
    agent any

    environment {
        VERCEL_TOKEN = credentials('VERCEL_TOKEN')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/OmarSM41/pokemon-pwa-probando.git'
            }
        }

        stage('Install Node') {
            steps {
                // Instala Node 18
                sh 'curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -'
                sh 'sudo apt-get install -y nodejs'
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build PWA') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy to Vercel') {
            steps {
                sh '''
                    npm install -g vercel
                    vercel deploy --prod --token $VERCEL_TOKEN --yes
                '''
            }
        }
    }
}
