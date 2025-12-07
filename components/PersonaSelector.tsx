import React from 'react';
import { UserPersona } from '../types';
import { GraduationCap, Briefcase, Glasses } from 'lucide-react';

interface PersonaSelectorProps {
  onSelect: (persona: UserPersona) => void;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter bg-[#FFE066] text-black inline-block border-4 border-black p-4 shadow-[8px_8px_0px_0px_#8CBED6] transform -rotate-2">
          Who are you?
        </h2>
        <p className="text-xl font-medium mt-4 text-[#E0E0E0]">
          The Router Agent will customize your experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
        {/* Card 1 */}
        <button
          onClick={() => onSelect(UserPersona.STUDENT)}
          className="group relative bg-[#262626] border-4 border-[#FFE066] p-8 flex flex-col items-center gap-4 transition-all hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#8CBED6]"
        >
          <div className="bg-[#FFE066] text-black p-4 border-2 border-black rounded-full group-hover:scale-110 transition-transform">
            <GraduationCap size={48} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-bold uppercase text-[#FFE066]">Student</h3>
          <p className="text-center text-sm font-medium text-[#E0E0E0]">
            Building foundations. Help me understand concepts clearly.
          </p>
        </button>

        {/* Card 2 */}
        <button
          onClick={() => onSelect(UserPersona.FRESHER)}
          className="group relative bg-[#262626] border-4 border-[#8CBED6] p-8 flex flex-col items-center gap-4 transition-all hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#FFE066]"
        >
          <div className="bg-[#8CBED6] text-black p-4 border-2 border-black rounded-full group-hover:scale-110 transition-transform">
            <Briefcase size={48} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-bold uppercase text-[#8CBED6]">Fresher</h3>
          <p className="text-center text-sm font-medium text-[#E0E0E0]">
            Job hunting. Prepare me for interviews and real-world tasks.
          </p>
        </button>

        {/* Card 3 */}
        <button
          onClick={() => onSelect(UserPersona.EXPERIENCED)}
          className="group relative bg-[#262626] border-4 border-white p-8 flex flex-col items-center gap-4 transition-all hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#FFE066]"
        >
          <div className="bg-white text-black p-4 border-2 border-black rounded-full group-hover:scale-110 transition-transform">
            <Glasses size={48} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-bold uppercase text-white">Pro</h3>
          <p className="text-center text-sm font-medium text-[#E0E0E0]">
            Leveling up. Give me the high-level strategy and nuance.
          </p>
        </button>
      </div>
    </div>
  );
};