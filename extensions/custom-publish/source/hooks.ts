import { BuildHook, IBuildResult, IBuildTaskOption } from "../@types";
import * as fs from "fs";
import { exec } from "child_process";
import AutoUpload from "./upload";
import { obfuscate } from "./obfuscator";
import { compressAllImage } from "./minImg";
import { zipDir } from "./zip";

interface IOptions {
    useZip: boolean;
    useJsEncryption: boolean;
    uploadDir: string;
    bucket: string;
    accessKeyId: string;
    accessKeySecret: string;
    region: string;
    cdnDomain: string;
}

const PACKAGE_NAME = "custom-publish";

interface ITaskOptions extends IBuildTaskOption {
    packages: {
        [PACKAGE_NAME]: IOptions;
    };
}


let allAssets = [];

export const throwError: BuildHook.throwError = true;

export const load: BuildHook.load = async function () {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
    allAssets = await Editor.Message.request("asset-db", "query-assets");
};


let buildVersion = 0;

export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options: ITaskOptions, result: IBuildResult) {
    if (!["web-mobile", "web-desktop"].includes(options.platform)) return;

    buildVersion = Date.now();
};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
    if (!["web-mobile", "web-desktop"].includes(options.platform)) return;

    result.settings.splashScreen.totalTime = 0;
};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
    // Todo some thing
    console.log("webTestOption", "onAfterCompressSettings");
};

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: ITaskOptions, result: IBuildResult) {
    if (!["web-mobile", "web-desktop"].includes(options.platform)) return;

    const {
        useZip, useJsEncryption,
        uploadDir, accessKeySecret, accessKeyId, bucket, region,
    } = options.packages[PACKAGE_NAME];

    /*************************** 防调试 ***************************/
    // 非调试模式下开启变态代码防调试
    if (useJsEncryption && !options.debug) {
        console.log("%c发布插件 >> 变态代码防调试", "color: green");
        if (fs.existsSync(result.dest + "/remote")) {
            fs.readdirSync(result.dest + "/remote")
                .forEach((dirName) => {
                    if (dirName !== "main") {
                        return;
                    }
                    obfuscate(result.dest + "/remote/" + dirName + "/index.js");
                });
        }

        if (fs.existsSync(result.dest + "/assets")) {
            fs.readdirSync(result.dest + "/assets")
                .forEach((dirName) => {
                    if (dirName !== "main") {
                        return;
                    }
                    obfuscate(result.dest + "/assets/" + dirName + "/index.js");
                });
        }

        if (fs.existsSync(result.dest + "/src/chunks")) {
            fs.readdirSync(result.dest + "/src/chunks")
                .forEach((fileName) => {
                    obfuscate(result.dest + "/src/chunks/" + fileName);
                });
        }
        console.log("%c发布插件 >> 变态代码防调试成功", "color: green");
    } else {
        console.warn("发布插件 >> 已开启调试模式，请确保不是上线代码");
        console.warn("发布插件 >> 已开启调试模式，请确保不是上线代码");
        console.warn("发布插件 >> 已开启调试模式，请确保不是上线代码");
        await Editor.Dialog.warn("发布插件\n已开启调试模式\n请确保不是上线代码");
    }
    /*************************** 防调试 ***************************/


    /*************************** 修改脚本 ***************************/
    console.log("%c发布插件 >> 开始修改脚本", "color: green");
    // application.js 所在路径
    const mainJsPath = result.dest + "/application.js";

    // 读取 application.js
    let script = fs.readFileSync(mainJsPath, "utf8");

    // 添加一点脚本
    script = `window.__version__ = ${buildVersion};\n`
        + `window.__ENV__ = "prod";\n`
        + script;

    if (useZip) {
        console.log("%c发布插件 >> 使用zip", "color: green");
        script =
            `window.zipBundle = ${JSON.stringify(result.settings.assets.remoteBundles)};`
            + script;
    }

    // 保存
    fs.writeFileSync(mainJsPath, script);

    console.log("%c发布插件 >> 修改脚本完成", "color: green");
    /*************************** 修改脚本 ***************************/


    /*************************** 压缩图片 ***************************/
    console.log("%c发布插件 >> 开始压缩图片", "color: green");

    await compressAllImage(["assets", "remote"], result.dest);

    console.log("%c发布插件 >> 压缩图片结束", "color: green");
    /*************************** 压缩图片 ***************************/


    /*************************** 压缩资源 ***************************/
    if (useZip) {
        console.log("%c发布插件 >> 使用zip", "color: green");
        if (fs.existsSync(result.dest + "/remote")) {
            await Promise.all(
                fs.readdirSync(result.dest + "/remote")
                    .map((dirName) => {
                        return zipDir(dirName, result.dest + "/remote/" + dirName, result.dest + "/remote");
                    })
            );
        }
    }
    /*************************** 压缩资源 ***************************/
};

export const unload: BuildHook.unload = async function () {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
};

export const onError: BuildHook.onError = async function (options, result) {
    // Todo some thing
    console.warn(`${PACKAGE_NAME} run onError`);
};

export const onBeforeMake: BuildHook.onBeforeMake = async function (root, options) {
    console.log(`onBeforeMake: root: ${root}, options: ${options}`);
};

export const onAfterMake: BuildHook.onAfterMake = async function (root, options) {
    console.log(`onAfterMake: root: ${root}, options: ${options}`);
};
