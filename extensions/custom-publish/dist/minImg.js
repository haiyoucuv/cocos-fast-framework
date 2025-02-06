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
exports.compressAllImage = compressAllImage;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const Os = __importStar(require("os"));
/** 压缩引擎路径表 */
const enginePathMap = {
    /** macOS */
    'darwin': 'pngquant/macos/pngquant',
    /** Windows */
    'win32': 'pngquant/windows/pngquant'
};
const getImages = (dir, imgs) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const imgPath = path.join(dir, file);
        const stat = fs.statSync(imgPath);
        if (stat.isDirectory()) {
            getImages(imgPath, imgs);
        }
        else {
            if (file.endsWith(".png")) {
                imgs.push(imgPath);
            }
        }
    });
};
async function compressAllImage(paths = [], root) {
    const platform = Os.platform();
    const pngquantPath = path.join(__dirname, "../", enginePathMap[platform]);
    // 设置引擎文件的执行权限（仅 macOS）
    if (pngquantPath && platform === 'darwin') {
        if (fs.statSync(pngquantPath).mode != 33261) {
            // 默认为 33188
            fs.chmodSync(pngquantPath, 33261);
        }
    }
    const qualityParam = `--quality 0-99`, speedParam = `--speed 3`, skipParam = platform == "win32" ? "" : '--skip-if-larger', outputParam = '--ext=.png', writeParam = '--force', 
    // colorsParam = config.colors,
    // compressOptions = `${qualityParam} ${speedParam} ${skipParam} ${outputParam} ${writeParam} ${colorsParam}`;
    compressOptions = `${qualityParam} ${speedParam} ${skipParam} ${outputParam} ${writeParam}`;
    const imgs = [];
    paths.forEach((dir) => {
        if (!fs.existsSync(root + "/" + dir))
            return;
        getImages(root + "/" + dir, imgs);
    });
    if (platform == "win32") {
        const now = Date.now();
        const tempDir = `C:\\Temp\\duiba\\${now}`;
        if (!fs.existsSync("C:\\Temp")) {
            fs.mkdirSync("C:\\Temp");
        }
        if (!fs.existsSync("C:\\Temp\\duiba")) {
            fs.mkdirSync("C:\\Temp\\duiba");
        }
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        const ps = imgs.map((imgPath, idx) => {
            return new Promise((resolve) => {
                const tempName = `${tempDir}\\${idx}_${path.basename(imgPath)}`;
                fs.copyFileSync(imgPath, tempName);
                (0, child_process_1.execSync)(`"${pngquantPath}" ${compressOptions} "${tempName}"`);
                fs.copyFileSync(tempName, imgPath);
                resolve();
            });
        });
        await Promise.all(ps);
        fs.rmSync(tempDir, { recursive: true });
    }
    else {
        let command = ""; // 先拼一条无用命令
        imgs.forEach((imgPath) => {
            command += `"${pngquantPath}" ${compressOptions} "${imgPath}" &`;
        });
        await new Promise((resolve) => {
            (0, child_process_1.exec)(command, (error, stdout, stderr) => {
                if (error) {
                    // console.error(error);
                }
                else {
                }
                resolve();
            });
        });
    }
    // const tasks = imgs.map((imgPath) => {
    //     return new Promise<void>((resolve) => {
    //         try {
    //             const command = `"${pngquantPath}" ${compressOptions} "${imgPath}"`;
    //
    //             console.log(command);
    //
    //             const originSize = fs.statSync(imgPath).size / 1000;
    //
    //             exec(command, (error, stdout, stderr) => {
    //                 if (error) {
    //                     // console.error(error);
    //                 } else {
    //                     const size = fs.statSync(imgPath).size / 1000;
    //                     // 计算压缩率
    //                     const rate = ((originSize - size) / originSize) * 100;
    //                     console.log(`%c压缩图片成功, ${originSize}k -> ${size}k 压缩率：${rate.toFixed(2)}%`, "color: green");
    //                 }
    //                 resolve();
    //             });
    //         } catch (e) {
    //             console.error(e);
    //             resolve();
    //         }
    //     });
    // });
    //
    // await Promise.all(tasks);
}
