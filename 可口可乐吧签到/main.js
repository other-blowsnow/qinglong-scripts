/**
 * name: 可口可乐吧
 * cron: 10 0 * * *
 * 环境变量：KKKLB_TOKEN = authorization
 */
const envName = "可口可乐吧"
const envTokenName = "KKKLB_TOKEN"
const envToken = process.env[envTokenName];

class Api {

    constructor(token) {
        this.token = token;
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
                'content-type': 'application/json',
                'authorization': this.token,
                'xweb_xhr': '1',
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
            .then(res => {
                if (!res.success) {
                    throw new Error("请求失败：" + res.message);
                }
                return res;
            })
    }

    async sign() {
        let res = await this.request("https://member-api.icoke.cn/api/icoke-sign/icoke/mini/sign/main/sign",
            {
                method: 'GET'
            }
        );
        return res.point;
    }
}

async function main() {
    if (!envToken) {
        console.error(`请设置环境变量${envTokenName}`);
        return;
    }
    // 分割token，使用分割符 @#
    const tokens = envToken.split('@');
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i].trim();
        const api = new Api(token)
        try {
            let point = await api.sign()
            console.log("签到成功", i + 1, point);
            if (typeof QLAPI !== 'undefined') {
                QLAPI.systemNotify({
                    "title": `${envName}签到成功`,
                    "content": `第${i + 1}个账号, 积分：${point}`
                })
            }
        } catch (e) {
            console.error("签到失败", i + 1, e)
            if (typeof QLAPI !== 'undefined') {
                QLAPI.systemNotify({"title": `${envName}签到失败`, "content": e.message})
            }
        }
    }
}


main()
