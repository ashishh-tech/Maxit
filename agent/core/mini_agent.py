import os
import json
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

from agent.tools.defi_llama import DefiLlamaTool
from agent.tools.coingecko import CoinGeckoTool
from agent.tools.dexscreener import DexscreenerTool

load_dotenv()

class DefiSenseMiniAgent:
    """Mini-Agent for DeFi Research, Yield Analytics, and Protocol Intelligence."""

    def __init__(self):
        self.defi_llama = DefiLlamaTool()
        self.coingecko = CoinGeckoTool()
        self.dexscreener = DexscreenerTool()
        self.api_key = os.getenv("GEMINI_API_KEY")

    def analyze_query(self, user_prompt: str) -> Dict[str, Any]:
        """Orchestrate tools and produce a comprehensive research report."""
        prompt_lower = user_prompt.lower()

        # Step 1: Detect Intent
        is_yield_query = any(k in prompt_lower for k in ["yield", "apy", "earn", "pool", "farm", "interest"])
        is_protocol_query = any(k in prompt_lower for k in ["tvl", "protocol", "volume", "aerodrome", "uniswap", "moonwell", "aave"])
        is_price_query = any(k in prompt_lower for k in ["price", "market", "token", "worth", "cost"])
        chain = "Base"  # Default focus for Agentmaxxx

        context_data: Dict[str, Any] = {
            "chain": chain,
            "query": user_prompt
        }

        # Step 2: Fetch relevant live on-chain & DeFi metrics
        if is_yield_query or (not is_protocol_query and not is_price_query):
            context_data["yield_pools"] = self.defi_llama.get_yield_pools(chain=chain, limit=8)

        if is_protocol_query or not is_yield_query:
            context_data["top_protocols"] = self.defi_llama.get_top_protocols_by_chain(chain=chain, limit=6)

        if is_price_query or "token" in prompt_lower or "price" in prompt_lower:
            context_data["top_tokens"] = self.coingecko.get_top_tokens_by_market_cap(limit=5)
            context_data["dex_pairs"] = self.dexscreener.search_pairs("Base")[:5]

        # Step 3: Generate AI Synthesis (Gemini or Analytical Engine)
        report = self._synthesize_report(user_prompt, context_data)

        return {
            "query": user_prompt,
            "chain": chain,
            "raw_data": context_data,
            "report": report
        }

    def _synthesize_report(self, query: str, context: Dict[str, Any]) -> str:
        """Synthesize a structured research report."""
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                model = genai.GenerativeModel("gemini-1.5-flash")

                system_prompt = (
                    "You are DefiSense, an elite autonomous DeFi Research and Risk Agent. "
                    "Analyze the real-time on-chain and DeFi market data provided below. "
                    "Provide a crisp, actionable report including: Summary, Top Opportunities, Risk Assessment (IL risk, protocol safety, TVL health), and Actionable Recommendation."
                )

                prompt = f"{system_prompt}\n\nUser Question: {query}\n\nLive DeFi Context Data:\n{json.dumps(context, indent=2)}"
                response = model.generate_content(prompt)
                if response and response.text:
                    return response.text
            except Exception as e:
                pass  # Fallback to local analytical engine

        # High-quality deterministic analytical synthesizer
        return self._local_analytical_engine(query, context)

    def _local_analytical_engine(self, query: str, context: Dict[str, Any]) -> str:
        """Deterministic research report generator when LLM key is absent."""
        chain = context.get("chain", "Base")
        pools = context.get("yield_pools", [])
        protocols = context.get("top_protocols", [])

        lines = [
            f"# ⚡ DefiSense Intelligence Report: {query.strip()}",
            f"**Target Chain**: {chain} | **Data Timestamp**: Live DeFi Llama & DEX Data\n",
            "## 📊 Executive Summary",
            f"Analyzed real-time liquidity and yield conditions across the {chain} ecosystem."
        ]

        if protocols:
            top_p = protocols[0]
            lines.append(f"- **Leading Protocol**: **{top_p.get('name')}** dominates with **${top_p.get('tvl', 0):,.0f} TVL** ({top_p.get('category')}).")

        if pools:
            best_pool = pools[0]
            lines.append(f"- **Top Yield Opportunity**: **{best_pool.get('project')} ({best_pool.get('symbol')})** offering **{best_pool.get('apy')}% APY** (TVL: ${best_pool.get('tvl_usd', 0):,.0f}).")

        if protocols:
            lines.append("\n## 🏛️ Top Protocols by TVL on Base")
            for p in protocols[:5]:
                ch_1d = p.get('change_1d')
                trend = f" ({ch_1d:+.2f}% 24h)" if ch_1d is not None else ""
                lines.append(f"1. **{p.get('name')}** ({p.get('category')}): `${p.get('tvl', 0):,.0f}`{trend}")

        if pools:
            lines.append("\n## 🌾 High-Conviction Yield Pools")
            for p in pools[:5]:
                il_tag = "⚠️ High IL Risk" if p.get("il_risk") == "yes" else "🛡️ Low IL / Stable"
                lines.append(f"- **{p.get('project')}** `{p.get('symbol')}`: **{p.get('apy')}% APY** (Base: {p.get('apy_base')}%, Reward: {p.get('apy_reward')}%) | TVL: `${p.get('tvl_usd', 0):,.0f}` | {il_tag}")

        lines.extend([
            "\n## 🛡️ Risk & Safety Analysis",
            "- **TVL Health**: Protocols with >$10M TVL (e.g. Aerodrome, Uniswap, Seamless) have strong liquidity depth and battle-tested smart contracts.",
            "- **Impermanent Loss (IL)**: For volatile pairs, ensure rewards exceed projected divergence loss. Favor stable or high-volume native pools.",
            "\n## 💡 Agent Recommendation",
            f"For conservative yield, explore stablecoin pools on leading Base money markets. For aggressive alpha, utilize liquidity incentives on Aerodrome with active monitoring."
        ])

        return "\n".join(lines)
