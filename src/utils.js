/*
 * @Author: dfh
 * @Date: 2021-02-28 02:20:30
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-28 03:16:46
 * @Modified By: dfh
 * @FilePath: /day25-react/src/utils.js
 */
import { REACT_TEXT } from './constants';

/**
 * 为了后面的DOM-DIFF，我把文本节点进行单独的封装或者说标识
 * 不管你原来是什么，都全部包装成React元素的形式。
 * @param {*} element 可能是一个对象，也可能是一个常量
 */
export function wrapToVdom(element){
    return (typeof element === 'string'||typeof element === 'number')
    ?{type:REACT_TEXT,props:{content:element}}:element;
}