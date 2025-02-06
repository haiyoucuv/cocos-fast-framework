
/**
 * jsonp模拟，不考虑回调
 * @param url
 * @param params
 */
export function jsonp(url: string, params: any) {
    const src = url + '?' + getParams(params);
    const scriptEl = document.createElement('script');
    scriptEl.src = src;
    scriptEl.onload = function () {//body考虑改成head
        document.body.removeChild(scriptEl);
    };
    scriptEl.onerror = function () {
        document.body.removeChild(scriptEl);
    };
    document.body.appendChild(scriptEl);
}


/**
 * 对象参数的处理
 * @param data
 * @returns {string}
 */
function getParams(data): string {
    if (!data) return "";//没有就返回空字符
    const arr = [];
    for (const param in data) {
        arr.push(encodeURIComponent(param) + '=' + encodeURIComponent(data[param]));
    }
    //不缓存
    arr.push('_=' + Date.now());
    return arr.join('&');
}
