<div align="center">

# ⚡ DefiSense
### **Autonomous DeFi Research, Risk Assessment & Yield Orchestration Agent**

*Built for the Agentmaxxx Hackathon · Native to Base Sepolia L2*

[![Base Network](https://img.shields.io/badge/Base-Sepolia_L2-0052FF?style=for-the-badge&logo=coinbase&logoColor=white)](https://base.org)
[![Python 3.12](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Next.js 16](https://img.shields.io/badge/Next.js-16_App_Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

<p align="center">
  <a href="#-key-capabilities">Key Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-quantpulse-risk-engine">Risk Engine</a> •
  <a href="#-live-cli-demo">CLI Demo</a> •
  <a href="#-quickstart">Quickstart</a> •
  <a href="#-experimentation-log">Experiments</a>
</p>

---

</div>

## 🌌 Overview

**DefiSense** is an autonomous AI agent engineered specifically for on-chain liquidity providers and DeFi strategists on **Base**. 

Instead of manually navigating fragmented DEX interfaces, dashboards, and APR trackers, DefiSense continuously orchestrates multi-source on-chain and off-chain data tools to discover yield alpha, compute impermanent loss risk curves, verify smart contract liquidity depth, and synthesize actionable execution reports.

```
                         ┌─────────────────────────────┐
                         │   🗣️ User Natural Query     │
                         │ "Find best APYs on Base L2" │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       🤖 DefiSense Agent Orchestrator                       │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │ Intent Classification │  │ Multi-Turn Memory     │  │ Tool Planner    │  │
│  └───────────────────────┘  └───────────────────────┘  └─────────────────┘  │
└───────┬───────────────────────────────┬─────────────────────────────┬───────┘
        │                               │                             │
        ▼                               ▼                             ▼
┌───────────────┐               ┌───────────────┐             ┌───────────────┐
│  DeFi Llama   │               │ QuantPulse    │             │ Base Sepolia  │
│  Live Yields  │               │ Risk & IL     │             │ Web3 RPC      │
│  & TVL Scanner│               │ Formula Engine│             │ State Tracker │
└───────┬───────┘               └───────┬───────┘             └───────┬───────┘
        │                               │                             │
        └───────────────────────┬───────┴─────────────────────────────┘
                                │
                                ▼
         ┌───────────────────────────────────────────────┐
         │ 📊 Comprehensive Intelligence Report & Action │
         │  • Yield APY Breakdown (Base + Reward Tokens) │
         │  • Impermanent Loss Sensitivity Metric        │
         │  • Liquidity Health & Smart Contract Rating   │
         └───────────────────────────────────────────────┘
```

---

## ✨ Key Capabilities

| Feature | Description | Status |
|---|---|---|
| **🌾 Live Yield Intelligence** | Queries real-time pools across Aerodrome, Uniswap V3, Moonwell, and Seamless with TVL > $50k | ✅ Active |
| **🛡️ QuantPulse Risk Engine** | Mathematical Impermanent Loss divergence calculation + composite risk rating (0–100) | ✅ Active |
| **⚡ Base Sepolia On-Chain RPC** | Queries live block numbers, gas tracker in Gwei, and wallet balances via `web3.py` | ✅ Active |
| **💬 Glassmorphic Web3 UI** | Next.js 16 frontend with dark-mode neon aesthetics, interactive chat, and live Base pulse | ✅ Active |
| **🧠 Multi-Turn Memory** | Tracks user conversation history, preferred tokens, and risk tolerance across prompts | ✅ Active |
| **💱 On-Chain Swap Execution** | Uniswap V3 automated swap preparation and execution on Base Sepolia | 🚧 Week 3 Sprint |
| **💳 x402 Micropayments** | Micro-fee protocol for premium AI research and alpha generation | 🚧 Week 3 Sprint |

---

## 🛡️ QuantPulse Risk Engine

DefiSense incorporates a dedicated quantitative risk scoring engine to protect users from high-APY yield traps and predatory token emissions.

### 1. Impermanent Loss Divergence Formula
$$IL(k) = \frac{2\sqrt{k}}{1 + k} - 1$$

Where $k = \frac{P_{\text{new}}}{P_{\text{old}}}$ represents the relative price divergence ratio between paired assets in an Automated Market Maker (AMM).

### 2. Risk Score Classification
```
  0 ───[ 🛡️ Low Risk (<30) ]─── 30 ───[ ⚖️ Medium Risk (30-65) ]─── 65 ───[ ⚠️ High / Degen (>65) ]─── 100
```
- **Liquidity Depth Factor**: Penalizes pools with $< \$100\text{k}$ TVL ($+40\text{ pts}$).
- **Sustainability Factor**: Flags APYs $> 500\%$ ($+45\text{ pts}$) due to high inflationary token emissions.
- **Protocol Safety**: Applies reputational discount for battle-tested bluechips (Aerodrome, Uniswap, Moonwell).

---

## 💻 Live CLI Demo

DefiSense provides an interactive terminal CLI powered by `rich`:

```bash
python agent/cli.py "Check gas and analyze top Base yield pools"
```

```text
╭───────────────────────────────────────────────────────────────╮
│ DefiSense — Autonomous DeFi Research Agent                    │
│ Agentmaxxx Hackathon | Base Sepolia & DeFi Llama Intelligence │
╰───────────────────────────────────────────────────────────────╯
⠸ Agent researching DeFi Llama, CoinGecko & DEX pools...

  ⚡ DefiSense Intelligence Report: Check gas and analyze top Base yield pools  

Target Chain: Base | Analysis Engine: QuantPulse Risk v1.0                      

📊 Executive Summary                                                            
Analyzed real-time liquidity and yield conditions across the Base ecosystem.    

 • On-Chain Gas: Base Sepolia gas currently at 0.006 Gwei (Block #47745067).    
 • Top Yield Opportunity: aerodrome-slipstream (USDC-PROS) at 91,413.0% APY.

🌾 Yield Pools & QuantPulse Risk Assessment                                     

aerodrome-slipstream USDC-PROS                                                  
 • APY: 91413.0% (Base: 8.96%, Reward: 91404.04%)                               
 • Liquidity (TVL): $1,010,151                                                  
 • Risk Rating: ⚖️ MEDIUM RISK (Balanced) (Score: 50/100 | Est. IL: ~0.62%)     
 • Strategy Note: Good yield-to-risk ratio. Recommended to track reward token.

aerodrome-v1 WETH-TRAC                                                          
 • APY: 90376.41% (Base: 0%, Reward: 90376.41%)                                 
 • Liquidity (TVL): $64,216                                                     
 • Risk Rating: ⚠️ HIGH RISK (Aggressive / Degen) (Score: 85/100 | Est. IL: ~0.62%)

💡 Agent Recommendation & Next Steps                                            
 • For Conservative Yield: Deposit into bluechip money markets (Moonwell/Seamless).
 • For Yield Maximization: Utilize Aerodrome Slipstream concentrated LP pools.
```

---

## 📁 Repository Structure

```
Agentmaxxx/
├── agent/                       # 🐍 Python Agent Core & Tool Registry
│   ├── core/
│   │   ├── mini_agent.py        # Central multi-tool agent orchestrator
│   │   └── memory.py            # Multi-turn conversation state manager
│   ├── tools/
│   │   ├── defi_llama.py        # DeFi Llama TVL & Yield pool API
│   │   ├── coingecko.py         # Token price & market cap tracker
│   │   ├── dexscreener.py       # DEX liquidity and pair data
│   │   ├── base_rpc.py          # Base Sepolia Web3 RPC node client
│   │   └── risk_engine.py       # QuantPulse Impermanent Loss engine
│   ├── cli.py                   # Terminal CLI runner with rich formatting
│   ├── server.py                # FastAPI backend server
│   └── requirements.txt         # Python package dependencies
│
├── frontend/                    # ⚛️ Next.js 16 Web3 App
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # AI Agent Chat & Base Pulse Dashboard
│   │   │   ├── globals.css      # Dark-mode glassmorphism styling
│   │   │   └── api/agent/       # Next.js API route proxying to agent
│   │   └── layout.tsx           # Root viewport & metadata configuration
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   └── EXPERIMENTATION_LOG.md   # 🧪 Tracked experiments for hackathon grading
│
├── .env.example                 # Environment configuration template
├── .gitignore                   # Clean ignore rules
└── README.md                    # Project documentation
```

---

## ⚡ Quickstart Guide

### Prerequisites
- **Node.js** `>= 18.17.0` (Node 20+ recommended)
- **Python** `>= 3.10`

### 1. Clone & Setup Repository
```bash
git clone https://github.com/ashishh-tech/Maxit.git
cd Maxit
```

### 2. Python Agent Backend
```bash
# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

# Install dependencies
pip install -r agent/requirements.txt

# Run the CLI Agent directly
python agent/cli.py "Find highest APY pools on Base"

# Or start the FastAPI API Server (port 8000)
python agent/server.py
```

### 3. Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the visual agent interface.

---

## 🧪 Hackathon Evaluation

### Track & Focus
- **Hackathon**: [Agentmaxxx Hackathon](https://github.com/ashishh-tech/Maxit)
- **Track**: AI Agents on Base L2
- **Experimentation Log**: Detailed records in [`docs/EXPERIMENTATION_LOG.md`](./docs/EXPERIMENTATION_LOG.md) documenting hypotheses, API benchmark findings, and risk formula calibrations.

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE) — feel free to use and build upon it.

<div align="center">
  <sub>Built with 💙 on <b>Base</b> by <a href="https://github.com/ashishh-tech">ashishh-tech</a></sub>
</div>
