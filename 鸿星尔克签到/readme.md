## 具体功能
自动签到得积分，积分大概一个月就可以换帽子衣服

## 使用方法
### 抓包教程
- 打开“鸿星尔克官方会员中心小程序”
- 授权登陆
- 打开抓包工具
- 找*hope.demogic.com*域名的请求体或请求头*memberId* 和 *enterpriseId*

### 参数示例
格式为：memberId@enterpriseId
示例：ff80808xxxxxxxx@ff8080817xxxxxxx

### 环境变量
```
# 自行替换关键词变量
HXEK=memberId@enterpriseId
# 多个账号
HXEK=memberId@enterpriseId#memberId@enterpriseId
```

## 来源
https://github.com/CHERWING/CHERWIN_SCRIPTS
