/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-25 20:08:44
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

  componentWillMount(){
    console.log('Counter 2.componentWillMount 组件将要挂载')
  }

  componentDidMount(){
    console.log('Counter 4.componentDidMount 组件挂载完成')
  }

  handlerClick = () => {
    this.setState({num:this.state.num+1});
  }

  shouldComponentUpdate(nextProps,nextState){
    console.log('Counter 5.shouldComponentUpdate 询问组件是否需要更新？')
    return nextState.num%2===0;//num为2的倍数更是视图，状态一致会更新
  }

  componentWillUpdate(){
    console.log('Counter 6.componentWillUpdate 组件将要更新')
  }

  componentDidUpdate(){
    console.log('Counter 7.componentDidUpdate 组件更新完成')
  }

  render() {
    console.log('Counter 3.render 生成虚拟DOM')
    return (
      <div>
        <p>{this.props.name}:{this.state.num}</p>
        <button onClick={this.handlerClick}>加2</button>
      </div>
    )
  }
}
ReactDOM.render(<Counter name='张三' />, document.getElementById('root'));
