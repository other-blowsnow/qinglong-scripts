const token = process.env.TST_TOKEN;
const version = "3.16.0";


function request(url, options) {
    const defaultOptions = {
        method: 'POST',
        ...options,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) UnifiedPCWindowsWechat(0xf254032b) XWEB/13655',
            'Content-Type': 'application/json',
            'version': version,
            'xweb_xhr': '1',
            'user-token': token,
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
async function getSignActivityId() {

    const data = JSON.stringify({
        "shopId": null,
        "birthday": "",
        "gender": 1,
        "nickName": "",
        "phone": ""
    });

    const list = await request('https://sss-web.tastientech.com/api/minic/shop/intelligence/banner/c/list', {
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

async function getMyPoint() {
    return request('https://sss-web.tastientech.com/api/wx/point/myPoint', {
        method: 'POST',
        body: JSON.stringify({})
    }).then(result => result.point)
}

async function getMemberDetail() {
    return request('https://sss-web.tastientech.com/api/intelligence/member/getMemberDetail', {
        method: 'GET',
    })
}

async function sign(activityId, memberName, phone) {
    return request('https://sss-web.tastientech.com/api/sign/member/signV2', {
        method: 'POST',
        body: JSON.stringify({
            "activityId": activityId,
            "memberName": memberName,
            "phone": phone,
        })
    })
}

async function run() {
    if (!token){
        console.error("请设置环境变量TST_TOKEN");
        return;
    }
    try {
        const activityId = await getSignActivityId();
        console.log("获取签到活动ID：", activityId);

        const memberInfo = await getMemberDetail();

        await sign(activityId, memberInfo.nickName, memberInfo.phone);

        const point = await getMyPoint();
        console.log("当前积分：", point);

        if (typeof QLAPI !== 'undefined') {
            QLAPI.systemNotify({"title": "塔斯汀签到成功", "content": "当前积分：" + point})
        }
    } catch (e) {
        if (typeof QLAPI !== 'undefined') {
            QLAPI.systemNotify({"title": "塔斯汀签到失败", "content": e.message})
        }
        console.error("签到失败",e)
    }
}

run()
