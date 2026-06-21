# AIScope

> 让 AI 没那么神秘 · Making AI less mysterious

交互式 AI 学习平台 —— 基于 [Timwood0x10 的个人笔记库](https://github.com/Timwood0x10?tab=repositories) 衍生的可视化教学项目。

[English version](README.en.md) · [中文版](#-中文版说明-chinese) · [Live demo](https://Timwood0x10.github.io/AIScope)

---

### 项目简介

**AIScope** 是一个纯前端的交互项目，目标是把复杂的 AI 底层概念（自注意力机制、RAG、Agent、数学基础等）通过可视化和小游戏的方式呈现出来，让初学者也能"玩着玩着就看懂了"。

这个项目的核心内容来源于我的**个人笔记库**（深度学习笔记、数学笔记等），我把笔记中的关键点抽出，做成可视化演示和互动游戏，不再只是一堆干巴巴的公式。

### 与笔记库的关系

- **笔记库地址**：<https://github.com/Timwood0x10?tab=repositories>
- **本项目不是笔记的镜像**：AIScope 是独立的 React / Vite 前端项目，仅把笔记内容抽离为可视化组件。
- **笔记库仍是学习的主体**：如果你想深入学习原理，请阅读原始笔记；AIScope 是笔记的"演示层"。

### Agent 部分的说明

- 🚧 **Agent 模块尚未上线**（work in progress）。
- 目前页面中标注"Agent 构建"的菜单是**占位内容**。
- 正式的 Agent 部分将从**我自研的 Go 多 Agent 框架 [GoAgentX（improve 分支）](https://github.com/Timwood0x10/GoAgentX/tree/improve)** 拆解出来，作为学习参考。
- **GoAgentX 不是对 LangChain / LlamaIndex / AutoGen 的封装或模仿**，而是在工程层面重新组织的一套 Agent 抽象。它的核心设计点包括：
  - **可变 DAG 工作流引擎（MutableDAG + DynamicExecutor）**：支持运行时增删节点与边，热路径在 1 µs 内完成。
  - **6 步记忆蒸馏管道**：从原始交互中抽取经验 → 分类 → 评分 → 降噪 → 冲突消解 → 容量限制；并提供 Session / Task / Distilled 三层记忆，底层用 pgvector 做向量检索。
  - **AHP（Agent Hosting Protocol）自研通信协议**：Agent 间的结构化通信、心跳监控、死信队列（DLQ）、进度追踪。
  - **Leader / Sub 架构 + Leader Failover**：基于 Checkpoint 的故障恢复，Supervisor 检测到 Leader 失联后从最近 Checkpoint 恢复并重新分配任务。
  - **事件溯源（Event Sourcing）Runtime**：17 种事件类型覆盖 Agent 生命周期 / 任务 / 会话 / 工作流 / 故障转移；同时用 EventStore（操作层面）和 MemoryStore（认知层面）做双维度恢复。
  - **人为干预（Human-in-the-Loop）**：任意步骤可挂 `InterruptConfig` 暂停执行等待人工审批，InterruptStore 做崩溃恢复。
  - **可插拔向量存储层**：统一 Vector Store 接口，支持 PostgreSQL+pgvector / Qdrant / Milvus / SQLite / 内存实现。
  - **MCP（Model Context Protocol）集成**：JSON-RPC 2.0 消息，支持 Stdio 和 SSE 传输。
  - **可观测性**：WebSocket 实时 Dashboard、Flight Recorder 决策日志、Agent Genealogy 谱系追踪。
  - **混沌工程测试（Arena 框架）**：内置 process_kill / network_partition / latency_spike / kill_orchestrator 等故障注入，32 个 benchmark、2573 个带 `-race` 的测试。
- 我会先把 GoAgentX 的核心模块（工作流引擎 / 记忆蒸馏 / AHP 协议 / Leader 故障转移 / 事件溯源 Runtime）抽成独立、可教学的子模块，再逐步合并进 AIScope。
- 如果你对这套自研架构感兴趣，可以直接去 [GoAgentX improve 分支](https://github.com/Timwood0x10/GoAgentX/tree/improve) 看满血版源码；AIScope 这边会在 GoAgentX 核心稳定后，放出 `v1.x` 版本的 Agent 教程。

### 功能概览

| 模块 | 说明 |
| --- | --- |
| 🏠 首页 | 学习路径概览与快速入口 |
| 🧠 自注意力机制 | Q / K / V、多头注意力、RoPE 的可视化演示 |
| 📐 数学基础 | 微积分、矩阵论、概率论、信息几何等可视化 |
| 📚 RAG 教程 | 向量索引、相似度检索、混合检索的交互式演示 |
| 🤖 Agent 构建 | WIP，由 GoAgentX 项目拆解 |
| 🎮 寓教于乐（Games） | 11 个小游戏，玩着玩着就学懂了 |

### 小游戏列表

1. 📚 **图书馆管理员** — 理解 Q / K / V
2. ✂️ **Token 切割师** — 文本如何变成数字
3. 👁️ **注意力填词** — 可视化注意力权重
4. 🏔️ **山谷探险** — 梯度下降直觉
5. 🧭 **词向量空间** — 语义相似度与最近邻
6. 🏎️ **梯度赛车** — 学习率优化挑战
7. 🤖 **猜字大师** — 训练一个迷你模型
8. 🏗️ **Transformer 堆叠** — 深度与理解
9. 🌋 **Loss 曲面探险** — 不同优化器在 Loss 曲面上的表现
10. 🕵️ **侦探贝叶斯** — 条件概率与贝叶斯定理
11. 🏋️ **训练之旅** — 预训练 → SFT → RLHF / DPO

### 部署到 GitHub Pages

本项目是纯前端，可直接部署到 GitHub Pages：

1. 将本目录 `AIScope/` 作为一个独立仓库 push 到 GitHub。
2. 在仓库 `Settings → Pages → Build and deployment → Source` 选择 **GitHub Actions**。
3. 项目自带 `.github/workflows/deploy.yml`，每次 push 到 `main` 分支会自动构建并发布。
4. 由于 `vite.config.ts` 中使用了 `base: process.env.VITE_BASE_PATH || '/'`，GitHub Actions 会自动把 base 设为 `/仓库名/`，子路径部署不会出现 404。

> 如果你把仓库命名成别的名字，`VITE_BASE_PATH` 会自动用 `${{ github.event.repository.name }}`，无需手动改。

### 本地开发

```bash
cd AIScope
npm install
npm run dev        # 启动开发服务器
npm run build      # 生产构建
npm run preview    # 本地预览 dist 产物
```

### License

[Apache-2.0](LICENSE) — 可自由用于学习、教学与二次创作，但请注明来源于 [Timwood0x10](https://github.com/Timwood0x10) 的笔记库。
