/*
 * @Author: dfh
 * @Date: 2021-02-24 18:34:32
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-24 23:50:13
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
            dom[key.toLocaleLowerCase()]=props[key];
        }else {//在JS中定义class使用的是className，所以不要改
            dom[key] = props[key];
        }
    }
}

const ReactDOM = {
    render
}

export default ReactDOM;