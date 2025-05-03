// 1.扫描上级目录所有
const fs = require('fs');
const path = require('path');
const {buildProjectInfo, projectJsonPath, historyProjects, buildProjects} = require("./utils");


// 从参数里面获取项目路径
const name = process.argv[2];

console.log("开始构建", name);

if (!fs.existsSync(path.join(__dirname, '../', name))){
    console.error(`项目路径不存在：${name}`);
    process.exit(1);
}

let flag = false;
for (let i = 0; i < historyProjects.length; i++) {
    const historyProject = historyProjects[i];
    if (historyProject.path === name) {
        console.log("找到项目，更新项目更新时间");
        flag = true;
        const newProject = buildProjectInfo(name);
        newProject.updateTime = Date.now();

        historyProjects[i] = newProject;
        break;
    }
}

if (!flag){
    console.log("没有找到项目，添加新项目");
    const newProject = buildProjectInfo(name);
    historyProjects.push(newProject)
}

console.log("构建成功", historyProjects.length);

buildProjects(historyProjects)
