import React, { useState } from 'react';
import { UserPersona, INDIAN_LANGUAGES } from '../types';
import { generateLessonContent, translateText } from '../services/geminiService';
import { STATIC_LESSONS } from '../data/staticLessons';
import {
  Book, ChevronRight, ArrowLeft, Loader2, BookOpen, Globe,
  Atom, FlaskConical, Dna, Calculator, Cpu, Globe2, Briefcase,
  Landmark, Palette, Feather, FileText, Users, TrendingUp,
  BrainCircuit, Code, Mail, DollarSign, Layers, Server,
  Target, Handshake, HeartHandshake, Smile, Coffee
} from 'lucide-react';
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

const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  // Student
  'Physics': <Atom size={40} />,
  'Chemistry': <FlaskConical size={40} />,
  'Biology': <Dna size={40} />,
  'Mathematics': <Calculator size={40} />,
  'Computer Science': <Cpu size={40} />,
  'Humanities': <Globe2 size={40} />,
  'Geography': <Globe size={40} />,
  'Economics': <TrendingUp size={40} />,
  'English Literature': <Feather size={40} />,
  'Arts': <Palette size={40} />,

  // Fresher
  'Resume Building': <FileText size={40} />,
  'Interview Preparation': <Users size={40} />,
  'Aptitude Tests': <BrainCircuit size={40} />,
  'Data Structures': <Code size={40} />,
  'System Design Basics': <Layers size={40} />,
  'Soft Skills': <Smile size={40} />,
  'Corporate Etiquette': <Briefcase size={40} />,
  'LinkedIn Growth': <TrendingUp size={40} />,
  'Email Writing': <Mail size={40} />,
  'Basic Finance': <DollarSign size={40} />,

  // Experienced
  'System Architecture': <Server size={40} />,
  'Team Leadership': <Users size={40} />,
  'Project Management': <Target size={40} />,
  'Agile Methodologies': <Layers size={40} />,
  'Cloud Computing': <Cpu size={40} />,
  'Strategic Planning': <TrendingUp size={40} />,
  'Negotiation': <Handshake size={40} />,
  'Mentorship': <HeartHandshake size={40} />,
  'Work-Life Balance': <Coffee size={40} />,
  'Financial Independence': <Landmark size={40} />,
};

const SUBJECT_MODULES: Record<string, string[]> = {
  // Student
  'Physics': ["Kinematics", "Dynamics", "Thermodynamics", "Electromagnetism", "Optics", "Quantum Physics", "Nuclear Physics", "Relativity"],
  'Chemistry': ["Atomic Structure", "Chemical Bonding", "Periodic Table", "Stoichiometry", "Organic Chemistry", "Electrochemistry", "Thermodynamics", "Polymers"],
  'Biology': ["Cell Structure", "Genetics", "Evolution", "Human Physiology", "Plant Biology", "Ecology", "Biotechnology", "Microbiology"],
  'Mathematics': ["Algebra", "Calculus", "Trigonometry", "Geometry", "Statistics", "Probability", "Vectors", "Matrices"],
  'Computer Science': ["Algorithms", "Data Structures", "Operating Systems", "DBMS", "Computer Networks", "Web Development", "AI/ML Basics", "Cybersecurity"],
  'Humanities': ["Ancient History", "Modern World History", "Sociology Basics", "Psychology 101", "Political Science", "anthropology", "Philosophy", "Ethics"],
  'Geography': ["Physical Geography", "Human Geography", "Climatology", "Oceanography", "Cartography", "Environmental Studies", "Resources", "Demographics"],
  'Economics': ["Microeconomics", "Macroeconomics", "International Trade", "Public Finance", "Development Economics", "Game Theory", "Econometrics", "Banking"],
  'English Literature': ["Shakespearean Drama", "Victorian Era", "Modernism", "Poetry Analysis", "Literary Criticism", "American Literature", "Post-Colonial Lit", "Creative Writing"],
  'Arts': ["Art History", "Color Theory", "Sketching Basics", "Modern Art", "Perspective Drawing", "Digital Art", "Sculpting", "Photography"],

  // Fresher
  'Resume Building': ["Structuring Your Resume", "Action Verbs & Impact", "Tailoring for ATS", "Project Showcasing", "Education & certifications", "Common Mistakes", "Cover Letters", "LinkedIn optimization"],
  'Interview Preparation': ["Behavioral Questions", "Technical Screening", "System Design Rounds", "Mock Interviews", "Salary Negotiation", "Body Language", "Addressing Weaknesses", "Follow-up Etiquette"],
  'Aptitude Tests': ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "Data Interpretation", "Puzzles", "Abstract Reasoning", "Speed Maths", "Practice Sets"],
  'Data Structures': ["Arrays & Strings", "Linked Lists", "Stacks & Queues", "Trees & Graphs", "Hashing", "Heaps", "Dynamic Programming", "Recursion"],
  'System Design Basics': ["Load Balancing", "Caching", "Database Sharding", "Vertical vs Horizontal Scaling", "Microservices", "API Design", "Message Queues", "Consistent Hashing"],
  // Add generics for others to save space/time while still being better than generic numbers
  'Soft Skills': ["Communication", "Empathy", "Time Management", "Adaptability"],
  'Corporate Etiquette': ["Email Manners", "Meeting Protocols", "Dress Code", "Networking"],
  'LinkedIn Growth': ["Profile Optimization", "Networking Strategy", "Content Creation", "Personal Branding"],
  'Email Writing': ["Formal vs Informal", "Cold Emailing", "Follow-ups", "Subject Lines"],
  'Basic Finance': ["Budgeting", "Investing 101", "Taxes", "Credit Scores"],

  // Experienced
  'System Architecture': ["Microservices Patterns", "Event-Driven Arch", "Serverless", "Distributed Systems", "High Availability", "Fault Tolerance", "Observability", "Security by Design"],
  'Team Leadership': ["Conflict Resolution", "Motivating Teams", "Delegation", "Hiring & Onboarding", "Performance Reviews", "Culture Building", "Remote Management", "Crisis Management"],
  'Project Management': ["Agile vs Waterfall", "Scrum Framework", "Risk Management", "Stakeholder Comm", "Budgeting", "Resource Allocation", "Timeline Planning", "Quality Assurance"],
  'Agile Methodologies': ["Scrum", "Kanban", "XP", "Sprint Planning", "Retrospectives", "User Stories", "Backlog Grooming", "Velocity Tracking"],
  'Cloud Computing': ["AWS Services", "Azure Fundamentals", "GCP Overview", "Docker & Kubernetes", "CI/CD Pipelines", "IaC (Terraform)", "Cloud Security", "Cost Optimization"],
  // ... generics for rest
  'Strategic Planning': ["SWOT Analysis", "OKR Framework", "Long-term Vision", "Competitive Analysis"],
  'Negotiation': ["Win-Win Strategies", "Contract Negotiation", "Conflict Management", "Persuasion"],
  'Mentorship': ["Guidance vs Instruction", "Career Pathing", "Feedback Loops", "Sponsorship"],
  'Work-Life Balance': ["Burnout Prevention", "Time Blocking", "Setting Boundaries", "Remote Work Health"],
  'Financial Independence': ["FIRE Movement", "Passive Income", "Real Estate", "Stock Market Strategies"]
};

