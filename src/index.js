/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 22:40:28
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

function Counter(props, ref) {
  const inputRef = React.useRef();
  //暴露只想让外界操作的方法
  React.useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current.focus();
    }
  }))
  return <input type="text" ref={inputRef} />
}

const WrapperCounter = React.forwardRef(Counter);
function App() {
  const ref = React.useRef();

  const getFocus = () => {
    //暴露的方法
    ref.current.focus();
  }

  const removeInput = () => {
    //为暴露的方法
    ref.current.remove();
  }

  return <div>
    <WrapperCounter ref={ref} />
    <button onClick={getFocus}>获取焦点</button>
    <button onClick={removeInput}>操作为暴露的方法</button>
  </div>
}
ReactDOM.render(<App />, document.getElementById('root'));

