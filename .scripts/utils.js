const fs = require('fs');
const path = require('path');

const projectJsonPath = path.join(__dirname, '../', 'project.json');
const historyProjects = fs.existsSync(projectJsonPath) ? JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8')) : [];
const historyProjectObjects = {};
for (const project of historyProjects) {
    historyProjectObjects[project.name] = project;
}

function buildProjectInfo(name){
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
    const scriptLanguages = [
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
    let projectLanguage = "python"
    // 扫描目录，查询后缀
    const files = fs.readdirSync(baseDir);
    for (const file of files) {
        const ext = path.extname(file);
        for (const scriptLanguage of scriptLanguages) {
            if (ext === `.${scriptLanguage.name}`) {
                projectLanguage = scriptLanguage.name;
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
        language: projectLanguage,
        path: name,
        // 生成时间，如果有就别改了
        createTime: createTime,
        updateTime: updateTime
    }
}

function buildProjects(projects){
    // 根据更新时间排序
    projects.sort((a, b) => {
        return b.updateTime - a.updateTime;
    });
    // 生成文件
    fs.writeFileSync(projectJsonPath, JSON.stringify(projects), 'utf-8');
    console.log('生成项目文件', projectJsonPath);

    // 生成项目表格
    buildProjectsTable(projects);
}

function buildProjectsTable(projects){
    let tableMd = `| 项目名称 | 项目描述 | 创建时间 | 更新时间 |`
        + `\n| --- | --- | --- | --- |\n`;
    let table = '';
    for (const project of projects) {
        const createTime = new Date(project.createTime).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
        const updateTime = new Date(project.updateTime).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
        table += `| [${project.name}](${project.path}) | ${project.desc} | ${createTime} | ${updateTime} |\n`;
    }
    tableMd = tableMd + table;

    // 替换文件内容
    const readmePath = path.join(__dirname, '../', 'readme.md');
    const readme = fs.readFileSync(readmePath, 'utf-8').replaceAll('\r\n', '\n').replaceAll('\r', '\n');
    const newReadme = readme.replace(/## 项目列表\n([\s\S]*?)-------项目列表结束--------/g, `## 项目列表\n${tableMd}-------项目列表结束--------`);
    fs.writeFileSync(readmePath, newReadme, 'utf-8');
}


module.exports = {
    projectJsonPath,
    historyProjects,
    historyProjectObjects,
    buildProjectInfo,
    buildProjects
}
