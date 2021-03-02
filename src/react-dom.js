/*
 * @Author: dfh
 * @Date: 2021-02-24 18:34:32
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 22:36:43
 * @Modified By: dfh
 * @FilePath: /day25-react/src/react-dom.js
 */

import { REACT_TEXT } from './constants';
import { addEvent } from './event';

//这是一个数组，用来存放所有的Hook状态,原版代码里hookState每个组件有自己的通过Fiber来实现的
let hookStates = [];
//hook索引，表示当前的hook
let hookIndex = 0;
//调度更新
let scheduleUpdate;
/**
 * 给跟容器挂载的时候
 * @param {*} vdom 需要渲染的虚拟DOM
 * @param {*} container 容器
 */
function render(vdom, container) {
    mount(vdom, container);
    scheduleUpdate = () => {
        hookIndex = 0;//在状态修改后，调度更新的时候，索引重置为0
        compareTwoVdom(container, vdom, vdom);
    }
}

function mount(vdom, container) {
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
        key,
        ref
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
        mount(props.children, dom);//把儿子变成真实DOM，并且挂载到自己身上
    } else if (Array.isArray(props.children)) {//有多个儿子
        reconcileChildren(props.children, dom);
    }

    //将真实DOM挂载到虚拟DOM上，以便后面取
    vdom.dom = dom;
    //通过虚拟DOM创建真实DOM之后,虚拟DOM的ref属性的current属性等于真实DOM
    ref && (ref.current = dom);
    return dom;
}

/**
 * 把一个类型为自定义类组件的虚拟DOM转化为一个真实DOM并返回
 * @param {*} vdom 类型为自定义类组件的虚拟DOM
 */
function mountClassComponent(vdom) {
    const { type: Clazz, props, ref } = vdom;
    //获取类的实例
    const classInstance = new Clazz(props);
    
    if (ref) {//如果虚拟DOM上有ref，那么将ref赋值到事例上
        classInstance.ref = ref;
    }
    if (Clazz.contextType) {
        classInstance.context = Clazz.contextType._currentValue;
    }
    //让这个类组件的虚拟DOM的classInstance属性指向这个类组件的实例
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
        mount(child, parentDOM);//把儿子挂载的自己身上
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
        //调用生命周期方法componentDidMount
        // newDOM.classInstance.componentDidMount && newDOM.classInstance.componentDidMount();
    } else if (oldRenderVdom && newRenderVdom && oldRenderVdom.type !== newRenderVdom.type) {//新老虚拟DOM都存在，但是类型不同
        const oldDOM = findDOM(oldRenderVdom);//老得真实DOM
        const newDOM = createDOM(newRenderVdom);//新的真实DOM
        parentDOM.replaceChild(newDOM, oldDOM);
        //调用生命周期方法
        oldRenderVdom.classInstance && oldRenderVdom.classInstance.componentWillUnmount && oldRenderVdom.classInstance.componentWillUnmount()
        //调用生命周期方法componentDidMount
        // newDOM.classInstance.componentDidMount && newDOM.classInstance.componentDidMount();
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
    const parentDOM = findDOM(oldVdom).parentNode;//找到老得父节点
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

export function useContext(context) {
    return context._currentValue;
}

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

export function useLayoutEffect(callback, deps) {
    if (hookStates[hookIndex]) {
        const [oldDestroyFunction, oldDeps] = hookStates[hookIndex];
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

export function useImperativeHandle(ref,factory){
    ref.current=factory();
}

const ReactDOM = {
    render
}

export default ReactDOM;