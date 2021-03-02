/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 18:15:55
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

function Animate() {
  const ref = React.useRef();
  const ref2 = React.useRef();
  React.useEffect(() => {
    ref.current.style.WebkitTransform = `translateX(500px)`;
    ref.current.style.transition = `all 1000ms`;
  })
  React.useLayoutEffect(() => {
    ref2.current.style.WebkitTransform = `translateX(500px)`;
    ref2.current.style.transition = `all 1000ms`;
  })

  const style = {
    marginTop:'60px',
    width: '100px',
    height: '100px',
    backgroundColor: 'red'
  }
  const style2 = {
    width: '100px',
    height: '100px',
    backgroundColor: 'green'
  }

  return <div >
    <div style={style} ref={ref}>useEffect渲染后执行</div>
    <div style={style2} ref={ref2}>useLayoutEffect渲染前执行</div>
  </div>
}
ReactDOM.render(<Animate />, document.getElementById('root'));

