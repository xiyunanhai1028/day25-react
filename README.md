<!--
 * @Author: dfh
 * @Date: 2021-02-24 18:16:54
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-24 23:23:17
 * @Modified By: dfh
 * @FilePath: /day25-react/README.md
-->

## react源码分析

### 1. JSX转化过程

> JSX代码经过babel转化成React.createElement，createElement执行后转化为了虚拟DOM，再经过render函数将虚拟DOM变为真实DOM，挂载到容器上

#### 1.1. 实例代码

``` react
import React from './react';
import ReactDOM from './react-dom';

let element = (
    <div id='title' style={{ color: 'red', background: 'green' }}>
        <span>hello</span>
        world
    </div>
)
ReactDOM.render(element, document.getElementById('root'));
```

#### 1.2.babel转化

> element经过babel转化后

``` js
React.createElement("div", {
    id: "title",
    style: {
        color: 'red',
        background: 'green'
    }
}, React.createElement("span", null, "hello"), "world");
```

#### 1.3.createElement

> React.createElement执行后成为了虚拟DOM, 虚拟DOM实质是一个用来描述虚拟DOM对象

``` js
{
    "type": "div",
    "props": {
        "id": "title",
        "style": {
            "color": "red",
            "background": "green"
        },
        "children": [{
                "type": "span",
                "props": {
                    "children": "hello"
                },
            },
            "world"
        ]
    },
}
```

### 2. 实现原生组件的渲染

``` tree
src
├── index.js
├── react-dom.js
└── react.js
```

#### 2.1 `src/index.js`

``` js
import React from './react';
import ReactDOM from './react-dom';

let element = React.createElement("div", {
    id: "title",
    style: {
        color: 'red',
        background: 'green'
    }
}, React.createElement("span", null, "hello"), "world");

ReactDOM.render(element, document.getElementById('root'));
```

#### 2.2 `src/react`

``` js
/**
 * 
 * @param {*} type 元素类型
 * @param {*} config 配置对象
 * @param {*} children 孩子或者孩子门
 */
function createElement(type, config, children) {
    if (config) {
        delete config._source;
        delete config._self;
    }
    let props = {
        ...config
    };

    if (arguments.length > 3) { //children是一个数组
        children = Array.prototype.slice.call(arguments, 2);
    }
    props.children = children;
    return {
        type,
        props
    }
}

const React = {
    createElement
}
export default React;
```

#### 2.3 `src/react-dom`

``` js
/**
 * 给跟容器挂载的时候
 * @param {*} vdom 需要渲染的虚拟DOM
 * @param {*} container 容器
 */
function render(vdom, container) {
    const dom = createDOM(vdom);
    //挂载真实DOM
    container.appendChild(dom);
}

/**
 * 创建证实DOM
 * @param {*} vdom 虚拟DOM
 */
function createDOM(vdom) {
    if (typeof vdom === 'string' || typeof vdom === 'number') { //vdom是字符串或者数组
        return document.createTextNode(vdom);
    }
    const {
        type,
        props
    } = vdom;
    //创建真实DOM
    const dom = document.createElement(type);
    //使用虚拟DOM的属性更新刚创建出来的真实DOM的属性
    updateProps(dom, props);
    //儿子是一个文本
    if (typeof props.children === 'string' || typeof props.children === 'number') {
        dom.textContent = props.children
    } else if (typeof props.children === 'object' && props.children.type) { //只有一个儿子，并且是虚拟DOM
        render(props.children, dom); //把儿子挂载的自己身上
    } else if (Array.isArray(props.children)) { //有多个儿子
        reconcileChildren(props.children, dom);
    } else {
        document.textContent = props.children ? props.children.toString() : ''
    }
    return dom;
}

/**
 * 
 * @param {*} childrenVdom 孩子门的虚拟DOM
 * @param {*} parentDOM 要挂载到的真实DOM
 */
function reconcileChildren(childrenVdom, parentDOM) {
    for (let i = 0; i < childrenVdom.length; i++) {
        const child = childrenVdom[i];
        render(child, parentDOM); //把儿子挂载的自己身上
    }
}
/**
 * 使用虚拟DOM的属性更新刚创建出来的真实DOM的属性
 * @param {*} dom 真实DOM
 * @param {*} props 虚拟DOM属性
 */
function updateProps(dom, props) {
    for (const key in props) {
        if (key === 'children') continue; //单独处理，不再此处处理
        if (key === 'style') {
            const styleObj = props.style;
            for (const attr in styleObj) {
                dom.style[attr] = styleObj[attr];
            }
        } else { //在JS中定义class使用的是className，所以不要改
            dom[key] = props[key];
        }
    }
}

const ReactDOM = {
    render
}

export default ReactDOM;
```

