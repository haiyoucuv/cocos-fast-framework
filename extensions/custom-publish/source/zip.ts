import * as fs from "fs";
import * as path from "path";
import JSZIP from "jszip";

//读取目录及文件
function readDir(zip, nowPath) {
    const files = fs.readdirSync(nowPath);
    files.forEach(function (fileName, index) {//遍历检测目录中的文件
        console.log(fileName, index);//打印当前读取的文件名
        const fillPath = nowPath + "/" + fileName;
        const file = fs.statSync(fillPath);//获取一个文件的属性
        if (file.isDirectory()) {//如果是目录的话，继续查询
            const dirlist = zip.folder(fileName);//压缩对象中生成该目录
            readDir(dirlist, fillPath);//重新检索目录文件
        } else {
            // 排除图片文件
            if (fileName.endsWith(".png") || fileName.endsWith(".jpg")) {
                return;
            }
            zip.file(fileName, fs.readFileSync(fillPath));//压缩目录添加文件
        }
    });
}

//开始压缩文件
export function zipDir(name, dir, dist) {
    return new Promise<void>((resolve, reject) => {
        const zip = new JSZIP();
        readDir(zip, dir);
        zip.generateAsync({//设置压缩格式，开始打包
            type: "nodebuffer",//nodejs用
            compression: "DEFLATE",//压缩算法
            compressionOptions: {//压缩级别
                level: 9
            }
        }).then((content: any) => {
            fs.writeFileSync(`${dist}/${name}.bundle`, content, "utf-8");
            resolve();
        });
    });
}

