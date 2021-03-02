/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 15:07:14
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from 'react';
import ReactDOM from 'react-dom';
const AppContext = React.createContext();
function App() {
  const [num, setNum] = React.useState(0);

  const addHander = () => setNum(num + 1);

  return <AppContext.Provider value={{ num, addHander }}>
    <Counter />
  </AppContext.Provider>
}

function Counter() {
  const { num, addHander } = React.useContext(AppContext)
  return <div style={{margin:100}}>
    <p>{num}</p>
    <button onClick={addHander}>+</button>
  </div>
}

ReactDOM.render(<App />, document.getElementById('root'));