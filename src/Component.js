/*
 * @Author: dfh
 * @Date: 2021-02-24 23:34:42
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-24 23:52:46
 * @Modified By: dfh
 * @FilePath: /day25-react/src/Component.js
 */
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
        mountClassComponent(this, newVdom);
    }
}

/**
 * 用新的真实dom替换老得真实DOM
 * @param {*} classInstance 类组件实例
 * @param {*} newVdom 新的虚拟DOM
 */
function mountClassComponent(classInstance, newVdom) {
    const newDOM = createDOM(newVdom);
    const oldDOM = classInstance.dom;
    oldDOM.parentNode.replaceChild(newDOM, oldDOM);
    classInstance.dom = newDOM;
}
export default Component;