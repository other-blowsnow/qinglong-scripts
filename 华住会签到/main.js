const hzhToken = process.env.HZH_TOKEN;

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
                'channel': '1',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Cookie': 'userToken=' + this.token,
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
                if (res.code !== 200) {
                    throw new Error("请求失败：" + res.message);
                }
                return res;
            })
    }

    async sign() {
        let date = Math.floor(Date.now() / 1000);

        let data = await this.request("https://appgw.huazhu.com/game/sign_in?date=" + date,
            {
                method: 'GET',
            }
        );
        return data.content.point;
    }

}

async function main() {
    if (!hzhToken) {
        console.error("请设置环境变量HZH_TOKEN");
        return;
    }
    // 分割token，使用分割符 @#
    const tokens = hzhToken.split('@');
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i].trim();
        const api = new Api(token)
        try {
            let point = await api.sign()
            console.log("签到成功", i + 1, point);
            if (typeof QLAPI !== 'undefined') {
                QLAPI.systemNotify({
                    "title": "华住会签到成功",
                    "content": `第${i + 1}个账号，签到积分：${point}`
                })
            }
        } catch (e) {
            console.error("签到失败", i + 1, e)
            if (typeof QLAPI !== 'undefined') {
                QLAPI.systemNotify({"title": "华住会签到失败", "content": e.message})
            }
        }
    }
}


main()
