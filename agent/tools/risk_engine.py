import math
from typing import Dict, Any, Optional

class RiskEngine:
    """
    QuantPulse-inspired Risk & Impermanent Loss (IL) Engine for DeFi Liquidity Pools.
    Calculates IL divergence, volatility risk, and risk-adjusted yield scores.
    """

    @staticmethod
    def calculate_impermanent_loss(price_ratio_change: float) -> float:
        """
        Calculate Impermanent Loss percentage given a price ratio change (k = P_new / P_old).
        Formula: IL = (2 * sqrt(k) / (1 + k)) - 1
        """
        if price_ratio_change <= 0:
            return 0.0
        k = price_ratio_change
        il = (2.0 * math.sqrt(k) / (1.0 + k)) - 1.0
        return round(abs(il) * 100, 2)

    @staticmethod
    def assess_pool_risk(
        pool_name: str,
        apy: float,
        tvl_usd: float,
        is_stablecoin: bool = False,
        project: str = ""
    ) -> Dict[str, Any]:
        """
        Assess pool risk tier, projected IL vulnerability, and risk score (0 - 100).
        Score < 30: Low Risk (Safe)
        Score 30 - 65: Medium Risk (Balanced)
        Score > 65: High / Degen Risk
        """
        score = 0
        risk_flags = []

        # TVL Liquidity Depth
        if tvl_usd < 100_000:
            score += 40
            risk_flags.append("Low liquidity (< $100k TVL) - high slippage vulnerability")
        elif tvl_usd < 1_000_000:
            score += 20
            risk_flags.append("Moderate liquidity ($100k - $1M TVL)")
        else:
            score += 5  # Deep TVL

        # APY Sustainability
        if apy > 500:
            score += 45
            risk_flags.append("Extreme APY (>500%) - likely heavy token inflation / temporary rewards")
        elif apy > 100:
            score += 25
            risk_flags.append("High APY (100% - 500%) - monitor reward token emissions")
        elif apy > 25:
            score += 10

        # Stablecoin vs Volatile Asset
        if is_stablecoin:
            projected_il = 0.0
            score = max(5, score - 20)
        else:
            # Assume a baseline 20% price divergence in crypto pairs
            projected_il = RiskEngine.calculate_impermanent_loss(1.25)
            score += 15

        # Protocol Reputational Assessment
        known_bluechips = ["aerodrome", "uniswap", "aave", "moonwell", "seamless", "compound"]
        is_bluechip = any(b in project.lower() for b in known_bluechips)
        if is_bluechip:
            score = max(5, score - 15)
        else:
            score += 15
            risk_flags.append("Non-tier 1 protocol - exercise additional diligence")

        score = min(99, max(5, score))

        if score < 30:
            tier = "🛡️ LOW RISK (Conservative)"
            verdict = "Suitable for passive yield generation with low expected divergence."
        elif score < 65:
            tier = "⚖️ MEDIUM RISK (Balanced)"
            verdict = "Good yield-to-risk ratio. Recommended to track reward token price."
        else:
            tier = "⚠️ HIGH RISK (Aggressive / Degen)"
            verdict = "High yield compensated by potential sharp impermanent loss or token volatility."

        return {
            "pool": pool_name,
            "risk_score": score,
            "risk_tier": tier,
            "projected_il_est_pct": projected_il,
            "verdict": verdict,
            "risk_flags": risk_flags
        }
