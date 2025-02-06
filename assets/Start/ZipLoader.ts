import {assetManager} from "cc";

const ZipCache = new Map<string, any>();
const ResCache = new Map<string, any>();

const loadBundle = assetManager.loadBundle.bind(assetManager);
assetManager.loadBundle = function (nameOrUrl: string, ...args) {
    const zipBundle = window["zipBundle"] || [];
    if (zipBundle.indexOf(nameOrUrl) > -1) {
        ZipLoader.ins.loadZip(`${window["__remoteUrl__"]}remote/${nameOrUrl}`)
            .then(() => {
                loadBundle(nameOrUrl, ...args);
            });
    } else {
        loadBundle(nameOrUrl,...args);
    }
};

export default class ZipLoader {

    static _ins: ZipLoader;
    static get ins() {
        if (!this._ins) {
            this._ins = new ZipLoader();
        }
        return this._ins;
    }

    constructor() {
        this.init();
    }

    /**
     * 下载单个zip文件为buffer
     * 为什么这里带上后缀名后面会讲到，是为了方面自动化
     * @param path 文件路径
     * @returns zip的buffer
     */
    downloadZip(path: string): Promise<ArrayBuffer> {
        return new Promise((resolve) => {
            assetManager.downloader.downloadFile(
                path + '.zip',
                {xhrResponseType: "arraybuffer"},
                null,
                (err, data) => {
                    resolve(data);
                }
            );
        });
    }

    /**
     * 解析加载Zip文件
     * @param path 文件路径
     */
    async loadZip(path: string) {

        const jsZip = window["JSZip"]();

        const zipBuffer = await this.downloadZip(path);

        const zipFile = await jsZip.loadAsync(zipBuffer);

        // 解析zip文件，将路径，bundle名，文件名拼起来，直接存在一个map里吧
        zipFile.forEach((v, t) => {
            if (t.dir) return;
            ZipCache.set(path + "/" + v, t);
        });
    }

    init() {

        // const originalAppendChild = document.body.appendChild;
        // document.body.appendChild = function (element) {
        //
        //     // @ts-ignore
        //
        //     if (element.tagName && element.tagName.toLowerCase() === 'script') {
        //
        //         const origin = window.location.origin + "/";
        //
        //         // @ts-ignore
        //
        //         const zipUrl = element.src.replace(origin, "");
        //
        //         console.log('result:', zipUrl);
        //
        //         if (ResCache.has(zipUrl as string)) {
        //
        //             const jsContent = ResCache.get(zipUrl);
        //
        //             console.log('text:', jsContent);
        //
        //             var newScript = document.createElement('script');
        //
        //             newScript.type = 'text/javascript';
        //
        //             newScript.innerHTML = jsContent;
        //
        //             newScript.onload = () => {
        //
        //                 console.log('Script executed:', newScript.src);
        //
        //             };
        //
        //             document.body.appendChild(newScript);
        //
        //             return
        //
        //         }
        //
        //     }
        //
        //     return originalAppendChild.call(document.body, element);
        //
        // };

        const accessor = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'response');
        Object.defineProperty(XMLHttpRequest.prototype, 'response', {
            get: function () {
                if (this.zipCacheUrl) {
                    const res = ResCache.get(this.zipCacheUrl);
                    return this.responseType === "json"
                        ? JSON.parse(res)
                        : res;
                }
                return accessor.get.call(this);
            },
            set: function (str) {
                // console.log('set responseText: %s', str);
                // return accessor.set.call(this, str);
            },
            configurable: true
        });

        // 拦截open
        const oldOpen = XMLHttpRequest.prototype.open;
        // @ts-ignore
        XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
            // 有这个资源就记录下来
            if (ZipCache.has(url as string)) {
                this.zipCacheUrl = url;
            }
            return oldOpen.apply(this, arguments);
        }

        // 拦截send
        const oldSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = async function (data) {
            // 记录过了就解析
            if (this.zipCacheUrl) {
                // 有缓存就不解析了
                if (!ResCache.has(this.zipCacheUrl)) {

                    const cache = ZipCache.get(this.zipCacheUrl);

                    if (this.responseType === "json") {
                        const text = await cache.async("text");
                        ResCache.set(this.zipCacheUrl, text);
                    } else {
                        // 直接拿cocos设置的responseType给zip解析
                        const res = await cache.async(this.responseType);
                        ResCache.set(this.zipCacheUrl, res);
                    }
                }

                // 解析完了直接调用onload，并且不再发起真实的网络请求
                this.onload();
                return;
            }

            return oldSend.apply(this, arguments);
        }
    }
}