# 로그
로그는 기본적으로 '~/.pm2/logs' 에 저장된다.

## 참고
[로그 시스템](https://pm2.keymetrics.io/docs/usage/log-management/)

## 일자별 로그 처리
* 기본 날짜별로 실행
```shell
$ pm2 install pm2-logrotate
```
* 7일 치만 보관
```shell
$ pm2 set pm2-logrotate:retain 7
```