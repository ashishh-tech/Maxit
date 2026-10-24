<div align="center">

# ⚡ DefiSense
### **Autonomous DeFi Research, Risk Assessment & Yield Orchestration Agent**

*Built for the Agentmaxxx Hackathon · Native to Base Sepolia L2*

[![Base Network](https://img.shields.io/badge/Base-Sepolia_L2-0052FF?style=for-the-badge&logo=coinbase&logoColor=white)](https://base.org)
[![Python 3.12](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Next.js 16](https://img.shields.io/badge/Next.js-16_App_Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Netlify](https://img.shields.io/badge/Live_Demo-agenticmaxai.netlify.app-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://agenticmaxai.netlify.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

<p align="center">
  <a href="#-key-capabilities">Key Features</a> •
  <a href="#-tech-stack--version-information">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-quantpulse-risk-engine">Risk Engine</a> •
  <a href="#-live-cli-demo">CLI Demo</a> •
  <a href="#-quickstart">Quickstart</a> •
  <a href="#-experimentation-log">Experiments</a>
</p>

---

</div>

## 🛠️ Tech Stack & Version Information

| Component | Technology | Version | Purpose |
|---|---|---|---|
| **L2 Blockchain** | Base Sepolia | Chain ID `84532` | Native L2 rollup execution & low-gas settlement |
| **Agent Backend** | Python | `3.12+` | Autonomous multi-tool orchestration & math engines |
| **Web Framework** | FastAPI | `0.115.0+` | High-performance asynchronous REST endpoints |
| **Web3 Engine (Backend)** | `web3.py` | `6.20.0+` | EVM RPC node interaction, key signing & Base node state |
| **Frontend Framework** | Next.js (App Router) | `16.0.0` | Edge-rendered glassmorphic Web3 cockpit |
| **Web3 Engine (Frontend)** | `viem` | `2.21.0+` | Browser transaction signing and RPC broadcasting |
| **Micropayment Protocol** | x402 Specification | `v1.0` | HTTP 402 machine-to-machine paywall standard |
| **Testnet Currency** | Circle USDC | ERC-20 (`0x036CbD...`) | Base Sepolia testnet settlement token |
| **Data Aggregators** | DeFi Llama & Dexscreener | REST APIs | Live liquidity pool APYs, TVL depth, and trading pairs |

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
| **👛 On-Chain Agent Wallet** | Autonomous Base Sepolia wallet (`0xcc40f8...3a1e`) with ETH & USDC balance tracking and transfer execution | ✅ Active |
| **💳 x402 Micropayments** | HTTP 402 payment challenge & settlement via Coinbase facilitator for premium AI research ($0.01 USDC) | ✅ Active |
| **💬 Glassmorphic Web3 Cockpit** | Next.js 16 frontend with interactive Terminal, Risk Radar, Yield Screener, Alerts, and Wallet tabs | ✅ Active |
| **🧠 Multi-Turn Memory** | Tracks user conversation history, preferred tokens, and risk tolerance across prompts | ✅ Active |
| **💱 On-Chain Swap Execution** | Uniswap V3 automated swap preparation on Base Sepolia | 🚧 Week 4 Roadmap |

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

## 🧪 Hackathon Submission & Walkthrough (Week 2 Sprint)

### 🎯 Mission: Taking the Agent Further (Deadline: October 16)
DefiSense evolved from an initial single-prompt prototype into a full-fledged, multi-tool autonomous DeFi research cockpit with real-time on-chain execution and dynamic risk modeling.

- **GitHub Repository**: [https://github.com/ashishh-tech/Maxit](https://github.com/ashishh-tech/Maxit)
- **🌐 Live Demo**: [https://agenticmaxai.netlify.app](https://agenticmaxai.netlify.app) ← deployed on Netlify
- **Live Experimentation Log**: [docs/EXPERIMENTATION_LOG.md](./docs/EXPERIMENTATION_LOG.md) (10 recorded experiments across APIs, workflows, and risk formulas)

### 🔬 New Capabilities & Workflows Added in Week 2
1. **Dynamic Intent Routing Workflow**: Automatically classifies prompts across Gas, Yields, Stablecoins, and DEX Comparisons, orchestrating targeted tool subsets instead of hitting redundant endpoints.
2. **Interactive QuantPulse™ IL Simulator**: Real-time divergence shock testing ($k$-ratio slider from $0.1\times$ to $5.0\times$) backed by AMM divergence mathematics.
3. **Dual-Tier Resilient Architecture**: Seamless fallback between local Python FastAPI backend (`localhost:8000`) and native edge serverless synthesis with zero downtime.
4. **Live Base L2 Ticker & Pulse**: 12-second continuous on-chain gas tracking (in Gwei) and block monitoring directly via Base RPC.
5. **Multi-View Intelligence Cockpit**: 5 purpose-built interfaces:
   - **Terminal**: Interactive agent conversation with pre-configured alpha prompts and rich markdown rendering.
   - **Risk Radar**: QuantPulse risk scoring breakdown and live Impermanent Loss divergence simulator.
   - **Yield Screener**: Live indexed pools on Base with TVL depth and risk tier badges.
   - **Real-Time Alerts**: Network congestion notices, whale movements, and depeg warning monitors.
   - **Agent Wallet & x402**: Autonomous on-chain identity (`0xcc40f8...3a1e`), live ETH/USDC balances, on-chain transfers, and interactive HTTP 402 paywall inspector.

---

## 👛 Week 3: "Give It A Wallet" & x402 Micropayments

### Why Crypto Actually Makes Sense for DefiSense
Autonomous AI agents in DeFi cannot rely on human credit cards or fiat payment rails. DefiSense incorporates crypto natively for two essential capabilities:
1. **Machine-to-Machine Monetization (`x402`)**: DefiSense gates high-compute quantitative research behind the open `x402` standard. When external clients, agents, or aggregators request deep alpha analysis, DefiSense issues an `HTTP 402 Payment Required` challenge, verifying $0.01 USDC micropayments settled via the Coinbase facilitator.
2. **Autonomous On-Chain Execution**: With its own Base Sepolia private key, DefiSense can independently check balances, execute rebalancing transactions, and sign EIP-712 payment permits.

### Agent Wallet Specifications
- **Target Network**: Base Sepolia L2 (Chain ID: `84532`)
- **Agent Public Address**: `0xcc40f8B1B95CC6d86ba84Bee37932Fe419a03a1e`
- **Supported Assets**: Native ETH (gas) & Circle Testnet USDC (`0x036CbD53842c5426634e7929541eC2318f3dCF7e`)
- **Key Management**: Managed via `AGENT_PRIVATE_KEY` in `.env` with fallback ephemeral generation.

### The x402 Flow Diagram
```
Client Agent                                                DefiSense Agent
     │                                                             │
     ├─── 1. POST /api/premium-research (no headers) ──────────────►│
     │                                                             │
     │◄── 2. HTTP 402 Payment Required + Challenge JSON ───────────┤
     │       (amount: $0.01 USDC, token: USDC, payTo: Agent)       │
     │                                                             │
     │─── 3. Client signs EIP-712 permit for USDC                  │
     │                                                             │
     ├─── 4. POST /api/premium-research with X-PAYMENT header ─────►│
     │                                                             │
     │                                     ┌───────────────────────┴───┐
     │                                     │ Verify signature via      │
     │                                     │ Coinbase facilitator      │
     │                                     └───────────────────────┬───┘
     │                                                             │
     │◄── 5. HTTP 200 OK + Verified Premium AI Research Report ────┤
```

---

### 🎬 Demo & Walkthrough Guide

#### Option A: Quick Terminal CLI Walkthrough
```bash
# Activate virtual environment
.\venv\Scripts\activate   # Windows (or source venv/bin/activate on Linux/macOS)

# 1. Test agent wallet status & on-chain identity
python -c "from agent.tools.wallet import AgentWallet; w = AgentWallet(); print(w.get_wallet_info())"

# 2. Test natural language wallet query
python agent/cli.py "Check DefiSense agent wallet balance and address"

# 3. Test stablecoin-focused yield strategy
python agent/cli.py "Find safe stablecoin pools on Base"

# 4. Start FastAPI server with wallet & x402 endpoints
python -m uvicorn agent.server:app --reload --port 8000
```

#### Option B: Full Glassmorphic Web Cockpit Walkthrough
```bash
cd frontend
npm install
npm run dev
```
1. Open [http://localhost:3000](http://localhost:3000).
2. **Terminal Tab**: Click any quick-prompt chip or ask about the agent wallet. Watch the agent stream live on-chain analytics.
3. **Radar Tab**: Adjust the **Price Divergence ($k$)** slider to simulate market shocks and observe mathematical Impermanent Loss projections.
4. **Yields Tab**: Inspect live Base liquidity pools with categorized risk scores and TVL depth.
5. **Alerts Tab**: Review network state, Base gas in Gwei, and tool connectivity matrix.
6. **Wallet Tab**: Inspect DefiSense's Base Sepolia on-chain address, live ETH/USDC balances, copy address, view on Basescan, and click **"Simulate 402 Challenge"** to inspect the live x402 protocol challenge!


---

## 🤖 Supported AI Models & Orchestration
- **Google Gemini 1.5 Flash (`gemini-1.5-flash`)**: High-throughput natural language intent extraction, semantic query parsing, and rapid protocol synthesis.
- **Google Gemini 1.5 Pro (`gemini-1.5-pro`)**: Deep quantitative DeFi research, multi-factor alpha thesis formulation, and complex financial analysis.
- **QuantPulse™ Deterministic Risk Engine (`v1.0`)**: Rigorous mathematical impermanent loss model ($IL(k)$) and multi-variable pool scoring.

---

## 🛠️ AI Agent Tools Registry
| Tool Name | Version | Functionality |
|---|---|---|
| **`AgentWalletTool`** | `v1.0` | Base Sepolia key management, on-chain balance queries, EIP-191 signing, and autonomous ETH/USDC transfer broadcasting. |
| **`PromptTransferEngine`** | `v1.0` | Natural language prompt extraction (token, amount, recipient) with in-chat interactive authorization and Base Sepolia transaction execution. |
| **`X402PaywallTool`** | `v1.0` | Implements open HTTP 402 protocol specification with Coinbase facilitator verification for $0.01 USDC machine-to-machine micropayments. |
| **`BaseRpcTool`** | `v1.0` | Real-time Base Sepolia Web3 RPC node monitor (gas tracker in Gwei, block height, 2s rollup finality). |
| **`DefiLlamaTool`** | `v1.0` | Live Base yield pools, APY compositions (Base + Reward), and protocol TVL depth. |
| **`DexscreenerTool`** | `v1.0` | Real-time DEX pair liquidity, 24h trading volume, and token pair pricing. |
| **`CoinGeckoTool`** | `v1.0` | Real-time token price feeds and global market cap tracking. |
| **`RiskEngineTool`** | `v1.0` | Deterministic mathematical AMM divergence calculator and impermanent loss risk curves. |

---

## 💸 Prompt-Based Crypto Transfers (In-Chat Interactive Execution)

DefiSense enables natural language crypto transfers directly from the agent's wallet or user's connected wallet on Base Sepolia.

**Example Prompts**:
- `"Send 0.005 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"`
- `"Transfer 0.001 ETH to 0xcc40f8B1B95CC6d86ba84Bee37932Fe419a03a1e"`

**Interactive Authorization Flow**:
1. **Extraction**: The agent parses the prompt, extracting the target `token`, `amount`, and `recipient address`.
2. **Review & Authorization Card**: An interactive review card renders directly within the chat stream displaying token details, network, estimated fee, and recipient.
3. **On-Chain Broadcast**: The user clicks **"Authorize & Send on Base Sepolia"**, broadcasting the transaction signed by the agent wallet (`0xcc40...3a1e`) with real-time Tx Hash and Basescan explorer link.

---

## 🔮 Future Scope & Upcoming Roadmap
- **ZK-Proof Privacy Layer**: Private yield strategies using zero-knowledge proofs to obscure LP rebalancing from front-running MEV bots.
- **Autonomous Multi-Pool Rebalancer**: Automated smart contract triggers to harvest and re-deposit rewards into highest risk-adjusted Base pools.
- **Full x402 Client Agent SDK**: Lightweight client library enabling third-party AI agents to autonomously pay DefiSense in USDC per research query.
- **Cross-Chain Bridge Orchestration**: Cross-rollup capital routing across the Superchain (Base, Optimism, Mode, Zora) via CCIP.

---

## 🎥 Demo Video Links

Follows the official submission format:

- **Week 1 (defisense.v1)**: https://github.com/ashishh-tech/Maxit
- **Week 2 (defisense.v2)**: https://youtu.be/itqAC2CK4x8
- **Week 3 (defisense.v3)**: https://youtu.be/4W3BllfwnXk

---

## 🌐 Community & Social Presence
- **Project Repository**: [https://github.com/ashishh-tech/Maxit](https://github.com/ashishh-tech/Maxit)
- **Live Deployment**: [https://agenticmaxai.netlify.app](https://agenticmaxai.netlify.app)
- **Twitter / X**: Tagging [@riseinweb3](https://x.com/riseinweb3) · 3 updates shared weekly with hashtag `#RiseInHackathon #BaseAgent`

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE) — feel free to use and build upon it.

<div align="center">
  <sub>Built with 💙 on <b>Base</b> by <a href="https://github.com/ashishh-tech">ashishh-tech</a></sub>
</div>
