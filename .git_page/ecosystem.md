# 에코 시스템

## 참고
[배포 옵션](https://pm2.keymetrics.io/docs/usage/deployment/)

## 준비
* 'ecosystem.config.js'에 설정을 저장.

## 실행
* 일반 실행
```shell
$ pm2 start ecosystem.config.js
```
* 지정환경 옵션 실행
```shell
$ pm2 start ecosystem.config.js --env production
```

## 옵션
* apps
   * 개발시 앱정보에 관련된 옵션.
| 옵션 | 타입 | 설명 |
| --- | --- | --- |
| apps | jsonArr | .하위 객체애 옵션을 둠으로써 한번에 여러개의 앱을 실행하는게 가능하다. |
| name | str | . app의 이름 |
| script | str | . 실행 스크립트 경로 |
| instance | int | . 실행할 인스턴스설정. '0'은 cpu갯수만큼 자동실행. |
| exec_mode | enum | . 'cluster' : 클러스터 모드. |
| watch | arr | . 변경되는 파일을 감시할 디렉토리. watch는 어차피 배포시에는 재시작되기때문에 사용안된다. |
| ignore_watch | arr | . 감시에 제외될 디렉토리 |
| watch_potions | obj | . 감시 옵션 |
| watch_potions/followSymlinks | bool | . true 시 브라우저에서 링크파일의 경로를 확인가능. 보안상 false. |
| wait_ready | bool | . 프로세스 종료 후 wait 이벤트가 발생하기 까지 기다린다. |
| listen_timeout | int | . wait_ready 시 대기시간. |
| kill_timeout | int | . waSIGKILL 시 대기시간. |
| env | obj | . 기본 실행 시 환경 변수 |
| env_production | obj | . production 실행 시 환경 변수 |
| max_memory_restart | str | . 최대 메모리. 초과 시 재 시작됨. |
* deploy
   * 배포시 사용될 옵션.
   * ec2등에서는 사용될 키의 정보도 같이 넣어줘야 한다.
| 옵션 | 타입 | 설명 |
| --- | --- | --- |
| deploy | obj | . 하위 객체애 'production', 'dev'등으로 환경별 변수 지정이 가능하다. |
| prodction | obj | . 비어있는 타켓 서버에 소스를 밀어 넣고 의존요소 설치 목적. |
| dev | obj | . 설치시 재시작.(build라는 명칭이 적당하다.) |
| ../user | obj | . 서버 유저 명 |
| ../host | jsonArr | . 호스팅 정보(domain, port등). 여러대의 서버 정보를 넣어 줄 수 있다. |
| ../host/host | str | . 호스팅 정보 |
| ../host/port | int | . 포트 정보 |
| ../ref | str | . git branch 정보 |
| ../repo | str | . git 저장소 위치(ssh) |
| ../path | str | . 서버내 앱 위치 |
| ../post-deploy | str | . git에서 내려 받은 후 행동. |

## 예제
```javascript
// ===== ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'app', // app 이름.
      script: './index.js', // 실행 스크립트
      instance: 0, // cpu 갯수 만큼 인스턴스 실행
      exec_mode: 'cluster', // 클러스터 모드
      watch: ["src"], // 파일이 변경되면 자동을 재실행.
      ignore_watch: ["node_modules", "src/static/img", ".git_page", ".vscode"], // 재시작 감시 제외 디렉토리
      watch_potions: {
        followSymlinks: false, // true 시 브라우저에서 링크파일의 경로를 확인가능. 보안상 false.
      },
      wait_ready: true, // 프로세스 종료 후 wait 이벤트가 발생하기 까지 기다린다.
      listen_timeout: 50000, // wait_ready 시 대기시간.
      kill_timeout: 5000, // SIGKILL 시 대기시간.
      max_memory_restart : "2G", // 최대 메모리 설정.
      env: { // 개발 환경시 적용될 설정 지정.
        "NODE_ENV" : "development",
        "NODE_PATH": "src",
      },
      env_production: { // 배포 환경 설정
        "NODE_ENV" : "production",
        "NODE_PATH": "src",
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
      'post-deploy' : 'npm install && cd fe && npm install && npm run build && cd .. && pm2 startOrRestart ecosystem.config.js --env dev',
      env  : { // 환경 변수
        NODE_ENV: 'dev'
      }
    }
  }
};

// ===== app.js
const express = require('express');
const app = express();
const port = 8080;
let isDisableKeepAlive = false; // keep-alive 비활성화 플래그.

// # keep-alive 비황성화 플래가 켜졌을 경우 connection close 헤더 set 미들웨어.
app.use((req, res, next) => {
  if(isDisableKeepAlive) {
    res.set('Connection', 'close');
  }
  next();
});

// # GET 라우팅
app.get('/', (req, res) => {
  res.send('hello world');
});

// # 서버 시작
app.listen(port, () => {
  process.send('ready'); // ready 이벤트 발생으로 새로운 프로세스로 교체한다.
  console.log('server start');
});

// # SIGINT 이벤트 리스닝
process.on('SIGINT', function() {
  // # keep-alive 비활성화
  isDisableKeepAlive = true;

  // # 새로운 요청을 받기 않게 앱 종료
  app.close(function() {
    console.log('server closed');
    process.exit(0); //
  });
});
```