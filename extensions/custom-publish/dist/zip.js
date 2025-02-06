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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipDir = zipDir;
const fs = __importStar(require("fs"));
const jszip_1 = __importDefault(require("jszip"));
//读取目录及文件
function readDir(zip, nowPath) {
    const files = fs.readdirSync(nowPath);
    files.forEach(function (fileName, index) {
        console.log(fileName, index); //打印当前读取的文件名
        const fillPath = nowPath + "/" + fileName;
        const file = fs.statSync(fillPath); //获取一个文件的属性
        if (file.isDirectory()) { //如果是目录的话，继续查询
            const dirlist = zip.folder(fileName); //压缩对象中生成该目录
            readDir(dirlist, fillPath); //重新检索目录文件
        }
        else {
            // 排除图片文件
            if (fileName.endsWith(".png") || fileName.endsWith(".jpg")) {
                return;
            }
            zip.file(fileName, fs.readFileSync(fillPath)); //压缩目录添加文件
        }
    });
}
//开始压缩文件
function zipDir(name, dir, dist) {
    return new Promise((resolve, reject) => {
        const zip = new jszip_1.default();
        readDir(zip, dir);
        zip.generateAsync({
            type: "nodebuffer", //nodejs用
            compression: "DEFLATE", //压缩算法
            compressionOptions: {
                level: 9
            }
        }).then((content) => {
            fs.writeFileSync(`${dist}/${name}.bundle`, content, "utf-8");
            resolve();
        });
    });
}
