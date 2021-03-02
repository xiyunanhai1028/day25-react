/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 13:45:27
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

function Counter({ data, addHander }) {
  console.log('render Counter')
  return <div>
    <p>{data.number}</p>
    <button onClick={addHander}>add +1</button>
  </div>
}
const MemoCounter = React.memo(Counter);

function App() {
  const [name, setName] = React.useState('张三');
  const [num, setNum] = React.useState(5);

  const data = React.useMemo(() => ({ number: num }), [num]);
  const addHander = React.useCallback(() => setNum(num + 1), [num]);

  console.log('render App')
  return <div>
    <input type="text" value={name} onChange={event => setName(event.target.value)} />
    <MemoCounter data={data} addHander={addHander} />
  </div>
}
ReactDOM.render(<App />, document.getElementById('root'));