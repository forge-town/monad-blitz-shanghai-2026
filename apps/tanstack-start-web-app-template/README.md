# TanStack Start Web App Template

基于 TanStack Start 的全栈 Web 应用模板

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | TanStack Start (Vite + Nitro) |
| 路由 | TanStack Router (文件路由) |
| 数据层 | tRPC + Refine DataProvider |
| 状态管理 | TanStack Query + Zustand |
| 认证 | Better Auth |
| UI | shadcn/ui + Tailwind CSS v4 + Lucide Icons |
| 表单 | React Hook Form + Zod |
| 国际化 | i18next + react-i18next |
| 测试 | Vitest + Testing Library + Playwright |
| 文档 | Storybook |
| Lint | OxLint |
| 格式化 | OxFmt |

## 开发

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 运行测试
bun run test

# 类型检查 + lint + 格式化检查 + 测试
bun run quality

# E2E 测试
bun run test:e2e
```

## 目录结构

```
src/
├── components/       # 通用组件
├── hooks/            # 自定义 hooks
├── integrations/     # 第三方集成
│   ├── better-auth/         # 认证 (服务端)
│   ├── better-auth-client/  # 认证 (客户端)
│   ├── refine/              # Refine DataProvider
│   ├── server-env/          # 环境变量 (Zod)
│   ├── tanstack-query/      # React Query Provider
│   └── trpc/                # tRPC 路由 + 客户端
├── lib/              # 工具函数
├── locales/          # i18n 翻译文件
├── pages/            # 页面组件
├── routes/           # TanStack Router 文件路由
├── store/            # Zustand 状态管理
└── test/             # 测试工具
```
