/*
 * @Author: dfh
 * @Date: 2021-02-24 23:34:42
 * @LastEditors: dfh
 * @LastEditTime: 2021-02-28 16:50:53
 * @Modified By: dfh
 * @FilePath: /day25-react/src/Component.js
 */
import { compareTwoVdom ,findDOM} from './react-dom'

//更新队列
export let updateQueue = {
    isBatchingUpdate: false,//当前是否处于批量更新模式
    updaters: new Set(),
    batchUpdate() {//批量更新
        for (let updater of this.updaters) {
            updater.updateClassComponent();
        }
        this.isBatchingUpdate = false;
        this.updaters.length=0;
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
        this.emitUpdate();
    }

    //一个组件不管属性变了，还是状态变了，都会更新
    emitUpdate(nextProps) {
        this.nextProps = nextProps;//缓存起来
        if (updateQueue.isBatchingUpdate) {//当前处于批量更新模式，先缓存updater
            updateQueue.updaters.add(this);//本次setState调用结束
        } else {//当前处于非批量更新模式，执行更新
            this.updateClassComponent();//直接更新组件
        }
    }

    updateClassComponent() {
        const { classInstance, pendingStates, cbs, nextProps } = this;
        if (nextProps || pendingStates.length > 0) {//有setState
            shouldUpdate(classInstance, nextProps, this.getState())
            // classInstance.state = this.getState();//计算新状态
            // classInstance.forceUpdate();
            // cbs.forEach(cb=>cb());
            // cbs.length=0;
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

/**
 * 判断组件是否需要更新
 * @param {*} classInstance 类组件实例
 * @param {*} nextProps 新的props
 * @param {*} newState 新状态
 */
function shouldUpdate(classInstance, nextProps, newState) {
    if (nextProps) {
        classInstance.props = nextProps;
    }
    //不管组件要不要更新，组件的state一定会改变
    classInstance.state = newState;
    //如果有这个方法，并且这个方法的返回值为false，则不需要继续向下更新了，否则就更新
    if (classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(classInstance.props, newState)) {
        return;
    }
    classInstance.forceUpdate()
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
    }

    forceUpdate() {
        //执行生命周期方法componentWillUpdate
        this.componentWillUpdate && this.componentWillUpdate();
        const newRenderVdom = this.render();//新的虚拟DOM
        const oldRenderVdom = this.oldRenderVdom;//老得虚拟DOM
        const dom = findDOM(oldRenderVdom);//老得真实DOM
        compareTwoVdom(dom.parentNode, oldRenderVdom, newRenderVdom);
        this.oldRenderVdom=newRenderVdom;//比较完毕后，重新赋值老的虚拟节点
        //调用生命周期方法componentDidUpdate
        this.componentDidUpdate && this.componentDidUpdate();
    }
}

export default Component;