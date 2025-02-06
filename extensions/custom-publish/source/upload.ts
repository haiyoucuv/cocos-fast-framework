import * as path from "path";
import * as fs from "fs";
import ProgressBar from "progress";
import OSS from "ali-oss";
import * as Os from "os";

interface IAutoUploadOptions {
    dir: string,
    originDir: string,
    bucket: string,
    accessKeyId: string,
    accessKeySecret: string,
    region: string,
}

export default class AutoUpload {
    options: IAutoUploadOptions = {
        dir: "",
        originDir: "",
        region: "",
        accessKeyId: "",
        accessKeySecret: "",
        bucket: "",
    };

    client = null;
    bar = null;
    private _files: any;
    private existFiles: number = 0;
    private uploadFiles: number = 0;
    private errorFiles: number = 0;

    constructor(props: IAutoUploadOptions) {

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
        const {accessKeyId, accessKeySecret, bucket, region} = this.options;
        this.client = new OSS({region, accessKeyId, accessKeySecret, bucket});

        this.bar = new ProgressBar(`文件上传中 [:bar] :current/${this.files().length} :percent :elapseds`, {
            complete: "●",
            incomplete: "○",
            width: 20,
            total: this.files().length,
            callback: () => {
                console.log("%cAll complete.", "color: green");
                console.log(`%c本次队列文件共${this.files().length}个，已存在文件${this.existFiles}个，上传文件${this.uploadFiles}个，上传失败文件${this.errorFiles}个`, "color: green");
            }
        })
        return this;
    }

    files() {
        if (this._files) return this._files;
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
                const isFile = stats.isFile();//是文件
                const isDir = stats.isDirectory();//是文件夹
                if (isFile) {
                    this._files.push(fileDir);
                } else if (isDir) {
                    fileDisplay(fileDir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                }
            });
        }

        //调用文件遍历方法
        fileDisplay(this.options.dir);
        return this._files;
    }

    async start() {
        const platform = Os.platform();

        const ps = this.files().map((file) => {

            let relativePath = "";

            if (platform === "win32") {
                console.log("win平台")
                relativePath = file.replace(this.options.dir + "\\", "");
                relativePath = relativePath.replace(/\\/g, "/");
            } else {
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
                    } else {
                        this.existFiles += 1;
                    }
                } catch (error) {
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
