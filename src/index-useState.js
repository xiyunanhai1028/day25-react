/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 08:25:09
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';
/**
 * 同步才是Hook的思维方式
 * 每次渲染都是一个独立的闭包
 */
function Counter() {
  const [number, setNumber] = React.useState(0);

  function asyncAdd() {
    setTimeout(() => {
      //这里的这个number是当时渲染出来这个函数时候的number，并不是最新的number
      setNumber(number + 1);
    }, 3000);
  }

  function asyncAdd2() {
    setTimeout(() => {
      //可以通过函数参数获取最新的number值
      setNumber(number => number + 1);
    }, 3000);
  }

  return <div>
    <p>{number}</p>
    <button onClick={() => setNumber(number + 1)}>add +1</button>
    <button onClick={asyncAdd}>async +1</button>
    <button onClick={asyncAdd2}>async2 +1</button>
  </div>
}
ReactDOM.render(<Counter />, document.getElementById('root'));