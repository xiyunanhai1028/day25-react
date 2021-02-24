/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-24 20:00:30
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

let element = (
    <div id='title' style={{ color: 'red', background: 'green' }}>
        <span>hello</span>
        world
    </div>
)

let element2=React.createElement("div", {
    id: "title",
    style: {
      color: 'red',
      background: 'green'
    }
  }, React.createElement("span", null, "hello"), "world");
console.log(JSON.stringify(element2,null,4))  

ReactDOM.render(element, document.getElementById('root'));