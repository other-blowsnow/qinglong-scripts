#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import random
import time
import os
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ========================
# 注意，此脚本使用ymyuuu大佬的接口
# github地址为https://github.com/ymyuuu/Steps-API
# ========================

# ========================
# 用户配置区（必须修改）
# ========================
ACCOUNT = "账号"      # 步数账号
PASSWORD = "密码"    # 步数密码
SERVERCHAN_SENDKEY = ""   # Server酱SendKey

# ========================
# 高级配置（可选修改）
# ========================
MAX_RETRIES = 3                    # 最大重试次数
REQUEST_TIMEOUT = (10, 30)         # 连接/读取超时时间（秒）
STEP_RANGE = (12000, 15000)        # 随机步数范围

def send_wechat_notification(success, steps=0, message=""):
    """发送优化版微信推送"""
    url = f"https://sctapi.ftqq.com/{SERVERCHAN_SENDKEY}.send"
    
    # 标题直接显示核心信息（包含emoji和步数）
    status_icon = "✅" if success else "❌"
    status_text = "成功" if success else "失败"
    title = f"{status_icon} 步数提交{status_text} | 目标步数：{steps}"
    
    # 优化Markdown内容排版（使用两个空格实现换行）
    content = f"""**🗓️ 时间**：{time.strftime('%Y-%m-%d %H:%M:%S')}  
**🌐 服务器**：`{os.uname().nodename}`  
**🆔 账号**：`{ACCOUNT}`  
**📝 详情**：{message}"""
    
    params = {
        "title": title,          # 主标题显示关键信息
        "desp": content,         # 内容使用Markdown格式
        "channel": 9             # 使用简洁的消息模板
    }
    
    try:
        response = requests.post(url, params=params, timeout=10)
        result = response.json()
        
        if response.status_code == 200 and result.get("code") == 0:
            return True
        print(f"⚠️ 微信推送失败：{result.get('message')}")
        return False
    except Exception as e:
        print(f"⚠️ 微信推送异常：{str(e)}")
        return False

def create_http_session():
    """创建带连接管理的HTTP会话"""
    session = requests.Session()
    
    # 配置重试策略
    retry_policy = Retry(
        total=MAX_RETRIES,
        backoff_factor=1.5,
        status_forcelist=[500, 502, 503, 504, 524],
        allowed_methods=["GET"]
    )
    
    adapter = HTTPAdapter(
        max_retries=retry_policy,
        pool_connections=2,
        pool_maxsize=2,
        pool_block=True
    )
    
    session.mount('https://', adapter)
    return session

def submit_steps(session):
    """执行步数提交核心逻辑"""
    steps = random.randint(*STEP_RANGE)
    url = f"https://steps.8bq.ovh/api?account={ACCOUNT}&password={PASSWORD}&steps={steps}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36",
        "Accept": "application/json",
        "Connection": "close"
    }
    
    try:
        with session.get(url, headers=headers, timeout=REQUEST_TIMEOUT) as response:
            response.raise_for_status()
            return True, steps, f"步数：{steps} | 响应：{response.text.strip()}"
    except requests.exceptions.RequestException as e:
        return False, 0, f"错误类型：{type(e).__name__} | 详情：{str(e)}"
        
def main():
    """主执行函数"""
    print(f"🕒 启动时间：{time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📂 工作目录：{os.getcwd()}")
    
    session = None
    try:
        session = create_http_session()
        success, steps, message = submit_steps(session)
        
        # 打印并推送结果
        status_icon = "✅" if success else "❌"
        print(f"{status_icon} {message}")
        send_wechat_notification(success, steps, message)
        
    except Exception as e:
        error_msg = f"未捕获异常：{str(e)}"
        print(f"❌ {error_msg}")
        send_wechat_notification(False, 0, error_msg)
        
    finally:
        if session:
            session.close()
            print("🔒 连接会话已关闭")

if __name__ == "__main__":
    main()