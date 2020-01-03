// ===== 더미 제품들 파일
const products = [
  { name: "반팔티", price: 15000, quantity: 1, selected: true },
  { name: "긴팔티", price: 20000, quantity: 2, selected: false },
  { name: "핸프폰케이스", price: 15000, quantity: 3, selected: true },
  { name: "후드티", price: 30000, quantity: 4, selected: false },
  { name: "바지", price: 25000, quantity: 5, selected: false },
  { name: "반팔티", price: 15000, quantity: 1, selected: true },
  { name: "반팔티", price: 15000, quantity: 1, selected: true },
  { name: "긴팔티", price: 20000, quantity: 2, selected: false },
  { name: "핸프폰케이스", price: 15000, quantity: 3, selected: true },
  { name: "후드티", price: 30000, quantity: 4, selected: false },
  { name: "바지", price: 25000, quantity: 5, selected: false },
  { name: "긴팔티", price: 20000, quantity: 2, selected: false },
  { name: "핸프폰케이스", price: 15000, quantity: 3, selected: true },
  { name: "후드티", price: 30000, quantity: 4, selected: false },
  { name: "바지", price: 25000, quantity: 5, selected: false }
];

// ===== 딜레이 함수
const delay = (time, a) =>
  new Promise(resolve => setTimeout(() => resolve(a), time));

const Product = {};
// 제품 리스트를 리턴하는 함수. db내용을 조회하는 함수라고 친다.
Product.list = () => products;
// 700의 딜리이가 걸리는 함수.
Product.list700 = () => delay(700, products);
Product.list250 = () => delay(250, products);
Product.list30 = () => delay(30, products);

// fltmxm템플릿
Product.list.tmpl = products =>
  `<table>
    <tr>
      <td>이름</td>
      <td>가격</td>
      <td>수량</td>
      <td>합계</td>
    </tr>
    ${products
      .map(
        p =>
          `<tr>
            <td>${p.name}</td>
            <td>${p.price}</td>
            <td>${p.quantity}</td>
            <td>${p.price * p.quantity}</td>
          </tr>`
      )
      .join("")}
  </table>`;

// ===== 텍스트를 엘리먼트로 만들어 넣는다.
const el = html => {
  const wrap = document.createElement("div");
  wrap.innerHTML = html;
  return wrap.children[0];
};

// ===== !리스트 출력 1.
// // flow: 리스트 객체 -> 템플릿 문자열 -> 엘리먼트에 집어 넣기
// document
//   .querySelector("body")
//   .appendChild(
//     el(Product.list.tmpl(Product.list()))
//   );

// ===== 셀렉터를 절차형에 함수형으로
const $ = (selector, parent = document) => parent.querySelector(selector);

// ===== append를 함수형으로
const append = (parent, child) => parent.appendChild(child);

// ===== remove class 원형. el에서 remove class 한뒤 el을 다시 리턴.
// const removeClass = (name, el) => (el.classList.remove(name), el);

// ===== 클래스 관련 추상화
const editClass = method => (name, el) => (el.classList[method](name), el);

// ===== remove class
const removeClass = editClass("remove");

// ===== add class
const addClass = editClass("add");

// ===== tab 함수 (리스트 출력 6.)
// 함수를 받고 이후 인자들을 받은 뒤 인자들을 적용하고 첫번째 인자를 리턴
const tap = f => (a, ...bs) => (f(a, ...bs), a);

// ===== sohw 1. hide 클래스를 삭제 후 엘리먼트 리턴.
// 애니메이션을 위해서는 비동기로 처리해야 한다.
// const show = el => setTimeout(() => removeClass('hide', el), 1);

// ===== sohw 2. (리스트 출력 5. 에서 고침)
// 비동기시 동시 처리를 위해 timeout이 아니라 엘리먼트를 리턴해 준다.
// const show = el => {
//   setTimeout(() => removeClass('hide', el), 1);
//   return el;
// };

