/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-03 16:54:06
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from 'react';
import ReactDOM from 'react-dom'

class Parent extends React.Component {
  state = { num: 0 }
  componentWillMount() {
    console.log('Parent-componentWillMount')
  }
  componentDidMount() {
    console.log('Parent-componentDidMount')
  }

  componentWillUpdate() {
    console.log('Parent-componentWillUpdate')
  }
  componentDidUpdate() {
    console.log('Parent-componentDidUpdate')
  }
  componentWillReceiveProps() {
    console.log('Parent-componentWillReceiveProps')
  }

  shouldComponentUpdate() {
    console.log('Parent-shouldComponentUpdate')
    return false
  }

  render() {
    console.log('Parent-render')
    return <div>
      Parent
      <button onClick={() => this.setState({ num: this.state.num + 1 })}>+1</button>
      <Child num={this.state.num} />
    </div>
  }
}

class Child extends React.Component {
  componentWillMount() {
    console.log('Child-componentWillMount')
  }
  componentDidMount() {
    console.log('Child-componentDidMount')
  }

  componentWillUpdate() {
    console.log('Child-componentWillUpdate')
  }
  componentDidUpdate() {
    console.log('Child-componentDidUpdate')
  }
  componentWillReceiveProps() {
    console.log('Child-componentWillReceiveProps')
  }

  shouldComponentUpdate() {
    console.log('Child-shouldComponentUpdate')
    return true
  }

  render() {
    console.log('Child-render')
    return <div>
      child-{this.props.num}
    </div>
  }
}

ReactDOM.render(<Parent />, document.getElementById('root'));
