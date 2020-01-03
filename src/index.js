import Express from "express";
import bodyParser from "body-parser";

// import api from "./api";

const port = 8080;
const app = Express();

// json 파싱
app.use(bodyParser.json());
// utf8 등의 query string
app.use(bodyParser.urlencoded({ extended: false }));
// api route
// app.use("/api", api);
// static route
app.use(Express.static(__dirname + "/static"));

app.listen(port, () => {
  console.log(`server listen ${port}`);
});
