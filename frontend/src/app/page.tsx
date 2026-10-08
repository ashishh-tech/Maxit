"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  Layers, 
  Wallet, 
  Search,
  ExternalLink,
  ChevronRight,
  Zap,
  Activity,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Fuel,
  ArrowUpRight
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "agent";
  content: string;
  timestamp: string;
  toolsUsed?: string[];
  rawData?: any;
}

const QUICK_PROMPTS = [
  "🔥 Best yields on Base right now",
  "🏛️ Top protocols by TVL on Base",
  "🛡️ Safe stablecoin yield pools",
  "⚡ Aerodrome vs Uniswap comparison",
  "⛽ Check Base gas and block height",
];

// Rich Markdown / Report Formatter
function FormattedReport({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderFormattedLine = (line: string, index: number) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={index} className="h-2" />;
    }

    // Main Header #
    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={index} className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 mt-2 mb-2">
          {trimmed.replace(/^#\s*/, "")}
        </h1>
      );
    }

    // Sub Header ##
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={index} className="text-xs sm:text-sm font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 mt-3 mb-1.5 border-b border-slate-800/80 pb-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          {trimmed.replace(/^##\s*/, "")}
        </h2>
      );
    }

    // Sub-sub Header ###
    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={index} className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5 mt-2.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          {trimmed.replace(/^###\s*/, "")}
        </h3>
      );
    }

    // Table divider line
    if (trimmed.startsWith("|---") || trimmed.startsWith("|:---")) {
      return null;
    }

    // Table rows
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed.split("|").filter((c, i, arr) => i > 0 && i < arr.length - 1);
      return (
        <div key={index} className="grid grid-cols-3 gap-2 p-2 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs my-1 font-mono">
          {cells.map((cell, cIdx) => (
            <div key={cIdx} className={cIdx === 0 ? "font-semibold text-slate-300" : "text-cyan-300"}>
              {parseInlineMarkdown(cell.trim())}
            </div>
          ))}
        </div>
      );
    }

    // Bullet points
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const bulletText = trimmed.replace(/^[-•]\s*/, "");
      return (
        <div key={index} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300 my-1 pl-1">
          <span className="text-cyan-400 mt-0.5">•</span>
          <div className="flex-1 leading-relaxed">{parseInlineMarkdown(bulletText)}</div>
        </div>
      );
    }

    // Numbered lists
    if (/^\d+\.\s/.test(trimmed)) {
      const numText = trimmed.replace(/^\d+\.\s*/, "");
      return (
        <div key={index} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300 my-1 pl-1">
          <span className="font-mono text-cyan-400 text-xs mt-0.5">▸</span>
          <div className="flex-1 leading-relaxed">{parseInlineMarkdown(numText)}</div>
        </div>
      );
    }

    return (
      <p key={index} className="text-xs sm:text-sm text-slate-300 leading-relaxed my-1">
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  };

  const parseInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 mx-0.5">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i} className="italic text-slate-400">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const lines = content.split("\n");

  return (
    <div className="relative group">
      <div className="space-y-0.5">
        {lines.map((line, idx) => renderFormattedLine(line, idx))}
      </div>
      
      <button
        onClick={handleCopy}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700 text-[11px] flex items-center gap-1 shadow-md"
        title="Copy report"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}

