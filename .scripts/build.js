// 1.扫描上级目录所有
const fs = require('fs');
const path = require('path');
const {buildProject, projectJsonPath} = require("./utils");


const list = fs.readdirSync(path.join(__dirname, '../')).filter(dir => {
    if (dir.startsWith(".")) return false
    // 判断是否是目录
    const stat = fs.statSync(path.join(__dirname, '../', dir));
    if (!stat.isDirectory()) return false;
    return true;
})

// 2.构建项目列表
const projectList = []
for (const name of list) {
    try {
        projectList.push(buildProject(name));
    }catch (e){
        console.error(`构建项目失败：${name}`, e);
    }
}

console.log("构建成功", projectList.length);

// 生成文件
fs.writeFileSync(projectJsonPath, JSON.stringify(projectList), 'utf-8');
