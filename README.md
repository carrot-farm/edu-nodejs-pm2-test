# nodejs pm2 테스트 코드

## 참고
[없어진 라인 기술 블로그](https://webcache.googleusercontent.com/search?q=cache:nuCNbmlRtEEJ:https://engineering.linecorp.com/ko/blog/pm2-nodejs/+&cd=4&hl=ko&ct=clnk&gl=kr)

## 명령어
``데몬화 후 모니터링``
```shell
$ pm2 start app.js
```

``설정파일 실행``
```shell
$ pm2 start ecosystem.config.js
```

``프로세스 간략 상태표시``
```shell
$ pm2 list
```

``프로세스 5개 늘리기``
```shell
$ pm2 scale app +5
```

``프로세스 4개만 실행하기``
```shell
$ pm2 scale app 4
```

``프로세스 재시작``
```shell
$ pm2 reload
```

## 프로세스 재시작 로직
* 프로세스 10개가 실행되고 있다고 가정.
* pm2 reload.
* pm2는 기존 0번 프로세스를 `_old_0`프로세스로 옮김.
* 새로운 0번 프로세스 만듦.
* 0번 프로세스는 준비가 되면 마스터 프로세스에게 `ready` 이벤트 호출.
* `_old_0`프로세스 종료 시그널(`SIGINT`) 보냄.
* 일정시간(`1600ms`)후에도 `_old_0` 프로세스가 종료 안된다면 `SIGKILL` 시그널 보내서 강제 종료.
* cpu 갯수만큼 반복.


## 재시작 과정에서 서비스가 중단되는 경우
* 상황
   * 새로만들어진 프로세스가 아직 요청을 받을 준비가 되지 않았는데 `ready` 이벤트를 보내는 경우.
* 해결
   * ecosystem.config.js - (wait_ready: true) 설정.

## 클라이언트 요청을 처리하는 도중 프로세스가 죽어버리는 경우
* 상황
   1. reload 명령 실행.
   1. 기존 0번 프로세스인 `_old_0` 프로세스는 종료전까지 계속 사용자 요청을 받음.
   1. `SIGINT`이 전달된 상태에서 요청 처리 하는데 `5000ms`가 걸림.
   1. 위의 상황에서 `1600ms`이후에도 종료하지 못함.
   1. `SIGKILL` 시그널로 요청을 처리하지 못하고 종료됨
* 해결
   1. `SIGINT` 시그널을 리스닝.
   1. `SIGINT` 전달 시 `app.close`명령어로 프로세스가 새로운 명령어를 받는 것을 거절하고
   기존 연결은 유지.
   1. 사용자 요청을 처리하기에 충분한 시간을 `kill_timeout`으로 설정.
   1. 요청을 처리 하고 프로세스 종료.

## HTTP 1.1 Keep-Alive 를 사용하는 경우
* 상황
   * 요청이 처리된 후에도 기존연결이 유지된다.
* 해결
   1. `SIGINT`시그널을 받음.
   1. 특정 전역 플래그 값에 따라 응답 헤더에 `Connection:close`를 설정.
   1. 클라이언트 요청을 종료.


## 코드
```javascript
// ===== ecosystem.config.js
moduel.exports == {
  apps : [
    {
      name: 'app', // app 이름.
      script: './app.js', // 실행 스크립트
      instance: 0, // cpu 갯수 만큼 인스턴스 실행
      exec_mode: 'cluster', // 클러스터 모드
      wait_ready: true, // 프로세스 종료 후 wait 이벤트가 발생하기 까지 기다린다.
      listen_timeout: 50000, // wait_ready 시 대기시간.
      kill_timeout: 5000, // SIGKILL 시 대기시간.
    }
  ]
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
