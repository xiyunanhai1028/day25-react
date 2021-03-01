/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-25 15:47:10
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';
/**
 * 类组件合成事件和批量更新
 * 1.在react里，事件的更新可能是异步，批量，不同步的
 *  1.1.调用setState之后状态并没有立刻更新，而是先缓存起来
 *  1.2.等事件函数处理完成在进行批量更新，一次更新并重新渲染
 * 
 * 2.jsx事件处理函数是react控制的，只有归react控制就是批量，只要不归react管就不是批量
 */

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { num: 0 }
  }

  handlerClick = () => {
    //批量更新
    this.setState(oldState=>({num:oldState.num+1}),()=>{
      console.log('log1--',this.state.num)
    })
    console.log('log2--',this.state.num);

    this.setState(oldState=>({num:oldState.num+1}),()=>{
      console.log('log3--',this.state.num)
    })
    console.log('log4--',this.state.num);

    //已经不归react管
    Promise.resolve().then(() => {
      console.log('log5--',this.state.num);

      this.setState(oldState=>({num:oldState.num+1}),()=>{
        console.log('log6--',this.state.num)
      })
      console.log('log7--',this.state.num);

      this.setState(oldState=>({num:oldState.num+1}),()=>{
        console.log('log8--',this.state.num)
      })
      console.log('log9--',this.state.num);

    })
    // //批量更新
    // this.setState({ num: this.state.num + 1 });
    // console.log(this.state.num);

    // this.setState({ num: this.state.num + 1 });
    // console.log(this.state.num);

    // //已经不归react管
    // Promise.resolve().then(() => {
    //   console.log(this.state.num);

    //   this.setState({ num: this.state.num + 1 });
    //   console.log(this.state.num);

    //   this.setState({ num: this.state.num + 1 });
    //   console.log(this.state.num);

    // })

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