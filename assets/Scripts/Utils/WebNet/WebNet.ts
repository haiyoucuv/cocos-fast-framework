import { showToast } from "db://assets/core/ui/UIFast";
import { PREVIEW } from 'cc/env';

import JSON5 from "json5";

//////////////星速台接口方法集成
/**
 * web接口枚举
 */
export enum WebNetName {

    getFrontVariable = 'coop_frontVariable.query',


    index = "coin/index.do",

    // 投福气
    putLuck = "coin/putLuck.do",

    // 体力详情
    energyDetail = "coin/energyDetail.do",

    // 抽奖
    draw = "coin/draw.do",

    // 上报
    reportResult = "coin/reportResult.do",

    // 当前时间戳
    currentTime = "coin/current.do",

    /**
     * 获取QrCode
     */
    genQrCode = "home/generateSunCode.do",

    /**
    * 奖品页面
    */
    prizeDetail = "records.query",
    queryPrizeDetail = "/customActivity/kouweiwang/prize/queryOrderNo",


    /**
     * 获取规则
     */
    projectRule = "projectRule.query",

    /**
     * 预扣积分
     */
    creditsCost = "credits/creditsCost.do",
    /**
     * 检查扣积分状态
     */
    queryStatus = "credits/queryStatus.do",
    /**
     * 邀请助力
     */
    getInviteCode = "inviteAssist_1/getInviteCode.do",
    doAssist = "inviteAssist_1/doAssist.do",

}

export const ERR_MESSAGE = {
    "100001": "登录过期啦，请重新登录哦～",
    "5001033": "该局使用该道具次数已达上限",
    "200303": "助力失败，您的助力次数已用完",
    "200306": "助力失败，不能给自己助力哦~",
    "200304": "助力失败，好友被助力次数已达上限~",
    "5001041": "网络异常，请稍后再试",
    "100018": "账号异常，请联系活动客服处理哦～",
    // "300001": "您的积分不足\n快去获取积分参与游戏吧～",
    // "400001": "系统维护中，请稍后尝试",
    // "400004": "您的积分不足\n快去获取积分参与游戏吧～",
    // "300003": "今日复活次数已经达到上限\n明天再来吧！",
}


//返回数据类型
interface dataOut {
    success: boolean,
    data?: any
    code?: string | number,
    message?: string,
    timeStamp?: number,
}

//记录数据
let dataRecord: {
    [name: string]: any
} = {};


interface IWebConfig {
    token?: string;
    callback?: (success: boolean, res?: dataOut) => void,
    hideMsg?: boolean,
    isGet?: boolean,//这两个参数基本不设置，放后面吧
    headers?: any,
}

/**
 * 发送接口
 * @param netName
 * @param parameter
 * @param config
 */
export function sendWebNet(
    netName: WebNetName | string,
    parameter: any = {},
    config: IWebConfig = {}
): Promise<dataOut> {

    let {
        callback,
        hideMsg = false,
        isGet = true,//这两个参数基本不设置，放后面吧
        headers = {},
    } = config;

    // 统一加上渠道参数
    // const channel = getUrlParams("channel");
    // parameter.channel = channel;

    return new Promise(async (resolve, reject) => {

        const success = (res) => {
            //发现有些接口成功了，但是response为空

            if (PREVIEW) {
                res = JSON5.parse(res);
            }

            res = res || {};
            //记录数据
            dataRecord[netName] = res;
            //统一错误信息提示，

            res.success = res.success || res.ok;
            res.timeStamp = res.timeStamp || Date.now();

            if (!res.success) {
                if (!hideMsg) {
                    showToast(ERR_MESSAGE[res.code] || res.message || "网络异常，请稍后再试～");
                }
            }

            callback && callback(res.success, res);
            resolve(res);
            console.log(
                `\n%c[ request ]\n`
                + `NAME  : ${netName} \n`
                + `STATE : %o \n`
                + `TIME  : %o \n`
                + `PARAM : %o \n`
                + `%cDATA  : %o \n`
                , `${res.success ? 'color:green' : 'color:red'}`
                , res.success
                , res.timeStamp || res.timestamp
                , parameter
                , `${res.success ? 'color:green' : 'color:red'}`
                , res
            );
        }

        const fail = () => {
            if (!hideMsg) showToast("网络异常，请稍后再试～");
            callback && callback(false);
            resolve({ success: false });
            console.log("接口" + netName + "：网络超时");
            return { success: false };
        }

        let url = netName;

        if (PREVIEW) {
            // let path = netName.split('/')[1];//后缀名字之前的是文件夹,mock里结构
            // if (netName.indexOf('/') <= -1) path = `projectX/${netName}`;
            // else path = netName
            // const url = "mock/" + path + ".json";
            isGet = true;   // post请求不到mock文件
            url = "mock/" + netName + ".json5";
        }

        let data = parameter || {};
        if (data.token) {
            url += "?token=" + data.token;
            delete data.token;
        }

        if (!isGet) {
            data = JSON.stringify(data);
            headers['content-type'] = "application/json;";
        }

        //网络请求
        $.ajax({
            url, //请求地址
            type: isGet ? 'GET' : "POST",   //请求方式
            data: data, //请求参数
            dataType: PREVIEW ? "raw" : "json",     // 返回值类型的设定,暂时只有json
            async: true,   //是否异步
            headers: headers,
            success: success,
            error: fail,
        })
    })
}

