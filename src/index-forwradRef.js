/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 22:24:15
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

function Counter(props, ref) {
  return <input type="text" ref={ref} />
}

const WrapperCounter = React.forwardRef(Counter);
function App() {
  const ref = React.useRef();

  const getFocus = () => {
    ref.current.focus();
  }
  
  return <div>
    <WrapperCounter ref={ref} />
    <button onClick={getFocus}>获取焦点</button>
  </div>
}
ReactDOM.render(<App />, document.getElementById('root'));

