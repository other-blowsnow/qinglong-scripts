// 1.扫描上级目录所有
const fs = require('fs');
const path = require('path');

const projectPath = path.join(__dirname, '../', 'project.json');
const historyProjects = fs.existsSync(projectPath) ? JSON.parse(fs.readFileSync(projectPath, 'utf-8')) : [];
const historyProjectObjects = {};
for (const project of historyProjects) {
    historyProjectObjects[project.name] = project;
}

const list = fs.readdirSync(path.join(__dirname, '../')).filter(dir => {
    if (dir.startsWith(".")) return false
    // 判断是否是目录
    const stat = fs.statSync(path.join(__dirname, '../', dir));
    if (!stat.isDirectory()) return false;
    return true;
})

// 2.构建项目列表

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
    return {
        name: name,
        desc: desc,
        content: readme,
        icon: icon,
        type: projectType,
        path: name,
        // 生成时间，如果有就别改了
        createTime: createTime,
        updateTime: Date.now()
    }
}

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
fs.writeFileSync(projectPath, JSON.stringify(projectList), 'utf-8');