// ===== sohw 3. (리스트 출력 6. 에서 적용)
// 애니메이션이 끝나는 지정을 정확히 알림.
// flow: 클래스 삭제 -> 애니메이션 발생 -> 애니메이션 종료 -> 엘리먼트 전달.({once : true} 옵션으로 한번만 실행됨)
// const show = el =>
//   new Promise(resolve =>
//     setTimeout(() => {
//       removeClass("hide", el).addEventListener(
//         "transitionend",
//         () => resolve(el),
//         { once: true }
//       );
//     }, 1)
//   );

// ===== sohw 4. (리스트 출력 8.)
// 재사용성을 위해 트렌지션의 끝을 알리는 코드를 분리
const transitionend = f => el =>
  new Promise(resolve =>
    setTimeout(() => {
      f(el); // 함수를 실행
      // transtion이 끝났을 때 엘리먼트를 리턴
      el.addEventListener(
        "transitionend",
        () => resolve(el),
        { once: true }
      );
    }, 1)
  );
// flow: el을 받아 removeClass 를 transitionend에서 클로저로 f를 잡고 있음
//      -> show를 실행하면 el을 받아 f 즉 removeClass를 실행
//      -> transitonend 이벤트 끝난 뒤 resolve 실행.
const show = transitionend(el => removeClass("hide", el));

// ===== !리스트 출력 2. flow를 함수형으로 다시 작성.
// append($("body"), el(Product.list.tmpl(Product.list())));

// ===== !리스트 출력 3.
// const openPage = (title, dataFn, tmplFn) =>
//   show(
//     append(
//       $("body"),
//       el(
//         `<div class="page hide">
//         <h2 class="title">${title}</h2>
//         <div class="content">${tmplFn(dataFn())}</div>
//       </div>`
//       )
//     )
//   );
// document.addEventListener('click', () =>
//   openPage(
//     "상품목록",
//     Product.list,
//     Product.list.tmpl));

// ===== !리스트 출력 4.
// promise의 사용과 async / await
// 데이터를 전부 기다린 다음 애니메이션이 된다.
// 비동기를 완전히 동기적으로 바꾼것에 지나지 않는다.
// const openPage = async (title, dataFn, tmplFn) =>
//   show(
//     append(
//       $("body"),
//       el(
//         `<div class="page hide">
//         <h2 class="title">${title}</h2>
//         <div class="content">${tmplFn(await dataFn())}</div>
//       </div>`
//       )
//     )
//   );

// document.addEventListener('click', () =>
//   openPage(
//     "상품목록",
//     Product.list700,
//     Product.list.tmpl));

// ===== !리스트 출력 5.
// 동시성 적용.
// 단점: 페이지 랜더링과 데이터를 받아 오는것을 동시에 하기 때문에
//      실제 사용시에는 많이 버벅 거린다.
// const openPage2 = async (title, dataFn, tmplFn) =>{
//   // 데이터를 받아옴과 동시에 page 엘리먼트를 생성
//   const dataP = dataFn();
//   const page = show(
//     append(
//       $("body"),
//       el(
//         `<div class="page hide">
//         <h2 class="title">${title}</h2>
//         <div class="content"></div>
//       </div>`
//       )
//     )
//   );

//  // 데이터를 다 가져 왔으 때 page에 품록 리스트를 붙임.
//   append(
//     $('.content', page),
//     el(tmplFn(await dataP))
//   )
// };
// document.addEventListener('click', () =>
//   openPage2(
//     "상품목록",
//     Product.list700,
//     Product.list.tmpl));

// ===== !리스트 출력 6.
// 데이터를 받아옴 과 동시에 페이지를 그리고 show 애니메이션이
// 끝났을 때 리스트를 실행. 먼저끝나는 엘리먼트나 나중에 로드가 완료되는 엘리먼트나 자연스럽다.
// const openPage2 = async (title, dataFn, tmplFn) =>{
//   const dataP = dataFn(); // 데이터를 받아옴.
//   const page = await show( // 데이터 부분외에 랜더링.
//     append(
//       $("body"),
//       el(
//         `<div class="page hide">
//         <h2 class="title">${title}</h2>
//         <div class="content"></div>
//       </div>`
//       )
//     )
//   );

