# InternPilot

InternPilot 是一个实习申请管理 Web App，帮助学生把分散在表格、邮箱、备忘录和浏览器书签里的岗位申请，整理成一个清晰的申请 pipeline。

## 产品定位

- **目标用户：** 正在同时申请多个实习岗位的学生。
- **核心问题：** 申请数量多后，截止日期、面试进度、备注和跟进事项容易分散和遗漏。
- **产品承诺：** 打开一个工作台，就能知道申请到了哪一步，以及今天最该处理什么。

## 当前功能

- 仪表盘：展示申请总数、活跃申请、面试数量和未来 7 天截止数量。
- 关注队列：按紧急程度展示需要优先处理的申请。
- Pipeline 看板：按 Wishlist、Applied、Interview、Offer、Rejected 分组。
- 搜索与筛选：支持按公司、岗位、地点、状态和优先级筛选。
- 申请管理：支持添加、编辑和删除申请。
- 本地保存：使用浏览器 `localStorage` 保存数据。
- CSV 导出：支持导出申请记录。
- 演示数据：支持一键重置 sample data。

## 本地运行

推荐运行：

```bash
npm start
```

然后打开：

```text
http://localhost:4173
```

也可以直接用浏览器打开 `index.html`。

## 部署到公网

这是一个纯静态项目，可以部署到 Netlify、Vercel 或 GitHub Pages。

详细步骤见：

[DEPLOYMENT.md](DEPLOYMENT.md)

## 项目结构

- `index.html`：产品页面结构。
- `styles.css`：响应式产品界面样式。
- `app.js`：状态管理、渲染、增删改查、本地保存和 CSV 导出。
- `PRD.md`：中文产品需求文档。
- `DEPLOYMENT.md`：公网部署说明。

## 后续迭代

- 看板阶段间拖拽。
- 截止日期提醒。
- 日历导出。
- 简历、cover letter 和岗位描述附件。
- 申请回复率和面试转化率分析。
- 用户账号和云同步。
