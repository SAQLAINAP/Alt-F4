import React, { useState, useEffect, useRef } from 'react';
import { UserPersona, Message, INDIAN_LANGUAGES } from '../types';
import { createTutorChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";
import { Send, MessageSquare, Loader2, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TutorAgentProps {
  persona: UserPersona;
  addXp: (amount: number) => void;
}

export const TutorAgent: React.FC<TutorAgentProps> = ({ persona, addXp }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Re-initialize chat when language changes
  useEffect(() => {
    try {
      chatSession.current = createTutorChat(persona, language);
      setMessages([{
        id: 'init-' + Date.now(),
        role: 'model',
        content: `Namaste! I am your Tutor. I will speak with you in **${language}**. Ask me anything about your subjects!`,
        timestamp: Date.now()
      }]);
    } catch (e) {
      console.error("Tutor init error:", e);
      chatSession.current = null;
      setMessages([{
        id: 'error-' + Date.now(),
        role: 'model',
        content: `**System Error**: Could not connect to Tutor Agent. Please check your API Key configuration.\n\nDetails: ${String(e)}`,
        timestamp: Date.now()
      }]);
    }
  }, [persona, language]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession.current) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result: GenerateContentResponse = await chatSession.current.sendMessage({ message: userMsg.content });
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', content: result.text || "...", timestamp: Date.now() }]);
      addXp(10);
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', content: "Connection error.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#262626] border-4 border-[#8CBED6] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] h-[calc(100vh-140px)] flex flex-col">
      <div className="p-4 border-b-2 border-[#8CBED6] flex flex-col md:flex-row items-center justify-between bg-[#1A1A1A] gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-[#8CBED6] text-black p-2 border-2 border-white rounded-full">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase text-[#8CBED6]">Vernacular Tutor</h2>
            <p className="text-xs font-bold text-[#E0E0E0]">GEMINI FLASH • {persona.toUpperCase()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#262626] border-2 border-[#404040] p-1 px-3 w-full md:w-auto">
          <Globe size={16} className="text-[#FFE066]" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-white font-bold text-sm focus:outline-none w-full"
          >
            {INDIAN_LANGUAGES.map(lang => (
              <option key={lang} value={lang} className="bg-[#262626]">{lang}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dots">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 border-2 ${msg.role === 'user'
                ? 'bg-[#FFE066] text-black border-black rounded-bl-xl rounded-tr-xl rounded-tl-xl shadow-[2px_2px_0px_0px_black]'
                : 'bg-[#404040] text-white border-[#8CBED6] rounded-br-xl rounded-tr-xl rounded-tl-xl shadow-[2px_2px_0px_0px_black]'
              }`}>
              <div className={`prose prose-sm ${msg.role === 'model' ? 'prose-invert' : ''}`}>
                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && <Loader2 className="animate-spin text-[#8CBED6] ml-4" size={24} />}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t-2 border-[#8CBED6] bg-[#1A1A1A] flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask something in ${language}...`}
          className="flex-1 bg-[#262626] text-white border-2 border-[#404040] p-3 font-medium focus:outline-none focus:border-[#8CBED6]"
        />
        <button onClick={handleSend} disabled={loading || !input.trim()} className="bg-[#8CBED6] text-black p-3 border-2 border-black hover:bg-[#7AB0C9]">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};