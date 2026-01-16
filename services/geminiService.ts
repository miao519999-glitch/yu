
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Textbook chapter or passage title" },
    vocabulary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          pos: { type: Type.STRING },
          definitionEn: { type: Type.STRING },
          definitionZh: { type: Type.STRING },
          usage: { type: Type.STRING },
          example: { type: Type.STRING },
          derivatives: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["word", "pos", "definitionEn", "definitionZh"]
      }
    },
    grammar: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          pattern: { type: Type.STRING },
          structure: { type: Type.STRING },
          explanation: { type: Type.STRING },
          example: { type: Type.STRING }
        }
      }
    },
    writing: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING },
        logic: { type: Type.STRING },
        summary: { type: Type.STRING },
        framework: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    background: { type: Type.STRING },
    mindMap: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        label: { type: Type.STRING },
        children: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING } } } }
      }
    },
    quizzes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, description: "matching, spelling, multipleChoice, grammar, or reading" },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.STRING },
          explanation: { type: Type.STRING },
          word: { type: Type.STRING }
        }
      }
    }
  },
  required: ["title", "vocabulary", "grammar", "writing", "mindMap", "quizzes"]
};

export const analyzeTextbookImage = async (base64Image: string): Promise<AIAnalysisResult> => {
  const model = 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Perform OCR and deeply analyze this English textbook page. Extract key vocabulary, grammar points, writing structure, and background info. Also generate a structured mind map and 10 relevant practice questions (mix of vocabulary matching, spelling, multiple choice, grammar, and reading comprehension). Return results in structured JSON format."
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA as any
    }
  });

  return JSON.parse(response.text || '{}') as AIAnalysisResult;
};
