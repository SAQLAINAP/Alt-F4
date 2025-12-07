import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserPersona, AgentType, LearningContext, User } from './types';
import { authService } from './services/authService';
import { Layout } from './components/Layout';
import { AuthScreen } from './components/AuthScreen';
import { PersonaSelector } from './components/PersonaSelector';
import { VisionAgent } from './components/VisionAgent';
import { TutorAgent } from './components/TutorAgent';
import { IllustrateAgent } from './components/IllustrateAgent';
import { LessonsAgent } from './components/LessonsAgent';
import { Eye, MessageCircle, Clapperboard, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [persona, setPersona] = useState<UserPersona | null>(null);
  const [xp, setXp] = useState(1250);
  const [streak, setStreak] = useState(5);

  // Check for existing session on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setPersona(null);
  };

  const context: LearningContext = {
    user,
    persona,
    xp,
    streak,
    setPersona,
    addXp: (amount) => setXp(prev => prev + amount),
    logout: handleLogout
  };

  const navItems = [
    { type: AgentType.LESSONS, label: 'LESSONS', icon: BookOpen, path: '/lessons' },
    { type: AgentType.TUTOR, label: 'TUTOR', icon: MessageCircle, path: '/tutor' },
    { type: AgentType.VISION, label: 'VISION', icon: Eye, path: '/vision' },
    { type: AgentType.ILLUSTRATE, label: 'ILLUSTRATE', icon: Clapperboard, path: '/illustrate' },
  ];

  // 1. Auth Check
  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  // 2. Persona Check (Layout wraps this to allow "Logo Click" to work)
  if (!persona) {
    return (
      <Layout context={context} navItems={navItems} showNav={false}>
        <PersonaSelector onSelect={setPersona} />
      </Layout>
    );
  }

  // 3. Main Application
  return (
    <Routes>
      <Route path="/" element={<Layout context={context} navItems={navItems} />}>
        <Route index element={<Navigate to="/lessons" replace />} />
        <Route path="lessons" element={
          <div className="w-full animate-fade-in-up">
            <LessonsAgent persona={persona} addXp={context.addXp} />
          </div>
        } />
        <Route path="tutor" element={
          <div className="w-full animate-fade-in-up">
            <TutorAgent persona={persona} addXp={context.addXp} />
          </div>
        } />
        <Route path="vision" element={
          <div className="w-full animate-fade-in-up">
            <VisionAgent persona={persona} addXp={context.addXp} />
          </div>
        } />
        <Route path="illustrate" element={
          <div className="w-full animate-fade-in-up">
            <IllustrateAgent persona={persona} addXp={context.addXp} />
          </div>
        } />
        <Route path="*" element={<Navigate to="/lessons" replace />} />
      </Route>
    </Routes>
  );
};

export default App;