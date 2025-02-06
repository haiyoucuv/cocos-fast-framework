import mobx, { IReactionPublic, IReactionDisposer } from "mobx";
import { EDITOR } from "cc/env";

const {
    autorun,
    reaction,
    configure
} = mobx;

configure({ enforceActions: "observed" });

const { hasOwnProperty } = Object.prototype;

const symbolAutoRuns = Symbol("autoRuns");
const symbolReactions = Symbol("reactions");
const symbolDisposers = Symbol("disposers");

/**
 * 绑定放到 onEnable, onDisable,
 * 如果用户不希望observe, 可以在 onLoad 中执行 this.enable = false;
 */
export function observer(Component: Function): void {
    if (EDITOR) return;

    const prototype = Component.prototype as ObserverPrototype;
    if (!prototype[symbolAutoRuns] && !prototype[symbolReactions]) return;
    const { onLoad: _onLoad, onDestroy: _onDestroy } = prototype;
    if (!_onLoad) {
        prototype.onLoad = observe;
    } else if (_onLoad !== observe) {
        prototype.onLoad = function onEnable(this: ObserverPrototype) {
            const rt = _onLoad.call(this);
            if (rt !== false) observe.call(this);
        };
    }
    if (!_onDestroy) {
        prototype.onDestroy = dispose;
    } else if (_onDestroy !== dispose) {
        prototype.onDestroy = function onDestroy(this: ObserverPrototype) {
            dispose.call(this);
            _onDestroy.call(this);
        };
    }
}

type ObserverPrototype = {
    [symbolDisposers]?: Array<() => void>;
    [symbolAutoRuns]?: string[];
    [symbolReactions]?: string[];
    onLoad?: () => unknown;
    onDestroy?: () => void;
};

function dispose(this: ObserverPrototype) {
    const disposers = this[symbolDisposers];
    if (disposers) disposers.splice(0).forEach((x) => x());
}

function getDisposers(object: ObserverPrototype): Array<() => void> {
    const value = object[symbolDisposers];
    if (value) return value;
    const arr: Array<() => void> = [];
    defineProperty(object, symbolDisposers, arr);
    return arr;
}

function observe(this: ObserverPrototype) {
    const disposers = getDisposers(this);
    if (disposers.length) return;
    const { [symbolAutoRuns]: autoRuns, [symbolReactions]: reactions } = this;
    const _self = this as unknown as { [fn: string]: () => () => void };
    if (autoRuns) {
        const { name } = this.constructor;
        autoRuns.forEach((fn) => {
            const view = _self[fn].bind(_self);
            const disposer = autorun(view, { name: `${name}#${fn}` });
            disposers.push(disposer);
        });
    }
    if (reactions) {
        reactions.forEach((fn) => {
            const disposer = _self[fn]();
            disposers.push(disposer);
        });
    }
}

export function render(target: any, key: string, _?: TypedPropertyDescriptor<() => void>) {
    if (EDITOR) return;

    if (key === "onEnable" || key === "onDisable")
        throw new Error(`should not bind @render for ${key}`);
    attach(target, key, symbolAutoRuns);
}

export function reactor(
    target: any,
    key: string,
    descriptor?: TypedPropertyDescriptor<() => IReactionDisposer>,
): void;
export function reactor<T>(
    expression: (r: IReactionPublic) => T,
): (target: any, key: string, descriptor: TypedPropertyDescriptor<(arg: T) => void>) => void;
export function reactor(arg0: any, arg1?: string) {
    if (arg1 == null) {
        return reactorArg1(arg0);
    }
    return attach(arg0, arg1, symbolReactions);
}

function reactorArg1<T>(expression: (r: IReactionPublic) => T) {
    return (target: any, key: string, descriptor: TypedPropertyDescriptor<(arg: T) => void>) => {
        attach(target, key, symbolReactions);
        const value = descriptor.value as (arg: T) => void;
        // eslint-disable-next-line no-param-reassign
        descriptor.value = function getter() {
            return reaction(expression, value.bind(this), { fireImmediately: true });
        };
    };
}

function attach<K extends symbol>(target: Record<K, string[]>, key: string, storeKey: K) {
    if (!hasOwnProperty.call(target, storeKey)) {
        const value = target[storeKey] ? target[storeKey].slice(0) : [];
        defineProperty(target, storeKey, value);
    }
    if (target[storeKey].indexOf(key) === -1) {
        target[storeKey].push(key);
    }
}

function defineProperty(target: any, key: string | symbol, value: unknown[]) {
    Object.defineProperty(target, key, {
        enumerable: false,
        writable: false,
        configurable: false,
        value,
    });
}