### 3. 函数组件实现

#### 3.1 `src/index.js`

``` js
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
```

#### 3.2. 经过babel转译

```react
function FunctionComponent(props) {
  return React.createElement("div", {
    className: "title",
    style: {
      background: 'green',
      color: 'red'
    }
  }, React.createElement("span", null, props.name), props.children);
}

ReactDOM.render( React.createElement(FunctionComponent, {
  name: "\u5F20\u4E09"
}, React.createElement("spam", null, ",\u4F60\u597D")), document.getElementById('root'));
```

#### 3.3. `react-dom` 修改

```js
/*
 * @Author: dfh
 * @Date: 2021-02-24 18:34:32
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-24 23:01:02
 * @Modified By: dfh
 * @FilePath: /day25-react/src/react-dom.js
 */

/**
 * 给跟容器挂载的时候
 * @param {*} vdom 需要渲染的虚拟DOM
 * @param {*} container 容器
 */
function render(vdom, container) {
    const dom = createDOM(vdom);
    //挂载真实DOM
    container.appendChild(dom);
}

/**
 * 创建证实DOM
 * @param {*} vdom 虚拟DOM
 */
function createDOM(vdom) {
    if (typeof vdom === 'string' || typeof vdom === 'number') {//vdom是字符串或者数组
        return document.createTextNode(vdom);
    }
    const { 
        type, 
        props } = vdom;
    //创建真实DOM
    let dom;
+    if (typeof type === 'function') {//自定义函数组件
+        return mountFunctionComponent(vdom);
+    } else {//原生组件
+        dom = document.createElement(type);
+    }
    //使用虚拟DOM的属性更新刚创建出来的真实DOM的属性
    updateProps(dom, props);
    //儿子是一个文本
    if (typeof props.children === 'string' || typeof props.children === 'number') {
        dom.textContent = props.children
    } else if (typeof props.children === 'object' && props.children.type) {//只有一个儿子，并且是虚拟DOM
        render(props.children, dom);//把儿子挂载的自己身上
    } else if (Array.isArray(props.children)) {//有多个儿子
        reconcileChildren(props.children, dom);
    } else {
        document.textContent = props.children ? props.children.toString() : ''
    }
    return dom;
}

/**
 * 把一个类型为自定义函数组件的虚拟DOM转换为一个真实DOM并返回
 * @param {*} vdom 类型为自定义函数组件的虚拟DOM
 */
+ function mountFunctionComponent(vdom) {
+    const { type: FunctionComponent, props } = vdom;
+    const renderVdom = FunctionComponent(props);
+    return createDOM(renderVdom);
+ }

/**
 * 
 * @param {*} childrenVdom 孩子门的虚拟DOM
 * @param {*} parentDOM 要挂载到的真实DOM
 */
function reconcileChildren(childrenVdom, parentDOM) {
    for (let i = 0; i < childrenVdom.length; i++) {
        const child = childrenVdom[i];
        render(child, parentDOM);//把儿子挂载的自己身上
    }
}
/**
 * 使用虚拟DOM的属性更新刚创建出来的真实DOM的属性
 * @param {*} dom 真实DOM
 * @param {*} props 虚拟DOM属性
 */
function updateProps(dom, props) {
    for (const key in props) {
        if (key === 'children') continue;//单独处理，不再此处处理
        if (key === 'style') {
            const styleObj = props.style;
            for (const attr in styleObj) {
                dom.style[attr] = styleObj[attr];
            }
        } else {//在JS中定义class使用的是className，所以不要改
            dom[key] = props[key];
        }
    }
}

const ReactDOM = {
    render
}

export default ReactDOM;
```

