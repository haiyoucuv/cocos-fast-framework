
(function autoStart() {
    let visibilityChange;
    if (typeof document.hidden !== 'undefined') {
        visibilityChange = 'visibilitychange';
    }
    else if (typeof document['msHidden'] !== 'undefined') {
        visibilityChange = 'msvisibilitychange';
    }
    else if (typeof document['webkitHidden'] !== 'undefined') {
        visibilityChange = 'webkitvisibilitychange';
    }
    function handleVisibilityChange(e) {
        visibilityChanged(document.visibilityState == "visible");
    }
    document.addEventListener(visibilityChange, handleVisibilityChange, false);
})();
const watchers = [];
function visibilityChanged(visible) {
    for (let watcher of watchers) {
        watcher && watcher(visible);
    }
}
/**
 * 观察页面显隐性变化
 * @ctype PROCESS
 * @description 观察页面显隐性变化
 * @param {function} [callback] - 回调
 * @example 一般用法
 * function onPageVisibilityChange(visible){
 *   console.log('页面' + visible? '可见' : '不可见')
 * }
 * watchPageVisibility(onPageVisibilityChange)
 */
export function watchPageVisibility(callback) {
    let index = watchers.indexOf(callback);
    if (index < 0) {
        watchers.push(callback);
    }
}
/**
 * 取消观察页面显隐性变化
 * @ctype PROCESS
 * @description 取消观察页面显隐性变化
 * @param {function} [callback] - 回调
 * @example 一般用法
 * function onPageVisibilityChange(visible){
 *   console.log('页面' + visible? '可见' : '不可见')
 * }
 * unwatchPageVisibility(onPageVisibilityChange)
 */
export function unwatchPageVisibility(callback) {
    let index = watchers.indexOf(callback);
    if (index >= 0) {
        watchers.splice(index, 1);
    }
    return {
        type: index >= 0 ? 'success' : 'failed',
    };
}
