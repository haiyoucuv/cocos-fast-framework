"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obfuscate = obfuscate;
const { exec } = require("child_process");
// TODO 要用这个功能就全局安装一下 javascript-obfuscator
// TODO yarn global add javascript-obfuscator
// TODO npm install -g javascript-obfuscator
function obfuscate(codePath) {
    return new Promise((resolve) => {
        const config = {
            // 疯狂debug
            "debug-protection": true,
            "debug-protection-interval": 4000,
            // 单行输出
            compact: true,
            // 自卫模式，美化代码就无法运行
            "self-defending": true,
            // 扁平化控制流
            "control-flow-flattening": true,
            "control-flow-flattening-threshold": 0.3,
            // 注入死代码
            "dead-code-injection": true,
            "dead-code-injection-threshold": 0.2,
            // 标识符名称生成器
            // hexadecimal			16进制 包体增大较多
            // mangled				短名称
            // mangled-shuffled		与mangled相同，但带有洗牌字母表
            // "identifier-names-generator": 'mangled-shuffled',
            // 数字转表达式 如:
            // const foo = 1234;
            // const foo=-0xd93+-0x10b4+0x41*0x67+0x84e*0x3+-0xff8;
            // numbersToExpressions: true,
            log: true,
            // 拆分字面字符串
            "split-strings": true,
            "string-array": true,
            "string-array-rotate": true,
            "string-array-calls-transform": true,
            "string-array-calls-transform-threshold": 1,
            // "string-array-encoding": ["none", "base64"],
            "string-array-wrappers-parameters-max-count": 5,
            "string-array-threshold": 1,
            // transformObjectKeys: true,
            target: "browser-no-eval",
        };
        let cmd = `javascript-obfuscator ${codePath} --output ${codePath}`;
        for (let key in config) {
            cmd += ` --${key} ${config[key]}`;
        }
        exec(cmd, (_err, stdout, _stderr) => {
            if (_err) {
                console.error(_err);
            }
            // console.log(_err, stdout, _stderr);
            resolve();
        });
    });
}
