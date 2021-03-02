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

##### 3.3.1.`src/react.js`

```javascript
import { useState, useCallback, useMemo } from './react-dom';

/**
 * 函数组件实现优化
 * @param {*} FunctionComponent 函数组件
 */
function memo(FunctionComponent) {
    return class extends PureComponent {
        render() {
            return FunctionComponent(this.props);
        }
    }
}

const React = {
    useCallback,
    useMemo,
    memo
}
```

##### 3.3.2.`src/react-dom.js`

```javascript
export function useMemo(factory, deps) {
    if (hookStates[hookIndex]) {//有数据时进入
        const [lastMemo, lastDeps] = hookStates[hookIndex];//获取上一次存储的数据和依赖
        //将新的依赖和老得依赖一一对比
        const same = deps.every((item, index) => item === lastDeps[index]);
        if (same) {//如果一样
            hookIndex++;
            return lastMemo;//返回老得数据
        } else {//如果不一样
            let newMemo = factory();//执行工厂方法获取新的数据
            hookStates[hookIndex++] = [newMemo, deps];//将新的依赖和数据存储起来
            return newMemo;//返回新的数据
        }

    } else {//第一次走这里
        const newMemo = factory();//获取工厂数据
        hookStates[hookIndex++] = [newMemo, deps];//将数据和依赖存起来
        return newMemo;//返回工厂数据
    }
}

export function useCallback(callback, deps) {
    if (hookStates[hookIndex]) {//已经存储过来
        const [lastCallback, lastDeps] = hookStates[hookIndex];//获取老得回调和依赖
        //将新的依赖和老得依赖一一对比
        const same = deps.every((item, index) => item === lastDeps[index]);
        if (same) {//如果一样
            hookIndex++;
            return lastCallback//返回老得回调
        } else {//如果不一样
            hookStates[hookIndex++] = [callback, deps];//将新的回调和依赖存储起来
            return callback;//返回新的依赖
        }
    } else {//第一次进入
        hookStates[hookIndex++] = [callback, deps];//将回调和依赖存储起来
        return callback;//返回回到
    }
}
```

### 4.useReducer

- useState的替代方案，它接收一个形如`(state action)=>newState`的`reducer`,并返回当前的state以及与其配套的`disaptch`方法
- 在某些场景下，`useReducer`会比`useState`更实用，例如state逻辑过于复杂

#### 4.1.事例

![useReducer](/Users/dufeihu/Documents/html/zhufeng/复习/day25-react/useReducer.gif)

```react
/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 14:14:32
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from 'react';
import ReactDOM from 'react-dom';

const ADD = 'ADD';
const MINUS = 'MINUS';

/**
 * 和redux很像
 * @param {*} state 任意的状态
 * @param {*} action 动作
 */
function reducer(state = { num: 0 }, action) {
  switch (action.type) {
    case ADD:
      return { num: state.num + 1 }
    case MINUS:
      return { num: state.num - 1 }
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = React.useReducer(reducer, { num: 0 })
  return <div style={{margin:100}}>
    <p>Counter:{state.num}</p>
    <button onClick={() => dispatch({ type: ADD })}>+</button>
    <button onClick={() => dispatch({ type: MINUS })}>-</button>
  </div>
}

ReactDOM.render(<Counter />, document.getElementById('root'));
```

#### 4.2.实现

##### 4.2.1.`src/react.js`

```javascript
import { useState, useCallback, useMemo,useReducer } from './react-dom';

const React = {
    useReducer
}
```

##### 4.2.2.`src/react-dom.js`

```javascript
/**
 * 让函数组件可以使用状态
 * @param {*} initialValue 初始状态
 */
export function useState(initialValue) {
    return useReducer(null, initialValue);
}

export function useReducer(reducer, initialValue) {
    //把老得值取出来，如果没有，取默认值
    hookStates[hookIndex] = hookStates[hookIndex] || (typeof initialValue === 'function' ? initialValue() : initialValue);
    let currentIndex = hookIndex;//闭包记录每次setState的位置
    function dispatch(action) {
        const oldState = hookStates[currentIndex];
        let newState;
        if (typeof action === 'function') {//setState里面是一个函数
            newState = action(oldState)
        }
        if (reducer) {//useReducer的情况
            newState = reducer(oldState, action);
        } else {//setState情况
            newState = action;
        }
        if (oldState !== newState) {
            hookStates[currentIndex] = newState;
            scheduleUpdate();
        }
    }
    return [hookStates[hookIndex++], dispatch];
}
```

### 5.useContext

- 接收一个context对象，并返回该context的当前值
- 当前的context值由上层组件中距离当前组件最近的Provider的value决定
- 当组件上最近的Provider更新时，该Hook会触发重渲染并使用最新传递给Provider的value值

