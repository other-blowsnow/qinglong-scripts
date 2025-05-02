## 功能
一个机场，通过edu可以免费获得一年每个月30G流量的套餐，或者注册后不要用，过一段时间会邮箱发送免费兑换码，签到可以延期

## 使用方法
### 抓包
注册登陆后F12获取cookie，这个机场到谷歌一搜就有，第一个就是，
这个cookie是只保留koa:sess=？？？; koa:sess.sig=？？ 这部分，前后不需要加引号

### 环境变量
GR_COOKIE=

案例
```shell
GR_COOKIE=koa:sess=eyJ1c2xxxxxxxxx; koa:sess.sig=sy_xxxxxxxxxxxxxx
```

## 来源
https://linux.do/t/topic/176621#p-1427388-glados-2

————————————————————————

[glados签到.zip](https://github.com/user-attachments/files/20007690/glados.zip)
