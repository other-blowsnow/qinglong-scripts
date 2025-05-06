/**
 * name: 塔斯汀签到
 * cron: 10 0 * * *
 * 环境变量：TST_TOKEN = user-token
 */
const envName = "塔斯汀签到"
const envTokenName = "TST_TOKEN"
const envToken = process.env[envTokenName];

const version = "3.16.0";

class Api{

    constructor(token) {
        this.token = token;
    }

    request(url, options) {
        const defaultOptions = {
            method: 'POST',
            ...options,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) UnifiedPCWindowsWechat(0xf254032b) XWEB/13655',
                'Content-Type': 'application/json',
                'version': version,
                'xweb_xhr': '1',
                'user-token': this.token,
                'channel': '1',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                ...(options.headers || {}),
            },
        };

        return fetch(url, defaultOptions)
            .then(async res => {
                if (res.status !== 200) {
                    throw new Error(`请求失败：${res.status}\n响应内容：${await res.text()}`);
                }
                return res;
            })
            .then(res => res.json())
            .then(result => {
                if (result.code !== 200) {
                    throw new Error(`请求失败：${result.msg}`);
                }
                return result.result;
            })
    }

    // 获取签到activeid
    async getSignActivityId() {

        const data = JSON.stringify({
            "shopId": null,
            "birthday": "",
            "gender": 1,
            "nickName": "",
            "phone": ""
        });

        const list = await this.request('https://sss-web.tastientech.com/api/minic/shop/intelligence/banner/c/list', {
            body: data,
            method: 'POST'
        });

        const item = list.find(item => {
            return item.bannerName.includes("签到")
        })

        if (!item) {
            throw new Error("没有找到签到活动");
        }

        const jumpPara = JSON.parse(item.jumpPara);

        return jumpPara.activityId;
    }

    async getMyPoint() {
        return this.request('https://sss-web.tastientech.com/api/wx/point/myPoint', {
            method: 'POST',
            body: JSON.stringify({})
        }).then(result => result.point)
    }

    async getMemberDetail() {
        return this.request('https://sss-web.tastientech.com/api/intelligence/member/getMemberDetail', {
            method: 'GET',
        })
    }

    async sign(activityId, memberName, phone) {
        return this.request('https://sss-web.tastientech.com/api/sign/member/signV2', {
            method: 'POST',
            body: JSON.stringify({
                "activityId": activityId,
                "memberName": memberName,
                "phone": phone,
            })
        })
    }

}

async function run(handler){
    // 分割token，使用分割符 @#
    const tokens = envToken.split('@');

    console.log("=====共获取到 " + (tokens.length) + "个账号=====");

    for (let i = 0; i < tokens.length; i++) {
        console.log("=====开始执行第 " + (i + 1) + "个账号=====");
        const token = tokens[i].trim();
        try {
            let message = await handler(token);
            console.log("执行成功✅", message);
            if (typeof QLAPI !== 'undefined') {
                QLAPI.systemNotify({
                    "title": `${envName}执行成功`,
                    "content": `第${i + 1}个账号，${message}`
                })
            }
        } catch (e) {
            console.error("执行失败❌", e)
            if (typeof QLAPI !== 'undefined') {
                QLAPI.systemNotify({"title": `${envName}执行失败`, "content": e.message})
            }
        }

        console.log("=====结束执行第 " + (i + 1) + "个账号=====");
    }
}

async function main() {
    if (!envToken){
        console.error(`请设置环境变量${envTokenName}`);
        return;
    }

    await run(async (token) => {
        const api = new Api(token)
        const activityId = await api.getSignActivityId();
        console.log("获取签到活动ID：", activityId);

        const memberInfo = await api.getMemberDetail();

        await api.sign(activityId, memberInfo.nickName, memberInfo.phone);

        const point = await api.getMyPoint();

        return "签到成功，当前积分：" + point;
    })
}

main()
