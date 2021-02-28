/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 07:22:45
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

class Counter extends React.Component {
  static defaultProps = {
    name: '计数器：'
  }

  constructor(props) {
    super(props)
    this.state = { num: 0 }
    console.log('Counter 1.constructor 属性，状态初始化')
  }

  componentWillMount() {
    console.log('Counter 2.componentWillMount 组件将要挂载')
  }

  componentDidMount() {
    console.log('Counter 4.componentDidMount 组件挂载完成')
  }

  handlerClick = () => {
    this.setState({ num: this.state.num + 1 });
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('Counter 5.shouldComponentUpdate 询问组件是否需要更新？',this.state.num,nextState)
    return nextState.num % 2 === 0;//num为2的倍数更是视图，状态一致会更新
  }

  componentWillUpdate() {
    console.log('Counter 6.componentWillUpdate 组件将要更新')
  }

  componentDidUpdate() {
    console.log('Counter 7.componentDidUpdate 组件更新完成')
  }

  render() {
    console.log('Counter 3.render 生成虚拟DOM')
    return (
      <div id={`id-${this.state.num}`}>
        <p>{this.props.name}:{this.state.num}</p>
        {this.state.num === 4 ? null : <ChildCounter num={this.state.num} />}
        <button onClick={this.handlerClick}>加2</button>
        <FunctionCounter num={this.state.num}/>
      </div>
    )
  }
}

class ChildCounter extends React.Component {
  constructor(props) {
    super(props);
    console.log('ChildCounter 1.constructor 属性，状态初始化')
  }
  componentWillMount() {
    console.log('ChildCounter 2.componentWillMount 组件将要挂载')
  }

  componentDidMount() {
    console.log('ChildCounter 4.componentDidMount 组件挂载完成')
  }

  componentWillReceiveProps(newProps) {//第一次不会执行，之后属性更新时会执行
    console.log('ChildCounter 5.componentWillReceiveProps 组件将要接收新的props')
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？')
    return nextProps.num % 3 === 0;//num为3的倍数更是视图，状态一致会更新
  }

  componentWillUpdate() {
    console.log('ChildCounter 7.componentWillUpdate 组件将要更新')
  }

  componentDidUpdate() {
    console.log('ChildCounter 8.componentDidUpdate 组件更新完成')
  }

  componentWillUnmount() {
    console.log('ChildCounter 9.componentWillUnmount 组件将被卸载')
  }

  render() {
    console.log('ChildCounter 3.render 生成虚拟DOM')
    return <div>{this.props.num}</div>
  }
}

function  FunctionCounter(props) {
  return <div>{props.num}</div>
}

ReactDOM.render(<Counter name='张三'/>, document.getElementById('root'));





