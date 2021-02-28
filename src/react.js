/*
 * @Author: dfh
 * @Date: 2021-02-24 18:34:24
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-28 16:22:11
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
    if (config) {
        delete config._source;
        delete config._self;
    }
    let props = { ...config };

    if (arguments.length > 3) {//children是一个数组
        props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom);
    } else {
        props.children = wrapToVdom(children);
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