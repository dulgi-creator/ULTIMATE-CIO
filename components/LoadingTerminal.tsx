import React, { useEffect, useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Coffee, Smile } from 'lucide-react';

interface LoadingTerminalProps {
  query: string;
}

const STEPS = [
  "시스템 초기화 중...",
  "글로벌 마켓 데이터베이스 연결 중...",
  "프로토콜 1: 실시간 검색 동기화...",
  "티커 심볼 및 거래소 데이터 검증 중...",
  "거시 경제 지표 분석 중...",
  "DART/SEC 공시 자료 스캔 중...",
  "재무 비율 계산 중 (내부 프로세스)...",
  "3가지 시나리오 전략 시뮬레이션 (Plan A/B/C)...",
  "최종 투자 리포트 작성 중..."
];

const HUMOR_DATA = [
  // 대가들의 명언 (PDF 기반)
  "워렌 버핏: '10년 보유할 생각 아니면 10분도 쳐다보지 마라.' (단타 금지령)",
  "워렌 버핏: '남들이 공포에 질렸을 때 탐욕을 부려라.' (청개구리 매매법)",
  "워렌 버핏: '썰물 때가 되어봐야 누가 발가벗고 수영했는지 알 수 있다.' (리스크 관리의 중요성)",
  "찰리 멍거: '좋은 기업을 제값 주고 사는 게, 똥차를 싸게 사는 것보다 낫다.'",
  "피터 린치: '주식 시장에서 가장 중요한 기관은 두뇌가 아니라 위장(Stomach)이다.' (멘탈이 실력이다)",
  "피터 린치: '떨어지는 칼날을 잡지 마라. 바닥에 꽂히고 잠잠해질 때까지 기다려라.'",
  "앙드레 코스톨라니: '주식을 사고 수면제를 먹어라. 10년 뒤 깨어나면 부자가 되어 있을 것이다.'",
  "존 템플턴: '모두가 비관적일 때가 최상의 매수 시점이다.' (근데 손이 안 나감)",
  "벤저민 그레이엄: '미스터 마켓은 조울증 환자다. 그 사람 기분에 내 지갑을 맡기지 마라.'",
  // 현대 투자 유머 및 밈 (PDF 기반)
  "💎 다이아몬드 핸즈 (Diamond Hands): 계좌가 파래져도 절대 팔지 않는 강철 멘탈. (a.k.a 존버)",
  "🧻 페이퍼 핸즈 (Paper Hands): 작은 하락에도 호들갑 떨며 매도 버튼 누르는 쿠크다스 멘탈.",
  "🚀 화성 갈끄니까 (To The Moon): 주가가 하늘을 뚫고 우주로 갈 거라는 행복회로.",
  "📈 스통크스 (Stonks): 이유 불문하고 무조건 오르는 주식. (논리는 사치다)",
  "🦍 영끌: 영혼까지 끌어모아 풀매수. 실패하면 영혼이 가출함.",
  "😭 벼락거지: 나만 빼고 다 부자 된 것 같은 상대적 박탈감.",
  "🍗 치킨값 벌었다: 하루 종일 차트 보고 스트레스 받아서 번 돈이 딱 치킨 한 마리 값.",
  "🐜 동학개미: 외국인과 기관에 맞서 싸우는 대한민국 개인 투자자들.",
  "💧 물타기: 평단 낮추려다 대주주 되는 지름길. (물론 물인지 늪인지는 모름)",
  "🙏 기도매매: 분석은 끝났다. 이제 신에게 맡긴다.",
  "📉 돔황챠: 악재 터지면 뒤도 돌아보지 말고 튀어라. (Run!)",
  "🧠 뇌동매매: 뇌를 거치지 않고 손가락이 먼저 매수 버튼을 누르는 신비한 현상.",
  "🏗️ 구조대: 고점에 물린 나를 구하러 올 다음 매수자들. (오고 있는 거 맞죠?)",
  "💸 한강 간다: 투자 실패 시 나오는 극단적 비관 심리. (물론 진짜 가진 않음)",
  "🛌 존버: '존나 버티기'의 순화어. 승리자의 유일한 전략."
];

export const LoadingTerminal: React.FC<LoadingTerminalProps> = ({ query }) => {
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
    // Set initial random joke
    setJokeIndex(Math.floor(Math.random() * HUMOR_DATA.length));

    const interval = setInterval(() => {
      setJokeIndex((prev) => {
        // Pick a random index that is different from the current one
        let next;
        do {
          next = Math.floor(Math.random() * HUMOR_DATA.length);
        } while (next === prev && HUMOR_DATA.length > 1);
        return next;
      });
    }, 4000); // Rotate joke every 4 seconds

    return () => clearInterval(interval);
  }, []);

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
              투자 심리 안정 프로토콜
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
              "{HUMOR_DATA[jokeIndex]}"
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {HUMOR_DATA.map((_, i) => (
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
          </div>
          <div className="text-slate-500">
            {isLogsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
        
        {isLogsOpen && (
          <div className="p-4 space-y-2 h-48 overflow-y-auto custom-scrollbar">
            {logs.map((log, index) => (
              <div key={index} className="text-emerald-500/90 animate-pulse-subtle">
                {log}
              </div>
            ))}
            <div className="animate-pulse text-emerald-500">_</div>
          </div>
        )}
      </div>
    </div>
  );
};