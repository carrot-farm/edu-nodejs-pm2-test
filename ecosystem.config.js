module.exports = {
  apps: [
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