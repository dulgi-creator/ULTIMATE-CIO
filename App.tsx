import React, { useState } from 'react';
import { Activity, Search, Zap, BookOpen, ArrowRight, Globe, TrendingUp, ExternalLink, BarChart } from 'lucide-react';
import { AnalysisMode, AnalysisState, Language } from './types';
import { MODE_DESCRIPTIONS } from './constants';
import { generateAnalysisReport } from './services/geminiService';
import { LoadingTerminal } from './components/LoadingTerminal';
import { ReportRenderer } from './components/ReportRenderer';

const INDICES = [
  { name: 'S&P 500', symbol: 'SPX', url: 'https://www.google.com/finance/quote/.INX:INDEXSP' },
  { name: 'NASDAQ', symbol: 'IXIC', url: 'https://www.google.com/finance/quote/.IXIC:INDEXNASDAQ' },
  { name: 'KOSPI', symbol: 'KOSPI', url: 'https://www.google.com/finance/quote/KOSPI:KRX' },
  { name: 'USD/KRW', symbol: 'KRW=X', url: 'https://www.google.com/finance/quote/USD-KRW' },
  { name: 'Bitcoin', symbol: 'BTC-USD', url: 'https://www.google.com/finance/quote/BTC-USD' },
  { name: 'Gold', symbol: 'GC=F', url: 'https://www.google.com/finance/quote/GCW00:COMEX' },
];

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.DEEP_DIVE);
  const [lang, setLang] = useState<Language>('en'); // Default to English
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    data: null,
    error: null,
    logs: []
  });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setAnalysisState({ status: 'loading', data: null, error: null, logs: [] });

    try {
      const report = await generateAnalysisReport(query, mode, lang);
      setAnalysisState({
        status: 'success',
        data: report,
        error: null,
        logs: []
      });
    } catch (err: any) {
      setAnalysisState({
        status: 'error',
        data: null,
        error: err.message || 'An unexpected error occurred',
        logs: []
      });
    }
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'ko' : 'en');
  };

  // Dynamic UI Text
  const uiText = {
    title: 'ULTIMATE',
    subtitle: 'Investment Analysis System',
    heroTitle: lang === 'en' ? 'Market Intelligence' : '시장 인텔리전스의',
    heroHighlight: lang === 'en' ? 'Redefined.' : '재정의.',
    heroDesc: lang === 'en' 
      ? 'Real-time synchronization, 3-scenario planning, and deep-dive financial analysis powered by advanced AI.'
      : '실시간 동기화, 3가지 시나리오 플래닝, AI 기반 심층 재무 분석.',
    placeholder: lang === 'en' 
      ? 'Enter Asset Name or Ticker (e.g., NVDA, Tesla, Bitcoin)...' 
      : '자산명 또는 티커 입력 (예: 삼성전자, NVDA, 비트코인)...',
    analyzeBtn: lang === 'en' ? 'Analyze' : '분석 시작',
    analyzingBtn: lang === 'en' ? 'Analyzing...' : '분석 중...',
    modeA: lang === 'en' ? 'Mode A: Deep Dive' : 'Mode A: 심층 분석',
    modeB: lang === 'en' ? 'Mode B: Quick Intel' : 'Mode B: 신속 검증',
    marketIndices: lang === 'en' ? 'Global Indices (Live Check)' : '글로벌 주요 지수 (실시간 확인)',
    externalTools: lang === 'en' ? 'External Market Tools' : '외부 시장 분석 도구',
    yahooHeatmap: lang === 'en' ? 'Yahoo Finance Heatmap' : '야후 파이낸스 히트맵',
    viewNow: lang === 'en' ? 'View Now' : '바로가기'
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 selection:bg-cyan-500/30 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAnalysisState({ status: 'idle', data: null, error: null, logs: [] })}>
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">{uiText.title} <span className="text-cyan-400">CIO</span></h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none">Investment Analysis System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-500">
               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> SYSTEM ONLINE</span>
               <span>GEMINI 2.5</span>
             </div>
             
             {/* Language Toggle */}
             <button 
               onClick={toggleLang}
               className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border border-slate-700"
             >
               <Globe size={14} />
               {lang === 'en' ? 'ENG' : 'KOR'}
             </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center p-4 md:p-8">
        
        {/* Search Section - Only show centered if idle */}
        {analysisState.status === 'idle' && (
          <div className="flex flex-col items-center justify-center w-full max-w-2xl mt-16 md:mt-24 animate-fade-in">
            <div className="mb-8 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                {uiText.heroTitle} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{uiText.heroHighlight}</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-lg mx-auto">
                {uiText.heroDesc}
              </p>
            </div>
          </div>
        )}

        {/* Input Area - Moves to top or stays center based on state */}
        <div className={`w-full max-w-3xl transition-all duration-500 ${analysisState.status !== 'idle' ? 'mt-0' : 'mt-4'}`}>
          <form onSubmit={handleAnalyze} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-slate-900 rounded-lg border border-slate-700 p-2 shadow-xl">
              <Search className="text-slate-400 ml-3" size={24} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={uiText.placeholder}
                className="w-full bg-transparent border-none focus:ring-0 text-white text-lg placeholder-slate-500 px-4 py-2 focus:outline-none"
                disabled={analysisState.status === 'loading'}
              />
              <button
                type="submit"
                disabled={analysisState.status === 'loading' || !query}
                className={`bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 min-w-[120px] justify-center flex-shrink-0 whitespace-nowrap ${lang === 'ko' ? 'text-sm' : 'text-base'}`}
              >
                {analysisState.status === 'loading' ? uiText.analyzingBtn : uiText.analyzeBtn}
                {analysisState.status !== 'loading' && <ArrowRight size={16} />}
              </button>
            </div>
          </form>

          {/* Mode Selection */}
          <div className="flex gap-4 mt-6 justify-center px-2">
            <button
              onClick={() => setMode(AnalysisMode.DEEP_DIVE)}
              className={`flex-1 max-w-xs flex items-center gap-3 p-3 rounded-lg border transition-all ${
                mode === AnalysisMode.DEEP_DIVE
                  ? 'bg-slate-800 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100'
              }`}
            >
              <div className={`p-2 rounded ${mode === AnalysisMode.DEEP_DIVE ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                <BookOpen size={20} />
              </div>
              <div className="text-left">
                <div className={`text-sm font-bold ${mode === AnalysisMode.DEEP_DIVE ? 'text-white' : 'text-slate-400'}`}>
                  {uiText.modeA}
                </div>
                <div className="text-xs text-slate-500 truncate">{MODE_DESCRIPTIONS[lang][AnalysisMode.DEEP_DIVE]}</div>
              </div>
            </button>

            <button
              onClick={() => setMode(AnalysisMode.QUICK_INTEL)}
              className={`flex-1 max-w-xs flex items-center gap-3 p-3 rounded-lg border transition-all ${
                mode === AnalysisMode.QUICK_INTEL
                  ? 'bg-slate-800 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100'
              }`}
            >
              <div className={`p-2 rounded ${mode === AnalysisMode.QUICK_INTEL ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                <Zap size={20} />
              </div>
              <div className="text-left">
                <div className={`text-sm font-bold ${mode === AnalysisMode.QUICK_INTEL ? 'text-white' : 'text-slate-400'}`}>
                  {uiText.modeB}
                </div>
                <div className="text-xs text-slate-500 truncate">{MODE_DESCRIPTIONS[lang][AnalysisMode.QUICK_INTEL]}</div>
              </div>
            </button>
          </div>

          {/* Market Indices Ticker */}
          <div className="mt-6 border-t border-slate-800/50 pt-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-xs font-mono text-slate-500 flex items-center gap-2">
                <TrendingUp size={12} />
                {uiText.marketIndices}
              </h3>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide mask-linear-fade">
              {INDICES.map((index) => (
                <a 
                  key={index.name}
                  href={index.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-600 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors group"
                >
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white">{index.name}</span>
                  <ExternalLink size={10} className="text-slate-600 group-hover:text-cyan-400" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full mt-8">
          {analysisState.status === 'loading' && (
            <LoadingTerminal query={query} />
          )}

          {analysisState.status === 'error' && (
            <div className="w-full max-w-2xl mx-auto bg-red-950/30 border border-red-900/50 rounded-lg p-6 text-center">
              <h3 className="text-red-400 font-bold mb-2">System Failure</h3>
              <p className="text-red-200/70">{analysisState.error}</p>
              <button 
                onClick={() => setAnalysisState({...analysisState, status: 'idle'})}
                className="mt-4 text-sm text-red-400 hover:text-red-300 underline"
              >
                Reset System
              </button>
            </div>
          )}

          {analysisState.status === 'success' && analysisState.data && (
            <div className="animate-fade-in-up">
               {/* Dashboard Stats Bar */}
               <div className="w-full max-w-5xl mx-auto mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                   <div className="text-xs text-slate-500 uppercase">Analysis Protocol</div>
                   <div className="text-cyan-400 font-mono font-bold">v3.2 ULTIMATE</div>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                   <div className="text-xs text-slate-500 uppercase">Data Sync</div>
                   <div className="text-emerald-400 font-mono font-bold flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> REAL-TIME
                   </div>
                 </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                   <div className="text-xs text-slate-500 uppercase">Risk Assessment</div>
                   <div className="text-amber-400 font-mono font-bold">ACTIVE SCAN</div>
                 </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                   <div className="text-xs text-slate-500 uppercase">Language</div>
                   <div className="text-purple-400 font-mono font-bold uppercase">{lang === 'en' ? 'English' : 'Korean'}</div>
                 </div>
               </div>

               <ReportRenderer content={analysisState.data} />
            </div>
          )}
        </div>

        {/* External Tools Section (Bottom) */}
        <div className="w-full max-w-3xl mt-16 border-t border-slate-800 pt-8">
           <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-px bg-slate-800 flex-1"></div>
              <span className="text-xs font-mono text-slate-600 uppercase">{uiText.externalTools}</span>
              <div className="h-px bg-slate-800 flex-1"></div>
           </div>
           
           <div className="flex justify-center">
              <a 
                href="https://finance.yahoo.com/b/stock-market-heatmap/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-slate-700 hover:border-cyan-500/50 p-4 rounded-xl group transition-all w-full max-w-md"
              >
                <div className="bg-slate-800 p-3 rounded-lg group-hover:bg-slate-700 transition-colors">
                  <BarChart className="text-purple-400" size={24} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-white font-bold group-hover:text-cyan-300 transition-colors">{uiText.yahooHeatmap}</h4>
                  <p className="text-xs text-slate-400">Visualize global market performance</p>
                </div>
                <div className="text-slate-500 group-hover:translate-x-1 transition-transform">
                   <ArrowRight size={18} />
                </div>
              </a>
           </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 mt-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-sm">
            &copy; 2025 Ultimate Investment Analysis. All data provided for informational purposes only. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;