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

---

## 🔬 Detailed Experiment Notes

### EXP-001: DeFi Llama Integration
- **Endpoints Tested**:
  - `https://api.llama.fi/protocols` -> Protocol list + TVL across chains.
  - `https://yields.llama.fi/pools` -> Yields, APY, 7d APY trend, and pool token composition.
- **Key Takeaway**: Base chain data is rich on DeFi Llama (Aerodrome, Uniswap, Moonwell, Overnight Finance, Seamless Protocol). Filtering by `chain == 'Base'` gives immediate high-conviction pools.

### EXP-002: Token & Pair Pricing (CoinGecko + Dexscreener)
- **Observations**: Free CoinGecko API has rate limits (10-30 req/min). For DEX-native tokens and pools on Base, `api.dexscreener.com/latest/dex/tokens/{address}` provides instant pair information with no auth required.
- **Decision**: Hybrid approach — CoinGecko for macro assets + Dexscreener for real-time DEX liquidity pairs on Base.
