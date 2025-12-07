import React, { useState } from 'react';
import { UserPersona, StoryStyle } from '../types';
import { generateIllustrativeStory } from '../services/geminiService';
import { PenTool, Sparkles, BookOpen, Clapperboard } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface IllustrateAgentProps {
  persona: UserPersona;
  addXp: (amount: number) => void;
}

const UNIVERSES: StoryStyle[] = [
  'Stranger Things', 'Harry Potter', 'Marvel', 'Star Wars', 'Game of Thrones',
  'Rick and Morty', 'Sherlock Holmes', 'Lord of the Rings', 'The Matrix',
  'Anime (Shonen)', 'Pixar', 'Wes Anderson', 'Cyberpunk 2077', 'Shakespeare', 'Tech Noir'
];

export const IllustrateAgent: React.FC<IllustrateAgentProps> = ({ persona, addXp }) => {
  const [inputText, setInputText] = useState('');
  const [selectedUniverse, setSelectedUniverse] = useState<StoryStyle>('Stranger Things');
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    const result = await generateIllustrativeStory(inputText, selectedUniverse, persona);
    setStory(result);
    setLoading(false);
    addXp(100);
  };

  return (
    <div className="bg-[#262626] border-4 border-[#8CBED6] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] p-6 min-h-[calc(100vh-140px)]">
      <div className="flex items-center gap-3 mb-6 border-b-2 border-[#8CBED6] pb-4">
        <div className="bg-[#8CBED6] text-black p-2 border-2 border-black">
          <Clapperboard size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold uppercase text-[#8CBED6]">Illustrate Mode</h2>
          <p className="text-sm font-medium text-[#E0E0E0]">Explain concepts via Pop Culture</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <div className="space-y-4 flex flex-col">
          <div>
            <label className="block font-bold mb-2 flex items-center gap-2 text-[#FFE066]">
              <BookOpen size={18} /> SOURCE TOPIC / TEXT
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste complex text or topic here..."
              className="w-full h-40 bg-[#1A1A1A] text-white border-2 border-[#404040] p-3 font-medium focus:outline-none focus:border-[#8CBED6] resize-none"
            />
          </div>

          <div className="flex-1">
            <label className="block font-bold mb-2 flex items-center gap-2 text-[#FFE066]">
              <Sparkles size={18} /> CHOOSE UNIVERSE
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto border-2 border-[#404040] p-2 bg-[#1A1A1A]">
              {UNIVERSES.map((universe) => (
                <button
                  key={universe}
                  onClick={() => setSelectedUniverse(universe)}
                  className={`p-2 text-xs font-bold transition-all border-2 text-left truncate ${selectedUniverse === universe
                      ? 'bg-[#8CBED6] border-black text-black'
                      : 'bg-[#262626] border-transparent text-[#E0E0E0] hover:border-[#FFE066]'
                    }`}
                >
                  {universe}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !inputText}
            className="w-full mt-auto bg-[#FFE066] text-black py-4 font-bold text-lg border-2 border-black hover:bg-[#E6C64C] disabled:opacity-50 shadow-[4px_4px_0px_0px_black] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all"
          >
            {loading ? "DIRECTING SCENE..." : "GENERATE EPISODE"}
          </button>
        </div>

        <div className="relative flex flex-col h-full min-h-[400px]">
          <div className="absolute top-0 right-0 bg-[#FFE066] text-black px-3 py-1 text-xs font-bold border-2 border-black transform -translate-y-3 translate-x-3 z-10">
            SCENE OUTPUT
          </div>
          <div className="flex-1 border-2 border-[#404040] bg-[#1A1A1A] p-6 overflow-y-auto">
            {story ? (
              <div className="prose prose-sm prose-invert font-medium text-[#E0E0E0]">
                <ReactMarkdown>
                  {story}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#404040]">
                <PenTool size={48} className="mb-2" />
                <p className="font-bold text-center">EPISODE SCRIPT WILL APPEAR HERE</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};