#### 5.1.事例

```react
/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 15:52:12
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';
const AppContext = React.createContext();
function App() {
  const [num, setNum] = React.useState(0);

  const addHander = () => setNum(num + 1);

  return <AppContext.Provider value={{ num, addHander }}>
    <Counter />
  </AppContext.Provider>
}

function Counter() {
  const { num, addHander } = React.useContext(AppContext)
  return <div style={{ margin: 500 }}>
    <p>{num}</p>
    <button onClick={addHander}>+</button>
  </div>
}

ReactDOM.render(<App />, document.getElementById('root'));
```

#### 5.2.实现

##### 5.2.1.`src/react.js`

```javascript
import { useState, useCallback, useMemo, useReducer,useContext } from './react-dom';

function createContext(initialValue) {
    const context = { Provider, Consumer };
    function Provider(props) {
        context._currentValue = context._currentValue || initialValue;
        if(context._currentValue){
            Object.assign(context._currentValue, props.value);
        }else{
            context._currentValue=props.value
        }
        return props.children;
    }
    function Consumer(props) {
        return props.children(context._currentValue)
    }
    return context;
}

const React = {
    useContext
}
```

##### 5.2.2.`src/react-dom.js`

```javascript
function mountClassComponent(vdom) {
    if (Clazz.contextType) {
+       classInstance.context = Clazz.contextType._currentValue;
    }
}

export function useContext(context){
    return context._currentValue;
}
```

### 6.useEffect

- 在函数组件主体内（这里指在 React 渲染阶段）改变 DOM、添加订阅、设置定时器、记录日志以及执行其他包含副作用的操作都是不被允许的，因为这可能会产生莫名其妙的 bug 并破坏 UI 的一致性
- 使用 useEffect 完成副作用操作。赋值给 useEffect 的函数会在组件渲染到屏幕之后执行。你可以把 effect 看作从 React 的纯函数式世界通往命令式世界的逃生通道
- useEffect 就是一个 Effect Hook，给函数组件增加了操作副作用的能力。它跟 class 组件中的 `componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount` 具有相同的用途，只不过被合并成了一个 API
- 该 Hook 接收一个包含命令式、且可能有副作用代码的函数

#### 6.1.事例

```react
import React from 'react';
import ReactDOM from 'react-dom';

function App() {
  const [num, setNum] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      console.log('开启定时器');
      setNum(num + 1);
    }, 1000);
    return () => {
      console.log('关闭定时器');
      clearInterval(timer);
    }
  })
  return <div>自动计数：{num}</div>
}

ReactDOM.render(<App />, document.getElementById('root'));
```

#### 6.2.实现

![useEffect](/Users/dufeihu/Documents/html/zhufeng/复习/day25-react/useEffect.gif)

##### 6.2.1.`src/react.js`

```javascript
import { useState, useCallback, useMemo, useReducer,useContext,useEffect } from './react-dom';

const React = {
    useEffect
}
```

##### 6.2.2.`src/react-dom.js`

```javascript
/**
 * 为了保证回调函数不是同步执行，而是在页面渲染后执行，需要把回调放入红任务队列
 * @param {*} callback 回调函数，页面渲染完成后执行
 * @param {*} deps 依赖数组
 */
export function useEffect(callback, deps) {
    if (hookStates[hookIndex]) {
        const [oldDestroyFunction, oldDeps] = hookStates[hookIndex];
        const same = deps && deps.every((item, index) => item === oldDeps[index]);
        if (same) {//老得依赖和新的依赖一样
            hookIndex++;
        } else {
            oldDestroyFunction && oldDestroyFunction();
            setTimeout(() => {//把回调放入红任务队列中
                const destroyFunction = callback();
                hookStates[hookIndex++] = [destroyFunction, deps]
            });
        }
    } else {//第一次执行
        setTimeout(() => {//把回调放入红任务队列中
            const destroyFunction = callback();
            hookStates[hookIndex++] = [destroyFunction, deps]
        });
    }
}
```

### 7.useLayoutEffect&useRef

#### 7.1.实现

##### 7.1.1.`src/react.js`

```javascript
import { useState, useCallback, useMemo, useReducer,useContext,useEffect,useLayoutEffect,useRef } from './react-dom';

const React = {
    useLayoutEffect,
    useRef
}
```

##### 7.1.2.`src/react-dom.js`

