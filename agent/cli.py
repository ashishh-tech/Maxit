import sys
import os
import io

# Fix Windows console UTF-8 output encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from agent.core.mini_agent import DefiSenseMiniAgent
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown

def main():
    console = Console(force_terminal=True, legacy_windows=False)
    console.print(Panel.fit(
        "[bold cyan]DefiSense — Autonomous DeFi Research Agent[/bold cyan]\n"
        "[dim]Agentmaxxx Hackathon | Base Sepolia & DeFi Llama Intelligence[/dim]",
        border_style="cyan"
    ))

    agent = DefiSenseMiniAgent()

    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = "What are the best yields and top protocols on Base right now?"

    with console.status("[bold green]Agent researching DeFi Llama, CoinGecko & DEX pools...[/bold green]"):
        result = agent.analyze_query(query)

    console.print("\n")
    console.print(Markdown(result["report"]))
    console.print("\n[dim green]✓ Research completed successfully using live on-chain tools.[/dim green]")

if __name__ == "__main__":
    main()
