# 🧪 DefiSense — Agent Experimentation & Iteration Log

> **Tracked for Hackathon Evaluation (25% Experimentation Score)**
> This log records all architectural decisions, API integrations tested, prompt experiments, edge cases encountered, and tool enhancements.

---

## 📋 Experiment Log Table

| # | Date | Component / Area | Hypothesis / Goal | Action Taken | Result / Finding | Status |
|---|---|---|---|---|---|---|
| **EXP-001** | Oct 6 | API Discovery: DeFi Llama | Fetch live TVL, top pools, and APY rates on Base without API keys | Tested `/protocols`, `/yields`, and `/v2/chains` endpoints | Successfully retrieved live Base protocol data and pool APYs with zero rate limit issues | ✅ Succeeded |
| **EXP-002** | Oct 6 | API Discovery: CoinGecko | Fetch token prices and market data for major Base tokens | Tested CoinGecko public ping and simple price endpoint | Works for top tokens; fallback to Dexscreener needed for long-tail pairs | ✅ Succeeded |
| **EXP-003** | Oct 6 | Agent Core: Mini-Agent Architecture | Test direct LLM tool-calling vs single-pass prompt synthesis for DeFi queries | Built Day 1 Mini-Agent CLI fetching real-time DeFi Llama data formatted for LLM reasoning | Low latency, reliable synthesis of current yield and TVL metrics | ✅ Succeeded |
| **EXP-004** | Oct 6 | Risk Engine: Impermanent Loss & TVL Scoring | Calculate projected divergence and risk-adjusted scores for liquidity pools | Built `RiskEngine` with mathematical IL divergence curve and TVL penalty thresholds | Accurately assigns risk tiers (Low/Medium/High) to volatile LP pairs vs stable pools | ✅ Succeeded |
| **EXP-005** | Oct 6 | Blockchain: Base Sepolia RPC Integration | Query on-chain network state, latest block, and gas estimates in real-time | Integrated `web3.py` with Base Sepolia public RPC endpoint (`https://sepolia.base.org`) | Real-time gas and block queries executing in <250ms | ✅ Succeeded |

---

## 🔬 Detailed Experiment Notes

### EXP-004: QuantPulse Risk & Impermanent Loss Formula
- **Formula Implemented**:
  $$IL(k) = \frac{2\sqrt{k}}{1 + k} - 1$$
  where $k = \frac{P_{new}}{P_{old}}$.
- **Risk Score Weights**:
  - Liquidity Depth (<$100k TVL: +40 risk points)
  - APY Sustainability (>500% APY: +45 risk points)
  - Bluechip Protocol Status (Aerodrome, Uniswap, Moonwell: -15 risk points)
