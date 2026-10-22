import { GoogleGenAI } from "@google/genai";

// Initializes the official Google Gen AI client with the server-side environment key
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});