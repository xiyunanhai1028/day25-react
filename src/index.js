/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 21:48:26
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

class Counter extends React.Component {
  state = { num1: 0, num2: 0 }

  addNum1 = () => {
    this.setState({ num1: this.state.num1 + 1 })
  }

  addNum2 = () => {
    this.setState({ num2: this.state.num2 + 1 })
  }

  render() {
    console.log('render Counter')
    return <div>
      <Number1 num={this.state.num1} />
      <Number2 num={this.state.num2} />
      <button onClick={this.addNum1}>Number1</button>
      <button onClick={this.addNum2}>Number2</button>
    </div>
  }
}

class Number1 extends React.PureComponent {
  render() {
    console.log('render Number1')
    return <div>
      Number1:{this.props.num}
    </div>
  }
}

class Number2 extends React.PureComponent {
  render() {
    console.log('render Number2')
    return <div>
      Number2:{this.props.num}
    </div>
  }
}
ReactDOM.render(<Counter />, document.getElementById('root'));