export default function DefiSenseApp() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "agent",
      content: `# 🤖 Welcome to DefiSense
I am your autonomous **DeFi Research & Yield Intelligence Agent** native to Base L2.

## 🎯 Active Capabilities
- **Scan Live Yield Pools**: Real-time APYs, TVL, and reward breakdown from DeFi Llama
- **QuantPulse Risk Engine**: Mathematical Impermanent Loss estimates and pool sustainability rating
- **Live Base RPC State**: Real-time gas price tracker in Gwei and latest block queries
- **DEX Liquidity Depth**: Comparison across Aerodrome, Uniswap V3, Moonwell and Base money markets

Ask me anything or tap one of the quick research actions below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolsUsed: ["DeFi Llama Yields", "Base Sepolia RPC", "QuantPulse Risk Engine"]
    }
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolStep, setActiveToolStep] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [gasGwei, setGasGwei] = useState<string>("0.006");
  const [blockNumber, setBlockNumber] = useState<number>(52321000);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll live Base gas periodically
  useEffect(() => {
    const fetchGas = async () => {
      try {
        const res = await fetch("https://mainnet.base.org", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([
            { jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 },
            { jsonrpc: "2.0", method: "eth_gasPrice", params: [], id: 2 },
          ]),
        });
        const data = await res.json();
        const blockHex = data.find((d: any) => d.id === 1)?.result;
        const gasHex = data.find((d: any) => d.id === 2)?.result;
        if (blockHex) setBlockNumber(parseInt(blockHex, 16));
        if (gasHex) setGasGwei(((parseInt(gasHex, 16)) / 1e9).toFixed(4));
      } catch {
        // keep fallback
      }
    };
    fetchGas();
    const interval = setInterval(fetchGas, 15000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeToolStep]);

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    // Dynamic step reasoning UX
    setActiveToolStep("Classifying user intent & orchestrating tools...");
    await new Promise((r) => setTimeout(r, 450));
    setActiveToolStep("Querying on-chain RPC & DeFi Llama endpoints...");
    await new Promise((r) => setTimeout(r, 550));
    setActiveToolStep("QuantPulse Risk Engine computing divergence scores...");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      let toolsUsed = ["DeFi Llama Yields", "QuantPulse Risk Engine"];
      if (/gas|block|rpc|network/i.test(query)) {
        toolsUsed = ["Base Sepolia RPC", "Web3 State Tracker"];
      } else if (/protocol|tvl/i.test(query)) {
        toolsUsed = ["DeFi Llama Protocols", "TVL Aggregator"];
      } else if (/compare|vs|aerodrome/i.test(query)) {
        toolsUsed = ["Aerodrome Slipstream", "Uniswap V3 DEX", "QuantPulse"];
      }
      
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        content: data.report || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolsUsed,
        rawData: data.raw_data
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          content: `⚠️ Failed to execute research query: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
      setActiveToolStep(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 🌌 Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#080c14]/90 backdrop-blur-xl px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                  DefiSense
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  Agentmaxxx v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous DeFi Research & Yield Agent</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Base Gas Ticker */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
              <Fuel className="w-3.5 h-3.5 text-cyan-400" />
              <span>Base Gas:</span>
              <span className="font-mono text-cyan-300 font-semibold">{gasGwei} Gwei</span>
            </div>

            {/* Network pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Block #{blockNumber ? blockNumber.toLocaleString() : "..."}</span>
            </div>

            <button
              onClick={() => setWalletConnected(!walletConnected)}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md ${
                walletConnected
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20"
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>{walletConnected ? "0x742d...44e" : "Connect Wallet"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 Main Content Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Interactive Agent Chat (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-[calc(100vh-140px)] rounded-2xl glass-panel-glow overflow-hidden relative border border-slate-800/80 bg-slate-950/40">
          
          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "agent" && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-1 shadow-sm shadow-cyan-500/10">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                )}

                <div
                  className={`max-w-[92%] sm:max-w-[86%] rounded-2xl p-4.5 text-sm leading-relaxed shadow-lg ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-tr-sm"
                      : "bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-tl-sm backdrop-blur-md"
                  }`}
                >
                  {/* Tool execution badge */}
                  {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3 pb-2.5 border-b border-slate-800/80">
                      {msg.toolsUsed.map((tool, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-800/40"
                        >
                          <Zap className="w-2.5 h-2.5 text-cyan-400" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Render Message Content with Custom Rich Formatter */}
                  <FormattedReport content={msg.content} />

                  {/* Timestamp */}
                  <div className="mt-2 text-[10px] text-slate-500 text-right font-mono">
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-xs font-bold text-blue-300">YOU</span>
                  </div>
                )}
              </div>
            ))}

            {/* Active Step Indicator when Loading */}
            {isLoading && (
              <div className="flex gap-3 items-center text-xs text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 px-4 py-3 rounded-xl w-fit shadow-lg shadow-cyan-950/50 animate-pulse">
                <Activity className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{activeToolStep || "Agent executing on-chain tools..."}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 sm:px-6 py-2 border-t border-slate-800/60 bg-slate-950/60 flex gap-2 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap text-xs px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-800 hover:border-cyan-700/60 transition-all text-slate-300 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-900/70 backdrop-blur-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask DefiSense (e.g. 'Find top APY pools on Base with TVL > $100k')..."
                  className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner focus:ring-1 focus:ring-cyan-500/50"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm text-white flex items-center gap-2 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Live Protocol Intelligence Panel (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Base Ecosystem Live Stats */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-sm text-slate-100">Base Ecosystem Pulse</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 animate-pulse">
                LIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-xs text-slate-400">Total TVL (Base)</span>
                <div className="text-lg font-bold text-slate-100 mt-1">$9.55B</div>
                <span className="text-[10px] text-emerald-400 font-mono">+5.4% 7d</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-xs text-slate-400">24h DEX Volume</span>
                <div className="text-lg font-bold text-slate-100 mt-1">$540M</div>
                <span className="text-[10px] text-cyan-400 font-mono">Aerodrome #1</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Top Base Protocols</span>
              
              <div 
                onClick={() => handleSend("Analyze Morpho Blue on Base")}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-800/60 hover:bg-slate-800/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">M</div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Morpho Blue</div>
                    <div className="text-[10px] text-slate-400">Lending Market</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200">$4.45B</div>
                  <div className="text-[10px] text-emerald-400 font-mono">+2.5%</div>
                </div>
              </div>

              <div 
                onClick={() => handleSend("Aerodrome yield analysis and pools")}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-800/60 hover:bg-slate-800/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">A</div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Aerodrome</div>
                    <div className="text-[10px] text-slate-400">DEX / ve(3,3) AMM</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200">$1.12B</div>
                  <div className="text-[10px] text-emerald-400 font-mono">+6.8%</div>
                </div>
              </div>

              <div 
                onClick={() => handleSend("Aave V3 Base lending rates")}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-800/60 hover:bg-slate-800/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-bold">A</div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Aave V3</div>
                    <div className="text-[10px] text-slate-400">Money Market</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200">$553M</div>
                  <div className="text-[10px] text-emerald-400 font-mono">+1.9%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Agent Capabilities */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-sm text-slate-100">Integrated Agent Tools</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">DeFi Llama Yields & TVL</span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Base RPC Live Gas Tracker</span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">QuantPulse Risk Engine</span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Dexscreener Base Pairs</span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800 opacity-60">
                <span className="text-slate-300">Uniswap V3 On-Chain Swaps</span>
                <span className="text-[10px] text-cyan-400 font-mono">Week 3 Sprint</span>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
