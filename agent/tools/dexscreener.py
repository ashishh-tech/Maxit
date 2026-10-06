import requests
from typing import Dict, Any, List

DEXSCREENER_BASE_URL = "https://api.dexscreener.com/latest/dex"

class DexscreenerTool:
    """Tool for fetching real-time DEX liquidity, volume, and pair data on Base and other chains."""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "DefiSense-Agent/1.0"})

    def search_pairs(self, query: str) -> List[Dict[str, Any]]:
        """Search DEX pairs across chains matching query (e.g. 'AERO', 'BRETT', 'WETH')."""
        try:
            resp = self.session.get(f"{DEXSCREENER_BASE_URL}/search", params={"q": query}, timeout=10)
            resp.raise_for_status()
            pairs = resp.json().get("pairs", [])
            return [
                {
                    "chain_id": p.get("chainId"),
                    "dex_id": p.get("dexId"),
                    "pair_address": p.get("pairAddress"),
                    "base_token": p.get("baseToken", {}).get("symbol"),
                    "quote_token": p.get("quoteToken", {}).get("symbol"),
                    "price_usd": p.get("priceUsd"),
                    "liquidity_usd": p.get("liquidity", {}).get("usd"),
                    "volume_24h": p.get("volume", {}).get("h24"),
                    "price_change_24h": p.get("priceChange", {}).get("h24"),
                    "url": p.get("url")
                }
                for p in pairs
                if p.get("liquidity", {}).get("usd", 0) and p.get("liquidity", {}).get("usd", 0) > 10000
            ][:10]
        except Exception as e:
            return [{"error": f"Failed to query Dexscreener: {str(e)}"}]

    def get_token_pairs_on_base(self, token_address: str) -> List[Dict[str, Any]]:
        """Fetch all DEX pairs for a specific token address on Base."""
        try:
            resp = self.session.get(f"{DEXSCREENER_BASE_URL}/tokens/{token_address}", timeout=10)
            resp.raise_for_status()
            pairs = resp.json().get("pairs", [])
            base_pairs = [p for p in pairs if p.get("chainId") == "base"]
            return [
                {
                    "dex": p.get("dexId"),
                    "pair": f"{p.get('baseToken', {}).get('symbol')}/{p.get('quoteToken', {}).get('symbol')}",
                    "price_usd": p.get("priceUsd"),
                    "liquidity_usd": p.get("liquidity", {}).get("usd"),
                    "volume_24h": p.get("volume", {}).get("h24"),
                    "price_change_24h": p.get("priceChange", {}).get("h24"),
                }
                for p in base_pairs
            ]
        except Exception as e:
            return [{"error": f"Failed to query token pairs: {str(e)}"}]
