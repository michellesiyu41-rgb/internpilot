# 部署说明

InternPilot 是一个纯静态 Web App，核心文件是 `index.html`、`styles.css` 和 `app.js`。它不需要后端、不需要数据库，也不需要构建步骤，因此可以直接部署到静态网站托管平台。

## 重要说明

当前版本使用浏览器 `localStorage` 保存数据。

这意味着：

- 每个访问者看到的是自己浏览器里的数据。
- 不同用户之间不会共享申请记录。
- 如果用户清理浏览器数据，本地记录可能丢失。
- 如果未来需要账号登录、跨设备同步或多人共享，需要增加后端和数据库。

## 推荐方案一：Netlify

适合最快发布一个公开链接。

步骤：

1. 打开 [Netlify](https://www.netlify.com/)。
2. 登录后选择 **Add new site**。
3. 选择 **Deploy manually** 或连接 GitHub 仓库。
4. 如果手动部署，直接上传整个项目文件夹。
5. 如果连接 GitHub：
   - Build command 留空。
   - Publish directory 填 `.`。
6. 部署完成后，Netlify 会生成一个公开网址。

项目中已经包含 `netlify.toml`，Netlify 可以直接识别发布目录。

## 推荐方案二：Vercel

适合后续升级为更完整的产品项目。

步骤：

1. 打开 [Vercel](https://vercel.com/)。
2. 登录后选择 **Add New Project**。
3. 导入 GitHub 仓库。
4. Framework Preset 选择 **Other**。
5. Build Command 留空。
6. Output Directory 保持默认或填 `.`。
7. 点击 Deploy。

项目中已经包含 `vercel.json`，可直接部署。

## 推荐方案三：GitHub Pages

适合用作品集或开源项目形式展示。

步骤：

1. 在 GitHub 创建一个新仓库，例如 `internpilot`。
2. 上传本项目所有文件。
3. 进入仓库的 **Settings**。
4. 打开 **Pages**。
5. Source 选择 `Deploy from a branch`。
6. Branch 选择 `main`，目录选择 `/root`。
7. 保存后等待 GitHub Pages 发布。

发布地址通常是：

```text
https://你的用户名.github.io/internpilot/
```

## 本地预览

可以在项目目录运行：

```bash
npm start
```

或者：

```bash
python3 -m http.server 4173
```

然后打开：

```text
http://localhost:4173
```

## 上线前检查清单

- 页面可以正常打开。
- 添加、编辑、删除申请可以正常使用。
- 搜索和筛选可以正常使用。
- 刷新页面后数据仍然保留。
- CSV 导出可以正常下载。
- 手机宽度下界面没有明显重叠或溢出。

## 后续如果要做成真正 SaaS

需要增加：

- 用户登录。
- 云端数据库。
- API 后端。
- 跨设备同步。
- 数据备份。
- 隐私政策和服务条款。
- 生产环境错误监控。
