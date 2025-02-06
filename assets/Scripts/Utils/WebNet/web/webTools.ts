
/////这里集成一些只有web环境才会用到的方法,链接参数,cookie参数等等


let urlParams: { [key: string]: string | true };
/**
 * 获取链接参数
 * @param key 
 */
export function getUrlParams(key: string, refreshCache: boolean = false): string | true {
    if (urlParams && !refreshCache) return urlParams[key];
    urlParams = {};
    let search = window.location.search;
    try {
        search = top.location.search;  //尝试获取顶层的链接
    } catch (e) {
    }
    //获取链接参数
    for (let item of search.replace('?', '').split('&')) {
        let arr = item.split('=');
        urlParams[arr[0]] = arr.length === 1 ? true : decodeURIComponent(arr[1]);
    }
    return urlParams[key];
}

let cookieParams: { [key: string]: string }
/**
 * cookie参数
 */
export function getCookieParams(key: string, refreshCache: boolean = false): string {
    if (cookieParams && !refreshCache) return cookieParams[key]
    cookieParams = {};
    var arr1 = document.cookie.split("; ");//由于cookie是通过一个分号+空格的形式串联起来的，所以这里需要先按分号空格截断,变成[name=Jack,pwd=123456,age=22]数组类型；
    for (var i = 0; i < arr1.length; i++) {
        var arr2 = arr1[i].split("=");//通过=截断，把name=Jack截断成[name,Jack]数组；
        cookieParams[arr2[0]] = decodeURIComponent(arr2[1]);
        // if (arr2[0] == key) {
        //     return decodeURIComponent(arr2[1]);
        // }
    }
    return cookieParams[key];
}

/**
 * 替换或添加url里的参数
 * @param url 修改的url
 * @param arg 参数名
 * @param arg_val 参数值
 */
export function changeURLArg(url: string, arg: string, arg_val: string) {
    var pattern = arg + '=([^&]*)';
    var replaceText = arg + '=' + arg_val;
    if (url.match(pattern)) {
        var tmp = '/(' + arg + '=)([^&]*)/gi';
        tmp = url.replace(eval(tmp), replaceText);
        return tmp;
    } else {
        if (url.match('[\?]')) {
            return url + '&' + replaceText;
        } else {
            return url + '?' + replaceText;
        }
    }
}

/**
 * 输入框ios兼容，如果加过输入框，加
 */
export function inputFeildIosEnable() {
    var u = navigator.userAgent, app = navigator.appVersion
    var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    if (isIOS) {
        setTimeout(() => {
            document.getElementsByTagName('input')[0].onblur = function () {
                if (isIOS) {
                    blurAdjust()
                    // alert("1231321233")
                }
            };
        }, 50)
    }
    // 解决苹果不回弹页面
    function blurAdjust() {
        setTimeout(() => {
            if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
                return
            }
            let result = 'pc';
            if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) { //判断iPhone|iPad|iPod|iOS
                result = 'ios'
            } else if (/(Android)/i.test(navigator.userAgent)) {  //判断Android
                result = 'android'
            }
            if (result = 'ios') {
                document.activeElement["scrollIntoViewIfNeeded"](true);
            }
        }, 100)
    }
}

/**
 * 处理iOS 微信客户端弹窗状态下调起输入法后关闭输入法页面元素错位解决办法
 * 输入框不能在屏幕外下面放dom，否则回弹有问题
 */
export function inputIosAdapte() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipod|ipad/i.test(navigator.appVersion) && /MicroMessenger/i.test(ua)) {
        document.body.addEventListener('focusout', () => {
            console.log('focusout')
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
        });
    }
}

let el: HTMLDivElement;
/**
 * html文本转纯文本
 * @param htmlText 
 */
export function htmlToPureText(htmlText: string) {
    if (!el) el = document.createElement('div');
    el.innerHTML = htmlText;
    document.body.appendChild(el);
    let pureText = el.innerText;
    document.body.removeChild(el);
    return pureText;
}