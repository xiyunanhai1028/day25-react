/*
 * @Author: dfh
 * @Date: 2021-02-24 18:34:24
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 13:33:21
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
    let ref, key;
    if (config) {
        delete config._source;
        delete config._self;
        ref = config.ref;
        key = config.key;
        delete config.ref;
        delete config.key;
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
        ref,
        key
    }
}

function createRef() {
    return { current: null }
}

function createContext(initialValue) {
    Provider._value = initialValue;
    function Provider(props) {
        const { value } = props;
        if (Provider._value) {
            Object.assign(Provider._value, value)
        } else {
            Provider._value = value;
        }
        return props.children;
    }
    function Consumer(props) {
        return props.children(Provider._value);
    }
    return { Provider, Consumer };
}
const React = {
    createElement,
    Component,
    createRef,
    createContext
}
export default React;