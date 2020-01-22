# 명령어

**프로세스 시작**
```shell
$ pm2 start app.js
```

**설정파일 실행**
```shell
$ pm2 start ecosystem.config.js
```

**로그 확인**
```shell
$ pm2 monit
```

**모니터**
```shell
$ pm2 log
```

**환경 변수 설정 후 시작**
* ecosystem.config.js 에 설정 후 다음 커맨드
* development 환경
```shell
$ pm2 start ecosystem.config.js
```
* production 환경
```shell
$ pm2 start ecosystem.config.js env-production
```

**프로세스 간략 상태표시**
```shell
$ pm2 list
```

**프로세스 5개 늘리기**
```shell
$ pm2 scale app +5
```

**프로세스 4개만 실행하기**
```shell
$ pm2 scale app 4
```

**프로세스 재시작**
```shell
$ pm2 reload app
```