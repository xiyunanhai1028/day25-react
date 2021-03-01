/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 13:41:47
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';
const PersonContext = React.createContext();
function getStyle(color) {
  return {
    border: `5px solid ${color}`,
    padding: '5px',
    marigin: '5px'
  }
}
class Person extends React.Component {
  state = {
    color: 'red'
  }

  changeColor = (color) => this.setState({ color })

  render() {
    const value = { color: this.state.color, changeColor: this.changeColor }
    return <PersonContext.Provider value={value}>
      <div style={{ ...getStyle(this.state.color), width: '200px' }}>
        Person
      <Head />
        <Body />
      </div>
    </PersonContext.Provider>
  }
}

class Head extends React.Component {
  static contextType = PersonContext;

  render() {
    return (
      <div style={getStyle(this.context.color)}>
        Head
        <Eye />
      </div>
    )
  }
}

class Body extends React.Component {
  static contextType = PersonContext;

  render() {
    return (
      <div style={getStyle(this.context.color)}>
        Body
        <Hand />
      </div>
    )
  }
}

class Hand extends React.Component {
  static contextType = PersonContext;

  render() {
    return (
      <div style={getStyle(this.context.color)}>
        Hand
        <button onClick={() => this.context.changeColor('red')}>变红</button>
        <button onClick={() => this.context.changeColor('green')}>变绿</button>
      </div>
    )
  }
}

function Eye() {
  return <PersonContext.Consumer>
    {content => <div style={getStyle(content.color)}>Eye</div>}
  </PersonContext.Consumer>
}

ReactDOM.render(<Person />, document.getElementById('root'));