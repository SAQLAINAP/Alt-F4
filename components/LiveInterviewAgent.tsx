// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, Volume2, Activity } from 'lucide-react';
import { float32ToInt16 } from '../services/geminiService';

interface LiveInterviewProps {
  addXp: (amount: number) => void;
}

export const LiveInterviewAgent: React.FC<LiveInterviewProps> = ({ addXp }) => {
  const [connected, setConnected] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const ai = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY })).current;
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);

  const addLog = (msg: string) => setLogs(p => [...p.slice(-4), msg]);

  const connect = async () => {
    try {
      addLog("Connecting...");
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: "You are an intense but fair Technical Interviewer. Conduct a coding interview.",
        },
      });
      sessionRef.current = session;
      setConnected(true);
      addLog("Connected! Speak.");
      const stream = new ReadableStream({
        start(controller) {
          session.receive.bind(session);
          (async () => {
            for await (const msg of session.receive()) {
              if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
                playAudio(msg.serverContent.modelTurn.parts[0].inlineData.data);
              }
            }
          })();
        }
      });
    } catch (e) { addLog("Connection failed."); }
  };

  const playAudio = (base64: string) => {
    if (!audioContextRef.current) return;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const float32 = new Float32Array(bytes.length / 2);
    const dataView = new DataView(bytes.buffer);
    for (let i = 0; i < float32.length; i++) float32[i] = dataView.getInt16(i * 2, true) / 32768.0;
    const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    const start = Math.max(audioContextRef.current.currentTime, nextStartTimeRef.current);
    source.start(start);
    nextStartTimeRef.current = start + buffer.duration;
  };

  const toggleMic = async () => {
    if (!connected || !sessionRef.current) return;
    if (micActive) {
      inputSourceRef.current?.disconnect();
      processorRef.current?.disconnect();
      setMicActive(false);
      addLog("Mic Muted.");
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext({ sampleRate: 16000 });
      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = float32ToInt16(inputData);
        const uint8 = new Uint8Array(pcm16.buffer);
        let binary = '';
        for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
        sessionRef.current.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: btoa(binary) } });
      };
      source.connect(processor);
      processor.connect(ctx.destination);
      inputSourceRef.current = source;
      processorRef.current = processor;
      setMicActive(true);
      addLog("Listening...");
    }
  };

  const disconnect = () => { sessionRef.current?.close(); setConnected(false); setMicActive(false); addLog("Disconnected."); addXp(100); };

  return (
    <div className="bg-[#262626] border-4 border-[#FFE066] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] p-6 h-[500px] flex flex-col items-center justify-center gap-8 relative overflow-hidden">
      <div className={`absolute inset-0 bg-[#8CBED6] transition-opacity duration-1000 ${connected ? 'opacity-5' : 'opacity-0'}`} />

      <div className="z-10 text-center">
        <h2 className="text-4xl font-black uppercase mb-2 text-[#FFE066]">Live Interview</h2>
        <p className="font-bold text-[#E0E0E0]">REAL-TIME AUDIO • GEMINI LIVE API</p>
      </div>

      <div className="z-10 flex flex-col items-center gap-6">
        {connected ? (
          <>
            <div className={`w-32 h-32 rounded-full border-4 border-black flex items-center justify-center transition-all ${micActive ? 'bg-[#FFE066] animate-pulse shadow-[0px_0px_20px_#FFE066]' : 'bg-[#404040]'}`}>
              {micActive ? <Activity size={48} className="text-black" /> : <MicOff size={48} className="text-[#8CBED6]" />}
            </div>

            <div className="flex gap-4">
              <button onClick={toggleMic} className="px-6 py-3 border-2 border-black bg-white text-black font-bold hover:bg-[#E0E0E0] flex items-center gap-2">
                {micActive ? 'MUTE MIC' : 'UNMUTE MIC'}
              </button>
              <button onClick={disconnect} className="px-6 py-3 border-2 border-black bg-black text-[#FFE066] font-bold hover:bg-[#333]">
                END CALL
              </button>
            </div>
          </>
        ) : (
          <button onClick={connect} className="px-8 py-4 bg-[#8CBED6] text-black font-black text-xl border-4 border-black shadow-[4px_4px_0px_0px_#FFE066] hover:-translate-y-1 transition-transform flex items-center gap-2">
            <Volume2 size={24} /> START INTERVIEW
          </button>
        )}
      </div>

      <div className="z-10 absolute bottom-4 left-4 right-4 bg-black/20 p-2 font-mono text-xs text-center text-[#8CBED6]">
        {logs.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
};