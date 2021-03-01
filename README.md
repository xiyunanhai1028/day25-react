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

### 6.类组件老生命周期

![老生命周期](http://img.zhufengpeixun.cn/react15.jpg)

#### 6.1.基本生命周期实现

##### 6.1.1.实例

```javascript
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

##### 6.1.2`src/react-dom.js`

```javascript
 import {addEvent} from './event';

/**
 * 给跟容器挂载的时候
 * @param {*} vdom 需要渲染的虚拟DOM
 * @param {*} container 容器
 */
function render(vdom, container) {
    const dom = createDOM(vdom);
    //挂载真实DOM
    container.appendChild(dom);
+   //调用生命周期方法componentDidMount
+   dom.componentDidMount&&dom.componentDidMount();
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
+   //调用生命周期方法componentWillMount
+   if(classInstance.componentWillMount){
+       classInstance.componentWillMount();
+   }
    //获取虚拟DOM
    const renderVdom=classInstance.render();
    //获取真实DOM
    const dom=createDOM(renderVdom);
    
+   if(classInstance.componentDidMount){
+       dom.componentDidMount=classInstance.componentDidMount;
+   }
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
            addEvent(dom,key.toLocaleLowerCase(),props[key]);
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

##### 6.1.3.`src/Component.js`

```javascript
import { createDOM } from './react-dom'

//更新队列
export let updateQueue = {
    isBatchingUpdate: false,//当前是否处于批量更新模式
    updaters: new Set(),
    batchUpdate(){//批量更新
        for(let updater of this.updaters){
            updater.updateClassComponent();
        }
        this.isBatchingUpdate=false;
    }
}
//更新器
class Updater {
    constructor(classInstance) {
        this.classInstance = classInstance;//类组件的实例
        this.pendingStates = [];//等待生效的状态，可能是一个对象，也可能是一个函数
        this.cbs = [];//存放回调
    }

    /**
     * 
     * @param {*} partialState 等待更新生效的状态
     * @param {*} cb 状态更新的回调
     */
    addState(partialState, cb) {
        this.pendingStates.push(partialState);
        typeof cb === 'function' && this.cbs.push(cb);
+       this.emitUpdate();
    }

    //一个组件不管属性变了，还是状态变了，都会更新
+  emitUpdate(newProps){
+       if (updateQueue.isBatchingUpdate) {//当前处于批量更新模式，先缓存updater
+           updateQueue.updaters.add(this);//本次setState调用结束
+       } else {//当前处于非批量更新模式，执行更新
+           this.updateClassComponent();//直接更新组件
+       }
+   }

    updateClassComponent() {
        const { classInstance, pendingStates, cbs } = this;
        if (pendingStates.length > 0) {//有setState
+           shouldUpdate(classInstance,this.getState())
            // classInstance.state = this.getState();//计算新状态
            // classInstance.forceUpdate();
            // cbs.forEach(cb=>cb());
            // cbs.length=0;
        }
    }

    getState() {//计算新状态
        const { classInstance, pendingStates } = this;
        let { state } = classInstance;//获取老状态
        pendingStates.forEach(newState => {
            //newState可能是对象，也可能是函数,对象setState的两种方式
            if (typeof newState === 'function') {
                newState = newState(state);
            }
            state = { ...state, ...newState };
        })
        pendingStates.length = 0;//清空数组
        return state;
    }
}

/**
 * 判断组件是否需要更新
 * @param {*} classInstance 类组件实例
 * @param {*} newState 新状态
 */
+ function shouldUpdate(classInstance,newState){
+   //不管组件要不要更新，组件的state一定会改变
+   classInstance.state=newState;
+   //如果有这个方法，并且这个方法的返回值为false，则不需要继续向下更新了，否则就更新
+   if(classInstance.shouldComponentUpdate&&!classInstance.shouldComponentUpdate(classInstance.props,newState)){
+       return;
+   }
+   classInstance.forceUpdate()
+ }
class Component {
    //用来判断是类组件
    static isReactComponent = true;
    constructor(props) {
        this.props = props;
        this.state = {};
        //每个类组件都有一个更新器
        this.updater = new Updater(this);
    }

    setState(partialState, cb) {
        this.updater.addState(partialState, cb);
        // const { state } = this;
        // this.state = { ...state, ...partialState };
        // const newVdom = this.render();
        // mountClassComponent(this, newVdom);
    }

    forceUpdate() {
+       //执行生命周期方法componentWillUpdate
+       this.componentWillUpdate&&this.componentWillUpdate();
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
+   //调用生命周期方法componentDidUpdate
+   classInstance.componentDidUpdate&&classInstance.componentDidUpdate();
    classInstance.dom = newDOM;
}
export default Component;
```

#### 6.2.子组件生命周期

##### 6.2.1.实例

```react
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

  componentWillMount() {
    console.log('Counter 2.componentWillMount 组件将要挂载')
  }

  componentDidMount() {
    console.log('Counter 4.componentDidMount 组件挂载完成')
  }

  handlerClick = () => {
    this.setState({ num: this.state.num + 1 });
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('Counter 5.shouldComponentUpdate 询问组件是否需要更新？')
    return nextState.num % 2 === 0;//num为2的倍数更是视图，状态一致会更新
  }

  componentWillUpdate() {
    console.log('Counter 6.componentWillUpdate 组件将要更新')
  }

  componentDidUpdate() {
    console.log('Counter 7.componentDidUpdate 组件更新完成')
  }

  render() {
    console.log('Counter 3.render 生成虚拟DOM')
    return (
      <div>
        <p>{this.props.name}:{this.state.num}</p>
        {this.state.num===4?null:<ChildCounter num={this.state.num}/>}
        <button onClick={this.handlerClick}>加2</button>
      </div>
    )
  }
}

class ChildCounter extends React.Component {
  constructor(props){
    super(props);
    console.log('ChildCounter 1.constructor 属性，状态初始化')
  }
  componentWillMount() {
    console.log('ChildCounter 2.componentWillMount 组件将要挂载')
  }

  componentDidMount() {
    console.log('ChildCounter 4.componentDidMount 组件挂载完成')
  }

  componentWillReceiveProps(newProps){//第一次不会执行，之后属性更新时会执行
    console.log('ChildCounter 5.componentWillReceiveProps 组件将要接收新的props')
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？')
    return nextProps.num % 3 === 0;//num为3的倍数更是视图，状态一致会更新
  }

  componentWillUpdate() {
    console.log('ChildCounter 7.componentWillUpdate 组件将要更新')
  }

  componentDidUpdate() {
    console.log('ChildCounter 8.componentDidUpdate 组件更新完成')
  }

  componentWillUnmount(){
    console.log('ChildCounter 9.componentWillUnmount 组件将被卸载')
  }

  render() {
    console.log('ChildCounter 3.render 生成虚拟DOM')
    return <div>{this.props.num}</div>
  }
}
ReactDOM.render(<Counter name='张三' />, document.getElementById('root'));
```

日志分心：

- 初始化日志

> 初始化时分别会走：`父组件constructor`->`父组件componentWillMount`->`父组件render`->`子组件constructor`->`子组件componentWillMount`->`子组件render`->`子组件componentDidMount`->`父组件componentDidMount`

```javascript
Counter 1.constructor 属性，状态初始化
Counter 2.componentWillMount 组件将要挂载
Counter 3.render 生成虚拟DOM
ChildCounter 1.constructor 属性，状态初始化
ChildCounter 2.componentWillMount 组件将要挂载
ChildCounter 3.render 生成虚拟DOM
ChildCounter 4.componentDidMount 组件挂载完成
Counter 4.componentDidMount 组件挂载完成
```

- 第一次点击

> 第一次点击时，父组件走了`shouldComponentUpdate`询问是否需要更新组件，此时`num=1`,返回的false，父组件不更新，子组件也不会更新

```javascript
  Counter 1.constructor 属性，状态初始化
  Counter 2.componentWillMount 组件将要挂载
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 4.componentDidMount 组件挂载完成
+ Counter 5.shouldComponentUpdate 询问组件是否需要更新？ 
```

- 第二次点击

> 第二次点击时，父组件走`shouldComponentUpdate`，此时`num=2`是2的倍数，返回的是true，父组件需要更新，调用`componentWillUpdate`父组件将要更新,从新`render`，此时子组件的`componentWillReceiveProps`被调用，子组件将要接收新的props，接着子组件的`shouldComponentUpdate`被调用,询问子组件是否需要更新，此时`num=2`,不是3的倍数，返回的是false，子组件不更新，接着执行`componentDidUpdate`父组件更新完成

```javascript
  Counter 1.constructor 属性，状态初始化
  Counter 2.componentWillMount 组件将要挂载
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 4.componentDidMount 组件挂载完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 5.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 6.componentWillUpdate 组件将要更新
+ Counter 3.render 生成虚拟DOM
+ ChildCounter 5.componentWillReceiveProps 组件将要接收新的props
+ ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 7.componentDidUpdate 组件更新完成
```

- 第三次点击

> 第三次点击时，父组件走了`shouldComponentUpdate`询问是否需要更新组件，此时`num=3`,返回的false，父组件不更新，子组件也不会更新

```javascript
  Counter 1.constructor 属性，状态初始化
  Counter 2.componentWillMount 组件将要挂载
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 4.componentDidMount 组件挂载完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 组件将要接收新的props
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
+ Counter 5.shouldComponentUpdate 询问组件是否需要更新？  
```

- 第四次点击

> 第四次点击时，父组件走`shouldComponentUpdate`，此时`num=4`是2的倍数，返回的是true，父组件需要更新，调用`componentWillUpdate`父组件将要更新,从新`render`，这是因为`num=4`,`{this.state.num===4?null:<ChildCounter num={this.state.num}/>}`执行后，子组件被卸载，所以子组件走了`componentWillUnmount`，父组件继续执行`componentDidUpdate`

```javascript
  Counter 1.constructor 属性，状态初始化
  Counter 2.componentWillMount 组件将要挂载
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 4.componentDidMount 组件挂载完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 组件将要接收新的props
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 5.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 6.componentWillUpdate 组件将要更新
+ Counter 3.render 生成虚拟DOM
+ ChildCounter 9.componentWillUnmount 组件将被卸载
+ Counter 7.componentDidUpdate 组件更新完成
```

- 第五次点击

> 第五次点击时父组,件走了`shouldComponentUpdate`询问是否需要更新组件，此时`num=5`,返回的false，父组件不更新，子组件也不会更新

```javascript
  Counter 1.constructor 属性，状态初始化
  Counter 2.componentWillMount 组件将要挂载
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 4.componentDidMount 组件挂载完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 组件将要接收新的props
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 9.componentWillUnmount 组件将被卸载
  Counter 7.componentDidUpdate 组件更新完成
+ Counter 5.shouldComponentUpdate 询问组件是否需要更新？  
```

- 第六次点击

> 第六次点击时，父组件走`shouldComponentUpdate`，此时`num=6`是2的倍数，返回的是true，父组件需要更新，调用`componentWillUpdate`父组件将要更新,从新`render`，由于之前在子组件被卸载了，需要重新开始，因为需要执行`子组件constructor`->`子组件componentWillMount`->`子组件render`->`子组件componentDidMount`，再执行`父组件componentDidMount`

```javascript
 	Counter 1.constructor 属性，状态初始化
  Counter 2.componentWillMount 组件将要挂载
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 4.componentDidMount 组件挂载完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 组件将要接收新的props
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 9.componentWillUnmount 组件将被卸载
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 5.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 6.componentWillUpdate 组件将要更新
+ Counter 3.render 生成虚拟DOM
+ ChildCounter 1.constructor 属性，状态初始化
+ ChildCounter 2.componentWillMount 组件将要挂载
+ ChildCounter 3.render 生成虚拟DOM
+ ChildCounter 4.componentDidMount 组件挂载完成
+ Counter 7.componentDidUpdate 组件更新完成
```

- 第七次点击

> 第七次点击时父组,件走了`shouldComponentUpdate`询问是否需要更新组件，此时`num=7`,返回的false，父组件不更新，子组件也不会更新

```javascript
 	Counter 1.constructor 属性，状态初始化
  Counter 2.componentWillMount 组件将要挂载
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 4.componentDidMount 组件挂载完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 组件将要接收新的props
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 9.componentWillUnmount 组件将被卸载
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 7.componentDidUpdate 组件更新完成
+ Counter 5.shouldComponentUpdate 询问组件是否需要更新？
```

- 第八次点击

> 第八次点击时父组,父组件走`shouldComponentUpdate`，此时`num=8`是2的倍数，返回的是true，父组件需要更新，调用`componentWillUpdate`父组件将要更新,从新`render`，此时子组件的`componentWillReceiveProps`被调用，子组件将要接收新的props，接着子组件的`shouldComponentUpdate`被调用,询问子组件是否需要更新，此时`num=8`,不是3的倍数，返回的是false，子组件不更新，接着执行`componentDidUpdate`父组件更新完成

```javascript
 	Counter 1.constructor 属性，状态初始化
  Counter 2.componentWillMount 组件将要挂载
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 4.componentDidMount 组件挂载完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 组件将要接收新的props
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 9.componentWillUnmount 组件将被卸载
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 5.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 6.componentWillUpdate 组件将要更新
+ Counter 3.render 生成虚拟DOM
+ ChildCounter 5.componentWillReceiveProps 询问组件是否需要更新？
+ ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 7.componentDidUpdate 组件更新完成
```

- 第九次点击

> 第九次点击时父组,件走了`shouldComponentUpdate`询问是否需要更新组件，此时`num=9`,返回的false，父组件不更新，子组件也不会更新

```javascript
  Counter 1.constructor 属性，状态初始化
  Counter 2.componentWillMount 组件将要挂载
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 4.componentDidMount 组件挂载完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 组件将要接收新的props
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 9.componentWillUnmount 组件将被卸载
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 询问组件是否需要更新？
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
+ Counter 5.shouldComponentUpdate 询问组件是否需要更新？
```

- 第十次点击

> 第十次点击时父组，父组件走`shouldComponentUpdate`，此时`num=10`是2的倍数，返回的是true，父组件需要更新，调用`componentWillUpdate`父组件将要更新,从新`render`，此时子组件的`componentWillReceiveProps`被调用，子组件将要接收新的props，接着子组件的`shouldComponentUpdate`被调用,询问子组件是否需要更新，此时`num=10`,不是3的倍数，返回的是false，子组件不更新，接着执行`componentDidUpdate`父组件更新完成

```javascript
  Counter 1.constructor 属性，状态初始化
  Counter 2.componentWillMount 组件将要挂载
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 4.componentDidMount 组件挂载完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 组件将要接收新的props
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 9.componentWillUnmount 组件将被卸载
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 询问组件是否需要更新？
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 5.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 6.componentWillUpdate 组件将要更新
+ Counter 3.render 生成虚拟DOM
+ ChildCounter 5.componentWillReceiveProps 询问组件是否需要更新？
+ ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 7.componentDidUpdate 组件更新完成
```

- 第十一次点击

> 第十一次点击时父组，件走了`shouldComponentUpdate`询问是否需要更新组件，此时`num=11`,返回的false，父组件不更新，子组件也不会更新

```javascript
  Counter 1.constructor 属性，状态初始化
  Counter 2.componentWillMount 组件将要挂载
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 4.componentDidMount 组件挂载完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 组件将要接收新的props
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 9.componentWillUnmount 组件将被卸载
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 询问组件是否需要更新？
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 询问组件是否需要更新？
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
+ Counter 5.shouldComponentUpdate 询问组件是否需要更新？  
```

- 第十二次点击

> 第十二次点击时父组，父组件走`shouldComponentUpdate`，此时`num=12`是2的倍数，返回的是true，父组件需要更新，调用`componentWillUpdate`父组件将要更新,从新`render`，此时子组件的`componentWillReceiveProps`被调用，子组件将要接收新的props，接着子组件的`shouldComponentUpdate`被调用,询问子组件是否需要更新，此时`num=12`,是3的倍数，返回的是true，调用`子组件componentWillUpdate`->`子组件render`->`子组件componentDidUpdate`，接着执行`componentDidUpdate`父组件更新完成

```javascript
  Counter 1.constructor 属性，状态初始化
  Counter 2.componentWillMount 组件将要挂载
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 4.componentDidMount 组件挂载完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 组件将要接收新的props
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 9.componentWillUnmount 组件将被卸载
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 1.constructor 属性，状态初始化
  ChildCounter 2.componentWillMount 组件将要挂载
  ChildCounter 3.render 生成虚拟DOM
  ChildCounter 4.componentDidMount 组件挂载完成
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 询问组件是否需要更新？
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？
  Counter 6.componentWillUpdate 组件将要更新
  Counter 3.render 生成虚拟DOM
  ChildCounter 5.componentWillReceiveProps 询问组件是否需要更新？
  ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
  Counter 7.componentDidUpdate 组件更新完成
  Counter 5.shouldComponentUpdate 询问组件是否需要更新？  
+ Counter 5.shouldComponentUpdate 询问组件是否需要更新？
+ Counter 6.componentWillUpdate 组件将要更新
+ Counter 3.render 生成虚拟DOM
+ ChildCounter 5.componentWillReceiveProps 询问组件是否需要更新？
+ ChildCounter 6.shouldComponentUpdate 询问组件是否需要更新？
+ ChildCounter 7.componentWillUpdate 组件将要更新
+ ChildCounter 3.render 生成虚拟DO
+ ChildCounter 8.componentDidUpdate 组件更新完成
+ Counter 7.componentDidUpdate 组件更新完成
```

#### 6.3.全生命周期(dom-diff)

##### 6.3.1.`src/Component.js`

```javascript
import { compareTwoVdom ,findDOM} from './react-dom'

//更新队列
export let updateQueue = {
    isBatchingUpdate: false,//当前是否处于批量更新模式
+   updaters: [],
    batchUpdate() {//批量更新
        for (let updater of this.updaters) {
            updater.updateClassComponent();
        }
        this.isBatchingUpdate = false;
+       this.updaters.length=0;
    }
}
//更新器
class Updater {
    constructor(classInstance) {
        this.classInstance = classInstance;//类组件的实例
        this.pendingStates = [];//等待生效的状态，可能是一个对象，也可能是一个函数
        this.cbs = [];//存放回调
    }

    /**
     * 
     * @param {*} partialState 等待更新生效的状态
     * @param {*} cb 状态更新的回调
     */
    addState(partialState, cb) {
        this.pendingStates.push(partialState);
        typeof cb === 'function' && this.cbs.push(cb);
        this.emitUpdate();
    }

    //一个组件不管属性变了，还是状态变了，都会更新
    emitUpdate(nextProps) {
+       this.nextProps = nextProps;//缓存起来
        if (updateQueue.isBatchingUpdate) {//当前处于批量更新模式，先缓存updater
            updateQueue.updaters.add(this);//本次setState调用结束
        } else {//当前处于非批量更新模式，执行更新
            this.updateClassComponent();//直接更新组件
        }
    }

    updateClassComponent() {
+       const { classInstance, pendingStates, cbs, nextProps } = this;
+       if (nextProps || pendingStates.length > 0) {//有setState
+           shouldUpdate(classInstance, nextProps, this.getState())
            // classInstance.state = this.getState();//计算新状态
            // classInstance.forceUpdate();
            // cbs.forEach(cb=>cb());
            // cbs.length=0;
        }
    }

    getState() {//计算新状态
        const { classInstance, pendingStates } = this;
        let { state } = classInstance;//获取老状态
        pendingStates.forEach(newState => {
            //newState可能是对象，也可能是函数,对象setState的两种方式
            if (typeof newState === 'function') {
                newState = newState(state);
            }
            state = { ...state, ...newState };
        })
        pendingStates.length = 0;//清空数组
        return state;
    }
}

/**
 * 判断组件是否需要更新
 * @param {*} classInstance 类组件实例
 * @param {*} nextProps 新的props
 * @param {*} newState 新状态
 */
function shouldUpdate(classInstance, nextProps, newState) {
+    let willUpdate = true;//是否需要更新
+   //如果有这个方法，并且这个方法的返回值为false，则不需要继续向下更新了，否则就更新
+   if (classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(nextProps, newState)) {
+       willUpdate = false;
+   }
+   //如果需要更新，并且组件调用类componentWillUpdate方法
+   if (willUpdate && classInstance.componentWillUpdate) {
+       classInstance.componentWillUpdate();//执行生命周期方法componentWillUpdate
+   }
+   //不管是否需要更新，属性和状态都有改变
+   if (nextProps) {
+       classInstance.props = nextProps;
+   }
+   //不管组件要不要更新，组件的state一定会改变
+   classInstance.state = newState;
+   //如果需要更新，走组件的更新逻辑
+   willUpdate && classInstance.forceUpdate()
}
  
class Component {
    //用来判断是类组件
    static isReactComponent = true;
    constructor(props) {
        this.props = props;
        this.state = {};
        //每个类组件都有一个更新器
        this.updater = new Updater(this);
    }

    setState(partialState, cb) {
        this.updater.addState(partialState, cb);
    }

    forceUpdate() {
        const newRenderVdom = this.render();//新的虚拟DOM
+       const oldRenderVdom = this.oldRenderVdom;//老得虚拟DOM
+       const dom = findDOM(oldRenderVdom);//老得真实DOM
+       compareTwoVdom(dom.parentNode, oldRenderVdom, newRenderVdom);
+       this.oldRenderVdom=newRenderVdom;//比较完毕后，重新赋值老的虚拟节点
+       //调用生命周期方法componentDidUpdate
+       this.componentDidUpdate && this.componentDidUpdate();
    }
}

export default Component;
```

##### 6.3.2.`src/event.js`

```javascript
/*
 * @Author: dfh
 * @Date: 2021-02-25 15:54:59
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-28 15:59:27
 * @Modified By: dfh
 * @FilePath: /day25-react/src/event.js
 */
import { updateQueue } from './Component';

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
export function addEvent(dom, eventType, listener) {
    const store = dom.store || (dom.store = {});
    store[eventType] = listener;//store.onclick=handlerClick
    if (!document[eventType]) {
        //事件委托，不管你给哪个DOM元素上绑事件，最后都统一代理到document上去了
        document[eventType] = dispatchEvent;//document.onclick=dispatchEvent
    }
}

let syntheticEvent = {}
/**
 * 
 * @param {*} event 原生event
 */
function dispatchEvent(event) {
    //target事件源button ,type类型click
    let { target, type } = event;
    const eventType = `on${type}`;
    updateQueue.isBatchingUpdate = true;//设置为批量更新模式
    createSyntheticEvent(event);
    while (target) {//事件冒泡
        const { store } = target;
        const listener = store && store[eventType];
        listener && listener.call(target, syntheticEvent);
        target = target.parentNode;
    }

    //syntheticEvent使用后清空
    for (const key in syntheticEvent) {
        syntheticEvent[key] = null;
    }
+   updateQueue.isBatchingUpdate = false;
    updateQueue.batchUpdate();//批量更新
}

/**
 * 将元素事件都拷贝到syntheticEvent上
 * @param {*} nativeEvent 元素事件
 */
function createSyntheticEvent(nativeEvent) {
    for (const key in nativeEvent) {
        syntheticEvent[key] = nativeEvent[key];
    }
}
```

##### 6.3.3.`src/constants.js`

```javascript
+ export const REACT_TEXT = Symbol('REACT_TEXT');
```

##### 6.3.4.`src/react-dom.js`

```javascript
+ import { REACT_TEXT } from './constants';
  import { addEvent } from './event';

/**
 * 给跟容器挂载的时候
 * @param {*} vdom 需要渲染的虚拟DOM
 * @param {*} container 容器
 */
function render(vdom, container) {
    const dom = createDOM(vdom);
    //挂载真实DOM
    container.appendChild(dom);
    //调用生命周期方法componentDidMount
    dom.componentDidMount && dom.componentDidMount();
}

/**
 * 创建证实DOM
 * @param {*} vdom 虚拟DOM
 */
export function createDOM(vdom) {
    const {
        type,
        props } = vdom;
    //创建真实DOM
    let dom;
+   if (type === REACT_TEXT) {//是文本
+       dom = document.createTextNode(props.content);
+   } else if (typeof type === 'function') {//自定义函数组件
        if (type.isReactComponent) {//类组件
            return mountClassComponent(vdom);
        } else {//函数组件
            return mountFunctionComponent(vdom);
        }
    } else {//原生组件
        dom = document.createElement(type);
    }

    //使用虚拟DOM的属性更新刚创建出来的真实DOM的属性
+   updateProps(dom, {}, props);
    if (typeof props.children === 'object' && props.children.type) {//只有一个儿子，并且是虚拟DOM
        render(props.children, dom);//把儿子变成真实DOM，并且挂载到自己身上
    } else if (Array.isArray(props.children)) {//有多个儿子
        reconcileChildren(props.children, dom);
    }

    //将真实DOM挂载到虚拟DOM上，以便后面取
+   vdom.dom = dom;
    return dom;
}

/**
 * 把一个类型为自定义类组件的虚拟DOM转化为一个真实DOM并返回
 * @param {*} vdom 类型为自定义类组件的虚拟DOM
 */
function mountClassComponent(vdom) {
    const { type: Clazz, props } = vdom;
    //获取类的实例
    const classInstance = new Clazz(props);
    //让这个类组件的虚拟DOM的classInstance属性指向这个类组件的实例
+   vdom.classInstance = classInstance;
    //调用生命周期方法componentWillMount
    if (classInstance.componentWillMount) {
        classInstance.componentWillMount();
    }
    //获取虚拟DOM
    const oldRenderVdom = classInstance.render();
    //将虚拟DOM挂载的组件实例上，以便后面DOM-diff时用
+   classInstance.oldRenderVdom = vdom.oldRenderVdom = oldRenderVdom;
    //获取真实DOM
    const dom = createDOM(oldRenderVdom);

    if (classInstance.componentDidMount) {
        dom.componentDidMount = classInstance.componentDidMount;
    }
    //将真实dom挂到实例上上
    classInstance.dom = dom;
    return dom;
}

/**
 * 把一个类型为自定义函数组件的虚拟DOM转换为一个真实DOM并返回
 * @param {*} vdom 类型为自定义函数组件的虚拟DOM
 */
function mountFunctionComponent(vdom) {
    const { type: FunctionComponent, props } = vdom;
    const renderVdom = FunctionComponent(props);
+   vdom.oldRenderVdom = renderVdom;
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
function updateProps(dom, oldProps, props) {
    for (const key in props) {
        if (key === 'children') continue;//单独处理，不再此处处理
        if (key === 'style') {
            const styleObj = props.style;
            for (const attr in styleObj) {
                dom.style[attr] = styleObj[attr];
            }
        } else if (key.startsWith('on')) {//onClick=>onclick
            // dom[key.toLocaleLowerCase()]=props[key];
            addEvent(dom, key.toLocaleLowerCase(), props[key]);
        } else {//在JS中定义class使用的是className，所以不要改
            dom[key] = props[key];
        }
    }
}

/**
 * 对当前组件进行DOM-DIFF
 * @param {*} parentDOM 老得父真实DOM
 * @param {*} oldRenderVdom 老得虚拟DOM
 * @param {*} newRenderVdom 新的虚拟DOM
 * @param {*} nextDom 下一个真实DOM，主要用来插入找位置用
 */
+ export function compareTwoVdom(parentDOM, oldRenderVdom, newRenderVdom, nextDom) {
+   if (!oldRenderVdom && !newRenderVdom) {//新老虚拟DOM都为null
+       return null;
+   } else if (oldRenderVdom && !newRenderVdom) {//新的虚拟DOM为NULL，老得存在
+       const currentDOM = findDOM(oldRenderVdom);//找到此虚拟DOM对应的真实DOM
+       currentDOM && parentDOM.removeChild(currentDOM);//移除此老得真实DOM
+       //调用生命周期方法
+       oldRenderVdom.classInstance && oldRenderVdom.classInstance.componentWillUnmount &&  oldRenderVdom.classInstance.componentWillUnmount()
+   } else if (!oldRenderVdom && newRenderVdom) {//新的虚拟DOM存在，老得虚拟DOM为NULL
+       const newDOM = createDOM(newRenderVdom);//获取真实DOM
+       if (nextDom) {
+           parentDOM.insertBefore(newDOM, nextDom);
+       } else {
+           parentDOM.appendChild(newDOM);
+       }
+   } else if (oldRenderVdom && newRenderVdom && oldRenderVdom.type !== newRenderVdom.type) {//新老虚拟DOM都存在，但是类型不同
+       const oldDOM = findDOM(oldRenderVdom);//老得真实DOM
+       const newDOM = createDOM(newRenderVdom);//新的真实DOM
+       parentDOM.replaceChild(newDOM, oldDOM);
+       //调用生命周期方法
+       oldRenderVdom.classInstance && oldRenderVdom.classInstance.componentWillUnmount && oldRenderVdom.classInstance.componentWillUnmount()
+   } else {//新老都有，类型也一样，要进行深度DOM-DIFF
+       updateElement(oldRenderVdom, newRenderVdom);
+   }
+ }

/**
 * 深度对比两个虚拟DOM
 * @param {*} oldRenderVdom 老得虚拟DOM
 * @param {*} newRenderVdom 新的虚拟DOM
 */
+ function updateElement(oldRenderVdom, newRenderVdom) {
+   if (oldRenderVdom.type === REACT_TEXT) {//文本
+       const currentDOM = newRenderVdom.dom = oldRenderVdom.dom;//复用老得真实DOM节点
+       currentDOM.textContent = newRenderVdom.props.content;//直接修改老的DOM节点的文件就可以了
+   } else if (typeof oldRenderVdom.type === 'string') {//说明是一个原生组件
+       const currentDOM = newRenderVdom.dom = oldRenderVdom.dom;//复用老得真实DOM
+       //先更新属性
+       updateProps(currentDOM, oldRenderVdom.props, newRenderVdom.props);
+       //比较儿子们
+       updateChildren(currentDOM, oldRenderVdom.props.children, newRenderVdom.props.children);
+   } else if (typeof oldRenderVdom.type === 'function') {
+       if (oldRenderVdom.type.isReactComponent) {
+           updateClassComponent(oldRenderVdom, newRenderVdom);//老新都是类组件，进行类组件更新
+       } else {
+           updateFunctionComponent(oldRenderVdom, newRenderVdom);//新老都是函数组件，进行函数组件更新
+       }
+   }
+ }

/**
 *  如果老得虚拟DOM节点和新的虚拟DOM节点都是函数的话，走这个更新逻辑
 * @param {*} oldVdom 老得虚拟DOM
 * @param {*} newVdom 新的虚拟DOM
 */
+ function updateFunctionComponent(oldVdom, newVdom) {
+   const parentDOM = findDOM(oldVdom).parentDOM;//找到老得父节点
+   const { type: FunctionComponent, props } = newVdom;
+   const oldRenderVdom = oldVdom.oldRenderVdom;//老得的渲染虚拟DOM
+   const newRenderVdom = FunctionComponent(props);//新的渲染虚拟DOM
+   compareTwoVdom(parentDOM, oldRenderVdom, newRenderVdom);//比较虚拟DOM
+   newVdom.oldRenderVdom = newRenderVdom;
+ }

/**
 * 如果老得虚拟DOM节点和新的虚拟DOM节点都是类组件的话，走这个更新逻辑
 * @param {*} oldVdom 老得虚拟DOM
 * @param {*} newVdom 新的虚拟DOM
 */
+ function updateClassComponent(oldVdom, newVdom) {
+   const classInstance = newVdom.classInstance = oldVdom.classInstance;//复用老得类的实例
+   newVdom.oldRenderVdom = oldVdom.oldRenderVdom;//上一次类组件的渲染出来的虚拟DOM
+   if (classInstance.componentWillReceiveProps) {//组件将要接受到新的属性
+       classInstance.componentWillReceiveProps();
+   }
+   //触发组件的更新，把新的属性传递过去
+   classInstance.updater.emitUpdate(newVdom.props);
+ }
/**
 * 深度比较孩子们
 * @param {*} parentDOM 父DOM 
 * @param {*} oldChildren 老得儿子们
 * @param {*} newChildren 新的儿子们
 */
+ function updateChildren(parentDOM, oldChildren, newChildren) {
+   //孩子可能是数组或者对象（单节点是对象）
+   oldChildren = Array.isArray(oldChildren) ? oldChildren : [oldChildren];
+   newChildren = Array.isArray(newChildren) ? newChildren : [newChildren];
+   //获取最大的长度
+   const maxLen = Math.max(oldChildren.length, newChildren.length);
+   for (let i = 0; i < maxLen; i++) {
+       //在儿子们里查找，找到索引大于当前索引的
+       const nextDOM = oldChildren.find((item, index) => index > i && item && item.dom)
+       //递归比较孩子
+       compareTwoVdom(parentDOM, oldChildren[i], newChildren[i], nextDOM && nextDOM.dom);
+   }
+ }


/**
 * 查找此虚拟DOM对象的真实DOM
 * @param {*} vdom 
 */
+ export function findDOM(vdom) {
+   const { type } = vdom;
+   let dom;
+   if (typeof type === 'function') {
+       dom = findDOM(vdom.oldRenderVdom)
+   } else {
+       dom = vdom.dom;
+   }
+   return dom
+ }

const ReactDOM = {
    render
}

export default ReactDOM;
```

##### 6.3.5.`src/react.js`

```javascript
  import Component from './Component';
+ import { wrapToVdom } from './utils';
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
+       props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom);
+   } else {
+       props.children = wrapToVdom(children);
    }
    return {
        type,
        props
    }
}

const React = {
    createElement,
    Component
}
export default React;
```

##### 6.3.6.`src/utils.js`

```javascript
+ import { REACT_TEXT } from './constants';

/**
 * 为了后面的DOM-DIFF，我把文本节点进行单独的封装或者说标识
 * 不管你原来是什么，都全部包装成React元素的形式。
 * @param {*} element 可能是一个对象，也可能是一个常量
 */
+ export function wrapToVdom(element){
+   return (typeof element === 'string'||typeof element === 'number')
+   ?{type:REACT_TEXT,props:{content:element}}:element;
+ }
```

### 7.新生命周期

#### 7.1.生命周期图

![生命周期图](http://img.zhufengpeixun.cn/react16.jpg)

#### 7.2.getDerivedStateFromProps

- 是一个静态方法
- 将父组件传递的props映射到当前组件的state上
- 状态是合并不是替换

为什么将getDerivedStateFromProps设计为静态方法

> getDerivedStateFromProps其实是老生命周期componentWillReceiveProps的替换品，因为componentWillReceiveProps里可以点用setState，很可能会让父组件刷新，父组件一旦刷新，就会重新执行componentWillReceiveProps，这样就容易造成死循环。而getDerivedStateFromProps被设计成了静态方法，里面是不能调用setState的，避免出现死循环。同时getDerivedStateFromProps是单利的比实例属性节约资源。

##### 7.2.1.事例

```react
import React from 'react';
import ReactDOM from 'react-dom';

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { num: 0 }
  }

  handlerClick = () => {
    this.setState({ num: this.state.num + 1 });
  }

  render() {
    return (
      <div id={`id-${this.state.num}`}>
        <p>{this.props.name}:{this.state.num}</p>
        <ChildCounter num={this.state.num} />
        <button onClick={this.handlerClick}>加2</button>
      </div>
    )
  }
}

class ChildCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 }
  }

  /**
   * componentWillReceiveProps
   * @param {*} nextProps 
   * @param {*} prevState 
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    const { num } = nextProps;
    if (num % 2 === 0) {//当为2的倍数时，更新状态
      return { number: num * 2 };
    } else if (num % 3 === 0) {//当为3的倍数时，更新状态
      return { number: num * 3 };
    } else {
      return null
    }
  }

  render() {
    return <div>{this.state.number}</div>
  }
}

ReactDOM.render(<Counter name='张三' />, document.getElementById('root'));
```

##### 7.2.2.实现

###### 7.2.2.1.`src/react-dom.js`

```javascript
/*
 * @Author: dfh
 * @Date: 2021-02-24 18:34:32
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 09:31:15
 * @Modified By: dfh
 * @FilePath: /day25-react/src/react-dom.js
 */

import { REACT_TEXT } from './constants';
import { addEvent } from './event';

/**
 * 给跟容器挂载的时候
 * @param {*} vdom 需要渲染的虚拟DOM
 * @param {*} container 容器
 */
function render(vdom, container) {
    const dom = createDOM(vdom);
    //挂载真实DOM
    container.appendChild(dom);
    //调用生命周期方法componentDidMount
    dom.componentDidMount && dom.componentDidMount();
}

/**
 * 创建证实DOM
 * @param {*} vdom 虚拟DOM
 */
export function createDOM(vdom) {
    const {
        type,
        props } = vdom;
    //创建真实DOM
    let dom;
    if (type === REACT_TEXT) {//是文本
        dom = document.createTextNode(props.content);
    } else if (typeof type === 'function') {//自定义函数组件
        if (type.isReactComponent) {//类组件
            return mountClassComponent(vdom);
        } else {//函数组件
            return mountFunctionComponent(vdom);
        }
    } else {//原生组件
        dom = document.createElement(type);
    }

    //使用虚拟DOM的属性更新刚创建出来的真实DOM的属性
    updateProps(dom, {}, props);
    if (typeof props.children === 'object' && props.children.type) {//只有一个儿子，并且是虚拟DOM
        render(props.children, dom);//把儿子变成真实DOM，并且挂载到自己身上
    } else if (Array.isArray(props.children)) {//有多个儿子
        reconcileChildren(props.children, dom);
    }

    //将真实DOM挂载到虚拟DOM上，以便后面取
    vdom.dom = dom;
    return dom;
}

/**
 * 把一个类型为自定义类组件的虚拟DOM转化为一个真实DOM并返回
 * @param {*} vdom 类型为自定义类组件的虚拟DOM
 */
function mountClassComponent(vdom) {
    const { type: Clazz, props } = vdom;
    //获取类的实例
    const classInstance = new Clazz(props);
    //让这个类组件的虚拟DOM的classInstance属性指向这个类组件的实例
    vdom.classInstance = classInstance;
    //调用生命周期方法componentWillMount
    if (classInstance.componentWillMount) {
        classInstance.componentWillMount();
    }
+   //执行生命周期方法getDerivedStateFromProps
+   if (Clazz.getDerivedStateFromProps) {
+       const partialState = Clazz.getDerivedStateFromProps(classInstance.props, classInstance.state)
+       if (partialState) {
+           classInstance.state = { ...classInstance.state, ...partialState };
+       }
+   }
    //获取虚拟DOM
    const oldRenderVdom = classInstance.render();
    //将虚拟DOM挂载的组件实例上，以便后面DOM-diff时用
    classInstance.oldRenderVdom = vdom.oldRenderVdom = oldRenderVdom;
    //获取真实DOM
    const dom = createDOM(oldRenderVdom);

    if (classInstance.componentDidMount) {
        dom.componentDidMount = classInstance.componentDidMount;
    }
    //将真实dom挂到实例上上
    classInstance.dom = dom;
    return dom;
}

/**
 * 把一个类型为自定义函数组件的虚拟DOM转换为一个真实DOM并返回
 * @param {*} vdom 类型为自定义函数组件的虚拟DOM
 */
function mountFunctionComponent(vdom) {
    const { type: FunctionComponent, props } = vdom;
    const renderVdom = FunctionComponent(props);
    vdom.oldRenderVdom = renderVdom;
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
function updateProps(dom, oldProps, props) {
    for (const key in props) {
        if (key === 'children') continue;//单独处理，不再此处处理
        if (key === 'style') {
            const styleObj = props.style;
            for (const attr in styleObj) {
                dom.style[attr] = styleObj[attr];
            }
        } else if (key.startsWith('on')) {//onClick=>onclick
            // dom[key.toLocaleLowerCase()]=props[key];
            addEvent(dom, key.toLocaleLowerCase(), props[key]);
        } else {//在JS中定义class使用的是className，所以不要改
            dom[key] = props[key];
        }
    }
}

/**
 * 对当前组件进行DOM-DIFF
 * @param {*} parentDOM 老得父真实DOM
 * @param {*} oldRenderVdom 老得虚拟DOM
 * @param {*} newRenderVdom 新的虚拟DOM
 * @param {*} nextDom 下一个真实DOM，主要用来插入找位置用
 */
export function compareTwoVdom(parentDOM, oldRenderVdom, newRenderVdom, nextDom) {
    if (!oldRenderVdom && !newRenderVdom) {//新老虚拟DOM都为null
        return null;
    } else if (oldRenderVdom && !newRenderVdom) {//新的虚拟DOM为NULL，老得存在
        const currentDOM = findDOM(oldRenderVdom);//找到此虚拟DOM对应的真实DOM
        currentDOM && parentDOM.removeChild(currentDOM);//移除此老得真实DOM
        //调用生命周期方法
        oldRenderVdom.classInstance && oldRenderVdom.classInstance.componentWillUnmount && oldRenderVdom.classInstance.componentWillUnmount()
    } else if (!oldRenderVdom && newRenderVdom) {//新的虚拟DOM存在，老得虚拟DOM为NULL
        const newDOM = createDOM(newRenderVdom);//获取真实DOM
        if (nextDom) {
            parentDOM.insertBefore(newDOM, nextDom);
        } else {
            parentDOM.appendChild(newDOM);
        }
    } else if (oldRenderVdom && newRenderVdom && oldRenderVdom.type !== newRenderVdom.type) {//新老虚拟DOM都存在，但是类型不同
        const oldDOM = findDOM(oldRenderVdom);//老得真实DOM
        const newDOM = createDOM(newRenderVdom);//新的真实DOM
        parentDOM.replaceChild(newDOM, oldDOM);
        //调用生命周期方法
        oldRenderVdom.classInstance && oldRenderVdom.classInstance.componentWillUnmount && oldRenderVdom.classInstance.componentWillUnmount()
    } else {//新老都有，类型也一样，要进行深度DOM-DIFF
        updateElement(oldRenderVdom, newRenderVdom);
    }
}

/**
 * 深度对比两个虚拟DOM
 * @param {*} oldRenderVdom 老得虚拟DOM
 * @param {*} newRenderVdom 新的虚拟DOM
 */
function updateElement(oldRenderVdom, newRenderVdom) {
    if (oldRenderVdom.type === REACT_TEXT) {//文本
        const currentDOM = newRenderVdom.dom = oldRenderVdom.dom;//复用老得真实DOM节点
        currentDOM.textContent = newRenderVdom.props.content;//直接修改老的DOM节点的文件就可以了
    } else if (typeof oldRenderVdom.type === 'string') {//说明是一个原生组件
        const currentDOM = newRenderVdom.dom = oldRenderVdom.dom;//复用老得真实DOM
        //先更新属性
        updateProps(currentDOM, oldRenderVdom.props, newRenderVdom.props);
        //比较儿子们
        updateChildren(currentDOM, oldRenderVdom.props.children, newRenderVdom.props.children);
    } else if (typeof oldRenderVdom.type === 'function') {
        if (oldRenderVdom.type.isReactComponent) {
            updateClassComponent(oldRenderVdom, newRenderVdom);//老新都是类组件，进行类组件更新
        } else {
            updateFunctionComponent(oldRenderVdom, newRenderVdom);//新老都是函数组件，进行函数组件更新
        }
    }
}

/**
 *  如果老得虚拟DOM节点和新的虚拟DOM节点都是函数的话，走这个更新逻辑
 * @param {*} oldVdom 老得虚拟DOM
 * @param {*} newVdom 新的虚拟DOM
 */
function updateFunctionComponent(oldVdom, newVdom) {
    const parentDOM = findDOM(oldVdom).parentDOM;//找到老得父节点
    const { type: FunctionComponent, props } = newVdom;
    const oldRenderVdom = oldVdom.oldRenderVdom;//老得的渲染虚拟DOM
    const newRenderVdom = FunctionComponent(props);//新的渲染虚拟DOM
    compareTwoVdom(parentDOM, oldRenderVdom, newRenderVdom);//比较虚拟DOM
    newVdom.oldRenderVdom = newRenderVdom;
}

/**
 * 如果老得虚拟DOM节点和新的虚拟DOM节点都是类组件的话，走这个更新逻辑
 * @param {*} oldVdom 老得虚拟DOM
 * @param {*} newVdom 新的虚拟DOM
 */
function updateClassComponent(oldVdom, newVdom) {
    const classInstance = newVdom.classInstance = oldVdom.classInstance;//复用老得类的实例
    newVdom.oldRenderVdom = oldVdom.oldRenderVdom;//上一次类组件的渲染出来的虚拟DOM
    if (classInstance.componentWillReceiveProps) {//组件将要接受到新的属性
        classInstance.componentWillReceiveProps();
    }
    //触发组件的更新，把新的属性传递过去
    classInstance.updater.emitUpdate(newVdom.props);
}
/**
 * 深度比较孩子们
 * @param {*} parentDOM 父DOM 
 * @param {*} oldChildren 老得儿子们
 * @param {*} newChildren 新的儿子们
 */
function updateChildren(parentDOM, oldChildren, newChildren) {
    //孩子可能是数组或者对象（单节点是对象）
    oldChildren = Array.isArray(oldChildren) ? oldChildren : [oldChildren];
    newChildren = Array.isArray(newChildren) ? newChildren : [newChildren];
    //获取最大的长度
    const maxLen = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < maxLen; i++) {
        //在儿子们里查找，找到索引大于当前索引的
        const nextDOM = oldChildren.find((item, index) => index > i && item && item.dom)
        //递归比较孩子
        compareTwoVdom(parentDOM, oldChildren[i], newChildren[i], nextDOM && nextDOM.dom);
    }
}


/**
 * 查找此虚拟DOM对象的真实DOM
 * @param {*} vdom 
 */
export function findDOM(vdom) {
    const { type } = vdom;
    let dom;
    if (typeof type === 'function') {
        dom = findDOM(vdom.oldRenderVdom)
    } else {
        dom = vdom.dom;
    }
    return dom
}

const ReactDOM = {
    render
}

export default ReactDOM;
```

###### 7.2.2.2.`src/Component.js`

```javascript
/*
 * @Author: dfh
 * @Date: 2021-02-24 23:34:42
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 09:21:37
 * @Modified By: dfh
 * @FilePath: /day25-react/src/Component.js
 */
import { compareTwoVdom, findDOM } from './react-dom'

//更新队列
export let updateQueue = {
    isBatchingUpdate: false,//当前是否处于批量更新模式
    updaters: [],
    batchUpdate() {//批量更新
        for (let updater of this.updaters) {
+           updater.updateComponent();
        }
        this.isBatchingUpdate = false;
        this.updaters.length = 0;
    }
}
//更新器
class Updater {
    constructor(classInstance) {
        this.classInstance = classInstance;//类组件的实例
        this.pendingStates = [];//等待生效的状态，可能是一个对象，也可能是一个函数
        this.cbs = [];//存放回调
    }

    /**
     * 
     * @param {*} partialState 等待更新生效的状态
     * @param {*} cb 状态更新的回调
     */
    addState(partialState, cb) {
        this.pendingStates.push(partialState);
        typeof cb === 'function' && this.cbs.push(cb);
        this.emitUpdate();
    }

    //一个组件不管属性变了，还是状态变了，都会更新
    emitUpdate(nextProps) {
        this.nextProps = nextProps;//缓存起来
        if (updateQueue.isBatchingUpdate) {//当前处于批量更新模式，先缓存updater
            updateQueue.updaters.push(this);//本次setState调用结束
        } else {//当前处于非批量更新模式，执行更新
+           this.updateComponent();//直接更新组件
        }
    }

+   updateComponent() {
        const { classInstance, pendingStates, cbs, nextProps } = this;
        if (nextProps || pendingStates.length > 0) {//有setState
+           shouldUpdate(classInstance, nextProps, this.getState(nextProps))
        }
    }

+   getState(nextProps) {//计算新状态
        const { classInstance, pendingStates } = this;
        let { state } = classInstance;//获取老状态
        pendingStates.forEach(newState => {
            //newState可能是对象，也可能是函数,对象setState的两种方式
            if (typeof newState === 'function') {
                newState = newState(state);
            }
            state = { ...state, ...newState };
        })
        pendingStates.length = 0;//清空数组
+       //执行生命周期方法
+       if (classInstance.constructor.getDerivedStateFromProps) {
+           const partialState = classInstance.constructor.getDerivedStateFromProps(nextProps, classInstance.state)
+           if (partialState) {//状态合并
+               state = { ...state, ...partialState };
+           }
+       }
        return state;
    }
}

/**
 * 判断组件是否需要更新
 * @param {*} classInstance 类组件实例
 * @param {*} nextProps 新的props
 * @param {*} newState 新状态
 */
function shouldUpdate(classInstance, nextProps, newState) {
    let willUpdate = true;//是否需要更新
    //如果有这个方法，并且这个方法的返回值为false，则不需要继续向下更新了，否则就更新
    if (classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(nextProps, newState)) {
        willUpdate = false;
    }
    //如果需要更新，并且组件调用类componentWillUpdate方法
    if (willUpdate && classInstance.componentWillUpdate) {
        classInstance.componentWillUpdate();//执行生命周期方法componentWillUpdate
    }
    //不管是否需要更新，属性和状态都有改变
    if (nextProps) {
        classInstance.props = nextProps;
    }

    //不管组件要不要更新，组件的state一定会改变
    classInstance.state = newState;
    //如果需要更新，走组件的更新逻辑
+   willUpdate && classInstance.updateComponent()
}
class Component {
    //用来判断是类组件
    static isReactComponent = true;
    constructor(props) {
        this.props = props;
        this.state = {};
        //每个类组件都有一个更新器
        this.updater = new Updater(this);
    }

    setState(partialState, cb) {
        this.updater.addState(partialState, cb);
    }

    /**
     * 强制更新：一般来说组件的属性或者状态没有改变时组件时不更新的，如果我们还想更新组件可以调用此方法更新组件
     */
+   forceUpdate() {
+       let nextState = this.state;
+       let nextProps = this.props;
+       if (this.constructor.getDerivedStateFromProps) {
+           const partialState = this.constructor.getDerivedStateFromProps(nextProps, nextState);
+           if(partialState){
+               nextState={...nextState,partialState}
+           }
+       }
+       this.state=nextState;
+       this.updateComponent();
+   }

    /**
     * 更新组件
     */
+   updateComponent() {
        const newRenderVdom = this.render();//新的虚拟DOM
        const oldRenderVdom = this.oldRenderVdom;//老得虚拟DOM
        const dom = findDOM(oldRenderVdom);//老得真实DOM
        compareTwoVdom(dom.parentNode, oldRenderVdom, newRenderVdom);
        this.oldRenderVdom = newRenderVdom;//比较完毕后，重新赋值老的虚拟节点
        //调用生命周期方法componentDidUpdate
        this.componentDidUpdate && this.componentDidUpdate();
    }
}

export default Component;
```

#### 7.3.getSnapshotBeforeUpdate

> `getSnapshotBeforeUpdate`被调用与`render`之后，可以读取但是无法使用DOM的时候，它可以在组件可能更改之前从DOM捕获一些信息(例如：滚动位置...)，此生命周期返回的任何值都将作为参数传递给`componentDidUpdate`

##### 7.3.1.事例

```react
/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 11:34:06
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from 'react';
import ReactDOM from 'react-dom';

class Counter extends React.Component {
  ulRef = React.createRef();//{current:null}
  constructor(props) {
    super(props)
    this.state = { list: [] }
  }

  getSnapshotBeforeUpdate() {
    return this.ulRef.current.scrollHeight;
  }

  /**
   * 
   * @param {*} prevProps 老得props
   * @param {*} prevState 老得state
   * @param {*} scrollHeight getSnapshotBeforeUpdate传递的值
   */
  componentDidUpdate(prevProps, prevState, scrollHeight) {
    console.log('本次新增的高度:', this.ulRef.current.scrollHeight - scrollHeight)
  }

  handlerClick = () => {
    const list = this.state.list;
    list.push(list.length);
    this.setState({ list });
  }

  render() {
    return (
      <div id={`id-${this.state.num}`}>
        <button onClick={this.handlerClick}>+</button>
        <ul ref={this.ulRef}>
          {this.state.list.map((item, index) => <li key={index}>{index}</li>)}
        </ul>
      </div>
    )
  }
}


ReactDOM.render(<Counter name='张三' />, document.getElementById('root'));
```



##### 7.3.2.实现

###### 7.3.2.1.`src/react.js`

```javascript
/*
 * @Author: dfh
 * @Date: 2021-02-24 18:34:24
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 11:30:06
 * @Modified By: dfh
 * @FilePath: /day25-react/src/react.js
 */
import Component from './Component';
import { wrapToVdom } from './utils';
/**
 * 
 * @param {*} type 元素类型
 * @param {*} config 配置对象
 * @param {*} children 孩子或者孩子门
 */
function createElement(type, config, children) {
+   let ref, key;
    if (config) {
        delete config._source;
        delete config._self;
+       ref = config.ref;
+       key = config.key;
+       delete config.ref;
+       delete config.key;
    }
    let props = { ...config };

    if (arguments.length > 3) {//children是一个数组
        props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom);
    } else {
        props.children = wrapToVdom(children);
    }
    return {
        type,
        props,
+       ref,
+       key
    }
}

+ function createRef() {
+   return { current: null }
+ }
const React = {
    createElement,
    Component,
+   createRef
}
export default React;
```

###### 7.3.2.2.`src/react-dom.js`

```javascript
/*
 * @Author: dfh
 * @Date: 2021-02-24 18:34:32
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 11:32:14
 * @Modified By: dfh
 * @FilePath: /day25-react/src/react-dom.js
 */

import { REACT_TEXT } from './constants';
import { addEvent } from './event';

/**
 * 给跟容器挂载的时候
 * @param {*} vdom 需要渲染的虚拟DOM
 * @param {*} container 容器
 */
function render(vdom, container) {
    const dom = createDOM(vdom);
    //挂载真实DOM
    container.appendChild(dom);
    //调用生命周期方法componentDidMount
    dom.componentDidMount && dom.componentDidMount();
}

/**
 * 创建证实DOM
 * @param {*} vdom 虚拟DOM
 */
export function createDOM(vdom) {
    const {
        type,
        props,
+       key,
+       ref
    } = vdom;
    //创建真实DOM
    let dom;
    if (type === REACT_TEXT) {//是文本
        dom = document.createTextNode(props.content);
    } else if (typeof type === 'function') {//自定义函数组件
        if (type.isReactComponent) {//类组件
            return mountClassComponent(vdom);
        } else {//函数组件
            return mountFunctionComponent(vdom);
        }
    } else {//原生组件
        dom = document.createElement(type);
    }

    //使用虚拟DOM的属性更新刚创建出来的真实DOM的属性
    updateProps(dom, {}, props);
    if (typeof props.children === 'object' && props.children.type) {//只有一个儿子，并且是虚拟DOM
        render(props.children, dom);//把儿子变成真实DOM，并且挂载到自己身上
    } else if (Array.isArray(props.children)) {//有多个儿子
        reconcileChildren(props.children, dom);
    }

    //将真实DOM挂载到虚拟DOM上，以便后面取
    vdom.dom = dom;
    //通过虚拟DOM创建真实DOM之后,虚拟DOM的ref属性的current属性等于真实DOM
+   ref && (ref.current = dom);
    return dom;
}

/**
 * 把一个类型为自定义类组件的虚拟DOM转化为一个真实DOM并返回
 * @param {*} vdom 类型为自定义类组件的虚拟DOM
 */
function mountClassComponent(vdom) {
    const { type: Clazz, props } = vdom;
    //获取类的实例
    const classInstance = new Clazz(props);
    //让这个类组件的虚拟DOM的classInstance属性指向这个类组件的实例
    vdom.classInstance = classInstance;
    //调用生命周期方法componentWillMount
    if (classInstance.componentWillMount) {
        classInstance.componentWillMount();
    }
    //执行生命周期方法getDerivedStateFromProps
    if (Clazz.getDerivedStateFromProps) {
        const partialState = Clazz.getDerivedStateFromProps(classInstance.props, classInstance.state)
        if (partialState) {
            classInstance.state = { ...classInstance.state, ...partialState };
        }
    }
    //获取虚拟DOM
    const oldRenderVdom = classInstance.render();
    //将虚拟DOM挂载的组件实例上，以便后面DOM-diff时用
    classInstance.oldRenderVdom = vdom.oldRenderVdom = oldRenderVdom;
    //获取真实DOM
    const dom = createDOM(oldRenderVdom);

    if (classInstance.componentDidMount) {
        dom.componentDidMount = classInstance.componentDidMount;
    }
    //将真实dom挂到实例上上
    classInstance.dom = dom;

    return dom;
}

/**
 * 把一个类型为自定义函数组件的虚拟DOM转换为一个真实DOM并返回
 * @param {*} vdom 类型为自定义函数组件的虚拟DOM
 */
function mountFunctionComponent(vdom) {
    const { type: FunctionComponent, props } = vdom;
    const renderVdom = FunctionComponent(props);
    vdom.oldRenderVdom = renderVdom;
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
function updateProps(dom, oldProps, props) {
    for (const key in props) {
        if (key === 'children') continue;//单独处理，不再此处处理
        if (key === 'style') {
            const styleObj = props.style;
            for (const attr in styleObj) {
                dom.style[attr] = styleObj[attr];
            }
        } else if (key.startsWith('on')) {//onClick=>onclick
            // dom[key.toLocaleLowerCase()]=props[key];
            addEvent(dom, key.toLocaleLowerCase(), props[key]);
        } else {//在JS中定义class使用的是className，所以不要改
            dom[key] = props[key];
        }
    }
}

/**
 * 对当前组件进行DOM-DIFF
 * @param {*} parentDOM 老得父真实DOM
 * @param {*} oldRenderVdom 老得虚拟DOM
 * @param {*} newRenderVdom 新的虚拟DOM
 * @param {*} nextDom 下一个真实DOM，主要用来插入找位置用
 */
export function compareTwoVdom(parentDOM, oldRenderVdom, newRenderVdom, nextDom) {
    if (!oldRenderVdom && !newRenderVdom) {//新老虚拟DOM都为null
        return null;
    } else if (oldRenderVdom && !newRenderVdom) {//新的虚拟DOM为NULL，老得存在
        const currentDOM = findDOM(oldRenderVdom);//找到此虚拟DOM对应的真实DOM
        currentDOM && parentDOM.removeChild(currentDOM);//移除此老得真实DOM
        //调用生命周期方法
        oldRenderVdom.classInstance && oldRenderVdom.classInstance.componentWillUnmount && oldRenderVdom.classInstance.componentWillUnmount()
    } else if (!oldRenderVdom && newRenderVdom) {//新的虚拟DOM存在，老得虚拟DOM为NULL
        const newDOM = createDOM(newRenderVdom);//获取真实DOM
        if (nextDom) {
            parentDOM.insertBefore(newDOM, nextDom);
        } else {
            parentDOM.appendChild(newDOM);
        }
    } else if (oldRenderVdom && newRenderVdom && oldRenderVdom.type !== newRenderVdom.type) {//新老虚拟DOM都存在，但是类型不同
        const oldDOM = findDOM(oldRenderVdom);//老得真实DOM
        const newDOM = createDOM(newRenderVdom);//新的真实DOM
        parentDOM.replaceChild(newDOM, oldDOM);
        //调用生命周期方法
        oldRenderVdom.classInstance && oldRenderVdom.classInstance.componentWillUnmount && oldRenderVdom.classInstance.componentWillUnmount()
    } else {//新老都有，类型也一样，要进行深度DOM-DIFF
        updateElement(oldRenderVdom, newRenderVdom);
    }
}

/**
 * 深度对比两个虚拟DOM
 * @param {*} oldRenderVdom 老得虚拟DOM
 * @param {*} newRenderVdom 新的虚拟DOM
 */
function updateElement(oldRenderVdom, newRenderVdom) {
    if (oldRenderVdom.type === REACT_TEXT) {//文本
        const currentDOM = newRenderVdom.dom = oldRenderVdom.dom;//复用老得真实DOM节点
        currentDOM.textContent = newRenderVdom.props.content;//直接修改老的DOM节点的文件就可以了
    } else if (typeof oldRenderVdom.type === 'string') {//说明是一个原生组件
        const currentDOM = newRenderVdom.dom = oldRenderVdom.dom;//复用老得真实DOM
        //先更新属性
        updateProps(currentDOM, oldRenderVdom.props, newRenderVdom.props);
        //比较儿子们
        updateChildren(currentDOM, oldRenderVdom.props.children, newRenderVdom.props.children);
    } else if (typeof oldRenderVdom.type === 'function') {
        if (oldRenderVdom.type.isReactComponent) {
            updateClassComponent(oldRenderVdom, newRenderVdom);//老新都是类组件，进行类组件更新
        } else {
            updateFunctionComponent(oldRenderVdom, newRenderVdom);//新老都是函数组件，进行函数组件更新
        }
    }
}

/**
 *  如果老得虚拟DOM节点和新的虚拟DOM节点都是函数的话，走这个更新逻辑
 * @param {*} oldVdom 老得虚拟DOM
 * @param {*} newVdom 新的虚拟DOM
 */
function updateFunctionComponent(oldVdom, newVdom) {
    const parentDOM = findDOM(oldVdom).parentDOM;//找到老得父节点
    const { type: FunctionComponent, props } = newVdom;
    const oldRenderVdom = oldVdom.oldRenderVdom;//老得的渲染虚拟DOM
    const newRenderVdom = FunctionComponent(props);//新的渲染虚拟DOM
    compareTwoVdom(parentDOM, oldRenderVdom, newRenderVdom);//比较虚拟DOM
    newVdom.oldRenderVdom = newRenderVdom;
}

/**
 * 如果老得虚拟DOM节点和新的虚拟DOM节点都是类组件的话，走这个更新逻辑
 * @param {*} oldVdom 老得虚拟DOM
 * @param {*} newVdom 新的虚拟DOM
 */
function updateClassComponent(oldVdom, newVdom) {
    const classInstance = newVdom.classInstance = oldVdom.classInstance;//复用老得类的实例
    newVdom.oldRenderVdom = oldVdom.oldRenderVdom;//上一次类组件的渲染出来的虚拟DOM
    if (classInstance.componentWillReceiveProps) {//组件将要接受到新的属性
        classInstance.componentWillReceiveProps();
    }
    //触发组件的更新，把新的属性传递过去
    classInstance.updater.emitUpdate(newVdom.props);
}
/**
 * 深度比较孩子们
 * @param {*} parentDOM 父DOM 
 * @param {*} oldChildren 老得儿子们
 * @param {*} newChildren 新的儿子们
 */
function updateChildren(parentDOM, oldChildren, newChildren) {
    //孩子可能是数组或者对象（单节点是对象）
    oldChildren = Array.isArray(oldChildren) ? oldChildren : [oldChildren];
    newChildren = Array.isArray(newChildren) ? newChildren : [newChildren];
    //获取最大的长度
    const maxLen = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < maxLen; i++) {
        //在儿子们里查找，找到索引大于当前索引的
        const nextDOM = oldChildren.find((item, index) => index > i && item && item.dom)
        //递归比较孩子
        compareTwoVdom(parentDOM, oldChildren[i], newChildren[i], nextDOM && nextDOM.dom);
    }
}


/**
 * 查找此虚拟DOM对象的真实DOM
 * @param {*} vdom 
 */
export function findDOM(vdom) {
    const { type } = vdom;
    let dom;
    if (typeof type === 'function') {
        dom = findDOM(vdom.oldRenderVdom)
    } else {
        dom = vdom.dom;
    }
    return dom
}

const ReactDOM = {
    render
}

export default ReactDOM;
```

###### 7.3.2.3.`src/Component.js`

```javascript
/*
 * @Author: dfh
 * @Date: 2021-02-24 23:34:42
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 11:34:22
 * @Modified By: dfh
 * @FilePath: /day25-react/src/Component.js
 */
import { compareTwoVdom, findDOM } from './react-dom'

//更新队列
export let updateQueue = {
    isBatchingUpdate: false,//当前是否处于批量更新模式
    updaters: [],
    batchUpdate() {//批量更新
        for (let updater of this.updaters) {
            updater.updateComponent();
        }
        this.isBatchingUpdate = false;
        this.updaters.length = 0;
    }
}
//更新器
class Updater {
    constructor(classInstance) {
        this.classInstance = classInstance;//类组件的实例
        this.pendingStates = [];//等待生效的状态，可能是一个对象，也可能是一个函数
        this.cbs = [];//存放回调
    }

    /**
     * 
     * @param {*} partialState 等待更新生效的状态
     * @param {*} cb 状态更新的回调
     */
    addState(partialState, cb) {
        this.pendingStates.push(partialState);
        typeof cb === 'function' && this.cbs.push(cb);
        this.emitUpdate();
    }

    //一个组件不管属性变了，还是状态变了，都会更新
    emitUpdate(nextProps) {
        this.nextProps = nextProps;//缓存起来
        if (updateQueue.isBatchingUpdate) {//当前处于批量更新模式，先缓存updater
            updateQueue.updaters.push(this);//本次setState调用结束
        } else {//当前处于非批量更新模式，执行更新
            this.updateComponent();//直接更新组件
        }
    }

    updateComponent() {
        const { classInstance, pendingStates, cbs, nextProps } = this;
        if (nextProps || pendingStates.length > 0) {//有setState
            shouldUpdate(classInstance, nextProps, this.getState(nextProps))
        }
    }

    getState(nextProps) {//计算新状态
        const { classInstance, pendingStates } = this;
        let { state } = classInstance;//获取老状态
        pendingStates.forEach(newState => {
            //newState可能是对象，也可能是函数,对象setState的两种方式
            if (typeof newState === 'function') {
                newState = newState(state);
            }
            state = { ...state, ...newState };
        })
        pendingStates.length = 0;//清空数组
        if (classInstance.constructor.getDerivedStateFromProps) {
            const partialState = classInstance.constructor.getDerivedStateFromProps(nextProps, classInstance.state)
            if (partialState) {//状态合并
                state = { ...state, ...partialState };
            }
        }
        return state;
    }
}

/**
 * 判断组件是否需要更新
 * @param {*} classInstance 类组件实例
 * @param {*} nextProps 新的props
 * @param {*} newState 新状态
 */
function shouldUpdate(classInstance, nextProps, newState) {
    let willUpdate = true;//是否需要更新
    //如果有这个方法，并且这个方法的返回值为false，则不需要继续向下更新了，否则就更新
    if (classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(nextProps, newState)) {
        willUpdate = false;
    }
    //如果需要更新，并且组件调用类componentWillUpdate方法
    if (willUpdate && classInstance.componentWillUpdate) {
        classInstance.componentWillUpdate();//执行生命周期方法componentWillUpdate
    }
    //不管是否需要更新，属性和状态都有改变
    if (nextProps) {
        classInstance.props = nextProps;
    }

    //不管组件要不要更新，组件的state一定会改变
    classInstance.state = newState;
    //如果需要更新，走组件的更新逻辑
    willUpdate && classInstance.updateComponent()
}
class Component {
    //用来判断是类组件
    static isReactComponent = true;
    constructor(props) {
        this.props = props;
        this.state = {};
        //每个类组件都有一个更新器
        this.updater = new Updater(this);
    }

    setState(partialState, cb) {
        this.updater.addState(partialState, cb);
    }

    /**
     * 强制更新：一般来说组件的属性或者状态没有改变时组件时不更新的，如果我们还想更新组件可以调用此方法更新组件
     */
    forceUpdate() {
        let nextState = this.state;
        let nextProps = this.props;
        if (this.constructor.getDerivedStateFromProps) {
            const partialState = this.constructor.getDerivedStateFromProps(nextProps, nextState);
            if (partialState) {
                nextState = { ...nextState, partialState }
            }
        }
        this.state = nextState;
        this.updateComponent();
    }

    /**
     * 更新组件
     */
    updateComponent() {
        const newRenderVdom = this.render();//新的虚拟DOM
        const oldRenderVdom = this.oldRenderVdom;//老得虚拟DOM
        const dom = findDOM(oldRenderVdom);//老得真实DOM
+       const extraArgs = this.getSnapshotBeforeUpdate && this.getSnapshotBeforeUpdate();
        compareTwoVdom(dom.parentNode, oldRenderVdom, newRenderVdom);
        this.oldRenderVdom = newRenderVdom;//比较完毕后，重新赋值老的虚拟节点
        //调用生命周期方法componentDidUpdate
+       this.componentDidUpdate && this.componentDidUpdate(this.props, this.state, extraArgs);
    }
}

export default Component;
```

### 8.context

#### 8.1.事例

```javascript
/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 13:25:37
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from 'react';
import ReactDOM from 'react-dom';
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
```

#### 8.2.实现

##### 8.2.1.`src/react.js`

```javascript

```





