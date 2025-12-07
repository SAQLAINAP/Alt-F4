import React, { useState, useRef } from 'react';
import { UserPersona, INDIAN_LANGUAGES } from '../types';
import { generateVisionAnalysis, generateSpeechTTS } from '../services/geminiService';
import { Camera, Upload, Loader2, FileText, Volume2, Globe, PlayCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface VisionAgentProps {
  persona: UserPersona;
  addXp: (amount: number) => void;
}

export const VisionAgent: React.FC<VisionAgentProps> = ({ persona, addXp }) => {
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

  return (
    <div className="bg-[#262626] border-4 border-[#FFE066] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] min-h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b-2 border-[#FFE066] pb-4">
        <div className="flex items-center gap-3">
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

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        <div className="flex-1 flex flex-col gap-4">
          <div 
            className={`border-4 border-dashed border-[#404040] flex-1 min-h-[250px] flex flex-col items-center justify-center cursor-pointer bg-[#1A1A1A] hover:bg-[#333] transition-colors relative ${!fileData ? 'animate-pulse' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {fileData ? (
              <div className="flex flex-col items-center p-4 text-center">
                 {mimeType.includes('image') ? (
                    <img src={fileData} alt="Preview" className="max-h-48 object-contain mb-4 border-2 border-[#404040]" />
                 ) : (
                    <FileText size={64} className="text-[#8CBED6] mb-4" />
                 )}
                 <p className="font-bold text-[#FFE066]">{fileName}</p>
                 <p className="text-xs text-[#E0E0E0] mt-1">Click to change</p>
              </div>
            ) : (
              <>
                <Upload size={48} className="mb-4 text-[#8CBED6]" />
                <span className="font-bold text-[#E0E0E0]">UPLOAD IMAGE OR PDF</span>
                <span className="text-xs text-[#888] mt-2">Supports .jpg, .png, .pdf</span>
              </>
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
            className="w-full bg-[#FFE066] text-black py-4 font-bold text-xl hover:bg-[#E6C64C] border-2 border-black transition-all shadow-[4px_4px_0px_0px_#8CBED6]"
          >
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> ANALYZING...</span> : "EXPLAIN IN " + language.toUpperCase()}
          </button>
        </div>

        <div className="flex-[1.5] bg-[#1A1A1A] border-2 border-[#404040] p-6 relative flex flex-col min-h-[400px]">
          {analysis ? (
            <>
              <div className="flex-1 overflow-y-auto mb-16">
                 <div className="prose prose-sm prose-invert font-medium text-[#E0E0E0]">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              </div>
              
              {/* Audio Controls */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#262626] border-2 border-[#8CBED6] p-3 flex items-center justify-between shadow-[4px_4px_0px_0px_black]">
                 <div className="flex items-center gap-2">
                    <Volume2 className="text-[#8CBED6]" />
                    <span className="font-bold text-sm text-[#E0E0E0]">Audio Explanation ({language})</span>
                 </div>
                 <button 
                   onClick={handleTTS}
                   disabled={speaking}
                   className={`flex items-center gap-2 px-4 py-2 font-bold text-black border-2 border-black transition-all ${speaking ? 'bg-[#404040] text-gray-500 cursor-not-allowed' : 'bg-[#FFE066] hover:bg-[#E6C64C]'}`}
                 >
                   {speaking ? 'SPEAKING...' : <><PlayCircle size={18}/> LISTEN</>}
                 </button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#404040]">
              <FileText size={48} className="mb-2" />
              <p className="font-bold">EXPLANATION WILL APPEAR HERE</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};