import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from agent.core.mini_agent import DefiSenseMiniAgent

app = FastAPI(title="DefiSense Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = DefiSenseMiniAgent()

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    query: str
    chain: str
    report: str
    raw_data: dict

@app.get("/")
def root():
    return {"status": "online", "agent": "DefiSense", "version": "1.0.0"}

@app.post("/api/research", response_model=QueryResponse)
def research_endpoint(req: QueryRequest):
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("agent.server:app", host="0.0.0.0", port=8000, reload=True)
