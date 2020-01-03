import Express from "express";
import bodyParser from "body-parser";

// import api from "./api";

const port = 8080;
const app = Express();

let isDisableKeepAlive = false; // keep-alive 비활성화 플래그.


// # keep-alive 비황성화 플래가 켜졌을 경우 connection close 헤더 set 미들웨어.
app.use((req, res, next) => {
  if(isDisableKeepAlive) {
    res.set('Connection', 'close');
  }
  next();
});

// json 파싱
app.use(bodyParser.json());
// utf8 등의 query string
app.use(bodyParser.urlencoded({ extended: false }));
// api route
// app.use("/api", api);
// static route
app.use(Express.static(__dirname + "/static"));

// ===== 서버 시작
app.listen(port, () => {
  process.sned('ready'); // ready 이벤트 발생으로 새로운 프로세스로 교체한다.
  console.log(`server listen ${port}`);
});

// ===== SIGINT 이벤트 리스닝
process.on('SIGINT', function() {
  // # keep-alive 비활성화
  isDisableKeepAlive = true;

  // # 새로운 요청을 받기 않게 앱 종료
  app.close(function() {
    console.log('server closed');
    process.exit(0); //
  });
});
