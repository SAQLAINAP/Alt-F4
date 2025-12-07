import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LearningContext, AgentType } from '../types';
import { Trophy, Zap, User, LogOut, RefreshCcw } from 'lucide-react';

export interface NavItem {
  type: AgentType;
  label: string;
  icon: React.ElementType;
  path: string;
}

interface LayoutProps {
  children?: React.ReactNode;
  context: LearningContext;
  navItems: NavItem[];
  showNav?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  context,
  navItems,
  showNav = true
}) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col md:flex-row font-sans selection:bg-[#FFE066] selection:text-black">

      {/* --- DESKTOP SIDEBAR --- */}
      {showNav && (
        <nav
          className="hidden md:flex flex-col w-64 border-r-4 border-black fixed h-screen bg-[#1A1A1A] z-50 overflow-y-auto"
          aria-label="Main Navigation"
        >
          {/* Logo Area - Clickable to reset Persona */}
          <div className="p-6 pb-2">
            <button
              onClick={() => context.setPersona(null)}
              className="flex items-center gap-3 mb-8 focus:outline-none group text-left"
              aria-label="Go to Homepage"
            >
              <div className="w-10 h-10 bg-black text-[#FFE066] flex items-center justify-center font-bold text-xl border-2 border-[#FFE066] shadow-[4px_4px_0px_0px_#8CBED6] group-hover:translate-y-[-2px] group-hover:shadow-[6px_6px_0px_0px_#8CBED6] transition-all">
                CC
              </div>
              <h1 className="text-xl font-bold tracking-tighter text-[#FFE066] leading-none group-hover:text-white transition-colors">
                CAREER<br />COMPANION
              </h1>
            </button>
          </div>

          {/* Navigation Links */}
          <ul className="flex-1 px-4 space-y-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.type}>
                  <Link
                    to={item.path}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-4 px-4 py-3 font-bold text-sm tracking-wide border-2 transition-all rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8CBED6]/50 ${isActive
                      ? 'bg-[#8CBED6] border-[#8CBED6] text-black shadow-[0px_4px_0px_0px_#6CA0B8]' // Active State
                      : 'bg-[#1A1A1A] border-transparent text-[#E0E0E0] hover:bg-[#262626] hover:border-[#404040]' // Inactive State
                      }`}
                  >
                    <item.icon size={22} className={isActive ? 'text-black' : 'text-[#FFE066]'} strokeWidth={2.5} />
                    <span className="uppercase">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop Stats & Auth Footer */}
          <div className="p-4 mt-auto border-t-4 border-black bg-[#262626] space-y-3">
            {context.persona && (
              <>
                <div className="flex items-center justify-between text-xs font-bold text-[#8CBED6]">
                  <span className="flex items-center gap-1"><Zap size={14} /> {context.streak} DAY STREAK</span>
                  <span className="flex items-center gap-1"><Trophy size={14} /> {context.xp} XP</span>
                </div>

                {/* Persona Control */}
                <div className="flex items-center gap-2 p-2 bg-[#1A1A1A] border-2 border-[#404040] rounded-lg">
                  <User size={16} className="text-[#FFE066]" />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm truncate">{context.user?.username}</p>
                    <p className="text-xs text-[#8CBED6] uppercase tracking-wide">{context.persona}</p>
                  </div>
                  <button
                    onClick={() => context.setPersona(null)}
                    className="text-[#E0E0E0] hover:text-[#FFE066] p-1"
                    title="Switch Persona"
                  >
                    <RefreshCcw size={16} />
                  </button>
                  <button
                    onClick={context.logout}
                    className="text-[#E0E0E0] hover:text-red-400 p-1"
                    title="Log Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </nav>
      )}

      {/* --- MOBILE TOP BAR --- */}
      {showNav && (
        <header className="md:hidden sticky top-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-sm border-b-2 border-[#404040] p-3 flex justify-between items-center px-4">
          <button onClick={() => context.setPersona(null)} className="w-8 h-8 bg-black text-[#FFE066] flex items-center justify-center font-bold text-sm border-2 border-[#FFE066]">CC</button>
          {context.persona && (
            <div className="flex gap-4 font-bold text-sm">
              <div className="flex items-center gap-1 text-[#FFE066]"><Trophy size={16} /> {context.xp}</div>
              <div className="flex items-center gap-1 text-[#8CBED6]"><Zap size={16} /> {context.streak}</div>
            </div>
          )}
        </header>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main
        className={`flex-1 min-h-screen flex flex-col items-center justify-start p-2 pb-24 md:p-6 md:pb-6 transition-all ${showNav ? 'md:ml-64' : ''}`}
        role="main"
      >
        <div className="w-full max-w-7xl mx-auto">
          {children || <Outlet />}
        </div>
      </main>

      {/* --- MOBILE BOTTOM NAV --- */}
      {showNav && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t-4 border-[#262626] z-50 pb-safe"
          aria-label="Mobile Navigation"
        >
          <ul className="flex justify-around items-center h-16 px-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.type} className="flex-1">
                  <Link
                    to={item.path}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full h-full flex items-center justify-center transition-all active:scale-95 focus:outline-none ${isActive
                      ? 'text-[#8CBED6] border-t-4 border-[#8CBED6] pt-1' // Active push-up effect
                      : 'text-[#555] hover:text-[#E0E0E0]'
                      }`}
                  >
                    <item.icon size={26} strokeWidth={isActive ? 3 : 2} />
                  </Link>
                </li>
              );
            })}
            {/* Mobile Logout Button integrated in Nav */}
            <li className="flex-1">
              <button
                onClick={() => context.setPersona(null)}
                className="w-full h-full flex items-center justify-center text-[#555] hover:text-[#FFE066]"
              >
                <RefreshCcw size={22} />
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};