### 4.类组件实现

```tree
src
├── Component.js
├── index.js
├── react-dom.js
└── react.js
```

#### 4.1.`index.js`

```javascript
import React from './react';
import ReactDOM from './react-dom';
/**
 * 类组件
 * props，是父组件给的，不能改变，只读的
 * state,状态对象
 */

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { num: 0 }
  }

  handlerClick = () => {
    this.setState({ num: this.state.num + 2 });
  }

  render() {
    return (
      <div>
        <p>{this.props.name}:{this.state.num}</p>
        <button onClick={this.handlerClick}>加2</button>
      </div>
    )
  }
}
ReactDOM.render(<Counter name='张三' />, document.getElementById('root'));
```

#### 4.2.`Component.js`

```javascript
import { createDOM } from './react-dom'
class Component {
    //用来判断是类组件
    static isReactComponent = true;
    constructor(props) {
        this.props = props;
        this.state = {};
    }

    setState(partialState) {
        const { state } = this;
        this.state = { ...state, ...partialState };
        const newVdom = this.render();
        updateClassComponent(this, newVdom);
    }
}

/**
 * 用新的真实dom替换老得真实DOM
 * @param {*} classInstance 类组件实例
 * @param {*} newVdom 新的虚拟DOM
 */
function updateClassComponent(classInstance, newVdom) {
    const newDOM = createDOM(newVdom);
    const oldDOM = classInstance.dom;
    oldDOM.parentNode.replaceChild(newDOM, oldDOM);
    classInstance.dom = newDOM;
}
export default Component;
```

#### 4.3.`react.js`

```javascript
+ import Component from './Component';
/**
 * 
 * @param {*} type 元素类型
 * @param {*} config 配置对象
 * @param {*} children 孩子或者孩子门
 */
function createElement(type, config, children) {
    if (config) {
        delete config._source;
        delete config._self;
    }
    let props = { ...config };

    if (arguments.length > 3) {//children是一个数组
        children = Array.prototype.slice.call(arguments, 2);
    }
    props.children = children;
    return {
        type,
        props
    }
}

const React = {
    createElement,
+   Component
}
export default React;
```

#### 4.4.`react-dom.js`

