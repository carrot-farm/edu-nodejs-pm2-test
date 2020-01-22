# 시작 프로그램 등록

## 참고
[시작프로그램 등록](https://pm2.keymetrics.io/docs/usage/startup/)

## 서버가 시작 시 바로 실행
### centos7
* os별 자동 설정
```shell
$ pm2 startup
```
* os지정 설정
```shell
$ pm2 startup centos
```
* 시작 시 상태 설정
   * 현재 상태를 저장 해 시작 시 같은 데몬을 실행 시킨다.
```shell
$ pm2 save
```




