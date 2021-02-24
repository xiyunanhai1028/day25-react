<!--
 * @Author: dfh
 * @Date: 2021-02-24 18:16:54
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-24 22:27:48
 * @Modified By: dfh
 * @FilePath: /day25-react/README.md
-->

## react源码分析

### 1. JSX转化过程

> JSX代码经过babel转化成React.createElement，createElement执行后转化为了虚拟DOM，再经过render函数将虚拟DOM变为真实DOM，挂载到容器上

#### 1.1. 实例代码

``` js
import React from 'react';
import ReactDOM from 'react-dom';

let element = ( <
    div id = 'title'
    style = {
        {
            color: 'red',
            background: 'green'
        }
    } >
    <
    span > hello < /span>
    world <
    /div>
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

### 2.1 `src/index.js`

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

### 2.2 `src/react`

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

### 2.3 `src/react-dom`

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

### 3.1. 函数组件实现

#### 3.1.1 `src/index.js`

``` js
import React from './react';
import ReactDOM from './react-dom';
/**
 * 1.组件名称必须以大写字母开头
 * 2.组件必须在使用前先定义
 * 3.组件的返回值只能有一个根元素
 */
function FunctionComponent(props) {
    return ( <
            div className = 'title'
            style = {
                {
                    background: 'green',
                    color: 'red'
                }
            } >
            <
            span > {
                props.name
            } < /span> {
            props.children
        } <
        /div>
)
}

ReactDOM.render( < FunctionComponent name = '张三' >
    <
    spam > , 你好 < /spam> < /
    FunctionComponent > , document.getElementById('root'));
```

#### 3.1.2. 经过babel转译

``` js
function FunctionComponent(props) {
    return ( <
            div className = 'title'
            style = {
                {
                    background: 'green',
                    color: 'red'
                }
            } >
            <
            span > {
                props.name
            } < /span> {
            props.children
        } <
        /div>
)
}

ReactDOM.render( < FunctionComponent name = '张三' >
    <
    spam > , 你好 < /spam> < /
    FunctionComponent > , document.getElementById('root'));
```

### 3.1.3. `react-dom` 修改

* createDOM方法修改

``` js
//创建真实DOM
let dom;
if (typeof type === 'function') { //自定义函数组件
    return mountFunctionComponent(vdom);
} else { //原生组件
    dom = document.createElement(type);
}
```

* 新增mountFunctionComponent方法

``` js
/**
 * 把一个类型为自定义函数组件的虚拟DOM转换为一个真实DOM并返回
 * @param {*} vdom 类型为自定义函数组件的虚拟DOM
 */
function mountFunctionComponent(vdom) {
    const {
        type: FunctionComponent,
        props
    } = vdom;
    const renderVdom = FunctionComponent(props);
    return createDOM(renderVdom);
}
```
