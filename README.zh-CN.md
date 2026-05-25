# PWALand 中文说明

PWALand 是一个用于发现、校验和提交 Progressive Web Apps 的精选目录。项目目标是帮助用户找到可安装、支持离线能力、体验接近原生应用的 Web 应用，同时为维护者提供一套在收录前校验 PWA 完整度的流程。

[English documentation](./README.md)

## 功能特性

- 精选 PWA 应用目录，支持分类浏览和关键词搜索。
- 推荐高质量 PWA 应用。
- 提交页面可检测目标网站是否满足核心 PWA 要求。
- 服务端校验 HTTPS、Web App Manifest、Service Worker、图标和 Display Mode。
- 支持重复检测，并可通过 Notion 集成存储提交的应用。
- 提供批量发现工具，可从公开域名来源中筛选候选 PWA。

## 项目结构

```text
pwaland/
├── projects/
│   ├── web-next/      # React Router 前端应用
│   └── server/        # Fastify API 服务
├── data/              # 精选和生成的 PWA 数据
├── scripts/           # 数据和 sitemap 工具脚本
├── bruno-api/         # Bruno API 调试集合
└── docs/              # 规划和优化文档
```

## 技术栈

- React 19 和 React Router 7 用于前端应用。
- Ant Design 6 用于界面组件。
- Vite 和 Vite+ 用于本地开发、构建、检查和测试。
- Fastify 5 用于 API 服务。
- Vitest 用于单元测试。
- Notion API 用于 PWA 数据存储集成。

## 快速开始

### 环境要求

- 推荐使用 Node.js 22 或更高版本。
- 使用项目声明的 pnpm 10.33.0。
- 需要 Vite+ CLI，也就是 `vp` 命令支持。

### 安装依赖

```bash
pnpm install
```

### 启动前端

```bash
cd projects/web-next
pnpm run dev
```

如果需要连接本地 API 服务，请使用本地代理模式：

```bash
cd projects/web-next
pnpm run dev:local
```

### 启动 API 服务

```bash
cd projects/server
pnpm run dev
```

### 构建

```bash
pnpm run build
```

### 测试

```bash
pnpm run test
```

## API 调试集合

`bruno-api/` 目录包含 Bruno 请求集合，覆盖常用 API 流程：

- 检查 URL 是否符合 PWA 要求。
- 添加 PWA 到目录。
- 从公开来源发现候选 PWA。
- 查询已有客户端或应用列表。

## 添加 PWA

推荐流程如下：

1. 打开 Web 应用中的提交页面。
2. 输入网站 URL。
3. 查看 PWA 检测结果。
4. 补充或调整系统建议的标题、图标、描述和标签。
5. 提交应用并写入存储。

如果只提交数据变更，请更新 `data/pwa.json`，并提供以下必填字段：

- `title`
- `icon`
- `link`

如果有更多信息，也可以补充描述、分类、标签、开发者和评分等元数据。

## 手动发现 PWA

Chrome 可以查看你访问过的、启用了 Service Worker 的网站：

```text
chrome://serviceworker-internals/
```

新版 Chrome 也可以在 DevTools 的 Application -> Service Workers 中查看类似信息。

## License

[MIT](./LICENSE)