```javascript
/**
 * 给跟容器挂载的时候
 * @param {*} vdom 需要渲染的虚拟DOM
 * @param {*} container 容器
 */
function render(vdom, container) {
    const dom = createDOM(vdom);
    //挂载真实DOM
    container.appendChild(dom);
}

/**
 * 创建证实DOM
 * @param {*} vdom 虚拟DOM
 */
+ export function createDOM(vdom) {
    if (typeof vdom === 'string' || typeof vdom === 'number') {//vdom是字符串或者数组
        return document.createTextNode(vdom);
    }
    const { 
        type, 
        props } = vdom;
    //创建真实DOM
    let dom;
    if (typeof type === 'function') {//自定义函数组件
+        if(type.isReactComponent){//类组件
+            return mountClassComponent(vdom);
+        }else{//函数组件
+            return mountFunctionComponent(vdom);
+        }
    } else {//原生组件
        dom = document.createElement(type);
    }
    //使用虚拟DOM的属性更新刚创建出来的真实DOM的属性
    updateProps(dom, props);
    //儿子是一个文本
    if (typeof props.children === 'string' || typeof props.children === 'number') {
        dom.textContent = props.children
    } else if (typeof props.children === 'object' && props.children.type) {//只有一个儿子，并且是虚拟DOM
        render(props.children, dom);//把儿子挂载的自己身上
    } else if (Array.isArray(props.children)) {//有多个儿子
        reconcileChildren(props.children, dom);
    } else {
        document.textContent = props.children ? props.children.toString() : ''
    }
    return dom;
}

/**
 * 把一个类型为自定义类组件的虚拟DOM转化为一个真实DOM并返回
 * @param {*} vdom 类型为自定义类组件的虚拟DOM
 */
+ function updateClassComponent(vdom){
+    const {type:Clazz,props}=vdom;
+    //获取类的实例
+    const classInstance=new Clazz(props);
+    //获取虚拟DOM
+    const renderVdom=classInstance.render();
+    //获取真实DOM
+    const dom=createDOM(renderVdom);
+    //将真实dom挂到实例上上
+    classInstance.dom=dom;
+    return dom;
+ }

/**
 * 把一个类型为自定义函数组件的虚拟DOM转换为一个真实DOM并返回
 * @param {*} vdom 类型为自定义函数组件的虚拟DOM
 */
function mountFunctionComponent(vdom) {
    const { type: FunctionComponent, props } = vdom;
    const renderVdom = FunctionComponent(props);
    return createDOM(renderVdom);
}

/**
 * 
 * @param {*} childrenVdom 孩子门的虚拟DOM
 * @param {*} parentDOM 要挂载到的真实DOM
 */
function reconcileChildren(childrenVdom, parentDOM) {
    for (let i = 0; i < childrenVdom.length; i++) {
        const child = childrenVdom[i];
        render(child, parentDOM);//把儿子挂载的自己身上
    }
}
/**
 * 使用虚拟DOM的属性更新刚创建出来的真实DOM的属性
 * @param {*} dom 真实DOM
 * @param {*} props 虚拟DOM属性
 */
function updateProps(dom, props) {
    for (const key in props) {
        if (key === 'children') continue;//单独处理，不再此处处理
        if (key === 'style') {
            const styleObj = props.style;
            for (const attr in styleObj) {
                dom.style[attr] = styleObj[attr];
            }
+       } else if(key.startsWith('on')){//onClick=>onclick
+           dom[key.toLocaleLowerCase()]=props[key];
        }else {//在JS中定义class使用的是className，所以不要改
            dom[key] = props[key];
        }
    }
}

const ReactDOM = {
    render
}

export default ReactDOM;
```

### 5.类组件合成事件和批量更新

> 在react里，事件的更新可能是异步，批量，不同步的
>
> - 调用setState之后状态并没有立刻更新，而是先缓存起来
> - 等事件函数处理完成在进行批量更新，一次更新并重新渲染
>
> jsx事件处理函数是react控制的，只有归react控制就是批量，只要不归react管就不是批量

- 第一种setState

```react
  handlerClick = () => {
    //批量更新
    this.setState({ num: this.state.num + 1 });
    console.log(this.state.num);

    this.setState({ num: this.state.num + 1 });
    console.log(this.state.num);

    //已经不归react管
    Promise.resolve().then(() => {
      console.log(this.state.num);

      this.setState({ num: this.state.num + 1 });
      console.log(this.state.num);

      this.setState({ num: this.state.num + 1 });
      console.log(this.state.num);

    })
  }
```

日志：

```javascript
0
0
1
2
3
```

- 第二张setState

```react
  handlerClick = () => {
    //批量更新,回调函数实在批量更新完成后才执行
    this.setState(oldState=>({num:oldState.num+1}),()=>{
      console.log('log1--',this.state.num)
    })
    console.log('log2--',this.state.num);

    this.setState(oldState=>({num:oldState.num+1}),()=>{
      console.log('log3--',this.state.num)
    })
    console.log('log4--',this.state.num);

    //已经不归react管
    Promise.resolve().then(() => {
      console.log('log5--',this.state.num);

      this.setState(oldState=>({num:oldState.num+1}),()=>{
        console.log('log6--',this.state.num)
      })
      console.log('log7--',this.state.num);

      this.setState(oldState=>({num:oldState.num+1}),()=>{
        console.log('log8--',this.state.num)
      })
      console.log('log9--',this.state.num);

    })
  }
```

日志：

