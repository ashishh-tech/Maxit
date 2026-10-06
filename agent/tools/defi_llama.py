import requests
from typing import Dict, Any, List, Optional

DEFILLAMA_BASE_URL = "https://api.llama.fi"
YIELDS_BASE_URL = "https://yields.llama.fi"

class DefiLlamaTool:
    """Tool for fetching TVL, yields, and protocol metrics from DeFi Llama."""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "DefiSense-Agent/1.0"})

    def get_protocols(self) -> List[Dict[str, Any]]:
        """Fetch all DeFi protocols with TVL and chains."""
        try:
            resp = self.session.get(f"{DEFILLAMA_BASE_URL}/protocols", timeout=10)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            return [{"error": f"Failed to fetch protocols: {str(e)}"}]

    def get_top_protocols_by_chain(self, chain: str = "Base", limit: int = 10) -> List[Dict[str, Any]]:
        """Get top protocols on a specific chain ranked by TVL."""
        protocols = self.get_protocols()
        if protocols and "error" in protocols[0]:
            return protocols

        chain_lower = chain.lower()
        matched = []
        for p in protocols:
            chains = [c.lower() for c in p.get("chains", [])]
            if chain_lower in chains:
                chain_tvls = p.get("chainTvls", {})
                # get TVL specific to this chain if available, else overall TVL
                chain_tvl = chain_tvls.get(chain, chain_tvls.get(chain.capitalize(), p.get("tvl", 0)))
                matched.append({
                    "name": p.get("name"),
                    "symbol": p.get("symbol"),
                    "category": p.get("category"),
                    "tvl": chain_tvl,
                    "total_tvl": p.get("tvl"),
                    "change_1d": p.get("change_1d"),
                    "change_7d": p.get("change_7d"),
                    "url": p.get("url"),
                })

        # Sort by chain TVL descending
        matched.sort(key=lambda x: x.get("tvl") or 0, reverse=True)
        return matched[:limit]

    def get_yield_pools(self, chain: Optional[str] = "Base", limit: int = 15) -> List[Dict[str, Any]]:
        """Get top yield pools with APY, TVL, and risk factors."""
        try:
            resp = self.session.get(f"{YIELDS_BASE_URL}/pools", timeout=12)
            resp.raise_for_status()
            data = resp.json().get("data", [])

            if chain:
                chain_lower = chain.lower()
                data = [p for p in data if (p.get("chain") or "").lower() == chain_lower]

            # Filter pools with reasonable TVL ( > $50k ) to avoid dust/scam pools
            filtered = [
                {
                    "pool_id": p.get("pool"),
                    "project": p.get("project"),
                    "symbol": p.get("symbol"),
                    "chain": p.get("chain"),
                    "tvl_usd": p.get("tvlUsd"),
                    "apy": round(p.get("apy", 0) or 0, 2),
                    "apy_base": round(p.get("apyBase", 0) or 0, 2),
                    "apy_reward": round(p.get("apyReward", 0) or 0, 2),
                    "reward_tokens": p.get("rewardTokens"),
                    "il_risk": p.get("ilRisk"),
                    "stablecoin": p.get("stablecoin", False)
                }
                for p in data
                if (p.get("tvlUsd") or 0) >= 50000
            ]

            # Sort by APY descending
            filtered.sort(key=lambda x: x.get("apy") or 0, reverse=True)
            return filtered[:limit]
        except Exception as e:
            return [{"error": f"Failed to fetch yields: {str(e)}"}]

    def get_chain_tvl_overview(self) -> List[Dict[str, Any]]:
        """Get high-level TVL summary across major L1/L2 chains."""
        try:
            resp = self.session.get(f"{DEFILLAMA_BASE_URL}/v2/chains", timeout=10)
            resp.raise_for_status()
            chains = resp.json()
            chains.sort(key=lambda x: x.get("tvl") or 0, reverse=True)
            return [
                {
                    "name": c.get("name"),
                    "tvl": c.get("tvl"),
                    "token_symbol": c.get("tokenSymbol")
                }
                for c in chains[:10]
            ]
        except Exception as e:
            return [{"error": f"Failed to fetch chain TVL: {str(e)}"}]

if __name__ == "__main__":
    tool = DefiLlamaTool()
    print("Top Base Protocols:")
    for p in tool.get_top_protocols_by_chain("Base", limit=5):
        print(f"- {p['name']} ({p.get('category')}): ${p.get('tvl', 0):,.0f}")

    print("\nTop Base Yield Pools:")
    for y in tool.get_yield_pools("Base", limit=5):
        print(f"- {y['project']} | {y['symbol']} -> {y['apy']}% APY (TVL: ${y['tvl_usd']:,.0f})")
