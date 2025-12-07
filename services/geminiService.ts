import { GoogleGenAI, GenerateContentResponse, Chat, Modality } from "@google/genai";
import { UserPersona, StoryStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FLASH = 'gemini-2.5-flash';
const MODEL_PRO_VISION = 'gemini-2.5-flash'; // Supports documents too
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';
const MODEL_COACH = 'gemini-3-pro-preview';
const MODEL_IMAGE = 'gemini-2.5-flash-image';
const MODEL_VIDEO = 'veo-3.1-fast-generate-preview';

// --- Multi-modal Audio Chat ---
export const chatWithAudio = async (
  audioBase64: string,
  persona: UserPersona,
  currentLanguage: string
): Promise<{ text: string; audio?: ArrayBuffer }> => {
  try {
    const model = ai.models.generateContent({
      model: MODEL_FLASH,
      contents: {
        parts: [
          { inlineData: { mimeType: "audio/webm", data: audioBase64 } },
          {
            text: `You are a helpful Tutor for a ${persona}. 
            1. IDENTIFY the language spoken in the audio.
            2. If silence/noise, reply: "I couldn't hear you clearly."
            3. Otherwise, ANSWER directly in that SAME language.
            4. Keep the response short (max 2-3 sentences) suitable for speech.
            ` }
        ]
      }
    });

    const response = await model;
    const textResponse = response.text || "Sorry, I couldn't hear you clearly.";

    // Generate TTS for the response
    const ttsAudio = await generateSpeechTTS(textResponse, "the identified language"); // Language arg is used in prompt logic below

    return { text: textResponse, audio: ttsAudio ? ttsAudio : undefined };

  } catch (error) {
    console.error("Audio Chat Error", error);
    return { text: "Error processing audio." };
  }
};

// --- Vision & Analysis (PDF/Image + Language + TTS) ---

export const generateVisionAnalysis = async (
  base64Data: string,
  mimeType: string,
  persona: UserPersona,
  language: string
): Promise<string> => {
  const systemInstruction = `You are a Vision Tutor Agent for a ${persona}. Analyze the provided image or document. 
  Explain the concepts in detail in ${language}. Output Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_PRO_VISION,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: `Explain this document/image in ${language}.` }
        ]
      },
      config: { systemInstruction, temperature: 0.4 }
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error(error);
    return "Error analyzing content.";
  }
};

// --- Tutor Chat (Language Specific) ---

export const createTutorChat = (persona: UserPersona, language: string): Chat => {
  return ai.chats.create({
    model: MODEL_FLASH,
    config: {
      systemInstruction: `You are a Polyglot Tutor for a ${persona}. 
      ALWAYS converse in ${language}. If the user speaks another language, gently guide them back to ${language} or answer in ${language}.
      Keep explanations clear and suitable for a ${persona}.`,
      temperature: 0.7,
    }
  });
};

// --- Career Coach ---

export const createCoachChat = (persona: UserPersona): Chat => {
  return ai.chats.create({
    model: MODEL_COACH,
    config: {
      systemInstruction: `You are a Career Strategist for a ${persona}. Use your reasoning capabilities and Google Search to provide up-to-date market insights and strategic advice.`,
      tools: [{ googleSearch: {} }],
    }
  });
};

// --- Illustrate (Creative) ---

export const generateIllustrativeStory = async (
  content: string,
  style: StoryStyle,
  persona: UserPersona,
  language: string = 'English'
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Create a highly detailed, artistic SVG POSTER illustrating the following concept: "${content}".
      
      Art Style: The universe of "${style}".
      Target Audience: ${persona}.
      Language: ${language}.
      
      REQUIREMENTS:
      1. Output ONLY valid SVG code. Do not wrap in markdown code blocks.
      2. The SVG should have a viewBox of "0 0 500 750" (Portrait Poster ratio).
      3. Use a rich color palette appropriate for the style (e.g., Neon for Cyberpunk, Parchment/Gold for Harry Potter, Retro for Stranger Things).
      4. Include the "Topic" as a stylized title within the poster.
      5. The TEXT in the poster (Title, labels, descriptions) MUST be in the language: "${language}".
      6. Make it visually striking and complex.
      
      Topic:
      ${content}`,
      config: { temperature: 1.0 } // High creativity
    });

    let text = response.text || "";
    // Clean markdown if present
    text = text.replace(/```svg/g, '').replace(/```xml/g, '').replace(/```/g, '').trim();
    return text.startsWith('<svg') ? text : "<svg viewBox='0 0 500 500'><text y='50'>Failed to generate valid SVG</text></svg>";
  } catch (error) {
    return "<svg viewBox='0 0 500 500'><text y='50'>Agent Offline</text></svg>";
  }
};

// --- Lessons Generation ---

export const generateLessonContent = async (
  subject: string,
  topic: string,
  persona: UserPersona
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Generate a comprehensive educational lesson about "${topic}" in the subject of "${subject}".
      Target Persona: ${persona}.
      
      Structure:
      1. Concept Overview
      2. Key Principles (Bullet points)
      3. Real-world Application (${persona === 'Student' ? 'Academic example' : 'Industry example'})
      4. Quick Quiz (3 questions with answers hidden/at bottom)
      
      Format: Markdown.`,
      config: { temperature: 0.3 }
    });
    return response.text || "Lesson generation failed.";
  } catch (error) {
    return "Could not load lesson content.";
  }
};

// --- Translation ---

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Translate the following markdown text into ${targetLanguage}.
      Keep the formatting (headers, bullet points, bold text) exactly the same.
      Only translate the content.
      
      Text:
      ${text}`,
      config: { temperature: 0.3 }
    });
    return response.text || text;
  } catch (error) {
    console.error("Translation Error", error);
    return text; // Return original on error
  }
};

// --- TTS ---

export const generateSpeechTTS = async (text: string, language: string): Promise<ArrayBuffer | null> => {
  try {
    // Clean text to remove markdown symbols for better speech
    const cleanText = text.replace(/[*#_`]/g, '');

    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: [{ parts: [{ text: `Speak efficiently and clearly in the detected language: ${cleanText.slice(0, 400)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }
    return null;
  } catch (e) {
    console.error("TTS Error", e);
    return null;
  }
};

// --- Visual Studio (Images & Video) ---

export const generateStudyImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image Gen Error", e);
    return null;
  }
};

export const editStudyImage = async (base64Data: string, prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Data } },
          { text: prompt }
        ]
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image Edit Error", e);
    return null;
  }
};

export const generateConceptVideo = async (prompt: string): Promise<string | null> => {
  try {
    // Note: For Veo, assume API key is handled/selected in environment.
    let operation = await ai.models.generateVideos({
      model: MODEL_VIDEO,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (videoUri) {
      // Return URI with API key appended for direct playback
      return `${videoUri}&key=${process.env.API_KEY}`;
    }
    return null;
  } catch (e) {
    console.error("Video Gen Error", e);
    return null;
  }
};

// --- Utils ---

export const float32ToInt16 = (float32: Float32Array): Int16Array => {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16;
};