//   // 데이터를 다 가져 왔으 때 page에 품록 리스트를 붙임.
//   // tab 함수로 인해 child 가 아니라 parent를 리턴하는 함수가 된다.
//   show(tap(append)(
//     addClass('hide', $('.content', page)),
//     el(tmplFn(await dataP))
//   ))
// };
// document.addEventListener('click', () =>
//   openPage2(
//     "상품목록",
//     Product.list250,
//     Product.list.tmpl));

// ===== ! 리스트 출력 7.
// 이미 데이터가 있을 경우는 바로 렌더링 된 후 애니메이션
// 받은 데이터가 promise가 아닌 경우는 바로 렌더링 되고 promise 인경우는 나중에 되게 한다.
const isPromise  = a => a instanceof Promise;
// const openPage3 = async (title, dataFn, tmplFn) => {
//   const dataP = dataFn();
//   // promise가 아닌 경우 바로 리스트를 출력
//   const page = await show(append(
//     $('body'),
//     el(`
//       <div class="page hide">
//         <h2 class="title">${title}</h2>
//         <div class="content">${isPromise(dataP) ? '' : tmplFn(dataP)}</div>
//       </div>
//     `)
//   ));

//   // Promise 가 아닌 경우 아래의 애니메이션 실행 안함.
//   isPromise(dataP) &&
//   show(tap(append)(
//     addClass('hide', $('.content', page)),
//     el(tmplFn(await dataP))
//   ));
// };

// let i = 0;
// document.addEventListener('click', () =>
//   openPage3(
//     "상품목록",
//     // Product.list250, // 나중에 리스트 렌더링
//     // Product.list, // promise가 아니기 때문에 렌더링 된 후 애니메이션
//     i++ % 2 ? Product.list : Product.list700, // 번갈아 가면서 실행
//     Product.list.tmpl));


// ===== ! 리스트 출력 8.
const nop = Symbol('nop');
const isNop = a => a === nop; // nop인지 확인.
// 비동기로 데이터를 받아 오지만 매우 빠르게 받아 올 경우는 렌더링을 한 후 애니메이션을 한다.
// 아래의 예제는 50ms안에 들어오면 그려서 올린다.
// Promise.race를 사용해 비동기로 받아오는 데이터중 빠르게 받아오는 데이터를 선별 가능하다.
const openPage4 = async (title, dataFn, tmplFn) => {
  const dataP = dataFn();
  // 2개의 인자중 먼저 완료된 promise를 받는다.
  const data = await Promise.race([
    dataP,
    delay(50, nop) // 50ms의 딜레이를 가지고 아무것도 의미없는 데이터
  ]);

  // nop이면 더 기다리고 nop이 아닐경우는 50ms 보다 빨리 받았기 때문에 바로 렌더링 되게 된다.
  const page = await show(append(
    $('body'),
    el(`
      <div class="page hide">
        <h2 class="title">${title}</h2>
        <div class="content">${isNop(data) ? "" : tmplFn(await data)}</div>
      </div>
    `)
  ));

  isNop(data) &&
    show(tap(append)(
      addClass('hide', $('.content', page)),
      el(tmplFn(await dataP))
    ));
};

// let i = 0;
// // 번갈아 제공되는 데이터는 둘다 비동기로 받아오는 데이터다.
// document.addEventListener('click', () =>
//   openPage4(
//     "상품목록",
//     i++ % 2 ? Product.list700 : Product.list30, // 번갈아 가면서 실행
//     Product.list.tmpl));

// 꼭 위와 같은 형태만 아니라 여러 방면으로 응용가능.
document.addEventListener('click', () =>
  openPage4(
    "다른 뷰",
    () => delay(1700, 'hi~'),
    str => `<i style="padding: 50px; display: block;">${str}</i>`));
