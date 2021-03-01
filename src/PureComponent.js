/*
 * @Author: dfh
 * @Date: 2021-03-01 19:49:40
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-01 22:28:52
 * @Modified By: dfh
 * @FilePath: /day25-react/src/PureComponent.js
 */
import Component from './Component';

class PureComponent extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        const value=!shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState)
        console.log(value)
        return value;
    }
}

/**
 * 用浅比较比较obj1和obj2是否相等
 * 只要内存地址一样，就认为相等，不一样就不相等
 * @param {*} obj1 
 * @param {*} obj2 
 */
function shallowEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;
    const key1 = Object.keys(obj1);
    const key2 = Object.keys(obj2);
    if (key1.length !== key2.length) return false;
    for (let key of key1) {
        if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) return false;
    }
    return true;
}

export default PureComponent;