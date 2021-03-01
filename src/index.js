/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 08:22:34
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { num: 0 }
  }

  handlerClick = () => {
    this.setState({ num: this.state.num + 1 });
  }

  render() {
    return (
      <div id={`id-${this.state.num}`}>
        <p>{this.props.name}:{this.state.num}</p>
        <ChildCounter num={this.state.num} />
        <button onClick={this.handlerClick}>加2</button>
      </div>
    )
  }
}

class ChildCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 }
  }

  /**
   * componentWillReceiveProps
   * @param {*} nextProps 
   * @param {*} prevState 
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    const { num } = nextProps;
    if (num % 2 === 0) {//当为2的倍数时，更新状态
      return { number: num * 2 };
    } else if (num % 3 === 0) {//当为3的倍数时，更新状态
      return { number: num * 3 };
    } else {
      return null
    }
  }

  render() {
    return <div>{this.state.number}</div>
  }
}

ReactDOM.render(<Counter name='张三' />, document.getElementById('root'));





