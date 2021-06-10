
pipeline {
  agent {
    docker {
      image 'cypress/base:10'
    }
  }

  stages {
    stage('build') {
      steps {
        echo "Running build ${env.BUILD_ID} on ${env.JENKINS_URL}"
        sh 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash'
        sh 'source ~/.profile'
        sh 'nvm install 14'
        sh 'nvm use 14'
        sh 'cd frontend && yarn install'
      }
    }
    stage('cypress parallel tests') {
      environment {
        CYPRESS_RECORD_KEY = credentials('ceph-tests')
        CYPRESS_trashAssetsBeforeRuns = 'false'
      }

      parallel {
        stage('Test runner A') {
          steps {
            echo "Running build ${env.BUILD_ID}"
            sh "yarn run test-ceph-parallel"
          }
        }

        // second tester runs the same command
        stage('Test runner B') {
          steps {
            echo "Running build ${env.BUILD_ID}"
            sh "yarn run test-ceph-parallel"
          }
        }
      }

    }
  }
}
