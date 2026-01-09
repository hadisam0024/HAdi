
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Modality } from "@google/genai";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 3000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const errorStr = err.message?.toLowerCase() || "";
    const isQuotaError = errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('limit');
    
    if (isQuotaError && retries > 0) {
      console.warn(`[XRIVET_SYSTEM]: Quota hit. Retrying in ${delay}ms... Madarchod Google!`);
      await sleep(delay);
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createWavBlob(samples: Uint8Array, sampleRate: number = 24000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length);
  const view = new DataView(buffer);
  const writeString = (v: DataView, offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(offset + i, s.charCodeAt(i));
  };
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length, true);
  const dataView = new Uint8Array(buffer, 44);
  dataView.set(samples);
  return new Blob([buffer], { type: 'audio/wav' });
}

export interface GeneratedAudio {
  buffer: AudioBuffer;
  rawData: Uint8Array;
}

export const generateSpeech = async (
  text: string, 
  voiceName: string,
  styleInstruction?: string
): Promise<GeneratedAudio> => {
  return withRetry(async () => {
    const ai = getClient();
    const prompt = `[VOICE_STYLE: SICK, HOARSE, COUGHING] Speak text: ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts", // TTS requires specific model
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName }
          }
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("EMPTY_RESPONSE");

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    try {
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, outputAudioContext, 24000, 1);
      return { buffer: audioBuffer, rawData: audioBytes };
    } finally {
      await outputAudioContext.close();
    }
  });
};

export const dramatizeText = async (text: string, styleInstruction?: string): Promise<string> => {
  return withRetry(async () => {
    const ai = getClient();
    const prompt = `Rewrite this for a vlogger with a sore throat, add (cough) and (sniffle). Hinglish style. Text: "${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-lite-latest", // Use the lightest model to bypass quota limits
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 150
      }
    });

    return response.text?.trim() || text;
  });
};
