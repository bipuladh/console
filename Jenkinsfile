
pipeline {
  agent {
    docker {
      image 'node:stretch-slim'
    }
  }

  stages {
    stage('build') {
      steps {
        echo "Running build ${env.BUILD_ID} on ${env.JENKINS_URL}"
        sh 'apt-get install software-properties-common'
        sh 'add-apt-repository ppa:deadsnakes/ppa'
        sh 'apt-get update && apt-get install python3.6'
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
