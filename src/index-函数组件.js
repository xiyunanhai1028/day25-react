/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-24 22:14:49
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';
/**
 * 1.组件名称必须以大写字母开头
 * 2.组件必须在使用前先定义
 * 3.组件的返回值只能有一个根元素
 */
function FunctionComponent(props){
  return (
    <div className='title' style={{background:'green',color:'red'}}>
      <span>{props.name}</span>
      {props.children}
    </div>
  )
}

ReactDOM.render(<FunctionComponent name='张三'>
  <spam>,你好</spam>
</FunctionComponent>, document.getElementById('root'));