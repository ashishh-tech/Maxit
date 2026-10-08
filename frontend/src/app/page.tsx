"use client";

import React, { useState, useEffect, useRef } from "react";

interface ResearchReport {
  query: string;
  report: string;
  timestamp: string;
  poolsIndexed: number;
}

interface Message {
  sender: "user" | "agent";
  text: string;
  time: string;
}

export default function DefiSenseApp() {
  const [activeTab, setActiveTab] = useState<"terminal" | "radar" | "yields" | "alerts">("terminal");
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletConnected, setWalletConnected] = useState(true);
  const [gasGwei, setGasGwei] = useState("0.006");
  const [blockNumber, setBlockNumber] = useState(52321000);
  const [radarFilter, setRadarFilter] = useState<string>("All");
  const [priceDivergence, setPriceDivergence] = useState<number>(1.5); // For IL calculator

  // Active AI Briefing State
  const [activeBriefing, setActiveBriefing] = useState<ResearchReport>({
    query: "Base Ecosystem Yield Scan",
    report: `Liquidity distribution across Base vAMM and concentrated DEXs exhibits stable fee compounding with subdued volatility. Top risk-adjusted opportunities remain concentrated in blue-chip pairings:

• Stable liquidity depth on Aerodrome continues to outpace Uniswap V3 on low-slippage routing.
• cbBTC incentives offer attractive hedged yields with under 1.2% projected 30-day Impermanent Loss.`,
    timestamp: "Updated 2m ago",
    poolsIndexed: 142,
  });

  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      sender: "agent",
      text: "🤖 **DefiSense Agent Online**: Ready to analyze Base yields, Impermanent Loss curves, or on-chain protocol stats. Ask a question or tap a quick chip below!",
      time: "09:00 AM",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        // keep fallback
      }
    };
    fetchGas();
    const interval = setInterval(fetchGas, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === "terminal") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isLoading, activeTab]);

  const handleSendQuery = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    const userQuery = q.trim();
    setInputQuery("");
    setIsLoading(true);

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Switch to terminal tab when submitting a query so user sees response
    setActiveTab("terminal");

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
      const errMsg = "⚠️ Agent connection timeout. Check live on-chain connection.";
      setActiveBriefing({
        query: userQuery,
        report: errMsg,
        timestamp: "Just now",
        poolsIndexed: 0,
      });
      setChatHistory((prev) => [
        ...prev,
        { sender: "agent", text: errMsg, time: currentTime },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${activeBriefing.query}\n\n${activeBriefing.report}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Impermanent Loss Formula Calculation
  const calculateIL = (k: number) => {
    const il = ((2 * Math.sqrt(k)) / (1 + k) - 1) * 100;
    return Math.abs(il).toFixed(2);
  };

  // Protocols Data for Radar View
  const allProtocols = [
    { rank: 1, name: "Morpho Blue", category: "Lending", tvl: "$4.45B", change7d: "+2.5%", isPositive: true, badge: "M" },
    { rank: 2, name: "Aerodrome Finance", category: "DEXs", tvl: "$1.12B", change7d: "+6.8%", isPositive: true, badge: "A" },
    { rank: 3, name: "Aave V3", category: "Lending", tvl: "$553.1M", change7d: "+1.9%", isPositive: true, badge: "A3" },
    { rank: 4, name: "Uniswap V3", category: "DEXs", tvl: "$412.0M", change7d: "+3.2%", isPositive: true, badge: "UNI" },
    { rank: 5, name: "Moonwell", category: "Lending", tvl: "$284.5M", change7d: "-0.8%", isPositive: false, badge: "MW" },
    { rank: 6, name: "Extra Finance", category: "Yield", tvl: "$110.2M", change7d: "+8.4%", isPositive: true, badge: "EXT" },
    { rank: 7, name: "Seamless Protocol", category: "Lending", tvl: "$89.4M", change7d: "+1.1%", isPositive: true, badge: "SML" },
    { rank: 8, name: "Optimism Bridge", category: "Bridges", tvl: "$756.5M", change7d: "+3.1%", isPositive: true, badge: "OP" },
  ];

  const filteredProtocols =
    radarFilter === "All"
      ? allProtocols
      : allProtocols.filter((p) => p.category.toLowerCase() === radarFilter.toLowerCase());

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
        
        {/* ================= TAB 1: TERMINAL VIEW ================= */}
        {activeTab === "terminal" && (
          <div className="space-y-4 animate-in fade-in duration-200">
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
              </div>
            </article>

            {/* 3. INTERACTIVE CHAT STREAM */}
            {chatHistory.length > 1 && (
              <section className="rounded-xl bg-white border border-slate-200/90 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-semibold text-slate-700">
                  <span>Conversation Stream</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {chatHistory.length} messages
                  </span>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`text-xs px-3.5 py-2.5 rounded-xl max-w-[90%] leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-orange-600 text-white rounded-tr-none"
                            : "bg-slate-100 text-slate-800 rounded-tl-none font-sans whitespace-pre-wrap"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 px-1">
                        {msg.time}
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </section>
            )}

            {/* 4. QUICK RESEARCH CHIPS */}
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
          </div>
        )}

        {/* ================= TAB 2: RADAR VIEW ================= */}
        {activeTab === "radar" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <section className="rounded-xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-orange-600">
                    radar
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">Base Protocol Radar</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">Live TVL & Momentum</span>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 p-3 border-b border-slate-100 overflow-x-auto no-scrollbar text-xs">
                {["All", "DEXs", "Lending", "Yield", "Bridges"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setRadarFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      radarFilter === cat
                        ? "bg-orange-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Protocol List */}
              <div className="divide-y divide-slate-100">
                {filteredProtocols.map((proto) => (
                  <div
                    key={proto.rank}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-center font-mono text-xs text-slate-400 font-semibold">
                        {proto.rank}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-xs text-orange-600 font-mono">
                        {proto.badge}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {proto.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                            {proto.category}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-500">
                          {proto.tvl} TVL{" "}
                          <span
                            className={`ml-1 font-semibold ${
                              proto.isPositive ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {proto.change7d}
                          </span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendQuery(`Deep research analysis for ${proto.name} on Base`)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-transparent text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                    >
                      Research
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ================= TAB 3: YIELDS VIEW ================= */}
        {activeTab === "yields" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* QuantPulse IL Calculator Widget */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-600 text-[18px]">
                    calculate
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">
                    QuantPulse™ Impermanent Loss Calculator
                  </h3>
                </div>
                <span className="text-xs font-mono text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  IL: ~{calculateIL(priceDivergence)}%
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                  <span>Price Divergence Ratio ($P_{"{new}"}/P_{"{old}"}$)</span>
                  <span className="font-semibold text-slate-800">{priceDivergence.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.05"
                  value={priceDivergence}
                  onChange={(e) => setPriceDivergence(parseFloat(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0.2x (-80%)</span>
                  <span>1.0x (No change)</span>
                  <span>5.0x (+400%)</span>
                </div>
              </div>
            </div>

            {/* Curated Yield Opportunities List */}
            <section className="rounded-xl bg-white border border-slate-200/90 shadow-sm overflow-hidden p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Top Base Yield Pools</h3>
                <span className="text-[11px] font-mono text-slate-400">DeFi Llama Live</span>
              </div>

              {/* Pool 1 */}
              <div
                onClick={() => handleSendQuery("Aerodrome WETH USDC pool analysis")}
                className="p-3 rounded-lg bg-[#FAFBFD] border border-slate-200 hover:border-orange-300 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 text-xs font-bold font-mono">
                      AERO
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-900">Aerodrome</span>
                        <span className="text-xs text-slate-500 font-mono">WETH / USDC</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Slipstream concentrated · 0.05%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-semibold">
                      41.8% APY
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Base 4.2% · AERO 37.6%</div>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>TVL <strong className="text-slate-800">$1.01M</strong></span>
                    <span>|</span>
                    <span>Est. IL <strong className="text-emerald-600">0.62%</strong></span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ● Low Risk
                  </span>
                </div>
              </div>

              {/* Pool 2 */}
              <div
                onClick={() => handleSendQuery("Uniswap V3 cbBTC ETH pool depth")}
                className="p-3 rounded-lg bg-[#FAFBFD] border border-slate-200 hover:border-orange-300 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 text-xs font-bold font-mono">
                      UNI
                    </div>
                    <div>
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
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Fees 22.1% · Merkl 6.3%</div>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>TVL <strong className="text-slate-800">$3.84M</strong></span>
                    <span>|</span>
                    <span>Est. IL <strong className="text-amber-600">1.14%</strong></span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    ● Med Risk
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================= TAB 4: ALERTS & NETWORK VIEW ================= */}
        {activeTab === "alerts" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Live On-Chain Node Status */}
            <section className="rounded-xl bg-white border border-slate-200/90 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-600 text-[18px]">
                    sensors
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Base On-Chain RPC & Health
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  OPERATIONAL
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500">Live Gas Price</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">
                    {gasGwei} Gwei
                  </div>
                  <span className="text-[10px] text-emerald-600 font-mono">Sub-cent swaps</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500">Block Height</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">
                    #{blockNumber.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">2s block time</span>
                </div>
              </div>
            </section>

            {/* Agent Tools Status Matrix */}
            <section className="rounded-xl bg-white border border-slate-200/90 shadow-sm p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Connected Agent Tools</h3>
              <div className="space-y-2">
                {[
                  { name: "DeFi Llama Yields & TVL API", status: "Active", ping: "45ms" },
                  { name: "Base Sepolia & Mainnet RPC", status: "Active", ping: "22ms" },
                  { name: "QuantPulse Risk & IL Engine", status: "Active", ping: "<1ms" },
                  { name: "Dexscreener Liquidity Stream", status: "Active", ping: "60ms" },
                  { name: "Uniswap V3 On-Chain Swaps", status: "Week 3 Sprint", ping: "Staging" },
                ].map((tool, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                  >
                    <span className="font-medium text-slate-700">{tool.name}</span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-slate-400">{tool.ping}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          tool.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {tool.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
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
          {/* Tab 1: Terminal */}
          <button
            onClick={() => setActiveTab("terminal")}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-colors font-medium cursor-pointer ${
              activeTab === "terminal" ? "text-orange-600 font-semibold" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">terminal</span>
            <span className="text-[10px] tracking-tight">Terminal</span>
          </button>

          {/* Tab 2: Radar */}
          <button
            onClick={() => setActiveTab("radar")}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-colors cursor-pointer ${
              activeTab === "radar" ? "text-orange-600 font-semibold" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">radar</span>
            <span className="text-[10px] tracking-tight">Radar</span>
          </button>

          {/* Tab 3: Yields */}
          <button
            onClick={() => setActiveTab("yields")}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-colors cursor-pointer ${
              activeTab === "yields" ? "text-orange-600 font-semibold" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">trending_up</span>
            <span className="text-[10px] tracking-tight">Yields</span>
          </button>

          {/* Tab 4: Alerts */}
          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-colors cursor-pointer ${
              activeTab === "alerts" ? "text-orange-600 font-semibold" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="text-[10px] tracking-tight">Alerts</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
