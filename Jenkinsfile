
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
        /* groovylint-disable-next-line LineLength */
        sh 'export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm'
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
