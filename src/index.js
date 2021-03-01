/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 16:20:31
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from 'react';
import ReactDOM from 'react-dom';
/**
 * 高阶组件 有三中应用场景
 * 1.属性代理
 */
const widthLoading = msg => OldComponent => {
  return class extends React.Component {
    show = () => {
      const div = document.createElement('div')
      div.setAttribute('id', 'load');
      div.innerHTML = `
      <p style="position:absolute;top:50%;left:50%;z-index:10;background-color:gray">${msg}</p>
      `
      document.body.appendChild(div);
    }

    hide = () => {
      document.getElementById('load').remove();
    }
    render() {
      return <OldComponent show={this.show} hide={this.hide} />
    }
  }
}

@widthLoading('正在加载中...')
class Hello extends React.Component {
  render() {
    return <div>
      <p>hello</p>
      <button onClick={this.props.show}>显示</button>
      <button onClick={this.props.hide}>隐藏</button>
    </div>
  }
}
ReactDOM.render(<Hello />, document.getElementById('root'));