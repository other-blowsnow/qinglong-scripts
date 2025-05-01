## 具体功能
自动签到得积分，积分大概一个月就可以换帽子衣服

## 使用方法
### 抓包教程
使用Root了的安卓，或苹果手机，或电脑微信小程序抓包，以reqable为例：开始抓包，windows微信搜索并打开“鸿星尔克会员中心”小程序，并注册登录，点击积分商城里的签到，如果这样抓不到，把账号退出重新登录。
选择抓hope.demogic.com这个域名，找这个域名下的post和get请求，在请求体或请求头中找memberId和enterpriseId，记录下来，保存成memberId@enterpriseId的形式，
在青龙面板中创建环境变量HXEK值为 memberId和enterpriseId ，多个账号用多账号#或&分割，佬友们可以参考我的 ff8080819151524f01915？？？？@ff8080817d9f？？？？ 
此外，如果CHERWIN_TOOLS.py下载失败，可以直接将本文件夹中的对应文件，上传到青龙的同一个文件夹下，已将原脚本中的GitHub下载链接替换成含代理的来适配大陆网络环境

## 来源
https://linux.do/t/topic/176621
