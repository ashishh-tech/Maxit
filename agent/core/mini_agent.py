import os
import json
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

from agent.tools.defi_llama import DefiLlamaTool
from agent.tools.coingecko import CoinGeckoTool
from agent.tools.dexscreener import DexscreenerTool
from agent.tools.risk_engine import RiskEngine
from agent.tools.base_rpc import BaseRpcTool
from agent.core.memory import AgentMemory

load_dotenv()

class DefiSenseMiniAgent:
    """Intelligent DeFi Research, Risk Assessment & Yield Orchestration Agent."""

    def __init__(self):
        self.defi_llama = DefiLlamaTool()
        self.coingecko = CoinGeckoTool()
        self.dexscreener = DexscreenerTool()
        self.risk_engine = RiskEngine()
        self.base_rpc = BaseRpcTool()
        self.memory = AgentMemory()
        self.api_key = os.getenv("GEMINI_API_KEY")

    def analyze_query(self, user_prompt: str) -> Dict[str, Any]:
        """Orchestrate tools, calculate risk metrics, and synthesize a structured intelligence report."""
        prompt_lower = user_prompt.lower()

        # Step 1: Detect Intent
        is_yield_query = any(k in prompt_lower for k in ["yield", "apy", "earn", "pool", "farm", "interest"])
        is_protocol_query = any(k in prompt_lower for k in ["tvl", "protocol", "volume", "aerodrome", "uniswap", "moonwell", "aave"])
        is_price_query = any(k in prompt_lower for k in ["price", "market", "token", "worth", "cost"])
        is_network_query = any(k in prompt_lower for k in ["gas", "block", "rpc", "base sepolia", "network"])
        chain = "Base"

        context_data: Dict[str, Any] = {
            "chain": chain,
            "query": user_prompt,
            "recent_context": self.memory.get_recent_context()
        }

        # Step 2: Query Tools
        if is_network_query or "gas" in prompt_lower:
            context_data["network_stats"] = self.base_rpc.get_network_stats()

        if is_yield_query or (not is_protocol_query and not is_price_query and not is_network_query):
            pools = self.defi_llama.get_yield_pools(chain=chain, limit=8)
            # Enrich each pool with RiskEngine scoring
            enriched_pools = []
            for p in pools:
                if "error" not in p:
                    risk_meta = self.risk_engine.assess_pool_risk(
                        pool_name=f"{p.get('project')} {p.get('symbol')}",
                        apy=p.get('apy', 0),
                        tvl_usd=p.get('tvl_usd', 0),
                        is_stablecoin=p.get('stablecoin', False),
                        project=p.get('project', '')
                    )
                    p["risk_assessment"] = risk_meta
                enriched_pools.append(p)
            context_data["yield_pools"] = enriched_pools

        if is_protocol_query or not is_yield_query:
            context_data["top_protocols"] = self.defi_llama.get_top_protocols_by_chain(chain=chain, limit=6)

        if is_price_query or "token" in prompt_lower or "price" in prompt_lower:
            context_data["top_tokens"] = self.coingecko.get_top_tokens_by_market_cap(limit=5)
            context_data["dex_pairs"] = self.dexscreener.search_pairs("Base")[:5]

        # Step 3: Synthesize Research Report
        report = self._synthesize_report(user_prompt, context_data)

        # Step 4: Record interaction in memory
        tools_used = ["DeFi Llama", "Risk Engine", "Dexscreener"]
        if is_network_query:
            tools_used.append("Base Sepolia RPC")
        self.memory.add_interaction(user_prompt, report, tools_used)

        return {
            "query": user_prompt,
            "chain": chain,
            "raw_data": context_data,
            "report": report
        }

    def _synthesize_report(self, query: str, context: Dict[str, Any]) -> str:
        """Synthesize a structured research report with risk scoring."""
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                model = genai.GenerativeModel("gemini-1.5-flash")

                system_prompt = (
                    "You are DefiSense, an elite autonomous DeFi Research and Risk Agent for Base. "
                    "Analyze the provided live on-chain and DeFi Llama metrics. "
                    "Include: Executive Summary, Top Yield/Protocol Findings, Risk Ratings with Impermanent Loss estimates, and clear Actionable Guidance."
                )

                prompt = f"{system_prompt}\n\nUser Question: {query}\n\nLive DeFi Context Data:\n{json.dumps(context, indent=2)}"
                response = model.generate_content(prompt)
                if response and response.text:
                    return response.text
            except Exception:
                pass

        return self._local_analytical_engine(query, context)

    def _local_analytical_engine(self, query: str, context: Dict[str, Any]) -> str:
        """High-conviction deterministic research report with risk calculations."""
        chain = context.get("chain", "Base")
        pools = context.get("yield_pools", [])
        protocols = context.get("top_protocols", [])
        network = context.get("network_stats", {})

        lines = [
            f"# ⚡ DefiSense Intelligence Report: {query.strip()}",
            f"**Target Chain**: {chain} | **Analysis Engine**: QuantPulse Risk v1.0\n",
            "## 📊 Executive Summary",
            f"Analyzed real-time liquidity and yield conditions across the {chain} ecosystem."
        ]

        if network and network.get("connected"):
            lines.append(f"- **On-Chain Gas**: Base Sepolia gas currently at `{network.get('gas_price_gwei')} Gwei` (Block #{network.get('latest_block')}).")

        if protocols:
            top_p = protocols[0]
            lines.append(f"- **Dominant Protocol**: **{top_p.get('name')}** leads with **${top_p.get('tvl', 0):,.0f} TVL**.")

        if pools:
            best_pool = pools[0]
            r_meta = best_pool.get("risk_assessment", {})
            lines.append(f"- **Top Yield Opportunity**: **{best_pool.get('project')} ({best_pool.get('symbol')})** at **{best_pool.get('apy')}% APY** ({r_meta.get('risk_tier', 'Analyzed')}).")

        if pools:
            lines.append("\n## 🌾 Yield Pools & QuantPulse Risk Assessment")
            for p in pools[:5]:
                r = p.get("risk_assessment", {})
                score = r.get("risk_score", 50)
                tier = r.get("risk_tier", "Tier N/A")
                il = r.get("projected_il_est_pct", 0.0)
                lines.append(f"### {p.get('project')} `{p.get('symbol')}`")
                lines.append(f"- **APY**: **{p.get('apy')}%** (Base: {p.get('apy_base')}%, Reward: {p.get('apy_reward')}%)")
                lines.append(f"- **Liquidity (TVL)**: `${p.get('tvl_usd', 0):,.0f}`")
                lines.append(f"- **Risk Rating**: `{tier}` (Score: {score}/100 | Est. IL: ~{il}%)")
                if r.get("verdict"):
                    lines.append(f"- *Strategy Note*: {r.get('verdict')}")
                lines.append("")

        if protocols:
            lines.append("## 🏛️ Top Base Protocols by Total Value Locked")
            for p in protocols[:5]:
                lines.append(f"1. **{p.get('name')}** ({p.get('category')}): `${p.get('tvl', 0):,.0f}`")

        lines.extend([
            "\n## 💡 Agent Recommendation & Next Steps",
            "- **For Conservative Yield**: Deposit into bluechip money markets (Moonwell/Seamless) or USDC single-sided lending.",
            "- **For Yield Maximization**: Utilize Aerodrome Slipstream concentrated LP pools with active range rebalancing."
        ])

        return "\n".join(lines)
