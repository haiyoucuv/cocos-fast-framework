import {exec, execFile, execSync} from 'child_process';
import * as path from "path";
import * as fs from "fs";
import * as Os from "os";

/** 压缩引擎路径表 */
const enginePathMap = {
    /** macOS */
    'darwin': 'pngquant/macos/pngquant',
    /** Windows */
    'win32': 'pngquant/windows/pngquant'
}


const getImages = (dir, imgs) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const imgPath = path.join(dir, file);
        const stat = fs.statSync(imgPath);
        if (stat.isDirectory()) {
            getImages(imgPath, imgs);
        } else {
            if (file.endsWith(".png")) {
                imgs.push(imgPath);
            }
        }
    });
}

export async function compressAllImage(paths = [], root) {
    const platform = Os.platform();
    const pngquantPath = path.join(__dirname, "../", enginePathMap[platform]);
    // 设置引擎文件的执行权限（仅 macOS）
    if (pngquantPath && platform === 'darwin') {
        if (fs.statSync(pngquantPath).mode != 33261) {
            // 默认为 33188
            fs.chmodSync(pngquantPath, 33261);
        }
    }

    const qualityParam = `--quality 0-99`,
        speedParam = `--speed 3`,
        skipParam = platform == "win32" ? "" : '--skip-if-larger',
        outputParam = '--ext=.png',
        writeParam = '--force',
        // colorsParam = config.colors,
        // compressOptions = `${qualityParam} ${speedParam} ${skipParam} ${outputParam} ${writeParam} ${colorsParam}`;
        compressOptions = `${qualityParam} ${speedParam} ${skipParam} ${outputParam} ${writeParam}`;

    const imgs = [];
    paths.forEach((dir) => {
        if (!fs.existsSync(root + "/" + dir)) return;
        getImages(root + "/" + dir, imgs);
    });

    if (platform == "win32") {

        const now = Date.now();
        const tempDir = `C:\\Temp\\duiba\\${now}`

        if (!fs.existsSync("C:\\Temp")){
            fs.mkdirSync("C:\\Temp");
        }

        if (!fs.existsSync("C:\\Temp\\duiba")){
            fs.mkdirSync("C:\\Temp\\duiba");
        }

        if (!fs.existsSync(tempDir)){
            fs.mkdirSync(tempDir);
        }

        const ps = imgs.map((imgPath, idx) => {
            return new Promise<void>((resolve) => {
                const tempName = `${tempDir}\\${idx}_${path.basename(imgPath)}`;
                fs.copyFileSync(imgPath, tempName);
                execSync(`"${pngquantPath}" ${compressOptions} "${tempName}"`);
                fs.copyFileSync(tempName, imgPath);
                resolve();
            });
        });

        await Promise.all(ps);

        fs.rmSync(tempDir, { recursive: true });

    } else {

        let command = "";   // 先拼一条无用命令

        imgs.forEach((imgPath) => {
            command += `"${pngquantPath}" ${compressOptions} "${imgPath}" &`;
        });

        await new Promise<void>((resolve) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    // console.error(error);
                } else {
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
