/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 14:16:06
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

const ADD = 'ADD';
const MINUS = 'MINUS';

/**
 * 和redux很像
 * @param {*} state 任意的状态
 * @param {*} action 动作
 */
function reducer(state = { num: 0 }, action) {
  switch (action.type) {
    case ADD:
      return { num: state.num + 1 }
    case MINUS:
      return { num: state.num - 1 }
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = React.useReducer(reducer, { num: 0 })
  return <div style={{margin:100}}>
    <p>Counter:{state.num}</p>
    <button onClick={() => dispatch({ type: ADD })}>+</button>
    <button onClick={() => dispatch({ type: MINUS })}>-</button>
  </div>
}

ReactDOM.render(<Counter />, document.getElementById('root'));