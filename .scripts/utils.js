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

    let status =  '正常';
    if (fs.existsSync(path.join(baseDir, 'error'))){
        status = fs.readFileSync(path.join(baseDir, 'error'), 'utf-8');
        status = status.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
        status = status.replaceAll('\n', '');
    }

    // 追加写入readme文件
    if (!readme.includes("# ⚠️【免责声明】")){
        const disclaimer = `# ⚠️【免责声明】
1. 此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2. 由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3. 请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4. 此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5. 本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6. 如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7. 所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。`;
        fs.appendFileSync(readmePath, "\n\n" + disclaimer, 'utf-8');
    }

    return {
        name: name,
        desc: desc,
        content: readme,
        icon: icon,
        status: status,
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
    let tableMd = `| 项目名称 | 项目描述 | 状态 | 更新时间 |`
        + `\n| --- | --- | --- | --- |\n`;
    let table = '';
    for (const project of projects) {
        const updateTime = new Date(project.updateTime).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
        table += `| [${project.name}](${project.path}) | ${project.desc} | ${project.status} | ${updateTime} |\n`;
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
