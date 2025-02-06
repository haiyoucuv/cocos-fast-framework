const exec = require('child_process').exec;

const extensions = [
    'custom-publish',
];

extensions.forEach((extension) => {
    const cmd = `cd ./extensions/${extension} && npm install`;
    console.log(`%c正在安装${extension}依赖...`, "color: green");
    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.log(`%c安装${extension}依赖失败`, "color: red");
            console.log(err);
            return;
        }
        console.log(`%c安装${extension}依赖完成`, "color: green");
    });
});