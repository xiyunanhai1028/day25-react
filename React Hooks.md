<!--
 * @Author: dfh
 * @Date: 2021-03-02 06:50:47
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 06:50:47
 * @Modified By: dfh
 * @FilePath: /day25-react/React Hooks.md
-->

## React Hooks

> Hook是React16.8的新特性，他可以让我们在不编写class的情况下使用state以及其他的React特性

### 1.注意事项

- 只能在函数最外层调用Hook，不要在循环，条件判断或者子函数中调用
- 只能在React的函数组件中调用Hook，不要在其他JS函数中调用

### 2.`useState`

- `useState`就是一个Hook
- 通过在函数组件里调用它来给组件添加一些内部state ,React在重复渲染时保留这个state
- `useState`会返回一对值：当前状态和一个让你更新它的函数，可以在事件处理函数中或其他一些地方调用这个函数。但是它不会把新的state和旧的state进行合并

```javascript
const [state,setState]=useState(initialState);
```

#### 2.1.事例1

```react
/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 08:05:08
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

function Counter() {
  const [number, setNumber] = React.useState(0);

  /**
   * 异步时，会拿老得状态
   */
  function asyncAdd() {
    setTimeout(() => {
      setNumber(number + 1);
    }, 3000);
  }
  return <div>
    <p>{number}</p>
    <button onClick={() => setNumber(number + 1)}>add +1</button>
    <button onClick={asyncAdd}>async +1</button>
  </div>
}
ReactDOM.render(<Counter />, document.getElementById('root'));
```

#### 2.2.实现

##### 2.2.1.`src/react`

```javascript

```

