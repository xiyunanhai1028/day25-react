/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 17:21:34
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';
/**
 * 高阶组件 有三中应用场景
 * 1.属性代理
 * 2.反向继承
 */
class Button extends React.Component {
  state = { name: '张三' }
  componentWillMount() {
    console.log('button componentWillMount');
  }

  componentDidMount() {
    console.log('button componentDidMount')
  }
  render() {
    return (<button name={this.state.name} title={this.props.title}></button>)
  }
}

const wrapper = Button => {
  return class extends Button {

    state = { number: 0 }

    componentWillMount() {
      console.log('WrapperButton componentWillMount');
    }

    componentDidMount() {
      console.log('WrapperButton componentDidMount');
    }

    handlerClick = () => {
      this.setState({ number: this.state.number + 1 });
    }

    render() {
      const renderElement = super.render();
      const newProps = {
        ...renderElement.props,
        ...this.state,
        onClick: this.handlerClick
      }
      return React.cloneElement(renderElement, newProps, this.state.number);
    }
  }
}

const WrapperButton = wrapper(Button)
ReactDOM.render(<WrapperButton title='标题' />, document.getElementById('root'));