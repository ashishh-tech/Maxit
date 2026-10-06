import os
from typing import Dict, Any, Optional
from web3 import Web3

BASE_SEPOLIA_RPC_URL = os.getenv("BASE_SEPOLIA_RPC", "https://sepolia.base.org")

class BaseRpcTool:
    """Tool for querying on-chain Base Sepolia state (block number, gas, balances)."""

    def __init__(self, rpc_url: Optional[str] = None):
        self.rpc_url = rpc_url or BASE_SEPOLIA_RPC_URL
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))

    def is_connected(self) -> bool:
        """Check connection to Base Sepolia RPC."""
        try:
            return self.w3.is_connected()
        except Exception:
            return False

    def get_network_stats(self) -> Dict[str, Any]:
        """Fetch current block, chain ID, and estimated gas price."""
        try:
            if not self.is_connected():
                return {"error": "Unable to connect to Base Sepolia RPC", "connected": False}

            block_num = self.w3.eth.block_number
            chain_id = self.w3.eth.chain_id
            gas_price_wei = self.w3.eth.gas_price
            gas_price_gwei = round(float(self.w3.from_wei(gas_price_wei, "gwei")), 4)

            return {
                "network": "Base Sepolia Testnet",
                "chain_id": chain_id,
                "latest_block": block_num,
                "gas_price_gwei": gas_price_gwei,
                "connected": True
            }
        except Exception as e:
            return {"error": f"RPC query failed: {str(e)}", "connected": False}

    def get_address_eth_balance(self, address: str) -> Dict[str, Any]:
        """Fetch ETH balance of an address on Base Sepolia."""
        try:
            checksum_address = self.w3.to_checksum_address(address)
            balance_wei = self.w3.eth.get_balance(checksum_address)
            balance_eth = float(self.w3.from_wei(balance_wei, "ether"))
            return {
                "address": checksum_address,
                "balance_eth": round(balance_eth, 6),
                "network": "Base Sepolia"
            }
        except Exception as e:
            return {"error": f"Invalid address or query failed: {str(e)}"}
