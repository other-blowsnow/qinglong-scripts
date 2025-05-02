const fs = require('fs');
const path = require('path');

const projectJsonPath = path.join(__dirname, '../', 'project.json');
const historyProjects = fs.existsSync(projectJsonPath) ? JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8')) : [];
const historyProjectObjects = {};
for (const project of historyProjects) {
    historyProjectObjects[project.name] = project;
}

function buildProject(name){
    const baseDir = path.join(__dirname, '../', name);
    // 获取readme.md文件内容
    const readmePath = path.join(baseDir, 'readme.md');
    // 匹配项目readme
    const readme = fs.readFileSync(readmePath, 'utf-8').replaceAll('\r\n', '\n').replaceAll('\r', '\n');
    // 获取介绍
    let desc = '';
    const match = readme.match(/## 功能\n(.*)\n/);
    if (match) {
        desc = match[1].replace(/`/g, '').replace(/\n/g, '').trim();
    }
    // 获取项目图标地址
    const icon = fs.existsSync(path.join(baseDir, 'icon.png')) ? path.join(name, 'icon.png') : null;

    // 尝试判断脚本类型
    const scriptTypes = [
        {
            name: 'js',
            desc: 'JavaScript',
        },
        {
            name: 'ts',
            desc: 'TypeScript',
        },
        {
            name: 'python',
            desc: 'Python',
        },
        {
            name: 'shell',
            desc: 'Shell',
        }
    ];
    let projectType = "python"
    // 扫描目录，查询后缀
    const files = fs.readdirSync(baseDir);
    for (const file of files) {
        const ext = path.extname(file);
        for (const scriptType of scriptTypes) {
            if (ext === `.${scriptType.name}`) {
                projectType = scriptType.name;
                break;
            }
        }
    }

    let createTime = Date.now();
    if (historyProjectObjects[name] && historyProjectObjects[name].createTime) {
        createTime = historyProjectObjects[name].createTime;
    }
    let updateTime = Date.now();
    if (historyProjectObjects[name] && historyProjectObjects[name].updateTime) {
        updateTime = historyProjectObjects[name].updateTime;
    }
    return {
        name: name,
        desc: desc,
        content: readme,
        icon: icon,
        type: projectType,
        path: name,
        // 生成时间，如果有就别改了
        createTime: createTime,
        updateTime: updateTime
    }
}


module.exports = {
    projectJsonPath,
    historyProjects,
    historyProjectObjects,
    buildProject
}