export const LessonsAgent: React.FC<LessonsAgentProps> = ({ persona, addXp }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState<string>(''); // Always English
  const [displayContent, setDisplayContent] = useState<string>(''); // Translated/Displayed
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);

  const subjects = SUBJECTS_MAP[persona] || SUBJECTS_MAP[UserPersona.STUDENT];

  const handleLessonSelect = async (lesson: string) => {
    if (!selectedSubject) return;
    setSelectedLesson(lesson);
    setLoading(true);
    setOriginalContent('');
    setDisplayContent('');

    // Try to get static content first
    const key = `${selectedSubject}-${lesson}`;
    let content = STATIC_LESSONS[key];

    // Fallback if not found (for demo purposes, dynamic generation could still be an option, but user asked for "pregenerated")
    if (!content) {
      content = await generateLessonContent(selectedSubject, lesson, persona);
    }

    setOriginalContent(content);

    // Initial display
    if (language === 'English') {
      setDisplayContent(content);
      setLoading(false);
    } else {
      // Immediate translation if language is already selected
      await handleTranslation(content, language);
      setLoading(false);
    }

    addXp(50);
  };

  const handleTranslation = async (text: string, lang: string) => {
    if (lang === 'English') {
      setDisplayContent(text);
      return;
    }
    setTranslating(true);
    const translated = await translateText(text, lang);
    setDisplayContent(translated);
    setTranslating(false);
  };

  const changeLanguage = async (newLang: string) => {
    setLanguage(newLang);
    if (originalContent) {
      await handleTranslation(originalContent, newLang);
    }
  };

  const resetView = () => {
    setSelectedLesson(null);
    setOriginalContent('');
    setDisplayContent('');
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

          <div className="ml-auto flex items-center gap-2 bg-[#262626] border-2 border-[#404040] p-1 px-3">
            <Globe size={16} className="text-[#FFE066]" />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-white font-bold text-sm focus:outline-none"
            >
              {INDIAN_LANGUAGES.map(lang => (
                <option key={lang} value={lang} className="bg-[#262626]">{lang}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-dots">
          {loading || translating ? (
            <div className="h-full flex flex-col items-center justify-center text-[#FFE066]">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="font-bold text-xl">{translating ? 'TRANSLATING...' : 'PREPARING LESSON...'}</p>
            </div>
          ) : (
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown>{displayContent}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedSubject) {
    const modules = SUBJECT_MODULES[selectedSubject] || ["Introduction", "Core Concepts", "Advanced Topics", "Case Studies", "Summary"];

    return (
      <div className="bg-[#262626] border-4 border-[#FFE066] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] h-[calc(100vh-140px)] flex flex-col">
        <div className="p-4 border-b-2 border-[#FFE066] flex items-center gap-4 bg-[#1A1A1A]">
          <button onClick={() => setSelectedSubject(null)} className="hover:text-[#FFE066] text-[#E0E0E0]">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-[#FFE066]">
              {SUBJECT_ICONS[selectedSubject] || <Book size={24} />}
            </div>
            <h2 className="text-2xl font-bold text-[#FFE066] uppercase">{selectedSubject} Modules</h2>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          {modules.map((title, idx) => (
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
            <div className="text-[#8CBED6] mb-4 group-hover:scale-110 transition-transform">
              {SUBJECT_ICONS[sub] || <Book size={40} />}
            </div>
            <span className="font-bold text-[#E0E0E0] group-hover:text-white uppercase text-sm md:text-base">{sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
};