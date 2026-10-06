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
  Lock
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
  "⚡ Aerodrome vs Uniswap liquidity comparison",
];

export default function DefiSenseApp() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "agent",
      content: `# 🤖 Welcome to DefiSense
I am your autonomous **DeFi Research & Yield Intelligence Agent** built on Base.

### What I can do for you:
- **Scan live Yield Pools** with real-time APY & TVL from DeFi Llama
- **Assess Impermanent Loss & Protocol Risk** before you deposit
- **Compare DEX Liquidity** across Aerodrome, Uniswap & Base protocols
- **Prepare & Simulate On-Chain Actions** on Base Sepolia

Ask me anything or pick a quick prompt below to start researching!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolsUsed: ["DeFi Llama", "Base Sepolia RPC", "Risk Engine"]
    }
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolStep, setActiveToolStep] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Simulated multi-step agent reasoning UX
    setActiveToolStep("Querying DeFi Llama API for Base yields...");
    await new Promise((r) => setTimeout(r, 600));
    setActiveToolStep("Scanning DEX pairs & TVL health metrics...");
    await new Promise((r) => setTimeout(r, 700));
    setActiveToolStep("Synthesizing risk assessment & recommendations...");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        content: data.report || "No data returned.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolsUsed: ["DeFi Llama Yields", "CoinGecko", "Risk Engine v1"],
        rawData: data.raw_data
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          content: `⚠️ Failed to fetch live data: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
      setActiveToolStep(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 🌌 Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-xl px-6 py-4">
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

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Base Sepolia</span>
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
        <div className="lg:col-span-8 flex flex-col h-[calc(100vh-140px)] rounded-2xl glass-panel-glow overflow-hidden relative border border-slate-800/80">
          
          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "agent" && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl p-4.5 text-sm leading-relaxed shadow-lg ${
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

                  {/* Render Message Body */}
                  <div className="whitespace-pre-wrap font-sans text-sm space-y-2">
                    {msg.content}
                  </div>

                  {/* Timestamp */}
                  <div className="mt-2 text-[10px] text-slate-400 text-right font-mono">
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
              <div className="flex gap-3 items-center text-xs text-cyan-400 bg-cyan-950/30 border border-cyan-800/40 px-4 py-3 rounded-xl w-fit animate-pulse">
                <Activity className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{activeToolStep || "Agent executing on-chain tools..."}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-6 py-2 border-t border-slate-800/50 bg-slate-950/40 flex gap-2 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap text-xs px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700/50 hover:border-cyan-700/50 transition-all text-slate-300 shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-lg">
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
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner focus:ring-1 focus:ring-cyan-500/50"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm text-white flex items-center gap-2 shadow-md shadow-cyan-500/20 transition-all"
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
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-sm text-slate-100">Base Ecosystem Pulse</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                LIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-xs text-slate-400">Total TVL (Base)</span>
                <div className="text-lg font-bold text-slate-100 mt-1">$3.42B</div>
                <span className="text-[10px] text-emerald-400 font-mono">+4.2% 7d</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-xs text-slate-400">24h DEX Volume</span>
                <div className="text-lg font-bold text-slate-100 mt-1">$482M</div>
                <span className="text-[10px] text-cyan-400 font-mono">Aerodrome #1</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Top Protocols</span>
              
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-cyan-800/40 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">A</div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Aerodrome</div>
                    <div className="text-[10px] text-slate-400">DEX / Automated Market Maker</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200">$1.12B</div>
                  <div className="text-[10px] text-emerald-400 font-mono">+6.8%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-cyan-800/40 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-bold">U</div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Uniswap V3</div>
                    <div className="text-[10px] text-slate-400">Concentrated Liquidity DEX</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200">$412M</div>
                  <div className="text-[10px] text-emerald-400 font-mono">+1.4%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-cyan-800/40 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">M</div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Moonwell</div>
                    <div className="text-[10px] text-slate-400">Lending & Borrowing</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200">$284M</div>
                  <div className="text-[10px] text-emerald-400 font-mono">+3.1%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Agent Capabilities */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
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
                <span className="text-slate-300">CoinGecko Market Data</span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Dexscreener Base Pairs</span>
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