```javascript
index.js:31 log2-- 0
index.js:36 log4-- 0
index.js:29 log1-- 2
index.js:34 log3-- 2
index.js:40 log5-- 2
index.js:43 log6-- 3
index.js:45 log7-- 3
index.js:48 log8-- 4
index.js:50 log9-- 4
```

#### 5.1.`src/Component.js`

```javascript
import { createDOM } from './react-dom'

//更新队列
+ export let updateQueue = {
+    isBatchingUpdate: false,//当前是否处于批量更新模式
+    updaters: new Set(),
+    batchUpdate(){//批量更新
+        for(let updater of this.updaters){
+            updater.updateClassComponent();
+        }
+        this.isBatchingUpdate=false;
+    }
+ }
//更新器
+ class Updater {
+    constructor(classInstance) {
+        this.classInstance = classInstance;//类组件的实例
+        this.pendingStates = [];//等待生效的状态，可能是一个对象，也可能是一个函数
+        this.cbs = [];//存放回调
+    }

    /**
     * 
     * @param {*} partialState 等待更新生效的状态
     * @param {*} cb 状态更新的回调
     */
+    addState(partialState, cb) {
+        this.pendingStates.push(partialState);
+        typeof cb === 'function' && this.cbs.push(cb);
+        if (updateQueue.isBatchingUpdate) {//当前处于批量更新模式，先缓存updater
+            updateQueue.updaters.add(this);//本次setState调用结束
+        } else {//当前处于非批量更新模式，执行更新
+            this.updateClassComponent();//直接更新组件
+        }
+    }

+    updateClassComponent() {
+        const { classInstance, pendingStates, cbs } = this;
+        if (pendingStates.length > 0) {//有setState
+            classInstance.state = this.getState();//计算新状态
+            classInstance.forceUpdate();
+            cbs.forEach(cb=>cb());
+            cbs.length=0;
+        }
+    }

+    getState() {//计算新状态
+        const { classInstance, pendingStates } = this;
+        let { state } = classInstance;//获取老状态
+        pendingStates.forEach(newState => {
+            //newState可能是对象，也可能是函数,对象setState的两种方式
+            if (typeof newState === 'function') {
+                newState = newState(state);
+            }
+            state = { ...state, ...newState };
+        })
+        pendingStates.length = 0;//清空数组
+        return state;
+    }
+ }
class Component {
    //用来判断是类组件
    static isReactComponent = true;
    constructor(props) {
        this.props = props;
        this.state = {};
        //每个类组件都有一个更新器
+       this.updater = new Updater(this);
    }

    setState(partialState, cb) {
+        this.updater.addState(partialState, cb);
        // const { state } = this;
        // this.state = { ...state, ...partialState };
        // const newVdom = this.render();
        // mountClassComponent(this, newVdom);
    }

+   forceUpdate() {
+       const newVdom = this.render();
+       updateClassComponent(this, newVdom);
+   }
}

/**
 * 用新的真实dom替换老得真实DOM
 * @param {*} classInstance 类组件实例
 * @param {*} newVdom 新的虚拟DOM
 */
function updateClassComponent(classInstance, newVdom) {
    const newDOM = createDOM(newVdom);
    const oldDOM = classInstance.dom;
    oldDOM.parentNode.replaceChild(newDOM, oldDOM);
    classInstance.dom = newDOM;
}
export default Component;
```

#### 5.2.`src/react-dom.js`

