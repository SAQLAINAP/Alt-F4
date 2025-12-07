import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserPersona, AgentType, LearningContext, User } from './types';
import { authService } from './services/authService';
import { firestoreService } from './services/firestoreService';
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
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          await firestoreService.saveUserProfile(user);
          const profile = await firestoreService.getUserProfile(user.uid);
          if (profile) {
            if (profile.xp !== undefined) setXp(profile.xp);
            if (profile.streak !== undefined) setStreak(profile.streak);
            if (profile.persona !== undefined) setPersona(profile.persona as UserPersona);
          }
        } catch (error) {
          console.error("Failed to sync with Firestore:", error);
        }
      } else {
        setPersona(null);
        // Optional: Reset XP/Streak or keep defaults
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setPersona(null);
  };

  const handleSetPersona = (p: UserPersona | null) => {
    setPersona(p);
    if (user && p) {
      firestoreService.updateStats(user.uid, { persona: p });
    }
  };

  const handleAddXp = (amount: number) => {
    setXp(prev => prev + amount);
    if (user) {
      firestoreService.addXp(user.uid, amount);
    }
  };

  const context: LearningContext = {
    user,
    persona,
    xp,
    streak,
    setPersona: handleSetPersona,
    addXp: handleAddXp,
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