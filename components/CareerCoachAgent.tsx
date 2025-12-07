import React, { useState, useEffect, useRef } from 'react';
import { UserPersona, Message } from '../types';
import { createCoachChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";
import { Send, BrainCircuit, Globe, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface CareerCoachAgentProps {
  persona: UserPersona;
  addXp: (amount: number) => void;
}

export const CareerCoachAgent: React.FC<CareerCoachAgentProps> = ({ persona, addXp }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSession.current = createCoachChat(persona);
    setMessages([{
      id: 'init',
      role: 'model',
      content: `I am your Career Strategist. I use advanced reasoning and real-time market data to help you plan your path as a ${persona}.`,
      timestamp: Date.now()
    }]);
  }, [persona]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession.current) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result: GenerateContentResponse = await chatSession.current.sendMessage({ message: userMsg.content });
      const text = result.text || "No strategy generated.";

      const grounding = result.candidates?.[0]?.groundingMetadata;

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: text,
        timestamp: Date.now(),
        groundingMetadata: grounding
      };

      setMessages(p => [...p, botMsg]);
      addXp(25);
    } catch (error) {
      console.error(error);
      setMessages(p => [...p, { id: Date.now().toString(), role: 'model', content: "Strategy module offline.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#262626] border-4 border-[#FFE066] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] h-[600px] flex flex-col">
      <div className="p-4 border-b-2 border-[#FFE066] flex items-center justify-between bg-[#1A1A1A]">
        <div className="flex items-center gap-3">
          <div className="bg-[#FFE066] text-black p-2 border-2 border-white rounded-full">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase text-[#FFE066]">Career Coach</h2>
            <p className="text-xs font-bold text-[#E0E0E0]">GEMINI 3 PRO • THINKING • GROUNDING</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-dots">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-4 border-2 ${msg.role === 'user'
                ? 'bg-[#8CBED6] text-black border-black shadow-[4px_4px_0px_0px_black]'
                : 'bg-[#404040] text-white border-[#FFE066] shadow-[4px_4px_0px_0px_black]'
              }`}>
              <div className={`prose prose-sm ${msg.role === 'model' ? 'prose-invert' : ''}`}>
                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>

            {msg.groundingMetadata?.groundingChunks && (
              <div className="mt-2 text-xs bg-black/30 border border-[#8CBED6] p-2 max-w-[85%] self-start text-[#8CBED6]">
                <p className="font-bold flex items-center gap-1 mb-1"><Globe size={12} /> Sources:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
                    chunk.web?.uri && (
                      <li key={i}>
                        <a href={chunk.web.uri} target="_blank" rel="noreferrer" className="hover:text-white underline">
                          {chunk.web.title || chunk.web.uri}
                        </a>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm font-bold animate-pulse text-[#FFE066]">
            <Loader2 className="animate-spin" size={16} /> THINKING...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t-2 border-[#FFE066] bg-[#1A1A1A] flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask complex career questions..."
          className="flex-1 bg-[#262626] text-white border-2 border-[#404040] p-3 font-medium focus:outline-none focus:border-[#FFE066]"
        />
        <button onClick={handleSend} disabled={loading} className="bg-[#FFE066] text-black p-3 border-2 border-black hover:bg-[#E6C64C] transition-colors">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};