"""
DefiSense Agent Wallet — Base Sepolia ETH & USDC wallet management.

Provides the agent with its own on-chain identity: balance queries, ETH transfers,
ERC-20 USDC reads, and message signing (used by x402 payment verification).
"""

import os
from typing import Dict, Any, Optional
from web3 import Web3
from eth_account import Account

BASE_SEPOLIA_RPC_URL = os.getenv("BASE_SEPOLIA_RPC", "https://sepolia.base.org")

# Base Sepolia USDC contract (Circle testnet faucet mint)
USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"

# Minimal ERC-20 ABI for balance and transfer operations
ERC20_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function",
    },
    {
        "constant": False,
        "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"},
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function",
    },
    {
        "constant": True,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function",
    },
    {
        "constant": True,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function",
    },
]


class AgentWallet:
    """Base Sepolia wallet for the DefiSense agent — manages ETH and USDC."""

    def __init__(self, private_key: Optional[str] = None, rpc_url: Optional[str] = None):
        self.rpc_url = rpc_url or BASE_SEPOLIA_RPC_URL
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))

        # Load or generate private key
        raw_key = private_key or os.getenv("AGENT_PRIVATE_KEY", "")

        if raw_key:
            # Normalize: strip whitespace & optional 0x prefix
            raw_key = raw_key.strip()
            if not raw_key.startswith("0x"):
                raw_key = "0x" + raw_key
            self.account = Account.from_key(raw_key)
        else:
            # Generate ephemeral wallet (will not persist across restarts)
            self.account = Account.create()
            print(f"[!] No AGENT_PRIVATE_KEY found. Generated ephemeral wallet: {self.account.address}")
            print(f"    Add to .env:  AGENT_PRIVATE_KEY={self.account.key.hex()}")

        self.address = self.account.address

        # USDC ERC-20 contract handle
        self.usdc_contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(USDC_BASE_SEPOLIA),
            abi=ERC20_ABI,
        )

    # ── Read Operations ──────────────────────────────────────────────────

    def get_wallet_info(self) -> Dict[str, Any]:
        """Full wallet snapshot: address, balances, connection status."""
        try:
            return {
                "address": self.address,
                "network": "Base Sepolia",
                "chain_id": 84532,
                "eth_balance": round(self.get_eth_balance(), 6),
                "usdc_balance": round(self.get_usdc_balance(), 2),
                "connected": self.w3.is_connected(),
                "rpc_url": self.rpc_url,
                "explorer_url": f"https://sepolia.basescan.org/address/{self.address}",
            }
        except Exception as e:
            return {
                "address": self.address,
                "network": "Base Sepolia",
                "chain_id": 84532,
                "error": str(e),
                "connected": False,
            }

    def get_eth_balance(self) -> float:
        """Return ETH balance in ether."""
        balance_wei = self.w3.eth.get_balance(self.address)
        return float(self.w3.from_wei(balance_wei, "ether"))

    def get_usdc_balance(self) -> float:
        """Return USDC balance (human-readable, 6 decimals)."""
        try:
            raw = self.usdc_contract.functions.balanceOf(self.address).call()
            return raw / 1e6
        except Exception:
            return 0.0

    # ── Write Operations ─────────────────────────────────────────────────

    def send_eth(self, to_address: str, amount_eth: float) -> Dict[str, Any]:
        """Send ETH on Base Sepolia. Returns tx hash and explorer link."""
        try:
            to = self.w3.to_checksum_address(to_address)
            nonce = self.w3.eth.get_transaction_count(self.address)

            tx = {
                "nonce": nonce,
                "to": to,
                "value": self.w3.to_wei(amount_eth, "ether"),
                "gas": 21000,
                "gasPrice": self.w3.eth.gas_price,
                "chainId": 84532,
            }

            signed = self.account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)

            return {
                "success": True,
                "tx_hash": tx_hash.hex(),
                "from": self.address,
                "to": to,
                "amount_eth": amount_eth,
                "explorer_url": f"https://sepolia.basescan.org/tx/0x{tx_hash.hex()}",
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def send_usdc(self, to_address: str, amount_usdc: float) -> Dict[str, Any]:
        """Send USDC on Base Sepolia."""
        try:
            to = self.w3.to_checksum_address(to_address)
            # USDC has 6 decimals
            raw_amount = int(amount_usdc * 1e6)
            nonce = self.w3.eth.get_transaction_count(self.address)

            tx = self.usdc_contract.functions.transfer(to, raw_amount).build_transaction(
                {
                    "from": self.address,
                    "nonce": nonce,
                    "gasPrice": self.w3.eth.gas_price,
                    "chainId": 84532,
                }
            )

            signed = self.account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)

            return {
                "success": True,
                "tx_hash": tx_hash.hex(),
                "from": self.address,
                "to": to,
                "amount_usdc": amount_usdc,
                "explorer_url": f"https://sepolia.basescan.org/tx/0x{tx_hash.hex()}",
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    # ── Signing ──────────────────────────────────────────────────────────

    def sign_message(self, message: str) -> Dict[str, Any]:
        """Sign an arbitrary message with the agent's private key (EIP-191)."""
        from eth_account.messages import encode_defunct

        msg = encode_defunct(text=message)
        signed = self.account.sign_message(msg)

        return {
            "message": message,
            "signature": signed.signature.hex(),
            "signer": self.address,
        }
