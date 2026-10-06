import requests
from typing import Dict, Any, List, Optional

COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"

class CoinGeckoTool:
    """Tool for fetching token prices, market caps, and 24h volume."""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "DefiSense-Agent/1.0"})

    def get_token_price(self, token_ids: List[str], vs_currencies: str = "usd") -> Dict[str, Any]:
        """Fetch current prices, 24h volume, and 24h change for given coin IDs."""
        try:
            params = {
                "ids": ",".join(token_ids),
                "vs_currencies": vs_currencies,
                "include_24hr_vol": "true",
                "include_24hr_change": "true",
                "include_market_cap": "true",
            }
            resp = self.session.get(f"{COINGECKO_BASE_URL}/simple/price", params=params, timeout=10)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            return {"error": f"Failed to fetch price: {str(e)}"}

    def get_top_tokens_by_market_cap(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch top tokens by market cap."""
        try:
            params = {
                "vs_currency": "usd",
                "order": "market_cap_desc",
                "per_page": limit,
                "page": 1,
                "sparkline": "false",
                "price_change_percentage": "24h,7d"
            }
            resp = self.session.get(f"{COINGECKO_BASE_URL}/coins/markets", params=params, timeout=10)
            resp.raise_for_status()
            return [
                {
                    "name": c.get("name"),
                    "symbol": c.get("symbol", "").upper(),
                    "price_usd": c.get("current_price"),
                    "market_cap": c.get("market_cap"),
                    "change_24h": round(c.get("price_change_percentage_24h") or 0, 2),
                    "volume_24h": c.get("total_volume"),
                }
                for c in resp.json()
            ]
        except Exception as e:
            return [{"error": f"Failed to fetch top tokens: {str(e)}"}]
