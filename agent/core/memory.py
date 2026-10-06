from typing import List, Dict, Any, Optional
import time

class AgentMemory:
    """
    In-memory session memory for multi-turn DeFi research dialogues.
    Tracks user risk profile, queried tokens, and past agent recommendations.
    """

    def __init__(self, max_history: int = 10):
        self.max_history = max_history
        self.history: List[Dict[str, Any]] = []
        self.user_preferences: Dict[str, Any] = {
            "risk_tolerance": "moderate",  # conservative, moderate, aggressive
            "target_chains": ["Base"],
            "favorite_tokens": ["USDC", "WETH", "AERO"]
        }

    def add_interaction(self, query: str, response: str, tools_used: Optional[List[str]] = None):
        """Append an interaction turn to history."""
        self.history.append({
            "timestamp": time.time(),
            "query": query,
            "response": response,
            "tools_used": tools_used or []
        })
        if len(self.history) > self.max_history:
            self.history.pop(0)

    def get_recent_context(self, limit: int = 3) -> str:
        """Format recent conversation history as context for LLM prompt."""
        if not self.history:
            return ""
        
        recent = self.history[-limit:]
        formatted = ["### Recent Conversation Context:"]
        for turn in recent:
            formatted.append(f"User: {turn['query']}")
            # Truncate response preview to keep context compact
            preview = turn['response'][:180].replace('\n', ' ')
            formatted.append(f"Agent: {preview}...")
        
        return "\n".join(formatted)

    def set_risk_tolerance(self, level: str):
        """Update user risk tolerance."""
        if level in ["conservative", "moderate", "aggressive"]:
            self.user_preferences["risk_tolerance"] = level

    def clear(self):
        """Clear memory session."""
        self.history.clear()