```javascript
+ import {addEvent} from './event';

/**
 * 给跟容器挂载的时候
 * @param {*} vdom 需要渲染的虚拟DOM
 * @param {*} container 容器
 */
function render(vdom, container) {
    const dom = createDOM(vdom);
    //挂载真实DOM
    container.appendChild(dom);
}

/**
 * 创建证实DOM
 * @param {*} vdom 虚拟DOM
 */
export function createDOM(vdom) {
    if (typeof vdom === 'string' || typeof vdom === 'number') {//vdom是字符串或者数组
        return document.createTextNode(vdom);
    }
    const { 
        type, 
        props } = vdom;
    //创建真实DOM
    let dom;
    if (typeof type === 'function') {//自定义函数组件
        if(type.isReactComponent){//类组件
            return mountClassComponent(vdom);
        }else{//函数组件
            return mountFunctionComponent(vdom);
        }
    } else {//原生组件
        dom = document.createElement(type);
    }
    //使用虚拟DOM的属性更新刚创建出来的真实DOM的属性
    updateProps(dom, props);
    //儿子是一个文本
    if (typeof props.children === 'string' || typeof props.children === 'number') {
        dom.textContent = props.children
    } else if (typeof props.children === 'object' && props.children.type) {//只有一个儿子，并且是虚拟DOM
        render(props.children, dom);//把儿子挂载的自己身上
    } else if (Array.isArray(props.children)) {//有多个儿子
        reconcileChildren(props.children, dom);
    } else {
        document.textContent = props.children ? props.children.toString() : ''
    }
    return dom;
}

/**
 * 把一个类型为自定义类组件的虚拟DOM转化为一个真实DOM并返回
 * @param {*} vdom 类型为自定义类组件的虚拟DOM
 */
function mountClassComponent(vdom){
    const {type:Clazz,props}=vdom;
    //获取类的实例
    const classInstance=new Clazz(props);
    //获取虚拟DOM
    const renderVdom=classInstance.render();
    //获取真实DOM
    const dom=createDOM(renderVdom);
    //将真实dom挂到实例上上
    classInstance.dom=dom;
    return dom;
}

/**
 * 把一个类型为自定义函数组件的虚拟DOM转换为一个真实DOM并返回
 * @param {*} vdom 类型为自定义函数组件的虚拟DOM
 */
function mountFunctionComponent(vdom) {
    const { type: FunctionComponent, props } = vdom;
    const renderVdom = FunctionComponent(props);
    return createDOM(renderVdom);
}

/**
 * 
 * @param {*} childrenVdom 孩子门的虚拟DOM
 * @param {*} parentDOM 要挂载到的真实DOM
 */
function reconcileChildren(childrenVdom, parentDOM) {
    for (let i = 0; i < childrenVdom.length; i++) {
        const child = childrenVdom[i];
        render(child, parentDOM);//把儿子挂载的自己身上
    }
}
/**
 * 使用虚拟DOM的属性更新刚创建出来的真实DOM的属性
 * @param {*} dom 真实DOM
 * @param {*} props 虚拟DOM属性
 */
function updateProps(dom, props) {
    for (const key in props) {
        if (key === 'children') continue;//单独处理，不再此处处理
        if (key === 'style') {
            const styleObj = props.style;
            for (const attr in styleObj) {
                dom.style[attr] = styleObj[attr];
            }
        } else if(key.startsWith('on')){//onClick=>onclick
            // dom[key.toLocaleLowerCase()]=props[key];
+           addEvent(dom,key.toLocaleLowerCase(),props[key]);
        }else {//在JS中定义class使用的是className，所以不要改
            dom[key] = props[key];
        }
    }
}

const ReactDOM = {
    render
}

export default ReactDOM;
```

#### 5.3.`src/event.js`

