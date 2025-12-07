import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from './firebase'; // Adjust path if needed
import { User } from '../types';

export const authService = {
  // Map Firebase User to App User
  mapUser: (firebaseUser: FirebaseUser): User => {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
    };
  },

  register: async (email: string, password: string): Promise<User> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return authService.mapUser(result.user);
  },

  login: async (email: string, password: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return authService.mapUser(result.user);
  },

  loginWithGoogle: async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return authService.mapUser(result.user);
  },

  logout: async () => {
    await signOut(auth);
  },

  getCurrentUser: (): User | null => {
    // Note: Firebase auth state is async. 
    // This synchronous method might not work as expected for initial load if not already cached.
    // However, for compatibility with existing App.tsx, we try to get current user.
    // Ideally, App.tsx should subscribe to onAuthStateChanged.
    const currentUser = auth.currentUser;
    return currentUser ? authService.mapUser(currentUser) : null;
  },

  // New method to subscribe to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? authService.mapUser(firebaseUser) : null);
    });
  }
};