/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-03 14:09:29
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

function App() {
  const [num, setNum] = React.useState(0);

  React.useEffect(() => {
    setTimeout(() => {
      console.log(num)
    }, 3000);
  })

  return <div>
    <p>{num}</p>
    <button onClick={()=>setNum(num+1)}>Add +1</button>
  </div>
}
ReactDOM.render(<App />, document.getElementById('root'));

