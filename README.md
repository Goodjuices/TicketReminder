TicketReminder 
一个简洁实用的 React Native 应用，用于管理事件提醒和目标倒计时。

项目介绍
TicketReminder 是一个帮助用户管理重要事件和目标的移动应用。通过设置事件提醒和目标倒计时，用户可以更好地规划时间，不错过任何重要时刻。

功能特点
### 事件提醒 (Event Reminder)
- 设置特定日期和时间的事件
- 自定义提醒时间（5分钟到1天前）
- 准时推送通知提醒

### 目标倒计时 (Goal Countdown)
- 设定目标日期
- 每日上午9点推送剩余天数提醒
- 直观显示距离目标还有多少天

### 其他特性
- 简洁美观的用户界面
- 滑动删除功能
- 本地数据持久化存储
- 支持英文界面(后续会增加中文等其他语言支持)

## 设备兼容性

已测试设备：
- 三星手机
- 华为手机


## 快速开始

### 下载使用
1. 从 [Releases](https://github.com/你的用户名/TicketReminder/releases) 页面下载最新的 APK 文件
2. 在手机设置中允许"安装未知来源应用"
3. 点击 APK 文件安装
4. 打开应用即可使用！

### 开发环境设置

> **注意**: 开始之前，请确保已完成 [React Native 环境设置](https://reactnative.dev/docs/environment-setup)。

1. 克隆项目

git clone https://github.com/Goodjuices/TicketReminder.git
cd TicketReminder

2. 安装依赖
bashnpm install
# 或者
yarn install

3. 运行 Metro
bashnpm start
# 或者
yarn start

4. 运行应用
新开一个终端窗口，运行：
bashnpm run android
# 或者
yarn android

技术栈
框架: React Native
数据存储: AsyncStorage
通知: React Native Push Notifications
日期选择: React Native Date Picker
列表滑动: React Native Swipe List View
状态管理: React Context API

问题排查
如果遇到构建或运行问题，请参考 React Native 故障排除指南。
贡献
欢迎提交 Issue 和 Pull Request！
开源协议
本项目采用 MIT 协议。
作者
GitHub: @Goodjuices

🙏 致谢

感谢 React Native 团队提供的优秀框架
感谢所有使用和支持这个项目的人！


⭐ 如果这个项目对你有帮助，请给一个 Star！