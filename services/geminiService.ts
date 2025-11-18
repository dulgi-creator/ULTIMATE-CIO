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

  const modeInstruction = mode === AnalysisMode.DEEP_DIVE 
    ? (lang === 'ko' ? "사용자가 TYPE A (심층 분석)을 요청했습니다." : "User requested TYPE A (Deep Dive).")
    : (lang === 'ko' ? "사용자가 TYPE B (특정 정보 확인)을 요청했습니다." : "User requested TYPE B (Quick Intel).");

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            { text: persona },
            { text: `Target Asset/Query: ${query}` },
            { text: modeInstruction }
          ]
        }
      ],
      config: {
        // Using Google Search Grounding is MANDATORY for this persona to get the Date/Time sync.
        tools: [{ googleSearch: {} }], 
        temperature: 0.7,
        maxOutputTokens: 8000, // Increased for detailed breakdown
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("No analysis generated.");
    }
    return text;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate report.");
  }
};