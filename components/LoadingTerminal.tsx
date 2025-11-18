import React, { useEffect, useState } from 'react';
import { Terminal, RefreshCw, ChevronDown, ChevronUp, Coffee, Smile } from 'lucide-react';

interface LoadingTerminalProps {
  query: string;
  lang?: 'en' | 'ko';
}

const STEPS = [
  "System Initializing...",
  "Connecting to Global Market Database...",
  "Protocol 1: Real-time Search Synchronization...",
  "Verifying Ticker Symbol & Exchange Data...",
  "Analyzing Macro Economic Indicators...",
  "Scanning EDGAR/DART Filings...",
  "Calculating Financial Ratios (PER, PBR, ROE)...",
  "Simulating 3-Scenario Strategy (Plan A/B/C)...",
  "Compiling Ultimate Investment Report..."
];

const HUMOR_DATA = {
  en: [
    "Only buy something that you'd be perfectly happy to hold if the market shut down for 10 years. - Warren Buffett",
    "The four most dangerous words in investing are: 'This time it's different.'",
    "Why did the investor bring a ladder? To reach the high yield!",
    "Stock market: A place where money changes hands from the impatient to the patient.",
    "Bull markets are born on pessimism, grow on skepticism, mature on optimism, and die on euphoria.",
    "I told my broker to buy low and sell high. He asked, 'Exactly how high and how low?'",
    "Risk comes from not knowing what you're doing.",
    "In the short run, the market is a voting machine but in the long run, it is a weighing machine."
  ],
  ko: [
    "10년 동안 주식시장이 문을 닫아도 마음 편히 보유할 주식만 사라. - 워렌 버핏",
    "투자에서 가장 위험한 네 마디: '이번엔 다르다 (This time it's different).'",
    "주식시장은 인내심 없는 사람의 돈을 인내심 있는 사람에게 이동시키는 도구다.",
    "비관론자는 명성을 얻고, 낙관론자는 돈을 번다.",
    "떨어지는 칼날을 잡지 마라. 하지만 바닥에 꽂힌 칼은 뽑아도 된다.",
    "내가 사면 떨어지고 내가 팔면 오르는 건 과학입니다.",
    "존버는 승리한다... 단, 우량주에서만.",
    "무릎에 사서 어깨에 팔라는데, 내 무릎이 어디인지 도통 모르겠다.",
    "계란을 한 바구니에 담지 마라. 근데 바구니가 하나밖에 없으면 어떡하죠?"
  ]
};

export const LoadingTerminal: React.FC<LoadingTerminalProps> = ({ query, lang = 'en' }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [jokeIndex, setJokeIndex] = useState(0);
  
  // Initial States: Humor OPEN, Logs CLOSED
  const [isHumorOpen, setIsHumorOpen] = useState(true);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < STEPS.length) {
        setLogs(prev => [...prev, `> ${STEPS[currentIndex]}`]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const jokes = HUMOR_DATA[lang];
    
    // Set initial random joke
    setJokeIndex(Math.floor(Math.random() * jokes.length));

    const interval = setInterval(() => {
      setJokeIndex((prev) => {
        // Pick a random index that is different from the current one
        let next;
        do {
          next = Math.floor(Math.random() * jokes.length);
        } while (next === prev && jokes.length > 1);
        return next;
      });
    }, 4000); // Rotate joke every 4 seconds

    return () => clearInterval(interval);
  }, [lang]);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 flex flex-col gap-4">
      
      {/* Humor / Stress Relief Protocol (Rounded Box, Open by Default) */}
      <div className="bg-slate-900/80 border border-cyan-900/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm transition-all duration-500">
        <div 
          className="px-6 py-3 bg-gradient-to-r from-cyan-900/20 to-slate-900 flex items-center justify-between cursor-pointer"
          onClick={() => setIsHumorOpen(!isHumorOpen)}
        >
          <div className="flex items-center gap-2 text-cyan-400">
            <Coffee size={18} />
            <span className="font-bold text-sm uppercase tracking-wider">
              {lang === 'en' ? 'Stress Relief Protocol' : '스트레스 완화 프로토콜'}
            </span>
          </div>
          <div className="text-cyan-600">
            {isHumorOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
        
        {isHumorOpen && (
          <div className="p-8 text-center animate-fade-in">
            <div className="mb-4 flex justify-center">
              <div className="p-3 bg-cyan-500/10 rounded-full">
                <Smile className="text-cyan-400 animate-bounce-slow" size={32} />
              </div>
            </div>
            <p className="text-lg md:text-xl text-slate-200 font-medium italic leading-relaxed font-serif">
              "{HUMOR_DATA[lang][jokeIndex]}"
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {HUMOR_DATA[lang].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-500 ${i === jokeIndex ? 'w-6 bg-cyan-500' : 'w-2 bg-slate-700'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* System Process Monitor (Terminal Logs, Closed by Default) */}
      <div className={`bg-slate-950 rounded-xl border border-slate-800 shadow-lg overflow-hidden font-mono text-sm transition-all duration-300 ${isLogsOpen ? 'h-auto' : 'h-12'}`}>
        <div 
          className="bg-slate-900 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors"
          onClick={() => setIsLogsOpen(!isLogsOpen)}
        >
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-emerald-500" />
            <span className="text-slate-400 font-semibold text-xs uppercase">CIO_Process_Monitor.exe</span>
            {!isLogsOpen && (
               <span className="text-slate-600 text-xs ml-2 animate-pulse">
                 {logs.length > 0 ? logs[logs.length - 1] : 'Initializing...'}
               </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 mr-2">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <div className="w-2 h-2 rounded-full bg-green-500/50" />
            </div>
            {isLogsOpen ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
          </div>
        </div>

        {isLogsOpen && (
          <div className="p-6 h-64 overflow-y-auto flex flex-col gap-2 bg-slate-950/50">
            <div className="text-cyan-400 mb-2">Target Asset: "{query}"</div>
            {logs.map((log, index) => (
              <div key={index} className="text-emerald-500/90 border-l-2 border-emerald-500/20 pl-2">
                {log}
              </div>
            ))}
            <div className="flex items-center gap-2 text-slate-500 mt-auto pt-4 border-t border-slate-800/50">
              <RefreshCw className="animate-spin" size={14} />
              <span>Processing complex data models...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};