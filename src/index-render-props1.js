/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 19:22:42
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index-render-props1.js
 */
import React from 'react';
import ReactDOM from 'react-dom';

class MouseTracker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { x: 0, y: 0 };
  }

  handeMouseMove = event => {
    this.setState({
      x: event.clientX,
      y: event.clientY
    })
  }

  render() {
    return <div onMouseMove={this.handeMouseMove}>
      {this.props.render(this.state)}
    </div>
  }
}
ReactDOM.render(<MouseTracker render={props => <>
  <h1>移动鼠标</h1>
  <p>当前的鼠标位置是：({props.x},{props.y})</p>
</>} />, document.getElementById('root'));