# NWPU 马原名词解释背诵助手

面向《马克思主义基本原理》课程的 180 个名词解释背诵工具：随机抽题、三档记忆标记、进度统计，账号下每个用户独立保存学习进度。

**在线体验**：<https://app-87wgn3z29udd.appmiaoda.com>

## 功能

| 功能 | 说明 |
| --- | --- |
| 随机抽题 | 从 180 条词条中随机出题，未学过的优先 |
| 记忆标记 | 已背过 / 模糊 / 没印象 三档状态，一键切换 |
| 进度统计 | 首页按状态汇总词条数量与完成度 |
| 词条解释 | 点开查看完整定义，对照记忆 |
| 分类浏览 | 按学习状态筛选词条列表 |
| 模拟考试 | 连续答题并汇总本轮结果 |
| 搜索词库 | 对词条与释义做模糊搜索 |
| 账号隔离 | Supabase Auth 登录，进度按用户隔离 |

## 页面与流程

登录 → 首页（统计 + 开始背诵）→ 答题（显示词条 / 标记状态 / 下一题）→ 解释页；另有词条列表、模拟考试、搜索页。路由见 `src/routes.tsx`，登录态由 `AuthContext` + `RouteGuard` 控制。

## 技术栈

React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui (Radix) · React Router 7 · Supabase（Postgres / Auth / RLS）

## 目录结构

```
src/
├── App.tsx / main.tsx / routes.tsx   # 应用入口与路由
├── pages/        # 首页、答题、解释、列表、模拟考试、搜索、登录
├── components/   # 业务组件与 shadcn/ui 组件
├── contexts/     # AuthContext 登录态
├── db/           # Supabase 客户端与数据访问封装
├── hooks/ lib/ types/
supabase/
├── migrations/   # 建表、RLS 策略、自动确认用户
└── schema.sql    # 线上库结构快照（含 180 条词条）
```

## 数据与配置

运行时从 `.env` 读取三项配置。仓库只保留模板 `.env.example`，`.env` 已被 `.gitignore` 忽略，复制后填入自己的值：

```bash
cp .env.example .env
```

| 变量 | 说明 |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase 项目地址 |
| `VITE_SUPABASE_ANON_KEY` | 匿名公钥，只能按 RLS 规则访问数据 |
| `VITE_APP_ID` | 秒哒应用 ID |

数据库三张表：`terms`（词条）、`profiles`（用户资料）、`user_progress`（学习进度）。三表均启用 RLS：匿名请求读不到任何行，登录用户只能读写自己的资料与进度。

## 本地校验

```bash
pnpm install
pnpm lint   # tsgo 类型检查 + biome + ast-grep 规则
```

本项目由秒哒（Baidu MIAODA）导出，`dev` / `build` 脚本由平台托管，仓库内保留为占位。

## 说明

个人课程复习项目，与学校官方无关；词条释义整理自课程资料，仅用于学习交流。

## 许可证

本项目基于 [MIT](./LICENSE) 许可开源，Copyright © 2026 22ABLE22。
