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
    updateQueue.isBatchingUpdate = false;
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