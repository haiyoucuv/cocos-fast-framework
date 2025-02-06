import { assetManager, director, ImageAsset, Node, SpriteFrame, Texture2D, tween, UITransform } from "cc";

/**
 * 添加url的协议头
 * @param url
 * @returns
 */
export const addHttps = (url = '') => {
    url = url || ""
    if (!url.includes('//')) return ''
    return url?.includes('http') ? url : `https:${url}`
}

/**
 * 获取分秒
 * @param countDown ms
 * @returns
 */
export const getMS = (countDown = 0) => {
    const secondTotal = countDown / 1000
    const minute = String(Math.floor(secondTotal / 60)).padStart(1, '0')// 剩余分钟数
    const second = String(Math.floor(secondTotal % 60)).padStart(1, '0')// 剩余秒数
    return `${minute}分${second}秒`
}


export const dateFormatter = (date: any, format = "yyyy/MM/dd") => {
    if (!date) return "-";
    date = new Date(
        typeof date === "string" && isNaN(+date)
            ? date.replace(/-/g, "/")
            : Number(date)
    );
    const o = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "h+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
        "q+": Math.floor((date.getMonth() + 3) / 3),
        S: date.getMilliseconds(),
    };
    if (/(y+)/.test(format)) {
        format = format.replace(
            RegExp.$1,
            (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
    }
    for (const k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(
                RegExp.$1,
                RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
            );
        }
    }
    return format;
};
export const getWeek = (date: Date) => {
    let week = date.getDay();
    if (week == 0) week = 7;
    return week;
}

/**
 * 链式取余算法
 * @param ori
 * @param dividend
 * @return {(number|number)[]|*}
 */
export const modAndDivide = (ori: number, dividend: number | number[]) => {
    if (typeof ori !== 'number') throw new Error('Error type.')
    if (typeof dividend === 'number')
        return [ori % dividend, Math.floor(ori / dividend)]
    else if (Array.isArray(dividend)) {
        let _tmp = ori;
        // 链式除
        const list = dividend.map(v => {
            const result = _tmp % v;
            _tmp = Math.floor(_tmp / v);
            return result;
        })
        if (_tmp !== 0) list.push(_tmp);
        return list;
    }
}

/**
 * 分割时间
 * @param  {number}leftTIme  单位秒
 * @param target
 * @return {{day: number, hour: number, min: number, sec: number}}
 */
export const sepTime = (leftTIme: number, target?) => {
    const [sec = 0, min = 0, hour = 0, day = 0] = modAndDivide(leftTIme, [60, 60, 24])
    if (target) {
        target.sec = sec;
        target.min = min;
        target.hour = hour;
        target.day = day
    }
    return {sec, min, hour, day}
}

export const zeroizeFormatter = (n: number | string, l = 2) => (Array(l).join("0") + n).slice(`${n}`.length > l ? -(`${n}`.length) : -l);


export const formatScoreDisplay = (num, from = 1000000, format = [10000, 10000]) => {
    if (!from || num > from) return formatUnitDisplay(num, format);
    return num;
}


export const formatUnitDisplay = (num, format = [10000, 10000, 10000, 10000], formatUnits = ["", "万", "亿", "兆", "万兆",]) => {
    const result = modAndDivide(num, format);

    let maxPos = 0;
    // 反向取最大位
    result.forEach((v, i) => {
        if (v !== 0) maxPos = i;
    })

    const intV = result[maxPos];
    // 没有小数位
    if (maxPos < 1) return intV

    const decimalsNum = result[maxPos - 1]

    if (decimalsNum < 100) return formatUnit(intV, "", maxPos, formatUnits);
    // 小数点后数长度
    // const leftLen = 3 - `${intV}`.length
    const leftLen = 2;

    const decimalsStr = zeroizeFormatter(decimalsNum, 4).substr(0, leftLen);

    return formatUnit(intV, decimalsStr, maxPos, formatUnits);
}

export const formatUnit = (int, dec, u, units) => {
    return `${int}${((dec && dec.length) ? '.' : '') + dec}${units[u]}`
}