export function sendWebNetWithToken(
    netName: WebNetName,
    parameter?: any,
    config?: IWebConfig,
): Promise<dataOut> {
    return new Promise(async r => {
        try {
            const token = await getPxTokenSave();
            if (!token) {
                showToast('网络异常，请稍后重试');
                r({ success: false })
                return;
            }
            const res = await sendWebNet(
                netName,
                { token, ...parameter },
                config,
            );
            r(res);
        } catch (e) {
            showToast('网络异常，请稍后重试');
            r({ success: false });
        }
    });
}

/**
 * 获取数据
 * @param netName
 */
export function getWebData(netName: WebNetName): dataOut {
    return dataRecord[netName] || {};
}

//销毁数据
export function destroyWebNetData() {
    dataRecord = {}
}


async function fetchAsync(url: string): Promise<any> {
    const res = await fetch(url);
    return await res.json();
}

const projectxString = "projectx/";
let projectId: string;

/**
 * 获取链接上的projectId
 */
export function getProjectId(): string {
    if (projectId) return projectId;

    let windowUrl = window.location.href;
    let splitArr = windowUrl.split(projectxString);
    if (splitArr.length != 2) {
        return projectId = "projectId"
    }
    let start = windowUrl.indexOf(projectxString) + projectxString.length;
    let end = splitArr[1].indexOf("/");
    return projectId = windowUrl.substr(start, end);
}

//这个临时，如星速台链接有变，注意
const isProd = location.href.indexOf(".com.cn/projectx") >= 0;

/**
 * 刷新星速台tokenkey,注意多活动跳转手动执行一边
 * @param callback
 */
export function refreshPxTokenKey(callback?: (success: boolean) => void) {
    if (isProd) {//线上
        const head = document.getElementsByTagName("head")[0];
        const scriptEl = document.createElement('script');
        scriptEl.src = "getTokenKey?_=" + Date.now();
        scriptEl.onload = function () {
            head.removeChild(scriptEl);
            callback && callback(true)
        };
        scriptEl.onerror = function () {
            head.removeChild(scriptEl);
            callback && callback(false)
        };
        head.appendChild(scriptEl);
    } else {//本地环境
        callback && callback(true)
    }
}

//执行一次
refreshPxTokenKey();

/**
 * 带重刷tokenkey功能的获取token，返回token字符串或null
 * @returns
 */
export function getPxTokenSave() {
    return new Promise<string>((reslove, reject) => {
        getPxToken(async (msg, token) => {
            if (token) {
                reslove(token);
                return
            }
            //只重试一次，刷新tokenKey
            const suc = await new Promise((r) => {
                refreshPxTokenKey(r);
            });
            //刷新失败，返回空
            if (!suc) {
                reslove(null);
                return;
            }
            //再次获取
            getPxToken((msg, token) => {
                reslove(token)
            })
        })
    })
}

/**
 * 获取星速台token
 * @param callback
 */
export function getPxToken(callback: (msg: string, token?: string) => void) {
    if (!isProd) {//本地环境
        callback(null, "token")
        return
    }
    if (!window["ohjaiohdf"]) {
        callback("need reload")
        return
    }
    var xml = new XMLHttpRequest;
    xml.open("get", "getToken?_t=" + Date.now(), true);
    xml.onreadystatechange = function () {
        if (xml.readyState === 4 && xml.status === 200) {
            var e = JSON.parse(xml.response);
            if (e.success) {
                window.eval(e.data);
                callback(null, window["ohjaiohdf"]());
            } else {
                var msg = (() => {
                    switch (e.code) {
                        case "100001":
                            return "need login"
                        case "100024":
                            return "state invalid"
                        default:
                            return e.code
                    }
                })();
                callback(msg);
            }
        }
    }
    xml.onerror = function () {
        callback("net error")
    };
    xml.onloadend = function () {
        xml.status === 404 && callback("net error")
    };
    xml.send()
}


/**
 * 扣积分流程，带轮询
 * @param toPlaywayId
 * @param toActionId
 * @param desc
 * @param credits
 * @return {Promise<{ success: boolean, ticket?: any,pollingData }>}
 */
export async function creditsCost(toPlaywayId, toActionId, desc, credits: number) {
    // 预扣积分
    const param = {
        toPlaywayId,
        toActionId,
        credits,
    };
    //@ts-ignore
    desc && (param.desc = desc);
    const { success, data: ticket } = await sendWebNet(WebNetName.creditsCost, param);

    if (!success) return { success: false };

    // 轮询
    const pollingData = await pollingWebNet(
        { ticketNum: ticket },
        (success, res) => {
            return res?.data != 0; // 0 是处理中
        }
    );

    return { success: pollingData.data == 1, ticket, pollingData };
}

/**
 * 封装一个轮询
 * @param param
 * @param {(success: boolean, res?: dataOut) => boolean} progress 这个函数必须返回一个bool值 用于是否结束轮询的标志 true则会结束轮询
 * @param { (res) => void} complete
 * @param {number} count
 * @param {number} timeOut
 * @return {Promise<{success: boolean, data: any}>}
 */
export async function pollingWebNet(param, progress, complete?, count = 10, timeOut = 200) {
    return new Promise<dataOut>(async (resolve, reject) => {
        // Loading.show();
        let _count = 0;

        async function pollingOnce() {
            const res = await sendWebNet(WebNetName.queryStatus, param)

            // 如果是true则结束轮询
            if (progress(res.success, res)) {
                // Loading.hide();
                resolve(res);
                complete && complete(res);
                return;
            }

            _count++;

            // 到达次数上限结束轮询
            if (_count >= count) {
                // Loading.hide();
                resolve(res);
                complete && complete(res);
                return;
            }

            setTimeout(() => {
                pollingOnce();
            }, timeOut);
        }

        await pollingOnce();
    });
}
