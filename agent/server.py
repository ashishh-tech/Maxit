import sys
import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from agent.core.mini_agent import DefiSenseMiniAgent
from agent.tools.wallet import AgentWallet
from agent.tools.x402_paywall import X402Paywall

app = FastAPI(title="DefiSense Agent API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Initialize agent, wallet, and x402 paywall ──────────────────────────
agent = DefiSenseMiniAgent()
wallet = AgentWallet()

# x402 paywall: charges 1 cent USDC per premium research query
paywall = X402Paywall(payee_address=wallet.address)
PREMIUM_PRICE_CENTS = 1  # $0.01 USDC per premium query


# ── Request / Response Models ────────────────────────────────────────────

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    query: str
    chain: str
    report: str
    raw_data: dict

class SendEthRequest(BaseModel):
    to_address: str
    amount_eth: float

class SendUsdcRequest(BaseModel):
    to_address: str
    amount_usdc: float

class SignMessageRequest(BaseModel):
    message: str


# ── Core Endpoints ───────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "status": "online",
        "agent": "DefiSense",
        "version": "2.0.0",
        "wallet": wallet.address,
        "capabilities": ["research", "risk-engine", "wallet", "x402-payments"],
    }


@app.post("/api/research", response_model=QueryResponse)
def research_endpoint(req: QueryRequest):
    """Free-tier research endpoint — general yield and protocol analysis."""
    try:
        if not req.query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        result = agent.analyze_query(req.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/protocols")
def get_protocols(chain: str = "Base", limit: int = 10):
    return agent.defi_llama.get_top_protocols_by_chain(chain=chain, limit=limit)


@app.get("/api/yields")
def get_yields(chain: str = "Base", limit: int = 10):
    return agent.defi_llama.get_yield_pools(chain=chain, limit=limit)


# ── Wallet Endpoints ─────────────────────────────────────────────────────

@app.get("/api/wallet/status")
def wallet_status():
    """Get the agent's on-chain wallet status, balances, and address."""
    return wallet.get_wallet_info()


@app.post("/api/wallet/send-eth")
def send_eth(req: SendEthRequest):
    """Send ETH from the agent wallet on Base Sepolia."""
    if req.amount_eth <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    result = wallet.send_eth(req.to_address, req.amount_eth)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Transaction failed"))
    return result


@app.post("/api/wallet/send-usdc")
def send_usdc(req: SendUsdcRequest):
    """Send USDC from the agent wallet on Base Sepolia."""
    if req.amount_usdc <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    result = wallet.send_usdc(req.to_address, req.amount_usdc)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Transaction failed"))
    return result


@app.post("/api/wallet/sign")
def sign_message(req: SignMessageRequest):
    """Sign a message with the agent's private key (EIP-191)."""
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    return wallet.sign_message(req.message)


# ── x402 Premium Research Endpoint ───────────────────────────────────────

@app.get("/api/premium-research")
def premium_research_info():
    """
    GET returns the x402 payment requirements (what it costs, where to pay).
    This lets clients/agents discover the paywall before sending payment.
    """
    return {
        "endpoint": "/api/premium-research",
        "method": "POST",
        "protocol": "x402",
        "price": f"${PREMIUM_PRICE_CENTS / 100:.2f} USDC",
        "network": "base-sepolia",
        "payTo": wallet.address,
        "description": "Premium AI-powered DeFi research with deep risk analysis, alpha signals, and portfolio recommendations.",
        "requirements": paywall.create_payment_requirements(
            PREMIUM_PRICE_CENTS,
            "/api/premium-research",
            "Premium DeFi Research Report — DefiSense",
        ),
    }


@app.post("/api/premium-research")
def premium_research(request: Request, req: QueryRequest):
    """
    x402-gated premium research endpoint.

    Flow:
      1. Client POSTs without X-PAYMENT header → 402 + payment challenge
      2. Client signs USDC authorization and retries with X-PAYMENT header
      3. Server verifies via facilitator → serves premium research report
    """
    resource_path = "/api/premium-research"

    # Check for x402 payment header
    payment_header = request.headers.get("X-PAYMENT") or request.headers.get("x-payment")

    if not payment_header:
        # No payment: return 402 Payment Required with challenge
        return JSONResponse(
            status_code=402,
            content=paywall.get_402_body(
                PREMIUM_PRICE_CENTS,
                resource_path,
                "Premium DeFi Research Report — DefiSense",
            ),
            headers=paywall.get_402_headers(
                PREMIUM_PRICE_CENTS,
                resource_path,
                "Premium DeFi Research Report — DefiSense",
            ),
        )

    # Verify payment via Coinbase facilitator
    is_valid, settlement = paywall.verify_payment(
        payment_header, resource_path, PREMIUM_PRICE_CENTS
    )

    if not is_valid:
        raise HTTPException(
            status_code=402,
            detail=f"Payment verification failed: {settlement.get('error', 'Unknown error')}",
        )

    # Payment verified — serve premium research
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    result = agent.analyze_query(req.query)

    return {
        **result,
        "tier": "premium",
        "x402_settlement": settlement,
        "payment_status": "verified",
    }


# ── Run ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("agent.server:app", host="0.0.0.0", port=8000, reload=True)
