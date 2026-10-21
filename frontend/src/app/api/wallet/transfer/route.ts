import { NextResponse } from "next/server";
import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

export async function POST(req: Request) {
  try {
    const { to, amount } = await req.json();

    if (!to || !amount) {
      return NextResponse.json({ error: "Recipient ('to') and 'amount' are required" }, { status: 400 });
    }

    const rawKey = process.env.AGENT_PRIVATE_KEY || "c245a9c17e88b3b0c0e53e5780a74ab9884cedc2f052bcb0179428cfaa16f42e";
    const formattedKey = rawKey.startsWith("0x") ? (rawKey as `0x${string}`) : (`0x${rawKey}` as `0x${string}`);

    const account = privateKeyToAccount(formattedKey);

    const client = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org"),
    });

    const txHash = await client.sendTransaction({
      to: to.trim() as `0x${string}`,
      value: parseEther(amount.toString()),
    });

    return NextResponse.json({
      success: true,
      tx_hash: txHash,
      from: account.address,
      to,
      amount,
      explorer_url: `https://sepolia.basescan.org/tx/${txHash}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Transfer failed" },
      { status: 500 }
    );
  }
}