export const moneyFormatter = (n) => {
    if (isNaN(+n)) n = 0;
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


export function prefixInteger(num: number, length: number) {
    return (Array(length).join('0') + num).slice(-length);
}

/**
 * 解析html文本
 * @ctype PROCESS
 * @description 解析html文本
 * @param {string} htmlText html文本
 * @returns
 * el HTMLElement html节点
 */
export function parseHtml(htmlText) {
    let el = document.createElement('div');
    el.innerHTML = htmlText;
    return el.children[0];
}


/**
 *  获取区间随机数 [min,max)
 * @export
 * @param {*} min
 * @param {*} max
 * @return {*}
 */
export function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

export function wait(t: number) {
    return new Promise((resolve) => setTimeout(resolve, t * 1000))
}

export function sleep(t: number) {
    return new Promise((resolve) => {
        tween(director.getScene())
            .delay(t)
            .call(resolve)
            .start();
    });
}

export const CN_NUM = [
    '零', '一', '二', '三', '四', '五', '六', '七', '八', '九', "十"
];


export function loadAllObject(root: Node, view = {}, path = "") {
    const len = root.children.length;
    for (let i = 0; i < len; i++) {
        view[path + root.children[i].name] = root.children[i];
        loadAllObject(root.children[i], view, path + root.children[i].name + "/");
    }
    return view;
}

/**
 * 获取url参数
 * @param {string} name
 */
export function getUrlParam(name: string) {
    const search = window.location.search;
    const matched = search
        .slice(1)
        .match(new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'));
    return search.length ? matched && matched[2] : null;
}


export function addButtonClick(node: Node, callback: Function, target?: any) {
    node.on(Node.EventType.TOUCH_END, callback, target);
}

/**
 * 从URL形式的链接中获取指定参数的值
 *
 * @param url URL地址
 * @param paramName 参数名
 * @returns 返回参数值，如果未找到则返回null
 */
export function getQueryParamValue(url: string, paramName: string): string | null {
    // 正则表达式匹配参数
    const regex = new RegExp(`[?&]${paramName}=([^&#]*)`);
    // 匹配结果
    const results = regex.exec(url);

    if (results) {
        // 如果找到匹配项，返回第一个捕获组的内容（即参数值）
        return decodeURIComponent(results[1] || '');
    }

    // 如果没有找到匹配项，返回 null
    return null;
}




/**
 * 文案过长处理
 * @param {string | number} str 需要处理的字符串或数字
 * @param {number} count 大于该占位值后展示...，中文占位2，其余占位1
 *  */
export function strFormat(str: string | number, count: number = 8): string {
    str = str + "";
    const _len = str.length;
    /** 当前索引 */
    let index: number = 0;
    /** 计算的占位数 */
    let sum: number = 0;
    while (index < _len && sum <= count) {
        if (/.*[\u4e00-\u9fa5]+.*$/.test(str[index])) {
            sum += 2;
        } else {
            sum += 1;
        }
        index++;
    }
    // console.log(index, sum);
    return str.substring(0, index) + (sum <= count || index == _len ? "" : "...");
}

/**
 * 网络图片加载
 * @param {string} url 图片地址
 * @param {Node} imgBox 图片载体 - 正方形
 */
interface ImgObj {
    spriteFrame: SpriteFrame;
    scale: number;
}

export function loadImg(url: string, imgBoSize: number): Promise<ImgObj> {
    if (!!!url) return;
    return new Promise((resolve, reject) => {
        const spriteFrame = new SpriteFrame();
        const texture = new Texture2D();
        let scale = 1;
        assetManager.loadRemote<ImageAsset>(url, {ext: '.png'}, function (err, imageAsset) {
            if (!!err) {
                reject(err)
            }
            texture.image = imageAsset;
            spriteFrame.texture = texture;
            const imgWidth = spriteFrame.width;
            const imgHeight = spriteFrame.height;
            if (imgWidth > imgHeight) {
                scale = imgWidth / imgBoSize;
            } else {
                scale = imgHeight / imgBoSize;
            }
            resolve({spriteFrame, scale});
        });
    })
}


/**
 * @description: 支持异步函数的节流，防止接口时间太长击穿防连点
 * @return {Function}
 * @param fun
 * @param delay
 */
export const _asyncThrottle = (fun, delay = 2000) => {
    let last, deferTimer;
    let canClick = true;
    return function () {
        const now = Date.now();
        if (!canClick) return;

        if (last && now < last + delay) {
            // clearTimeout(deferTimer);
            // deferTimer = setTimeout(() => {
            //     last = now;
            // }, delay);
        } else {
            last = now;
            const ps = fun.apply(this, arguments);
            if (ps instanceof Promise) {
                canClick = false;
                ps.then(() => {
                    canClick = true;
                });
            }
        }
    };
};

