import { GoogleGenAI } from "@google/genai";
import { AnalysisMode, Language } from "../types";
import { SYSTEM_PERSONAS } from "../constants";

const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API Key is missing. Ensure process.env.API_KEY is set.");
    return "";
  }
  return key;
};

export const generateAnalysisReport = async (
  query: string,
  mode: AnalysisMode,
  lang: Language
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key configuration error.");

  const ai = new GoogleGenAI({ apiKey });

  // Select model based on complexity
  const modelName = 'gemini-2.5-flash'; 

  const persona = SYSTEM_PERSONAS[lang];

  let modeInstruction = "";
  
  switch (mode) {
    case AnalysisMode.DEEP_DIVE:
      modeInstruction = lang === 'ko' 
        ? "사용자가 TYPE A (심층 분석)을 요청했습니다. 밀도 높은 기관급 보고서를 작성하십시오." 
        : "User requested TYPE A (Deep Dive). Generate a dense, institutional-grade report.";
      break;
    case AnalysisMode.QUICK_INTEL:
      modeInstruction = lang === 'ko'
        ? "사용자가 TYPE B (신속 검증)을 요청했습니다. 팩트 위주로 간결하게 답변하십시오."
        : "User requested TYPE B (Quick Intel). specific facts and verification.";
      break;
    case AnalysisMode.NEWS:
      modeInstruction = lang === 'ko'
        ? "사용자가 [최신 뉴스 대시보드]를 요청했습니다. 글로벌/국내 헤드라인과 해당 자산의 최신 뉴스를 요약하고 주요 지표를 테이블로 제시하십시오."
        : "User requested [Latest News Dashboard]. Summarize global/local headlines and specific asset news with a metrics table.";
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            { text: persona },
            { text: `Target Asset/Query: ${query || (lang === 'ko' ? "글로벌 시장 동향" : "Global Market Trends")}` },
            { text: modeInstruction }
          ]
        }
      ],
      config: {
        // Using Google Search Grounding is MANDATORY for this persona to get the Date/Time sync.
        tools: [{ googleSearch: {} }], 
        temperature: 0.7,
        maxOutputTokens: mode === AnalysisMode.NEWS ? 2000 : 8000,
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' }
        ],
      },
    });

    const text = response.text;
    
    if (!text) {
        const candidate = response.candidates?.[0];
        if (candidate && candidate.finishReason && candidate.finishReason !== 'STOP') {
             throw new Error(`Analysis blocked. Reason: ${candidate.finishReason}`);
        }
        throw new Error("No analysis generated. The model returned an empty response.");
    }
    return text;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate report.");
  }
};