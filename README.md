# ⚡ DefiSense — Autonomous DeFi Research & Risk Agent

> **Built for the Agentmaxxx Hackathon (Base Sepolia & AI Agents Track)**
> An autonomous agent that navigates live DeFi protocols, compares yield incentives, evaluates impermanent loss & smart contract risk, and prepares on-chain transactions on Base.

---

## 🌟 Key Features

- **🌾 Live Yield Intelligence**: Deep queries into DeFi Llama & Dexscreener for real-time Base APYs and liquidity pools.
- **🛡️ Risk & IL Engine**: Evaluates impermanent loss risk, TVL sustainability, and contract battle-testedness.
- **💬 Interactive Agent Interface**: Glassmorphic dark-mode chat UI with multi-step tool call inspection and live market tickers.
- **⚡ Base Ecosystem Native**: Built specifically for Base L2 protocols (Aerodrome, Uniswap V3, Moonwell, Seamless).
- **🧪 Hackathon Experimentation Log**: Documented progression in [`docs/EXPERIMENTATION_LOG.md`](./docs/EXPERIMENTATION_LOG.md).

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js 16 + Tailwind CSS)         │
│  - Interactive AI Agent Chat Stream                       │
│  - Real-Time Base Ecosystem Pulse & Tickers               │
│  - Tool Call Visual Badges & Risk Cards                   │
└─────────────────────────────┬─────────────────────────────┘
                              ▼
┌───────────────────────────────────────────────────────────┐
│              AI AGENT CORE (Python + Gemini + FastAPI)    │
│  - Intent Classifier & Query Planner                      │
│  - Tool Registry: DeFi Llama, CoinGecko, Dexscreener      │
│  - Deterministic Analytical Engine + LLM Synthesizer      │
└─────────────────────────────┬─────────────────────────────┘
                              ▼
┌───────────────────────────────────────────────────────────┐
│              BLOCKCHAIN LAYER (Base Sepolia)              │
│  - Protocol TVL Verification                              │
│  - On-Chain Liquidity & Pair Health                       │
└───────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart

### 1. Python Agent Backend & CLI

```bash
# Set up Python virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r agent/requirements.txt

# Run the interactive CLI Mini-Agent
python agent/cli.py "What are the highest yield pools on Base right now?"

# Or start the FastAPI agent server
python agent/server.py
```

### 2. Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with DefiSense.