```javascript
export function useLayoutEffect(callback, deps) {
    if (hookStates[hookIndex]) {
        const [oldDestroyFunction, oldDeps]= hookStates[hookIndex];
        const same = deps && deps.every((item, index) => item === oldDeps[index]);
        if (same) {
            hookIndex++;
        } else {
          	oldDestroyFunction && oldDestroyFunction();//销毁上一次的
            queueMicrotask(() => {//把回调放入微任务队列中
                const destroyFunction = callback();
                hookStates[hookIndex++] = [destroyFunction, deps]
            })
        }
    } else {
        queueMicrotask(() => {//把回调放入微任务队列中
            const destroyFunction = callback();
            hookStates[hookIndex++] = [destroyFunction, deps]
        })
    }
}

export function useRef(initialValue) {
    hookStates[hookIndex] = hookStates[hookIndex] || { current: initialValue };
    return hookStates[hookIndex++]
}
```

### 8.useEffect和useLayoutEffect

- useEffect和useLayoutEffect的区别？

> useEffect中的回调被放在了红任务中，useLayoutEffect的回调被放到了微任务中，浏览器的事情环`主站任务`->`清空微任务队列`->`GUI渲染`->`取出一个红任务执行`，这样看来，useLayoutEffect的回调调用时机是在页面渲染前执行的，而useEffect的回调调用时机是在页面渲染完成后



```react
/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 18:15:55
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

function Animate() {
  const ref = React.useRef();
  const ref2 = React.useRef();
  React.useEffect(() => {
    ref.current.style.WebkitTransform = `translateX(500px)`;
    ref.current.style.transition = `all 1000ms`;
  })
  React.useLayoutEffect(() => {
    ref2.current.style.WebkitTransform = `translateX(500px)`;
    ref2.current.style.transition = `all 1000ms`;
  })

  const style = {
    marginTop:'60px',
    width: '100px',
    height: '100px',
    backgroundColor: 'red'
  }
  const style2 = {
    width: '100px',
    height: '100px',
    backgroundColor: 'green'
  }

  return <div >
    <div style={style} ref={ref}>useEffect渲染后执行</div>
    <div style={style2} ref={ref2}>useLayoutEffect渲染前执行</div>
  </div>
}
ReactDOM.render(<Animate />, document.getElementById('root'));
```

### 9.forwardRef

- 将ref从父组件中转发到子组件中的DOM元素上
- 子组件接受props和ref作为参数

#### 9.1.事例

> 点击按钮时，输入框获取焦点

![forwardRef](/Users/dufeihu/Documents/html/zhufeng/复习/day25-react/forwardRef.gif)

```react
import React from 'react';
import ReactDOM from 'react-dom';

function Counter(props, ref) {
  return <input type="text" ref={ref} />
}

const WrapperCounter = React.forwardRef(Counter);

function App() {
  const ref = React.useRef();

  const getFocus = () => {
    ref.current.focus();
  }
  
  return <div>
    <WrapperCounter ref={ref} />
    <button onClick={getFocus}>获取焦点</button>
  </div>
}
ReactDOM.render(<App />, document.getElementById('root'));
```

#### 9.2.实现

##### 9.2.1.`src/react-dom.js`

```javascript
function mountClassComponent(vdom) {
+   const { type: Clazz, props, ref } = vdom;
    //获取类的实例
+   const classInstance = new Clazz(props);
    
+   if (ref) {//如果虚拟DOM上有ref，那么将ref赋值到事例上
+       classInstance.ref = ref;
+   }
}  
```

##### 9.2.2.`src/react.js`

```javascript
/**
 * 函数组件给子组件传递ref
 * @param {*} FunctionComponent 函数组件
 */
function forwardRef(FunctionComponent) {
    return class extends Component {
        render() {
            return FunctionComponent(this.props, this.ref)
        }
    }
}

const React = {
    forwardRef
}
```

### 10.useImperativeHandle

- `useImperativeHandle`可以让在使用`ref`时自定义暴露给父组件的实例值

#### 10.1.事例

![useImperativeHandle](/Users/dufeihu/Documents/html/zhufeng/复习/day25-react/useImperativeHandle.gif)

```react
import React from 'react';
import ReactDOM from 'react-dom';

function Counter(props, ref) {
  const inputRef = React.useRef();
  //暴露只想让外界操作的方法
  React.useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current.focus();
    }
  }))
  return <input type="text" ref={inputRef} />
}

const WrapperCounter = React.forwardRef(Counter);
function App() {
  const ref = React.useRef();

  const getFocus = () => {
    //暴露的方法
    ref.current.focus();
  }

  const removeInput = () => {
    //为暴露的方法
    ref.current.remove();
  }

  return <div>
    <WrapperCounter ref={ref} />
    <button onClick={getFocus}>获取焦点</button>
    <button onClick={removeInput}>操作为暴露的方法</button>
  </div>
}
ReactDOM.render(<App />, document.getElementById('root'));
```

#### 10.2.实现





