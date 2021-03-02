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

#### 2.1.事例

```react
/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 08:25:09
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';
/**
 * 同步才是Hook的思维方式
 * 每次渲染都是一个独立的闭包
 */
function Counter() {
  const [number, setNumber] = React.useState(0);

  function asyncAdd() {
    setTimeout(() => {
      //这里的这个number是当时渲染出来这个函数时候的number，并不是最新的number
      setNumber(number + 1);
    }, 3000);
  }

  function asyncAdd2() {
    setTimeout(() => {
      //可以通过函数参数获取最新的number值
      setNumber(number => number + 1);
    }, 3000);
  }

  return <div>
    <p>{number}</p>
    <button onClick={() => setNumber(number + 1)}>add +1</button>
    <button onClick={asyncAdd}>async +1</button>
    <button onClick={asyncAdd2}>async2 +1</button>
  </div>
}
ReactDOM.render(<Counter />, document.getElementById('root'));
```

#### 2.2.实现

##### 2.2.1.`src/react.js`

```javascript
+ import {useState} from './react-dom';
+ const React={useState}
```

##### 2.2.2.`src/react-dom.js`

```javascript
+ //用来存放所有的hook状态，源码中每个组件有自己独立的hookstate，通过fiber实现的
+ let hookStates=[];
+ //用来标记当前的hook
+ let hookIndex=0;
+ //调度更新
+ let scheduleUpdate;

+ function render(vdom,container){
+		mount(vdom,container);
+		scheduleUpdate=()=>{
+			//状态修改后，调度更新时，索引修改为0
+			hookIndex=0;
+			compareTwoVdom(container,vdom,vdom);  
+   }	  
+ }

+ function mount(vdom, container) {
+   const dom = createDOM(vdom);
    //挂载真实DOM
+   container.appendChild(dom);
+   //调用生命周期方法componentDidMount
+   dom.componentDidMount && dom.componentDidMount();
+ }

/**
 * 让函数组件可以使用状态
 * @param {*} initialValue 初始状态
 */
+ export function useState(initialValue) {
+   //把老得值取出来，如果没有，去默认值
+   hookStates[hookIndex] = hookStates[hookIndex] || (typeof initialValue === 'function' ? initialValue() : initialValue);
+   let currentIndex = hookIndex;//闭包记录每个setState的位置
+   function setState(newState) {
+       if (typeof newState === 'function') {//函数
+           newState = newState(hookStates[currentIndex]);
+       }
+       hookStates[currentIndex] = newState;
+       scheduleUpdate();//状态改变后需要重新更新应用
+   }
+   return [hookStates[hookIndex++], setState]
+ }
```

### 3.useCallback&useMemo

- 把内联回调函数及依赖项数组作为参数传入`useCallback`，它将返回该回调函数的`memoized`版本，该回调函数仅在某个依赖项改变时才会更新
- 把创建函数和依赖项数组作为参数传入`useMemo`，它仅会在某个依赖项改变时才重新计算`memoized`值，这个优化有助于避免在每次渲染时都会进行高开销的计算

#### 3.1.事例1

> 在不管是输入框输入数据，还是点击按钮添加的时候，都会触发父子组件render

![没使用useMemo](/Users/dufeihu/Documents/html/zhufeng/复习/day25-react/没使用useMemo.gif)

```react
/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 09:20:02
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from 'react';
import ReactDOM from 'react-dom';

function Counter({ data, addHander }) {
  console.log('render Counter')
  return <div>
    <p>{data.number}</p>
    <button onClick={addHander}>add +1</button>
  </div>
}
function App() {
  const [name, setName] = React.useState('张三');
  const [num, setNum] = React.useState(5);

  const data = { number: num };
  const addHander = () => setNum(num + 1);

  console.log('render App')
  return <div>
    <input type="text" value={name} onChange={event => setName(event.target.value)} />
    <Counter data={data} addHander={addHander} />
  </div>
}
ReactDOM.render(<App />, document.getElementById('root'));
```

#### 3.2.事例2

> 当在输入框内输入内容时，子组件并没有刷新，只有在点击的时候父子组件才刷新

![使用useMemo](/Users/dufeihu/Documents/html/zhufeng/复习/day25-react/使用useMemo.gif)

```react
/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 09:33:49
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from 'react';
import ReactDOM from 'react-dom';

function Counter({ data, addHander }) {
  console.log('render Counter')
  return <div>
    <p>{data.number}</p>
    <button onClick={addHander}>add +1</button>
  </div>
}
const MemoCounter = React.memo(Counter);

function App() {
  const [name, setName] = React.useState('张三');
  const [num, setNum] = React.useState(5);

  const data = React.useMemo(() => ({ number: num }), [num]);
  const addHander = React.useCallback(() => setNum(num + 1), [num]);

  console.log('render App')
  return <div>
    <input type="text" value={name} onChange={event => setName(event.target.value)} />
    <MemoCounter data={data} addHander={addHander} />
  </div>
}
ReactDOM.render(<App />, document.getElementById('root'));
```

#### 3.3.实现



