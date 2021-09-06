var exec = require('child_process').exec;

var cmd = 'node "./node_modules/apk-update/apk-update.js" "android/app/release/app-release.apk" "update/"';

exec(cmd, (error, stdout, stderr) => {
    // 获取命令执行的输出
});