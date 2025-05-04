const crypto = require('crypto');

const envToken = process.env.MRNK_TOKEN;

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
                'accessToken': this.token,
                'xweb_xhr': '1',
                'Referer': 'https://servicewechat.com/wxe01416bd2b06871c/279/page-frame.html',
                ...(options.headers || {}),
            },
        };

        // 签名值
        const params = {
            // randomString 6位
            nonce: Math.random().toString(36).substring(2, 8),
            timestamp: parseInt((new Date).getTime() / 1e3),
        }
        const hash = crypto.createHash('md5');
        hash.update(params.nonce + params.timestamp + this.token)
        params.sign = hash.digest('hex');

        if (url.includes("?")){
            url = url + '&' + new URLSearchParams(params).toString()
        }else{
            url = url + '?' + new URLSearchParams(params).toString()
        }

        return fetch(url, defaultOptions)
            .then(async res => {
                if (res.status !== 200) {
                    throw new Error(`请求失败：${res.status}\n响应内容：${await res.text()}`);
                }
                return res;
            })
            .then(res => res.json())
            .then(res => {
                console.log('res', res);
                if (res.code !== 200) {
                    throw new Error("请求失败：" + res.error.message);
                }
                return res;
            })
    }

    async sign() {
        // 获取当前日期
        let date = new Date();

        // 获取年份、月份和日期
        let year = date.getFullYear();
        let month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1，并确保是2位数
        let day = String(date.getDate()).padStart(2, '0'); // 确保日期是2位数
        // 格式化成 年-月-日
        let formattedDate = `${year}-${month}-${day}`;

        await this.request("https://shopapp.miiow.com.cn/buyer/members/sign?time=" + formattedDate,
            {
                method: 'POST',
                body: JSON.stringify({})
            }
        );
    }

}

async function main() {
    if (!envToken) {
        console.error("请设置环境变量MRNK_TOKEN");
        return;
    }
    // 分割token，使用分割符 @#
    const tokens = envToken.split('@');
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i].trim();
        const api = new Api(token)
        try {
            await api.sign()
            console.log("签到成功", i + 1);
            if (typeof QLAPI !== 'undefined') {
                QLAPI.systemNotify({
                    "title": "猫人签到成功",
                    "content": `第${i + 1}个账号`
                })
            }
        } catch (e) {
            console.error("签到失败", i + 1, e)
            if (typeof QLAPI !== 'undefined') {
                QLAPI.systemNotify({"title": "猫人签到失败", "content": e.message})
            }
        }
    }
}


main()
