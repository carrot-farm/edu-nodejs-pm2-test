# 배포

## 목차
* [참고](#참고)
* [시나리오](#시나리오)
* [준비](#준비)
* [배포설정](#배포설정)
* [배포하기](#배포하기)
* [사용 예](#사용-예)

## 참고
[참고](https://fkkmemi.github.io/nembv/nembv-21-deploy-web/)
[배포 옵션](https://pm2.keymetrics.io/docs/usage/deployment/)

## 시나리오
* ssh, git 사용.
* 로드밸런서에 의해 여러대의 서버가 존재하는 상황.
* 한번의 커맨드로 여러대의 서버의 최종 버전을 변경.

## 준비
* ssh 암호 저장 후 암호입력없이 입력 접속.
```shell
$ ssh-copy-id account@serverurl -p12345
$ ssh account@serverurl
```
* 타켓 서버가 ssh로 깃헙에 연결.
   * 흐름
      * 클라이언트 -> 타겟 서버 ssh -> git hub
   * rsa 키 만들기
   ```shell
   $ ssh-keygen -t rsa -b 4096 -C "aaa@bbb.com"
   # copy key
   $ cat ~/.ssh/id_rsa.pub
   ```
   * git hub에서 키 등록
      * github.com -> personal setting -> SSH and GPG keys -> new ssh key -> 복사한키 붙여넣기.

## 배포 설정
* 타겟 서버에 접속할 정보 설정파일.
```javascript
// ===== cfg/cfg.js
pm2 : {
  user: 'root',
  host: 'xxx.com',
  port: 8080,
  path: '/var/www/nembv',
}
```
* ecosystem 설정 파일
```javascript
// ===== ecosystem.config.js
const cfg = require('./cfg/cfg');

module.exports = {
  // # 앱 관련 설정.
  apps : [
    {
      name      : 'nembv',
      script    : 'bin/www',
      // watch: ["bin","routes","views","system"],
      ignore_watch : ["node_modules","cfg"],
      watch_options: {
        "followSymlinks": false
      },
      max_memory_restart : "2G",
      env: {
        COMMON_VARIABLE: 'true'
      },
      env_production : {
        NODE_ENV: 'production'
      }
    }
  ],
  // # 서버에 배포 시 사용할 옵션
  // # EC2 등이라면 키도 같이 넣어줘야 한다.
  deploy : {
    // # 서버에 밀어 넣기.
    production : {
      user : cfg.pm2.user, // 서버의 유저 명
      host : [ // 서버의 호스팅 정보. 여러대의 서버를 사용한다면 여러개 사용가능.
        {
          "host": cfg.pm2.host, // 호스팅 주소
          "port": cfg.pm2.port, // 포트 주소
        }
      ],
      ref  : 'origin/master', // git 브랜치
      repo : 'git@github.com:fkkmemi/nembv.git', // git 레포지터리
      path : cfg.pm2.path, // 서버내 앱 주소
      // 다운 후 해야할 행동
        // 'post-deploy' : 'npm install && pm2 startOrRestart ecosystem.config.js --env production'
      'post-deploy' : 'npm install && cd fe && npm install && npm run build --env production'
    },
    // # 설치 후 재시작시 행동.
    dev : {
      user : cfg.pm2.user,
      host : [
        {
          "host": cfg.pm2.host,
          "port": cfg.pm2.port,
        }
      ],
      ref  : 'origin/master',
      repo : 'git@github.com:fkkmemi/nembv.git',
      path : cfg.pm2.path,
      'post-deploy' : 'npm install && cd fe && npm install && npm run build && cd .. && pm2 startOrRestart ecosystem.config.js --env dev && pm2 log',
      env  : { // 환경 변수
        NODE_ENV: 'dev'
      }
    }
  }
};
```
* package.json 설정
   * pm2 scirpt 설정
```javascript
{
  "name": "nemv",
  "version": "0.0.1",
  "scripts": {
    "dev": "NODE_ENV=development node ./be/bin/www",
    "serve": "cd fe && yarn serve",
    "pr": "cd fe && yarn && yarn build && cd ../be && yarn && NODE_ENV=production PORT=80 node ./bin/www",
    "pm2": "cd fe && yarn && yarn build && cd ../be && yarn && cd .. && pm2 start --env pr"
  },
  ...
}
```

## 배포하기
* 시나리오
   * git hub push.
      * 최근에 push 된 내용이 없으면 실행 안됨.
      * push 없이 하려먼 `-force`옵션
   * pm2 deploy xxx
   * 등록되어 있는 서버에 접속.
   * 정해진 경로에 다운 이나 갱신(git clone or pull)
   * post-deploy 실행
      * **npm install** : 백엔드 의존요소 설치.
      * **cf fe && npm install** : 프론트엔드 의존요소 설치.
      * **npm run build** : 프론트 엔드 webpack 빌드.
      * **cd .. && pm2 startOrRestart ecosystem.config.js** : 실행되어있으면 start. 실행되어 있다면 restart.(apps 실행됨.)
* 주의 사항
   * 여러대일 경우 동시 실행이 아니라 한대가 끝나고 다음것을 실행한다.
   * 서버의 경로에 관한 디렉토리는 미리 만들어 줘야 한다.
* dev 빌드 & 배포
```shell
$ pm2 deploy dev
```
* production 배포
```shell
# $ pm2 deploy ecosystem.config.js production
# `ecosystem.config.js`가 최상단에 정의되어 있어 생략 가능.
$ pm2 deploy production
```
* 기타
   * git push 없이 하려면 뒤에 -force 옵션 붙여주기.


## 사용 예
* 서버에 접근 후 root 권한 얻기
```shell
# 일반유저 접속
$ ssh -i nemKey.pem centos@x.x.x.x
# root 권한 획득
$ sudo -i
```
* pm2 설치
```shell
$ npm i -g pm2
```
* 서버 코드 최신화 후 실행
```shell
$ git pull
$ yarn pm2
```

