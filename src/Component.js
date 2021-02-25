/*
 * @Author: dfh
 * @Date: 2021-02-24 23:34:42
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-25 15:53:51
 * @Modified By: dfh
 * @FilePath: /day25-react/src/Component.js
 */
import { createDOM } from './react-dom'

//更新队列
export let updateQueue = {
    isBatchingUpdate: false,//当前是否处于批量更新模式
    updaters: new Set(),
    batchUpdate(){//批量更新
        for(let updater of this.updaters){
            updater.updateClassComponent();
        }
        this.isBatchingUpdate=false;
    }
}
//更新器
class Updater {
    constructor(classInstance) {
        this.classInstance = classInstance;//类组件的实例
        this.pendingStates = [];//等待生效的状态，可能是一个对象，也可能是一个函数
        this.cbs = [];//存放回调
    }

    /**
     * 
     * @param {*} partialState 等待更新生效的状态
     * @param {*} cb 状态更新的回调
     */
    addState(partialState, cb) {
        this.pendingStates.push(partialState);
        typeof cb === 'function' && this.cbs.push(cb);
        if (updateQueue.isBatchingUpdate) {//当前处于批量更新模式，先缓存updater
            updateQueue.updaters.add(this);//本次setState调用结束
        } else {//当前处于非批量更新模式，执行更新
            this.updateClassComponent();//直接更新组件
        }
    }

    updateClassComponent() {
        const { classInstance, pendingStates, cbs } = this;
        if (pendingStates.length > 0) {//有setState
            classInstance.state = this.getState();//计算新状态
            classInstance.forceUpdate();
            cbs.forEach(cb=>cb());
            cbs.length=0;
        }
    }

    getState() {//计算新状态
        const { classInstance, pendingStates } = this;
        let { state } = classInstance;//获取老状态
        pendingStates.forEach(newState => {
            //newState可能是对象，也可能是函数,对象setState的两种方式
            if (typeof newState === 'function') {
                newState = newState(state);
            }
            state = { ...state, ...newState };
        })
        pendingStates.length = 0;//清空数组
        return state;
    }
}
class Component {
    //用来判断是类组件
    static isReactComponent = true;
    constructor(props) {
        this.props = props;
        this.state = {};
        //每个类组件都有一个更新器
        this.updater = new Updater(this);
    }

    setState(partialState, cb) {
        this.updater.addState(partialState, cb);
        // const { state } = this;
        // this.state = { ...state, ...partialState };
        // const newVdom = this.render();
        // mountClassComponent(this, newVdom);
    }

    forceUpdate() {
        const newVdom = this.render();
        updateClassComponent(this, newVdom);
    }
}

/**
 * 用新的真实dom替换老得真实DOM
 * @param {*} classInstance 类组件实例
 * @param {*} newVdom 新的虚拟DOM
 */
function updateClassComponent(classInstance, newVdom) {
    const newDOM = createDOM(newVdom);
    const oldDOM = classInstance.dom;
    oldDOM.parentNode.replaceChild(newDOM, oldDOM);
    classInstance.dom = newDOM;
}
export default Component;