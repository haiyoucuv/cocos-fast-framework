import { showToast } from "db://assets/core/ui/UIFast";
import { PREVIEW } from 'cc/env';

import JSON5 from "json5";

/**
 * web接口枚举
 */
export enum WebNetName {

    /**
     * 获取规则
     */
    projectRule = "projectRule.query",

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

