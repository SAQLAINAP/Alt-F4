import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { User, UserPersona } from '../types';

export const firestoreService = {
    // Create or update user profile
    saveUserProfile: async (user: User) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Initialize new user profile
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                xp: 0,
                streak: 0,
                persona: null,
                createdAt: new Date().toISOString()
            });
        } else {
            // Update existing auth info if changed
            await updateDoc(userRef, {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                lastLogin: new Date().toISOString()
            });
        }
    },

    getUserProfile: async (uid: string) => {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data();
        }
        return null;
    },

    updateStats: async (uid: string, data: { xp?: number; streak?: number; persona?: UserPersona }) => {
        const userRef = doc(db, 'users', uid);
        // Use merging or specific updates
        // For XP we might want increment if passing delta, but here we assume absolute values or handle logic elsewhere.
        // Let's assume we pass the new value or use increment for adding.
        // If exact value:
        await updateDoc(userRef, data);
    },

    addXp: async (uid: string, amount: number) => {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            xp: increment(amount)
        });
    }
};
