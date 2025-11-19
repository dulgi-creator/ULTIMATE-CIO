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
      modeInstruction = "Task: Execute Mode A (Deep Dive Report). Output must be detailed (v3.1 format) and strictly text-based (NO formulas, NO tables). Provide interpretation only. Ensure full completion."; 
      break;
    case AnalysisMode.QUICK_INTEL:
      modeInstruction = "Task: Execute Mode B (Quick Intel). Focus on facts and verification. Keep it concise.";
      break;
    case AnalysisMode.NEWS:
      modeInstruction = "Task: Execute News Dashboard. Strictly 5 News + 3 Opinions. No images. Ensure content is fully generated.";
      break;
  }

  // Retry logic wrapper
  const makeRequest = async (retries = 3): Promise<string> => {
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
          temperature: 0.6,
          // Set high token limit to ensure news/reports are not truncated
          // 8192 is the max for 2.5 flash
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
          // If simply empty, throw generic error to trigger retry
          throw new Error("Model returned an empty response.");
      }
      return text;

    } catch (error: any) {
      const isTransient = error.message.includes('503') || 
                          error.message.includes('overloaded') || 
                          error.message.includes('Empty response') ||
                          error.message.includes('fetch') ||
                          error.message.includes('500');
      
      if (isTransient && retries > 0) {
        console.warn(`Gemini API transient error: ${error.message}. Retrying... (${retries} attempts left)`);
        // Exponential backoff: 2s, 4s, 6s...
        await new Promise(resolve => setTimeout(resolve, 2000 * (4 - retries)));
        return makeRequest(retries - 1);
      }
      
      throw error;
    }
  };

  try {
    return await makeRequest();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate report.");
  }
};