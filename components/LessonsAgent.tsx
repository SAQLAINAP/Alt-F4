import React, { useState } from 'react';
import { UserPersona } from '../types';
import { generateLessonContent } from '../services/geminiService';
import { Book, ChevronRight, ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface LessonsAgentProps {
  persona: UserPersona;
  addXp: (amount: number) => void;
}

const SUBJECTS_MAP: Record<UserPersona, string[]> = {
  [UserPersona.STUDENT]: [
    'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 
    'Humanities', 'Geography', 'Economics', 'English Literature', 'Arts'
  ],
  [UserPersona.FRESHER]: [
    'Resume Building', 'Interview Preparation', 'Aptitude Tests', 'Data Structures', 
    'System Design Basics', 'Soft Skills', 'Corporate Etiquette', 'LinkedIn Growth', 
    'Email Writing', 'Basic Finance'
  ],
  [UserPersona.EXPERIENCED]: [
    'System Architecture', 'Team Leadership', 'Project Management', 'Agile Methodologies', 
    'Cloud Computing', 'Strategic Planning', 'Negotiation', 'Mentorship', 
    'Work-Life Balance', 'Financial Independence'
  ]
};

// Mock lesson titles for demo (in real app, these could also be generated)
const LESSON_TITLES = [
  "Introduction & Fundamentals", "Core Concepts Deep Dive", "Advanced Techniques", 
  "Case Studies", "Modern Applications", "Common Pitfalls", "Expert Best Practices", 
  "Future Trends", "Practical Workshop", "Final Review"
];

export const LessonsAgent: React.FC<LessonsAgentProps> = ({ persona, addXp }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const subjects = SUBJECTS_MAP[persona] || SUBJECTS_MAP[UserPersona.STUDENT];

  const handleLessonSelect = async (lesson: string) => {
    if (!selectedSubject) return;
    setSelectedLesson(lesson);
    setLoading(true);
    setLessonContent('');
    
    const content = await generateLessonContent(selectedSubject, lesson, persona);
    setLessonContent(content);
    setLoading(false);
    addXp(50);
  };

  const resetView = () => {
    setSelectedLesson(null);
    setLessonContent('');
  };

  if (selectedLesson) {
    return (
      <div className="bg-[#262626] border-4 border-[#FFE066] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] h-[calc(100vh-140px)] flex flex-col">
        <div className="p-4 border-b-2 border-[#FFE066] flex items-center gap-4 bg-[#1A1A1A]">
          <button onClick={resetView} className="hover:text-[#FFE066] text-[#E0E0E0]">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-[#FFE066] uppercase">{selectedSubject}</h2>
            <p className="text-xs font-bold text-[#E0E0E0]">{selectedLesson}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-dots">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center text-[#FFE066]">
               <Loader2 size={48} className="animate-spin mb-4"/>
               <p className="font-bold text-xl">GENERATING LESSON...</p>
             </div>
          ) : (
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown>{lessonContent}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedSubject) {
    return (
      <div className="bg-[#262626] border-4 border-[#FFE066] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] h-[calc(100vh-140px)] flex flex-col">
         <div className="p-4 border-b-2 border-[#FFE066] flex items-center gap-4 bg-[#1A1A1A]">
          <button onClick={() => setSelectedSubject(null)} className="hover:text-[#FFE066] text-[#E0E0E0]">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-[#FFE066] uppercase">{selectedSubject} Module</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          {LESSON_TITLES.map((title, idx) => (
            <button
              key={idx}
              onClick={() => handleLessonSelect(title)}
              className="bg-[#1A1A1A] border-2 border-[#404040] p-4 flex items-center justify-between hover:border-[#8CBED6] hover:bg-[#333] group transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="bg-[#404040] text-white w-8 h-8 flex items-center justify-center font-bold rounded-full group-hover:bg-[#8CBED6] group-hover:text-black">
                  {idx + 1}
                </span>
                <span className="font-bold text-[#E0E0E0] group-hover:text-white text-left">{title}</span>
              </div>
              <ChevronRight className="text-[#404040] group-hover:text-[#8CBED6]" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#FFE066] text-black border-4 border-black p-6 shadow-[8px_8px_0px_0px_#8CBED6]">
        <h2 className="text-3xl font-black uppercase flex items-center gap-3">
          <BookOpen size={32} /> Learning Path: {persona}
        </h2>
        <p className="font-bold mt-2 opacity-80">Select a subject to begin your mastery journey.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className="aspect-square bg-[#262626] border-4 border-[#404040] hover:border-[#FFE066] hover:-translate-y-1 transition-all flex flex-col items-center justify-center p-4 text-center group shadow-[4px_4px_0px_0px_black]"
          >
            <Book size={40} className="text-[#8CBED6] mb-4 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-[#E0E0E0] group-hover:text-white uppercase text-sm md:text-base">{sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
};