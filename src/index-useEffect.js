/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 17:18:24
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

function App() {
  const [num, setNum] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      console.log('开启定时器');
      setNum(num + 1);
    }, 1000);
    return () => {
      console.log('关闭定时器');
      clearInterval(timer);
    }
  })
  return <div>自动计数：{num}</div>
}

ReactDOM.render(<App />, document.getElementById('root'));