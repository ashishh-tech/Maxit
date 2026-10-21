"""
x402 Payment Protocol — Server-side paywall for DefiSense premium endpoints.

Implements the HTTP 402 Payment Required flow:
  1. Client requests a paid resource without payment headers → 402 + challenge
  2. Client signs EIP-712 USDC authorization and retries with X-PAYMENT header
  3. Server forwards to Coinbase facilitator for on-chain verification & settlement
  4. On success, serves the protected resource

Reference: https://x402.org  |  Network: Base Sepolia  |  Token: USDC
"""

import json
import base64
import requests
from typing import Dict, Any, Optional, Tuple

# Coinbase x402 testnet facilitator handles on-chain verification & settlement
FACILITATOR_URL = "https://x402.org/facilitator"

# Base Sepolia USDC contract
USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"


class X402Paywall:
    """
    Server-side x402 handler — creates payment challenges and verifies
    payment signatures via the Coinbase testnet facilitator.
    """

    def __init__(self, payee_address: str, facilitator_url: str = FACILITATOR_URL):
        self.payee_address = payee_address
        self.facilitator_url = facilitator_url

    # ── Payment Challenge ────────────────────────────────────────────────

    def create_payment_requirements(
        self,
        price_usd_cents: int,
        resource_path: str,
        description: str = "Premium DeFi Research Report",
    ) -> Dict[str, Any]:
        """
        Build the x402 payment requirements payload.

        Args:
            price_usd_cents: price in USD cents (1 = $0.01)
            resource_path:   the protected API path
            description:     human-readable description of the resource

        Returns:
            Dict conforming to x402 v1 spec with 'accepts' array.
        """
        # USDC uses 6 decimals → 1 cent = 10_000 raw units
        amount = str(price_usd_cents * 10_000)

        return {
            "x402Version": 1,
            "accepts": [
                {
                    "scheme": "exact",
                    "network": "base-sepolia",
                    "maxAmountRequired": amount,
                    "resource": resource_path,
                    "description": description,
                    "mimeType": "application/json",
                    "payTo": self.payee_address,
                    "maxTimeoutSeconds": 300,
                    "asset": USDC_BASE_SEPOLIA,
                    "extra": {
                        "name": "USDC",
                        "version": "1",
                    },
                }
            ],
        }

    def get_402_headers(
        self,
        price_usd_cents: int,
        resource_path: str,
        description: str = "Premium DeFi Research Report",
    ) -> Dict[str, str]:
        """
        Build HTTP response headers for a 402 Payment Required response.
        The requirements are base64-encoded and placed in the X-PAYMENT-REQUIRED header.
        """
        requirements = self.create_payment_requirements(
            price_usd_cents, resource_path, description
        )
        encoded = base64.b64encode(json.dumps(requirements).encode()).decode()
        return {
            "X-PAYMENT-REQUIRED": encoded,
            "Content-Type": "application/json",
        }

    def get_402_body(
        self,
        price_usd_cents: int,
        resource_path: str,
        description: str = "Premium DeFi Research Report",
    ) -> Dict[str, Any]:
        """
        Build the JSON response body for a 402 Payment Required response.
        Includes both human-readable info and the full requirements payload.
        """
        requirements = self.create_payment_requirements(
            price_usd_cents, resource_path, description
        )
        return {
            "error": "Payment Required",
            "message": f"This endpoint requires a micropayment of ${price_usd_cents / 100:.2f} USDC on Base Sepolia.",
            "protocol": "x402",
            "payTo": self.payee_address,
            "network": "base-sepolia",
            "asset": "USDC",
            "amountUSD": f"${price_usd_cents / 100:.2f}",
            "requirements": requirements,
        }

    # ── Payment Verification ─────────────────────────────────────────────

    def verify_payment(
        self,
        payment_header: str,
        resource_path: str,
        price_usd_cents: int,
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Verify a client's payment signature via the Coinbase x402 facilitator.

        Args:
            payment_header:  the raw value from the X-PAYMENT request header
            resource_path:   the path being accessed
            price_usd_cents: expected price in cents

        Returns:
            (success: bool, details: dict)  — details include tx hash on success
        """
        amount = str(price_usd_cents * 10_000)

        verify_payload = {
            "payment": payment_header,
            "resource": resource_path,
            "payTo": self.payee_address,
            "maxAmountRequired": amount,
            "network": "base-sepolia",
            "scheme": "exact",
        }

        try:
            response = requests.post(
                f"{self.facilitator_url}/verify",
                json=verify_payload,
                timeout=30,
            )

            if response.status_code == 200:
                result = response.json()
                return True, {
                    "verified": True,
                    "settlement": result,
                    "network": "base-sepolia",
                    "amount_usdc": f"${price_usd_cents / 100:.2f}",
                }
            else:
                return False, {
                    "verified": False,
                    "error": f"Facilitator rejected: {response.text}",
                    "status_code": response.status_code,
                }

        except requests.Timeout:
            return False, {"verified": False, "error": "Facilitator timeout (30s)"}
        except Exception as e:
            return False, {"verified": False, "error": str(e)}

    # ── Convenience ──────────────────────────────────────────────────────

    def check_request_for_payment(
        self,
        headers: Dict[str, str],
        resource_path: str,
        price_usd_cents: int,
    ) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Check if the incoming request contains a valid x402 payment.
        Returns (has_valid_payment, settlement_details_or_None).
        """
        payment = headers.get("X-PAYMENT") or headers.get("x-payment")
        if not payment:
            return False, None

        return self.verify_payment(payment, resource_path, price_usd_cents)
