"use client";

import React, { useState, useEffect, useRef } from "react";

interface ResearchReport {
  query: string;
  report: string;
  timestamp: string;
  poolsIndexed: number;
}

export default function DefiSenseApp() {
  const [activeTab, setActiveTab] = useState<"terminal" | "radar" | "yields" | "alerts">("terminal");
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletConnected, setWalletConnected] = useState(true);
  const [gasGwei, setGasGwei] = useState("0.006");
  const [blockNumber, setBlockNumber] = useState(52321000);

  // Active AI Briefing State
  const [activeBriefing, setActiveBriefing] = useState<ResearchReport>({
    query: "Base Ecosystem Yield Scan",
    report: `Liquidity distribution across Base vAMM and concentrated DEXs exhibits stable fee compounding with subdued volatility. Top risk-adjusted opportunities remain concentrated in blue-chip pairings:

• Stable liquidity depth on Aerodrome continues to outpace Uniswap V3 on low-slippage routing.
• cbBTC incentives offer attractive hedged yields with under 1.2% projected 30-day Impermanent Loss.`,
    timestamp: "Updated 2m ago",
    poolsIndexed: 142,
  });

  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: "user" | "agent"; text: string; time: string }>
  >([]);

  // Fetch real-time Base gas
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
        if (gasHex) setGasGwei(((parseInt(gasHex, 16)) / 1e9).toFixed(3));
      } catch {
        // keep default
      }
    };
    fetchGas();
    const interval = setInterval(fetchGas, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleSendQuery = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    const userQuery = q.trim();
    setInputQuery("");
    setIsLoading(true);

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Add to chat history
    setChatHistory((prev) => [
      ...prev,
      { sender: "user", text: userQuery, time: currentTime },
    ]);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });

      const data = await res.json();
      const reportText = data.report || "No data received from research agent.";

      setActiveBriefing({
        query: userQuery,
        report: reportText,
        timestamp: "Just now",
        poolsIndexed: data.raw_data?.totalPools || 148,
      });

      setChatHistory((prev) => [
        ...prev,
        { sender: "agent", text: reportText, time: currentTime },
      ]);
    } catch {
      setActiveBriefing({
        query: userQuery,
        report: "⚠️ Agent connection timeout. Check live on-chain connection.",
        timestamp: "Just now",
        poolsIndexed: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${activeBriefing.query}\n\n${activeBriefing.report}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#F8F9FA] text-slate-900 flex flex-col min-h-screen">
      {/* TOP APP HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#F8F9FA]/90 backdrop-blur-md border-b border-slate-200/80 pt-safe">
        <div className="h-14 px-4 flex items-center justify-between gap-3 max-w-5xl mx-auto">
          {/* Left: Logo & Wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-[15px] tracking-tight text-slate-900">
                DefiSense
              </span>
              <span className="text-[11px] font-mono text-orange-600 font-medium hidden sm:inline">
                RESEARCH
              </span>
            </div>
          </div>

          {/* Right: Network Selector + Gas + Wallet */}
          <div className="flex items-center gap-2">
            {/* Gas Badge */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-mono text-slate-600 shadow-sm">
              <span className="text-orange-500">⛽</span>
              <span className="font-semibold text-slate-800">{gasGwei}</span>
              <span className="text-[10px] text-slate-400">Gwei</span>
            </div>

            {/* Network Selector Pill */}
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-orange-300 text-[12px] font-medium text-slate-700 shadow-sm transition-colors cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span>Base</span>
              <span className="material-symbols-outlined text-[14px] text-slate-400">
                expand_more
              </span>
            </button>

            {/* Connected Wallet Pill */}
            <button
              onClick={() => setWalletConnected(!walletConnected)}
              className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-full bg-white border border-slate-200 hover:border-orange-300 shadow-sm transition-colors cursor-pointer"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  walletConnected ? "bg-emerald-500" : "bg-slate-400"
                }`}
              ></span>
              <span className="font-mono text-[11px] text-slate-700 font-medium">
                {walletConnected ? "0x742d...44e" : "Connect"}
              </span>
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-[10px] text-white font-bold ml-0.5">
                D
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN SCROLLABLE CONTENT */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-20 pb-36 space-y-4">
        {/* 1. BASE ECOSYSTEM OVERVIEW CARDS */}
        <section className="grid grid-cols-2 gap-3 pt-1">
          {/* Total TVL */}
          <div
            onClick={() => handleSendQuery("Show full Base TVL and breakdown")}
            className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:border-orange-300 transition-colors flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-medium text-slate-600">Base TVL</span>
              <span className="text-[10px] text-slate-400 font-mono">L2 BEAT</span>
            </div>
            <div className="my-1.5 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tracking-tight text-slate-900">
                $9.55B
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-mono font-medium">
                <span className="material-symbols-outlined text-[13px]">trending_up</span> +5.4%
                <span className="text-slate-400 text-[10px] ml-0.5">7d</span>
              </span>
              {/* Sparkline */}
              <svg className="w-12 h-4 text-emerald-500" fill="none" viewBox="0 0 48 16">
                <path
                  d="M1 13 L10 11 L18 14 L28 7 L36 9 L47 2"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </div>
          </div>

          {/* 24h DEX Volume */}
          <div
            onClick={() => handleSendQuery("Aerodrome DEX volume & top traded pairs")}
            className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:border-orange-300 transition-colors flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-medium text-slate-600">24h DEX Volume</span>
              <span className="text-[10px] text-slate-400 font-mono">DEFILLAMA</span>
            </div>
            <div className="my-1.5 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tracking-tight text-slate-900">
                $540.2M
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-slate-700 font-medium truncate">Aerodrome</span>
              <span className="text-slate-400 font-mono text-[10px]">68.2% share</span>
            </div>
          </div>
        </section>

        {/* 2. INSTITUTIONAL RESEARCH BRIEFING / AI ALPHA NOTE */}
        <article className="rounded-xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-2 h-2 rounded-full ${
                  isLoading ? "bg-amber-500 animate-ping" : "bg-orange-600"
                }`}
              ></div>
              <div className="flex flex-col min-w-0">
                <h2 className="text-sm font-semibold text-slate-900 truncate">
                  {activeBriefing.query}
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <span>{isLoading ? "Analyzing..." : activeBriefing.timestamp}</span>
                  <span>•</span>
                  <span>{activeBriefing.poolsIndexed} pools indexed</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSendQuery("Bookmark top Base yields")}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Bookmark research note"
              >
                <span className="material-symbols-outlined text-[17px]">bookmark_border</span>
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                id="btn-copy-report"
                title="Copy briefing"
              >
                <span
                  className={`material-symbols-outlined text-[17px] ${
                    copied ? "text-emerald-600 font-bold" : ""
                  }`}
                >
                  {copied ? "check" : "share"}
                </span>
              </button>
            </div>
          </div>

          {/* Executive Briefing Text */}
          <div className="p-4 space-y-3">
            <div className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
              {activeBriefing.report}
            </div>

            {/* Curated Yield Opportunities Table/Cards */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span className="font-medium text-slate-700">Top Curated Opportunities</span>
                <span className="font-mono text-[11px] text-slate-400">Ranked by Sharpe</span>
              </div>

              {/* Pool 1: Aerodrome */}
              <div
                onClick={() => handleSendQuery("Aerodrome WETH USDC pool analysis")}
                className="p-3 rounded-lg bg-[#FAFBFD] border border-slate-200/90 hover:border-orange-300 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 text-xs font-bold font-mono">
                      AERO
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-900">Aerodrome</span>
                        <span className="text-xs text-slate-500 font-mono">WETH / USDC</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Volatile pool · 0.05% fee</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-semibold">
                      41.8% APY
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Base 4.2% · AERO 37.6%
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>
                      TVL <strong className="text-slate-800 font-semibold">$1.01M</strong>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>
                      Est. IL <strong className="text-emerald-600 font-semibold">0.62%</strong>
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Low Risk
                  </span>
                </div>
              </div>

              {/* Pool 2: Uniswap V3 */}
              <div
                onClick={() => handleSendQuery("Uniswap V3 cbBTC ETH pool depth")}
                className="p-3 rounded-lg bg-[#FAFBFD] border border-slate-200/90 hover:border-orange-300 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 text-xs font-bold font-mono">
                      UNI
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-900">Uniswap V3</span>
                        <span className="text-xs text-slate-500 font-mono">cbBTC / ETH</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Concentrated · 0.30% fee</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-700 font-mono text-xs font-semibold">
                      28.4% APY
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Fees 22.1% · Merkl 6.3%
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>
                      TVL <strong className="text-slate-800 font-semibold">$3.84M</strong>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>
                      Est. IL <strong className="text-amber-600 font-semibold">1.14%</strong>
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Med Risk
                  </span>
                </div>
              </div>

              {/* Pool 3: ExtraFi */}
              <div
                onClick={() => handleSendQuery("Extra Finance USDC Vault yields and utilization")}
                className="p-3 rounded-lg bg-[#FAFBFD] border border-slate-200/90 hover:border-orange-300 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold font-mono">
                      EXT
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-900">ExtraFi</span>
                        <span className="text-xs text-slate-500 font-mono">USDC Vault</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Leveraged lending strategy</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700 font-mono text-xs font-semibold">
                      38.2% APY
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Base 12.0% + Borr. yield
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>
                      TVL <strong className="text-slate-800 font-semibold">$412.8K</strong>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>
                      Util. <strong className="text-slate-800 font-semibold">89.4%</strong>
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> High Risk
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* 3. PROTOCOL RADAR / LEADERBOARD */}
        <section className="rounded-xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-orange-600">
                leaderboard
              </span>
              <h3 className="text-sm font-semibold text-slate-900">Base Protocol Radar</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Sorted by TVL</span>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Item 1: Morpho */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 text-center font-mono text-xs text-slate-400 font-semibold">
                  1
                </span>
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-xs text-orange-600 font-mono">
                  M
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      Morpho Blue
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                      Lending
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    $4.45B TVL{" "}
                    <span className="text-emerald-600 ml-1 font-semibold">+2.5%</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleSendQuery("Analyze Morpho Blue on Base")}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-transparent text-xs font-medium text-slate-700 transition-colors cursor-pointer"
              >
                View
              </button>
            </div>

            {/* Item 2: Aerodrome */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 text-center font-mono text-xs text-slate-400 font-semibold">
                  2
                </span>
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-xs text-orange-600 font-mono">
                  A
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      Aerodrome
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                      DEX
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    $1.12B TVL{" "}
                    <span className="text-emerald-600 ml-1 font-semibold">+6.8%</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleSendQuery("Aerodrome DEX liquidity pools & volume")}
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-xs font-medium text-white shadow-sm transition-colors cursor-pointer"
              >
                Trade
              </button>
            </div>

            {/* Item 3: Aave V3 */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 text-center font-mono text-xs text-slate-400 font-semibold">
                  3
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 font-mono">
                  A3
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      Aave V3
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                      Markets
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    $553.1M TVL{" "}
                    <span className="text-emerald-600 ml-1 font-semibold">+1.9%</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleSendQuery("Aave V3 Base lending and borrow APYs")}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-transparent text-xs font-medium text-slate-700 transition-colors cursor-pointer"
              >
                View
              </button>
            </div>
          </div>
        </section>

        {/* 4. QUICK RESEARCH QUERIES CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
          {[
            "Top stablecoin yields",
            "cbBTC impermanent loss",
            "Whale inflows > $500k",
            "Aero gauge votes",
            "Check Base gas & block",
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(chip)}
              disabled={isLoading}
              className="chip-query flex-shrink-0 px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 hover:border-orange-300 hover:text-orange-600 text-slate-700 font-medium shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      </main>

      {/* DOCKED SEARCH & CHAT BAR (Sticky above bottom nav) */}
      <div className="fixed bottom-16 inset-x-0 z-40 px-4 pb-2 pt-1 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA]/95 to-transparent pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-md backdrop-blur-md focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all"
          >
            <span className="material-symbols-outlined text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                isLoading
                  ? "Scanning on-chain indexes & computing risk..."
                  : "Ask about Base yields, protocol risks, or whale flows..."
              }
              disabled={isLoading}
              className="flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSendQuery("Check Base gas and block height")}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Gas & block query"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </button>
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="w-7 h-7 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                id="btn-send"
              >
                <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* BOTTOM TAB BAR NAVIGATION */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 border-t border-slate-200 backdrop-blur-md pb-safe shadow-sm">
        <div className="max-w-md mx-auto h-16 flex items-center justify-around px-2">
          {/* Tab 1: Terminal / Home (Active) */}
          <button
            onClick={() => setActiveTab("terminal")}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-colors font-medium cursor-pointer ${
              activeTab === "terminal" ? "text-orange-600" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">terminal</span>
            <span className="text-[10px] font-semibold tracking-tight">Terminal</span>
          </button>

          {/* Tab 2: Radar */}
          <button
            onClick={() => {
              setActiveTab("radar");
              handleSendQuery("Show top Base protocols ranked by TVL");
            }}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-colors cursor-pointer ${
              activeTab === "radar" ? "text-orange-600 font-semibold" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">radar</span>
            <span className="text-[10px] font-medium tracking-tight">Radar</span>
          </button>

          {/* Tab 3: Yields */}
          <button
            onClick={() => {
              setActiveTab("yields");
              handleSendQuery("Show highest APY yield pools on Base");
            }}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-colors cursor-pointer ${
              activeTab === "yields" ? "text-orange-600 font-semibold" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">trending_up</span>
            <span className="text-[10px] font-medium tracking-tight">Yields</span>
          </button>

          {/* Tab 4: Alerts */}
          <button
            onClick={() => {
              setActiveTab("alerts");
              handleSendQuery("Check current Base gas price and network status");
            }}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-colors cursor-pointer ${
              activeTab === "alerts" ? "text-orange-600 font-semibold" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="text-[10px] font-medium tracking-tight">Alerts</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
