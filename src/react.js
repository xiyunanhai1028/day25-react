/*
 * @Author: dfh
 * @Date: 2021-02-24 18:34:24
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-02 17:18:16
 * @Modified By: dfh
 * @FilePath: /day25-react/src/react.js
 */
import Component from './Component';
import PureComponent from './PureComponent';
import { wrapToVdom } from './utils';
import { useState, useCallback, useMemo, useReducer,useContext,useEffect } from './react-dom';
/**
 * 
 * @param {*} type 元素类型
 * @param {*} config 配置对象
 * @param {*} children 孩子或者孩子门
 */
function createElement(type, config, children) {
    let ref, key;
    if (config) {
        delete config.__source;
        delete config.__self;
        ref = config.ref;
        delete config.ref;
        key = config.key;
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

function cloneElement(oldElement, newProps, ...newChildren) {
    let children = oldElement.props.children;
    //children可能是undefined,对象，数组
    if (children) {
        if (!Array.isArray(children)) {//是一个对象
            children = [children]
        }
    } else {//undefined
        children = [];
    }
    children.push(...newChildren);
    children = children.map(wrapToVdom);
    if (children.length === 0) {
        children = undefined;
    } else if (children.length === 1) {
        children = children[0];
    }
    newProps.children = children;
    const props = { ...oldElement.props, ...newProps };
    return { ...oldElement, props };
}

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
    createElement,
    Component,
    PureComponent,
    createRef,
    createContext,
    cloneElement,
    useState,
    useCallback,
    useMemo,
    memo,
    useReducer,
    useContext,
    useEffect
}
export default React;