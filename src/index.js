/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-24 23:37:02
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';
/**
 * 类组件
 * props，是父组件给的，不能改变，只读的
 * state,状态对象
 */

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { num: 0 }
  }

  handlerClick = () => {
    this.setState({ num: this.state.num + 2 });
  }

  render() {
    return (
      <div>
        <p>{this.props.name}:{this.state.num}</p>
        <button onClick={this.handlerClick}>加2</button>
      </div>
    )
  }
}
ReactDOM.render(<Counter name='张三' />, document.getElementById('root'));