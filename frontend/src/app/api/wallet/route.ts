import { NextResponse } from "next/server";

const AGENT_BACKEND_URL = process.env.AGENT_BACKEND_URL || "http://localhost:8000";
const AGENT_WALLET_ADDRESS = process.env.AGENT_WALLET_ADDRESS || "0xcc40f8B1B95CC6d86ba84Bee37932Fe419a03a1e";
const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org";

export async function GET() {
  // First attempt to query the Python agent backend
  try {
    const res = await fetch(`${AGENT_BACKEND_URL}/api/wallet/status`, {
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Fall back to direct RPC query
  }

  // Fallback direct RPC query for live testnet data
  try {
    const rpcRes = await fetch(BASE_SEPOLIA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        {
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [AGENT_WALLET_ADDRESS, "latest"],
          id: 1,
        },
        {
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 2,
        },
      ]),
      signal: AbortSignal.timeout(4000),
    });

    const data = await rpcRes.json();
    const balanceHex = data.find((d: any) => d.id === 1)?.result || "0x0";
    const balanceWei = BigInt(balanceHex);
    const ethBalance = Number(balanceWei) / 1e18;

    return NextResponse.json({
      address: AGENT_WALLET_ADDRESS,
      network: "Base Sepolia",
      chain_id: 84532,
      eth_balance: Number(ethBalance.toFixed(6)),
      usdc_balance: 0.0,
      connected: true,
      rpc_url: BASE_SEPOLIA_RPC,
      explorer_url: `https://sepolia.basescan.org/address/${AGENT_WALLET_ADDRESS}`,
      mode: "direct-rpc-fallback",
    });
  } catch (err: any) {
    return NextResponse.json({
      address: AGENT_WALLET_ADDRESS,
      network: "Base Sepolia",
      chain_id: 84532,
      eth_balance: 0.0,
      usdc_balance: 0.0,
      connected: false,
      error: err.message,
      explorer_url: `https://sepolia.basescan.org/address/${AGENT_WALLET_ADDRESS}`,
    });
  }
}
