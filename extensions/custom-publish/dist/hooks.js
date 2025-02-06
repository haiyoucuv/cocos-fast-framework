"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAfterMake = exports.onBeforeMake = exports.onError = exports.unload = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = exports.load = exports.throwError = void 0;
const fs = __importStar(require("fs"));
const obfuscator_1 = require("./obfuscator");
const minImg_1 = require("./minImg");
const zip_1 = require("./zip");
const PACKAGE_NAME = "custom-publish";
let allAssets = [];
exports.throwError = true;
const load = async function () {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
    allAssets = await Editor.Message.request("asset-db", "query-assets");
};
exports.load = load;
let buildVersion = 0;
const onBeforeBuild = async function (options, result) {
    if (!["web-mobile", "web-desktop"].includes(options.platform))
        return;
    buildVersion = Date.now();
};
exports.onBeforeBuild = onBeforeBuild;
const onBeforeCompressSettings = async function (options, result) {
    if (!["web-mobile", "web-desktop"].includes(options.platform))
        return;
    result.settings.splashScreen.totalTime = 0;
};
exports.onBeforeCompressSettings = onBeforeCompressSettings;
const onAfterCompressSettings = async function (options, result) {
    // Todo some thing
    console.log("webTestOption", "onAfterCompressSettings");
};
exports.onAfterCompressSettings = onAfterCompressSettings;
const onAfterBuild = async function (options, result) {
    if (!["web-mobile", "web-desktop"].includes(options.platform))
        return;
    const { useZip, useJsEncryption, uploadDir, accessKeySecret, accessKeyId, bucket, region, } = options.packages[PACKAGE_NAME];
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
                (0, obfuscator_1.obfuscate)(result.dest + "/remote/" + dirName + "/index.js");
            });
        }
        if (fs.existsSync(result.dest + "/assets")) {
            fs.readdirSync(result.dest + "/assets")
                .forEach((dirName) => {
                if (dirName !== "main") {
                    return;
                }
                (0, obfuscator_1.obfuscate)(result.dest + "/assets/" + dirName + "/index.js");
            });
        }
        if (fs.existsSync(result.dest + "/src/chunks")) {
            fs.readdirSync(result.dest + "/src/chunks")
                .forEach((fileName) => {
                (0, obfuscator_1.obfuscate)(result.dest + "/src/chunks/" + fileName);
            });
        }
        console.log("%c发布插件 >> 变态代码防调试成功", "color: green");
    }
    else {
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
    await (0, minImg_1.compressAllImage)(["assets", "remote"], result.dest);
    console.log("%c发布插件 >> 压缩图片结束", "color: green");
    /*************************** 压缩图片 ***************************/
    /*************************** 压缩资源 ***************************/
    if (useZip) {
        console.log("%c发布插件 >> 使用zip", "color: green");
        if (fs.existsSync(result.dest + "/remote")) {
            await Promise.all(fs.readdirSync(result.dest + "/remote")
                .map((dirName) => {
                return (0, zip_1.zipDir)(dirName, result.dest + "/remote/" + dirName, result.dest + "/remote");
            }));
        }
    }
    /*************************** 压缩资源 ***************************/
};
exports.onAfterBuild = onAfterBuild;
const unload = async function () {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
};
exports.unload = unload;
const onError = async function (options, result) {
    // Todo some thing
    console.warn(`${PACKAGE_NAME} run onError`);
};
exports.onError = onError;
const onBeforeMake = async function (root, options) {
    console.log(`onBeforeMake: root: ${root}, options: ${options}`);
};
exports.onBeforeMake = onBeforeMake;
const onAfterMake = async function (root, options) {
    console.log(`onAfterMake: root: ${root}, options: ${options}`);
};
exports.onAfterMake = onAfterMake;