```javascript
import {updateQueue} from './Component';

/**
 * 给真实DOM添加事件处理函数
 * 为什么要这么做，为什么要做事件委托？
 *  1.可以做兼容处理，兼容不同浏览器,不能的浏览器event是不一样的， 处理浏览器的兼容性
 *  2.可以在事件处理函数之前和之后做一些事情，比如：
 *     2.1 之前 updateQueue.isBatchingUpdate=true
 *     2.2 之后 updateQueue.batchUpdate
 * @param {*} dom 真实DOM
 * @param {*} eventType 事件类型
 * @param {*} listener 监听函数
 */
export function addEvent(dom,eventType,listener){
    const store=dom.store||(dom.store={});
    store[eventType]=listener;//store.onclick=handlerClick
    if(!document[eventType]){
        //事件委托，不管你给哪个DOM元素上绑事件，最后都统一代理到document上去了
        document[eventType]=dispatchEvent;//document.onclick=dispatchEvent
    }
}

let syntheticEvent={}
/**
 * 
 * @param {*} event 原生event
 */
function dispatchEvent(event){
    //target事件源button ,type类型click
    const {target,type}=event;
    const eventType=`on${type}`;
    updateQueue.isBatchingUpdate=true;//设置为批量更新模式
    createSyntheticEvent(event);
   
    while(target){//事件冒泡
        const {store}=target;
        const listener=store&&store[eventType];
        listener&&listener.call(target,syntheticEvent);
        target=target.parentNode;
    }
  
    //syntheticEvent使用后清空
    for (const key in syntheticEvent) {
        syntheticEvent[key]=null;
    }
    updateQueue.batchUpdate();//批量更新
}

/**
 * 将元素事件都拷贝到syntheticEvent上
 * @param {*} nativeEvent 元素事件
 */
function createSyntheticEvent(nativeEvent){
    for (const key in nativeEvent) {
        syntheticEvent[key]=nativeEvent[key];
    }
}
```

### 6.类组件生命周期

#### 6.1.实例1

```javascript
/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-25 19:37:17
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from 'react';
import ReactDOM from 'react-dom';

class Counter extends React.Component {
  static defaultProps = {
    name: '计数器：'
  }

  constructor(props) {
    super(props)
    this.state = { num: 0 }
    console.log('Counter 1.constructor 属性，状态初始化')
  }

  componentWillMount(){
    console.log('Counter 2.componentWillMount 组件将要挂载')
  }

  componentDidMount(){
    console.log('Counter 4.componentDidMount 组件挂载完成')
  }

  handlerClick = () => {
    this.setState({num:this.state.num+1});
  }

  shouldComponentUpdate(nextProps,nextState){
    console.log('Counter 5.shouldComponentUpdate 询问组件是否需要更新？')
    return nextState.num%2===0;//num为2的倍数更是视图，状态一致会更新
  }

  componentWillUpdate(){
    console.log('Counter 6.componentWillUpdate 组件将要更新')
  }

  componentDidUpdate(){
    console.log('Counter 7.componentDidUpdate 组件更新完成')
  }

  render() {
    console.log('Counter 3.render 生成虚拟DOM')
    return (
      <div>
        <p>{this.props.name}:{this.state.num}</p>
        <button onClick={this.handlerClick}>加2</button>
      </div>
    )
  }
}
ReactDOM.render(<Counter name='张三' />, document.getElementById('root'));
```

日志：

- 初始化日志

> 日志可以看出，初始化的时候，分别走了`constructor`->`componentWillMount`->`render`->`componentDidMount`

```javascript
 Counter 1.constructor 属性，状态初始化
 Counter 2.componentWillMount 组件将要挂载
 Counter 3.render 生成虚拟DOM
 Counter 4.componentDidMount 组件挂载完成
```

- 点击第一次日志

> 当第一次点击按钮时，走了`shouldComponentUpdate`方法，此时询问是否需要更新组件，此时`num=1`不是2的倍数，返回的是false，因此不更新组件

```markdown
  Counter 1.constructor 属性，状态初始化
  Counter 2.componentWillMount 组件将要挂载
  Counter 3.render 生成虚拟DOM
  Counter 4.componentDidMount 组件挂载完成
+ Counter 5.shouldComponentUpdate 询问组件是否需要更新？
```

+ 点击第二次日志：

> 第二次点击按钮时，继续询问是否需要更新组件，此时`num=2`是2的倍数，返回的是true,因此更新组件，分别需要走`shouldComponentUpdate`->`componentWillUpdate`->`render`->`componentDidUpdate`

```markdown
  Counter 1.constructor 属性，状态初始化
  Counter 2.componentWillMount 组件将要挂载
  Counter 3.render 生成虚拟DOM
  Counter 4.componentDidMount 组件挂载完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 5.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 6.componentWillUpdate 组件将要更新
+ Counter 3.render 生成虚拟DOM
+ Counter 7.componentDidUpdate 组件更新完成
```

