/**
 * name: 冷酸灵签到
 * cron: 10 0 * * *
 * 环境变量：LSL_TOKEN = x-account-id&x-access-token
 */
const envName = "冷酸灵签到"
const envTokenName = "LSL_TOKEN"
const envToken = process.env[envTokenName];

class Api {

    constructor(token,userId) {
        this.token = token;
        this.userId = userId
    }

    request(url, options) {
        const defaultOptions = {
            method: 'POST',
            ...options,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) UnifiedPCWindowsWechat(0xf254032b) XWEB/13655',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'x-access-token': this.token,
                'x-account-id': this.userId,
                'content-type': 'application/json',
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
    }

    async sign() {
        let data = await this.request("https://consumer-api.quncrm.com/modules/campaigncenter/signin?maijsVersion=1.51.0&clientId=01969929-9d79-a375-7d4f-032b9d845916&appVersion=1.101.36.9bf363eab&appName=%E7%BE%A4%E8%84%89%E7%94%B5%E5%95%86&envVersion=release&clientTime=" + (new Date().toISOString()),
            {
                method: 'POST',
                body: JSON.stringify({
                    templateIds: []
                })
            }
        );
        return data?.rewardGroup[0]?.score;
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
    if (!envToken) {
        console.error(`请设置环境变量${envTokenName}`);
        return;
    }

    await run(async (token) => {
        const list = token.split('&')
        if (list.length !== 2){
            throw new Error("环境变量格式有问题，格式为：userId&token")
        }
        const api = new Api(list[1], list[0])
        let point = await api.sign()
        return "签到奖励积分：" + point
    })
}


main()
