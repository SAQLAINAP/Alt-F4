import React, { useState } from 'react';
import { UserPersona, StoryStyle } from '../types';
import { generateIllustrativeStory } from '../services/geminiService';
import { PenTool, Sparkles, BookOpen, Film } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface CreativeAgentProps {
  persona: UserPersona;
  addXp: (amount: number) => void;
}

const STYLES: StoryStyle[] = ['Stranger Things', 'Marvel', 'Tech Noir', 'Shakespeare'];

export const CreativeAgent: React.FC<CreativeAgentProps> = ({ persona, addXp }) => {
  const [inputText, setInputText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<StoryStyle>('Stranger Things');
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    const result = await generateIllustrativeStory(inputText, selectedStyle, persona);
    setStory(result);
    setLoading(false);
    addXp(100);
  };

  return (
    <div className="bg-[#262626] border-4 border-[#8CBED6] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] p-6">
      <div className="flex items-center gap-3 mb-6 border-b-2 border-[#8CBED6] pb-4">
        <div className="bg-[#8CBED6] text-black p-2 border-2 border-black">
          <Film size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold uppercase text-[#8CBED6]">Pop Culture Generator</h2>
          <p className="text-sm font-medium text-[#E0E0E0]">Turn boring docs into episodes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block font-bold mb-2 flex items-center gap-2 text-[#FFE066]">
              <BookOpen size={18} /> SOURCE TEXT
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste content here..."
              className="w-full h-40 bg-[#1A1A1A] text-white border-2 border-[#404040] p-3 font-medium focus:outline-none focus:border-[#8CBED6] resize-none"
            />
          </div>

          <div>
            <label className="block font-bold mb-2 flex items-center gap-2 text-[#FFE066]">
              <Sparkles size={18} /> CHOOSE UNIVERSE
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`p-2 border-2 text-sm font-bold transition-all ${selectedStyle === style
                      ? 'bg-[#8CBED6] border-black text-black shadow-[2px_2px_0px_0px_#FFE066]'
                      : 'bg-[#1A1A1A] border-[#404040] text-[#E0E0E0] hover:bg-[#333]'
                    }`}
                >
                  {style.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !inputText}
            className="w-full mt-4 bg-[#FFE066] text-black py-3 font-bold text-lg border-2 border-black hover:bg-[#E6C64C] disabled:opacity-50"
          >
            {loading ? "WRITING SCRIPT..." : "GENERATE EPISODE"}
          </button>
        </div>

        <div className="relative">
          <div className="absolute top-0 left-0 bg-[#FFE066] text-black px-2 py-1 text-xs font-bold border-2 border-black transform -translate-y-3 translate-x-3 z-10">
            OUTPUT
          </div>
          <div className="h-full min-h-[400px] border-2 border-[#404040] bg-[#1A1A1A] p-4 overflow-y-auto">
            {story ? (
              <div className="prose prose-sm prose-invert font-medium text-[#E0E0E0]">
                <ReactMarkdown>
                  {story}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#404040]">
                <PenTool size={48} className="mb-2" />
                <p className="font-bold text-center">STORY WILL APPEAR HERE</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};