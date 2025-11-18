import { GoogleGenAI } from "@google/genai";
import { AnalysisMode } from "../types";
import { SYSTEM_PERSONA } from "../constants";

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
  mode: AnalysisMode
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key configuration error.");

  const ai = new GoogleGenAI({ apiKey });

  // Select model based on complexity
  const modelName = 'gemini-2.5-flash'; 

  let modeInstruction = "";
  
  switch (mode) {
    case AnalysisMode.DEEP_DIVE:
      modeInstruction = "사용자가 TYPE A (심층 분석)을 요청했습니다. 밀도 높은 기관급 보고서를 작성하십시오. 특수 기호나 수식 노출을 피하고 서술형으로 작성하십시오."; 
      break;
    case AnalysisMode.QUICK_INTEL:
      modeInstruction = "사용자가 TYPE B (신속 검증)을 요청했습니다. 팩트 위주로 간결하게 답변하십시오.";
      break;
    case AnalysisMode.NEWS:
      modeInstruction = "사용자가 [최신 뉴스 대시보드]를 요청했습니다. 글로벌/국내 헤드라인과 해당 자산의 최신 뉴스를 요약하십시오. 내용이 끊기지 않도록 끝까지 작성하십시오.";
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            { text: SYSTEM_PERSONA },
            { text: `Target Asset/Query: ${query || "글로벌 시장 동향"}` },
            { text: modeInstruction }
          ]
        }
      ],
      config: {
        // Using Google Search Grounding is MANDATORY for this persona to get the Date/Time sync.
        tools: [{ googleSearch: {} }], 
        temperature: 0.7,
        // Set high token limit to ensure news/reports are not truncated
        maxOutputTokens: 8192,
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