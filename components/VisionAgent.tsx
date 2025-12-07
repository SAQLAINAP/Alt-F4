import React, { useState, useRef } from 'react';
import { UserPersona, INDIAN_LANGUAGES } from '../types';
import { generateVisionAnalysis, generateSpeechTTS } from '../services/geminiService';
import { Camera, Upload, Loader2, FileText, Volume2, Globe, PlayCircle, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface VisionAgentProps {
  persona: UserPersona;
  addXp: (amount: number) => void;
}

type ViewState = 'upload' | 'analysis';

export const VisionAgent: React.FC<VisionAgentProps> = ({ persona, addXp }) => {
  const [view, setView] = useState<ViewState>('upload');
  const [fileData, setFileData] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData(reader.result as string);
        setAnalysis('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!fileData) return;
    setLoading(true);
    const base64Data = fileData.split(',')[1];
    const result = await generateVisionAnalysis(base64Data, mimeType, persona, language);
    setAnalysis(result);
    setLoading(false);
    setView('analysis');
    addXp(50);
  };

  const handleTTS = async () => {
    if (!analysis || speaking) return;
    setSpeaking(true);
    const audioBuffer = await generateSpeechTTS(analysis, language);

    if (audioBuffer) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      try {
        const decodedBuffer = await ctx.decodeAudioData(audioBuffer);
        const source = ctx.createBufferSource();
        source.buffer = decodedBuffer;
        source.connect(ctx.destination);
        source.onended = () => setSpeaking(false);
        source.start(0);
      } catch (e) {
        console.error("Audio Decode Error", e);
        setSpeaking(false);
      }
    } else {
      setSpeaking(false);
    }
  };

  const resetView = () => {
    setView('upload');
    setSpeaking(false);
    // Optional: Clear file data if desired, but keeping it allows re-analysis
    // setFileData(null);
    // setFileName('');
  };

  return (
    <div className="bg-[#262626] border-4 border-[#FFE066] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] min-h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b-2 border-[#FFE066] pb-4">
        <div className="flex items-center gap-3">
          {view === 'analysis' && (
            <button onClick={resetView} className="mr-2 hover:text-[#FFE066] transition-colors">
              <ArrowLeft size={28} />
            </button>
          )}
          <div className="bg-[#FFE066] text-black p-2 border-2 border-black">
            <Camera size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold uppercase text-[#FFE066]">Vision & Doc Tutor</h2>
            <p className="text-sm font-medium text-[#E0E0E0]">Upload PDF, Images & Listen</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2 bg-[#1A1A1A] border-2 border-[#404040] p-2">
          <Globe size={16} className="text-[#8CBED6]" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-[#E0E0E0] font-bold text-sm focus:outline-none"
          >
            {INDIAN_LANGUAGES.map(lang => (
              <option key={lang} value={lang} className="bg-[#262626]">{lang}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">

        {/* VIEW 1: UPLOAD FORM */}
        {view === 'upload' && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full gap-8 animate-fade-in-up">
            <div
              className={`w-full border-4 border-dashed border-[#404040] min-h-[300px] flex flex-col items-center justify-center cursor-pointer bg-[#1A1A1A] hover:bg-[#333] transition-colors relative rounded-xl ${!fileData ? 'animate-pulse' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {fileData ? (
                <div className="flex flex-col items-center p-8 text-center">
                  {mimeType.includes('image') ? (
                    <img src={fileData} alt="Preview" className="max-h-64 object-contain mb-6 border-4 border-[#404040] shadow-lg" />
                  ) : (
                    <FileText size={80} className="text-[#8CBED6] mb-6" />
                  )}
                  <p className="font-bold text-[#FFE066] text-xl">{fileName}</p>
                  <p className="text-sm text-[#E0E0E0] mt-2 bg-black/50 px-3 py-1 rounded-full">Click to change file</p>
                </div>
              ) : (
                <div className="flex flex-col items-center p-8 text-center">
                  <Upload size={64} className="mb-6 text-[#8CBED6]" />
                  <span className="font-black text-2xl text-[#E0E0E0] mb-2">UPLOAD FILE</span>
                  <span className="text-sm text-[#888] font-medium">Supports JPG, PNG, PDF</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="hidden"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!fileData || loading}
              className="w-full max-w-md bg-[#FFE066] text-black py-4 font-black text-xl hover:bg-[#E6C64C] border-4 border-black transition-all shadow-[8px_8px_0px_0px_#8CBED6] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_#8CBED6] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {loading ? <span className="flex items-center justify-center gap-3"><Loader2 className="animate-spin" size={24} /> ANALYZING...</span> : "ANALYZE & EXPLAIN"}
            </button>
          </div>
        )}

        {/* VIEW 2: ANALYSIS RESULT */}
        {view === 'analysis' && (
          <div className="flex-1 bg-[#1A1A1A] border-2 border-[#404040] p-8 relative flex flex-col min-h-[500px] animate-fade-in-up rounded-xl">
            <div className="flex-1 overflow-y-auto mb-20 pr-2">
              <div className="prose prose-lg prose-invert font-medium text-[#E0E0E0] max-w-none">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            </div>

            {/* Audio Controls Bar */}
            <div className="absolute bottom-6 left-6 right-6 bg-[#262626] border-2 border-[#8CBED6] p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_black] rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${speaking ? 'bg-[#FFE066] text-black animate-pulse' : 'bg-[#404040] text-[#8CBED6]'}`}>
                  <Volume2 size={24} />
                </div>
                <div>
                  <p className="font-bold text-white">Audio Explanation</p>
                  <p className="text-xs text-[#8CBED6] font-bold uppercase">{language}</p>
                </div>
              </div>
              <button
                onClick={handleTTS}
                disabled={speaking}
                className={`flex items-center gap-2 px-6 py-3 font-bold text-black border-2 border-black transition-all rounded-lg ${speaking ? 'bg-[#404040] text-gray-500 cursor-not-allowed' : 'bg-[#FFE066] hover:bg-[#E6C64C] hover:scale-105'}`}
              >
                {speaking ? 'SPEAKING...' : <><PlayCircle size={20} /> LISTEN NOW</>}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};