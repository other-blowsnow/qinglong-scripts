// 1.扫描上级目录所有
const fs = require('fs');
const path = require('path');
const {buildProjectInfo, projectJsonPath, historyProjects, buildProjects} = require("./utils");


// 从参数里面获取项目路径
const name = process.argv[2];
if (!fs.existsSync(path.join(__dirname, '../', name))){
    console.error(`项目路径不存在：${name}`);
    process.exit(1);
}

for (let i = 0; i < historyProjects.length; i++) {
    const historyProject = historyProjects[i];
    if (historyProject.path === name) {
        const newProject = buildProjectInfo(name);
        newProject.updateTime = Date.now();

        historyProjects[i] = newProject;
        break;
    }
}

console.log("构建成功", historyProjects.length);

buildProjects(historyProjects)
