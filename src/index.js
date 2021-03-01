/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 11:34:06
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

class Counter extends React.Component {
  ulRef = React.createRef();//{current:null}
  constructor(props) {
    super(props)
    this.state = { list: [] }
  }

  getSnapshotBeforeUpdate() {
    return this.ulRef.current.scrollHeight;
  }

  /**
   * 
   * @param {*} prevProps 老得props
   * @param {*} prevState 老得state
   * @param {*} scrollHeight getSnapshotBeforeUpdate传递的值
   */
  componentDidUpdate(prevProps, prevState, scrollHeight) {
    console.log('本次新增的高度:', this.ulRef.current.scrollHeight - scrollHeight)
  }

  handlerClick = () => {
    const list = this.state.list;
    list.push(list.length);
    this.setState({ list });
  }

  render() {
    return (
      <div id={`id-${this.state.num}`}>
        <button onClick={this.handlerClick}>+</button>
        <ul ref={this.ulRef}>
          {this.state.list.map((item, index) => <li key={index}>{index}</li>)}
        </ul>
      </div>
    )
  }
}


ReactDOM.render(<Counter name='张三' />, document.getElementById('root'));





