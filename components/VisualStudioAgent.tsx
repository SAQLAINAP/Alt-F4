import React, { useState } from 'react';
import { generateStudyImage, editStudyImage, generateConceptVideo } from '../services/geminiService';
import { Image, Video, Wand2, Loader2 } from 'lucide-react';

interface VisualStudioProps {
  addXp: (amount: number) => void;
}

type Mode = 'GENERATE' | 'EDIT' | 'VIDEO';

export const VisualStudioAgent: React.FC<VisualStudioProps> = ({ addXp }) => {
  const [mode, setMode] = useState<Mode>('GENERATE');
  const [prompt, setPrompt] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!prompt) return;
    setLoading(true);
    setResultUrl(null);
    let res: string | null = null;
    if (mode === 'GENERATE') res = await generateStudyImage(prompt);
    else if (mode === 'EDIT' && uploadedImage) res = await editStudyImage(uploadedImage.split(',')[1], prompt);
    else if (mode === 'VIDEO') res = await generateConceptVideo(prompt);
    if (res) { setResultUrl(res); addXp(150); }
    setLoading(false);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-[#262626] border-4 border-[#FFE066] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] p-6">
      <div className="flex items-center gap-3 mb-6 border-b-2 border-[#FFE066] pb-4">
        <div className="bg-[#FFE066] text-black p-2 border-2 border-black">
          <Wand2 size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold uppercase text-[#FFE066]">Visual Studio</h2>
          <p className="text-sm font-medium text-[#E0E0E0]">Create & Edit with Gemini & Veo</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['GENERATE', 'EDIT', 'VIDEO'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setResultUrl(null); setPrompt(''); }}
            className={`px-4 py-2 border-2 text-sm font-bold transition-all ${
              mode === m 
                ? 'bg-[#8CBED6] border-black text-black' 
                : 'bg-[#1A1A1A] border-[#404040] text-[#E0E0E0] hover:bg-[#333]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {mode === 'EDIT' && (
            <div className="border-2 border-dashed border-[#404040] h-40 flex items-center justify-center bg-[#1A1A1A] relative cursor-pointer">
              {uploadedImage ? <img src={uploadedImage} alt="Source" className="h-full w-full object-contain" /> : <span className="font-bold text-[#404040]">UPLOAD IMAGE</span>}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} accept="image/*" />
            </div>
          )}

          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={mode === 'GENERATE' ? "Describe image..." : mode === 'EDIT' ? "Edit instructions..." : "Video prompt..."}
            className="w-full h-32 bg-[#1A1A1A] text-white border-2 border-[#404040] p-3 font-medium focus:outline-none focus:border-[#FFE066] resize-none"
          />

          <button
            onClick={handleAction}
            disabled={loading || !prompt || (mode === 'EDIT' && !uploadedImage)}
            className="w-full bg-[#FFE066] text-black py-3 font-bold text-lg border-2 border-black hover:bg-[#E6C64C] shadow-[4px_4px_0px_0px_#8CBED6]"
          >
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin"/> PROCESSING...</span> : "EXECUTE"}
          </button>
        </div>

        <div className="border-2 border-[#404040] bg-[#1A1A1A] min-h-[300px] flex items-center justify-center p-4">
          {resultUrl ? (
            mode === 'VIDEO' ? <video src={resultUrl} controls className="w-full max-h-[400px] border-2 border-[#404040]" /> : <img src={resultUrl} alt="Result" className="w-full max-h-[400px] object-contain border-2 border-[#404040]" />
          ) : (
            <div className="text-center text-[#404040]">
              {mode === 'VIDEO' ? <Video size={48} className="mx-auto mb-2"/> : <Image size={48} className="mx-auto mb-2"/>}
              <p className="font-bold">OUTPUT AREA</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};