import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Search, Zap, BookOpen, ArrowRight, TrendingUp, ExternalLink, BarChart, Newspaper, Menu, PanelLeftClose, PanelLeftOpen, Smartphone, Monitor } from 'lucide-react';
import { AnalysisMode, AnalysisState, SavedReport } from './types';
import { MODE_DESCRIPTIONS } from './constants';
import { generateAnalysisReport } from './services/geminiService';
import { LoadingTerminal } from './components/LoadingTerminal';
import { ReportRenderer } from './components/ReportRenderer';
import { HistorySidebar } from './components/HistorySidebar';

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
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    data: null,
    error: null,
    logs: []
  });
  
  // Sidebar & History State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cio_reports');
    if (stored) {
      try {
        setSavedReports(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cio_reports', JSON.stringify(savedReports));
  }, [savedReports]);

  const saveReport = (query: string, mode: AnalysisMode, content: string) => {
    const newReport: SavedReport = {
      id: Date.now().toString(),
      title: query || '글로벌 시장 업데이트',
      query,
      mode,
      date: new Date().toISOString(),
      content
    };
    setSavedReports(prev => [newReport, ...prev]);
  };

  const deleteReport = (id: string) => {
    setSavedReports(prev => prev.filter(r => r.id !== id));
  };

  const handleSelectReport = (report: SavedReport) => {
    setQuery(report.query);
    setMode(report.mode);
    setAnalysisState({
      status: 'success',
      data: report.content,
      error: null,
      logs: []
    });
    // On mobile, close sidebar after selection
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const performAnalysis = useCallback(async (currentQuery: string, currentMode: AnalysisMode) => {
    // For News Dashboard, query can be empty (defaults to global)
    if (!currentQuery.trim() && currentMode !== AnalysisMode.NEWS) return;

    setAnalysisState({ status: 'loading', data: null, error: null, logs: [] });

    try {
      const report = await generateAnalysisReport(currentQuery, currentMode);
      setAnalysisState({
        status: 'success',
        data: report,
        error: null,
        logs: []
      });
      // Auto Save
      saveReport(currentQuery, currentMode, report);
    } catch (err: any) {
      setAnalysisState({
        status: 'error',
        data: null,
        error: err.message || 'An unexpected error occurred',
        logs: []
      });
    }
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    performAnalysis(query, mode);
  };

  // Auto-Refresh for News Dashboard (Every 10 minutes)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    // Only activate timer if we are in News Mode and have already loaded data once
    if (mode === AnalysisMode.NEWS && analysisState.status === 'success') {
       // 10 minutes = 600,000 ms
       interval = setInterval(() => {
         console.log("Auto-refreshing News Dashboard...");
         performAnalysis(query, mode);
       }, 600000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, analysisState.status, query, performAnalysis]);

  // Callbacks for ReportRenderer deep actions
  const handleDeepDiveRequest = (topic: string) => {
    setQuery(topic);
    setMode(AnalysisMode.DEEP_DIVE);
    // Small delay to ensure state updates before analysis
    setTimeout(() => performAnalysis(topic, AnalysisMode.DEEP_DIVE), 100);
  };

  // Dynamic UI Text (Korean Only)
  const uiText = {
    title: 'ULTIMATE',
    subtitle: 'Investment Analysis System',
    heroTitle: '시장 인텔리전스의',
    heroHighlight: '재정의.',
    heroDesc: '실시간 동기화, 3가지 시나리오 플래닝, AI 기반 심층 재무 분석.',
    placeholder: '자산명 또는 티커 입력 (예: 삼성전자, NVDA, 비트코인)...',
    analyzeBtn: '분석 시작',
    analyzingBtn: '분석 중...',
    modeA: 'Mode A: 심층 분석',
    modeB: 'Mode B: 신속 검증',
    modeNews: '최신 뉴스 대시보드',
    marketIndices: '글로벌 주요 지수 (실시간 확인)',
    externalTools: '외부 시장 분석 도구',
    tradingViewHeatmap: '트레이딩뷰 히트맵',
    viewNow: '바로가기'
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 selection:bg-cyan-500/30 font-sans overflow-x-hidden">
      
      {/* History Sidebar */}
      <HistorySidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        savedReports={savedReports}
        onSelectReport={handleSelectReport}
        onDeleteReport={deleteReport}
      />

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
        
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors mr-2"
                title="저장된 리포트 열기/닫기"
              >
                {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              </button>

              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAnalysisState({ status: 'idle', data: null, error: null, logs: [] })}>
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Activity className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="font-bold text-lg tracking-tight text-white hidden sm:block">{uiText.title} <span className="text-cyan-400">CIO</span></h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               {/* View Mode Toggles */}
               <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                  <button
                    onClick={() => setViewMode('mobile')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    title="모바일 뷰"
                  >
                    <Smartphone size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    title="데스크탑 뷰"
                  >
                    <Monitor size={16} />
                  </button>
               </div>

               <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-500">
                 <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> ONLINE</span>
                 <span>GEMINI 2.5</span>
               </div>
            </div>
          </div>
        </header>

        <main className={`flex-grow flex flex-col items-center p-4 md:p-8 transition-all duration-500 mx-auto w-full ${viewMode === 'mobile' ? 'max-w-[420px] border-x border-slate-800 shadow-2xl' : ''}`}>
          
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
                  disabled={analysisState.status === 'loading' || (!query && mode !== AnalysisMode.NEWS)}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 min-w-[100px] justify-center flex-shrink-0 whitespace-nowrap text-sm"
                >
                  {analysisState.status === 'loading' ? uiText.analyzingBtn : uiText.analyzeBtn}
                  {analysisState.status !== 'loading' && <ArrowRight size={16} />}
                </button>
              </div>
            </form>

            {/* Mode Selection */}
            <div className="flex flex-wrap lg:flex-nowrap gap-2 mt-6 justify-center px-2">
              
               {/* News Dashboard Button */}
              <button
                onClick={() => setMode(AnalysisMode.NEWS)}
                className={`flex-1 min-w-[120px] lg:max-w-[200px] flex flex-col md:flex-row items-center gap-3 p-3 rounded-lg border transition-all ${
                  mode === AnalysisMode.NEWS
                    ? 'bg-slate-800 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`p-2 rounded ${mode === AnalysisMode.NEWS ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Newspaper size={20} />
                </div>
                <div className="text-center md:text-left">
                  <div className={`text-xs md:text-sm font-bold ${mode === AnalysisMode.NEWS ? 'text-white' : 'text-slate-400'}`}>
                    {uiText.modeNews}
                  </div>
                  <div className="text-[10px] text-slate-500 hidden md:block truncate">10분 단위 업데이트</div>
                </div>
              </button>

              <button
                onClick={() => setMode(AnalysisMode.DEEP_DIVE)}
                className={`flex-1 min-w-[120px] flex flex-col md:flex-row items-center gap-3 p-3 rounded-lg border transition-all ${
                  mode === AnalysisMode.DEEP_DIVE
                    ? 'bg-slate-800 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`p-2 rounded ${mode === AnalysisMode.DEEP_DIVE ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                  <BookOpen size={20} />
                </div>
                <div className="text-center md:text-left">
                  <div className={`text-xs md:text-sm font-bold ${mode === AnalysisMode.DEEP_DIVE ? 'text-white' : 'text-slate-400'}`}>
                    {uiText.modeA}
                  </div>
                  <div className="text-[10px] text-slate-500 hidden md:block truncate">{MODE_DESCRIPTIONS[AnalysisMode.DEEP_DIVE]}</div>
                </div>
              </button>

              <button
                onClick={() => setMode(AnalysisMode.QUICK_INTEL)}
                className={`flex-1 min-w-[120px] flex flex-col md:flex-row items-center gap-3 p-3 rounded-lg border transition-all ${
                  mode === AnalysisMode.QUICK_INTEL
                    ? 'bg-slate-800 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`p-2 rounded ${mode === AnalysisMode.QUICK_INTEL ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Zap size={20} />
                </div>
                <div className="text-center md:text-left">
                  <div className={`text-xs md:text-sm font-bold ${mode === AnalysisMode.QUICK_INTEL ? 'text-white' : 'text-slate-400'}`}>
                    {uiText.modeB}
                  </div>
                  <div className="text-[10px] text-slate-500 hidden md:block truncate">{MODE_DESCRIPTIONS[AnalysisMode.QUICK_INTEL]}</div>
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
                <h3 className="text-red-400 font-bold mb-2">시스템 오류</h3>
                <p className="text-red-200/70">{analysisState.error}</p>
                <button 
                  onClick={() => setAnalysisState({...analysisState, status: 'idle'})}
                  className="mt-4 text-sm text-red-400 hover:text-red-300 underline"
                >
                  시스템 재설정
                </button>
              </div>
            )}

            {analysisState.status === 'success' && analysisState.data && (
              <div className="animate-fade-in-up">
                 {/* Dashboard Stats Bar */}
                 <div className="w-full max-w-5xl mx-auto mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                   <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                     <div className="text-xs text-slate-500 uppercase">분석 프로토콜</div>
                     <div className="text-cyan-400 font-mono font-bold">v3.2 ULTIMATE</div>
                   </div>
                   <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                     <div className="text-xs text-slate-500 uppercase">데이터 동기화</div>
                     <div className="text-emerald-400 font-mono font-bold flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> 실시간 (REAL-TIME)
                     </div>
                   </div>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                     <div className="text-xs text-slate-500 uppercase">리스크 평가</div>
                     <div className="text-amber-400 font-mono font-bold">스캔 완료</div>
                   </div>
                 </div>

                 <ReportRenderer content={analysisState.data} onDeepDive={handleDeepDiveRequest} />
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
                  href="https://kr.tradingview.com/heatmap/stock/#%7B%22dataSource%22%3A%22SPX500%22%2C%22blockColor%22%3A%22change%22%2C%22blockSize%22%3A%22market_cap_basic%22%2C%22grouping%22%3A%22sector%22%7D" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-slate-700 hover:border-cyan-500/50 p-4 rounded-xl group transition-all w-full max-w-md"
                >
                  <div className="bg-slate-800 p-3 rounded-lg group-hover:bg-slate-700 transition-colors">
                    <BarChart className="text-purple-400" size={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-white font-bold group-hover:text-cyan-300 transition-colors">{uiText.tradingViewHeatmap}</h4>
                    <p className="text-xs text-slate-400">글로벌 시장 성과 시각화</p>
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
              &copy; 2025 Ultimate Investment Analysis. 제공된 모든 데이터는 정보 제공 목적이며 투자 권유가 아닙니다.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;