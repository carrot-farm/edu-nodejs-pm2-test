const path = require('path');
const { parsed, error } = require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

// ===== 에러 처리
if (error) {
  console.error('node> ERROR dotenv : \n', error);
}

// ===== appRoot 지정
global.appRoot = path.resolve(__dirname);

// ===== esm 적용
// require = require('esm')(module);

require("babel-register");
require("babel-polyfill");
require("./src"); // 비즈니스 로직은 모두 이곳에서 수행
