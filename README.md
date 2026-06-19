# AIScope

> Making AI less mysterious · 让 AI 没那么神秘

An interactive AI learning platform — a visualization project ported from [Timwood0x10's personal notes](https://github.com/Timwood0x10?tab=repositories).

[中文版](README.md) · [Live demo](https://Timwood0x10.github.io/AIScope)

---

## Project Overview

**AIScope** is a pure-frontend interactive project. The goal is to demystify the fundamentals of AI — self-attention, RAG, Agents, math foundations, **etc**. — through visualizations and mini-games, so that even beginners can "learn by playing".

The content is extracted from **my personal notes** (deep learning notes, mathematics notes, **etc**.). I pulled the essential points out and turned them into interactive visualizations and games, instead of leaving them as pages of dry formulas.

### Relationship with the notes repositories

- **Notes repositories**：<https://github.com/Timwood0x10?tab=repositories>
- **This project is NOT a mirror of the notes.** AIScope is a standalone React / Vite project that turns notes into interactive / visual components.
- **The notes remain the primary learning material**: if you want to dive deep into the theory, please read the original notes. AIScope is the "visualization layer" on top of them.

### About the Agent section

- 🚧 **The Agent module is NOT live yet.**
- The "Agent Building" menu entry on the page is currently a **placeholder**.
- The production-ready Agent module will be disassembled from **my self-built Go multi-agent framework [GoAgentX (improve branch)](https://github.com/Timwood0x10/GoAgentX/tree/improve)**, and used here as a learning reference.
- **GoAgentX is NOT a wrapper or mimic of LangChain / LlamaIndex / AutoGen / similar tools.** It is an engineering-level re-architecture grounded in my own design of how agents should be modeled. Core design points:
  - **Mutable DAG workflow engine (MutableDAG + DynamicExecutor)**：runtime node/edge mutation, hot paths complete under 1 µs.
  - **6-step memory distillation pipeline**：extract experiences → classify → score → de-noise → conflict resolution → capacity limit; with Session / Task / Distilled three memory tiers, backed by pgvector for semantic retrieval.
  - **AHP (Agent Hosting Protocol) — a custom inter-agent communication protocol**：structured inter-agent messaging, heartbeat monitoring, dead-letter queue (DLQ), progress tracking.
  - **Leader / Sub architecture with Leader Failover**：checkpoint-based recovery. The supervisor detects when a leader goes down, recovers from the last checkpoint, and reassigns work to available sub-agents.
  - **Event Sourcing Runtime**：17 event types covering agent lifecycle / tasks / sessions / workflows / failover; dual-dimension recovery via EventStore (operational) + MemoryStore (cognitive).
  - **Human-in-the-Loop**：any step can attach an `InterruptConfig` to pause execution and wait for human approval; InterruptStore handles crash recovery of pending approvals.
  - **Pluggable vector storage layer**：unified Vector Store interface with PostgreSQL+pgvector / Qdrant / Milvus / SQLite / in-memory implementations.
  - **MCP (Model Context Protocol) integration**：JSON-RPC 2.0 messaging, with Stdio and SSE transport support.
  - **Observability**：WebSocket real-time dashboard, Flight Recorder decision logging, Agent Genealogy lineage tracking.
  - **Chaos engineering (Arena framework)**：built-in fault injection for process_kill / network_partition / latency_spike / kill_orchestrator; 32 benchmarks, 2573 tests passing with `-race`.
- I will first extract GoAgentX's core modules (workflow engine / memory distillation / AHP protocol / leader failover / event-sourcing runtime) into standalone, teachable sub-modules, and then merge them into AIScope incrementally.
- If this homegrown architecture interests you, head straight to the [GoAgentX improve branch](https://github.com/Timwood0x10/GoAgentX/tree/improve) for the full-featured source. AIScope will publish the `v1.x` Agent tutorials once the GoAgentX core stabilizes.

### Features at a glance

| Module | Description |
| --- | --- |
| 🏠 Home | Learning path overview & quick entry |
| 🧠 Self-Attention | Q / K / V, multi-head attention, RoPE — visual demos |
| 📐 Math Basics | Calculus, linear algebra, probability, information geometry |
| 📚 RAG Tutorial | Vector indexing, similarity search, hybrid retrieval |
| 🤖 Agent Building | WIP, to be disassembled from GoAgentX |
| 🎮 Learning Games | 11 mini-games — learn by playing |

### List of mini-games

1. 📚 **Library Admin** — understanding Q / K / V
2. ✂️ **Token Slicer** — how text becomes numbers
3. 👁️ **Attention Fill-in** — visualizing attention weights
4. 🏔️ **Valley Adventure** — gradient descent intuition
5. 🧭 **Word Vector Space** — semantic similarity & nearest neighbors
6. 🏎️ **Gradient Racing** — learning rate optimization challenge
7. 🤖 **Guess Master** — training a mini model
8. 🏗️ **Transformer Stacking** — depth vs understanding
9. 🌋 **Loss Surface Explorer** — different optimizers on a loss landscape
10. 🕵️ **Detective Bayes** — conditional probability and Bayes' theorem
11. 🏋️ **Training Journey** — Pretrain → SFT → RLHF / DPO

### Deploy to GitHub Pages

This project is pure frontend and can be directly deployed to GitHub Pages：

1. Push the contents of this `AIScope/` folder to a standalone GitHub repository.
2. Go to `Settings → Pages → Build and deployment → Source` and select **GitHub Actions**.
3. The project ships with `.github/workflows/deploy.yml` out of the box — every push to `main` triggers an automated build & deploy.
4. `vite.config.ts` uses `base: process.env.VITE_BASE_PATH || '/'`, and the GitHub Action sets `VITE_BASE_PATH: /<repo-name>/`, so sub-path deployment won't cause 404s.

> If you name the repository something else, `VITE_BASE_PATH` automatically picks up `${{ github.event.repository.name }}`, so no manual change is needed.

### Local development

```bash
cd AIScope
npm install
npm run dev        # start the dev server
npm run build      # production build
npm run preview    # preview the dist locally
```

### Project layout

```
AIScope/
├── .github/workflows/deploy.yml   # automated GitHub Pages deploy
├── src/
│   ├── components/                # layout / UI / chart components
│   ├── pages/                     # route pages + 11 mini-games
│   ├── i18n/                      # Chinese / English switching
│   └── utils/                     # math / vector utilities
├── public/                        # static assets (favicon etc.)
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── tsconfig.json
```

### License

[Apache-2.0](LICENSE) — free for learning, teaching and remixing. Please attribute the original notes by [Timwood0x10](https://github.com/Timwood0x10).
