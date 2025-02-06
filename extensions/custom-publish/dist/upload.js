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
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const progress_1 = __importDefault(require("progress"));
const ali_oss_1 = __importDefault(require("ali-oss"));
const Os = __importStar(require("os"));
class AutoUpload {
    options = {
        dir: "",
        originDir: "",
        region: "",
        accessKeyId: "",
        accessKeySecret: "",
        bucket: "",
    };
    client = null;
    bar = null;
    _files;
    existFiles = 0;
    uploadFiles = 0;
    errorFiles = 0;
    constructor(props) {
        this.options = Object.assign({}, this.options, props);
        const checkOptions = [
            "dir", "originDir",
            "bucket", "region",
            "accessKeySecret", "accessKeyId",
        ];
        for (const optionKey of checkOptions) {
            if (!this.options[optionKey]) {
                throw new Error(`AutoUpload: required option "${optionKey}"`);
            }
        }
        this.init();
    }
    init() {
        const { accessKeyId, accessKeySecret, bucket, region } = this.options;
        this.client = new ali_oss_1.default({ region, accessKeyId, accessKeySecret, bucket });
        this.bar = new progress_1.default(`文件上传中 [:bar] :current/${this.files().length} :percent :elapseds`, {
            complete: "●",
            incomplete: "○",
            width: 20,
            total: this.files().length,
            callback: () => {
                console.log("%cAll complete.", "color: green");
                console.log(`%c本次队列文件共${this.files().length}个，已存在文件${this.existFiles}个，上传文件${this.uploadFiles}个，上传失败文件${this.errorFiles}个`, "color: green");
            }
        });
        return this;
    }
    files() {
        if (this._files)
            return this._files;
        this._files = [];
        /**
         * 文件遍历方法
         * @param filePath 需要遍历的文件路径
         */
        const fileDisplay = (filePath) => {
            //根据文件路径读取文件，返回文件列表
            const files = fs.readdirSync(filePath);
            files.forEach((filename) => {
                //获取当前文件的绝对路径
                const fileDir = path.join(filePath, filename);
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                const stats = fs.statSync(fileDir);
                const isFile = stats.isFile(); //是文件
                const isDir = stats.isDirectory(); //是文件夹
                if (isFile) {
                    this._files.push(fileDir);
                }
                else if (isDir) {
                    fileDisplay(fileDir); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
                }
            });
        };
        //调用文件遍历方法
        fileDisplay(this.options.dir);
        return this._files;
    }
    async start() {
        const platform = Os.platform();
        const ps = this.files().map((file) => {
            let relativePath = "";
            if (platform === "win32") {
                console.log("win平台");
                relativePath = file.replace(this.options.dir + "\\", "");
                relativePath = relativePath.replace(/\\/g, "/");
            }
            else {
                relativePath = file.replace(this.options.dir + "/", "");
            }
            // const relativePath = path.relative(this.options.dir, file)
            //     .replace(path.sep, "/");
            this.existFiles = 0;
            this.uploadFiles = 0;
            this.errorFiles = 0;
            const originPath = `${this.options.originDir}${relativePath}`;
            return (async () => {
                let originFile = null;
                originFile = await this.client.head(originPath)
                    .catch((error) => originFile = error);
                try {
                    if (originFile.status === 404) {
                        await this.client.put(originPath, file);
                        this.uploadFiles += 1;
                    }
                    else {
                        this.existFiles += 1;
                    }
                }
                catch (error) {
                    this.errorFiles += 1;
                }
                this.bar.tick();
            })();
        });
        await Promise.all(ps).catch((err) => {
            console.error("上传错误", err);
        });
    }
}
exports.default = AutoUpload;
