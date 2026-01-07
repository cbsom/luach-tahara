// Authentication Store - Zustand
import { create } from 'zustand';
import { User } from 'firebase/auth';
import { signInWithGoogle, signOut, onAuthChange } from '@/services/firebase';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;

    // Actions
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    initialize: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    error: null,

    signIn: async () => {
        try {
            set({ loading: true, error: null });
            const user = await signInWithGoogle();
            set({ user, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to sign in',
                loading: false,
            });
        }
    },

    signOut: async () => {
        try {
            set({ loading: true, error: null });
            await signOut();
            set({ user: null, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to sign out',
                loading: false,
            });
        }
    },

    initialize: () => {
        // Subscribe to auth state changes
        const unsubscribe = onAuthChange((user) => {
            set({ user, loading: false });
        });

        // Return cleanup function
        return unsubscribe;
    },

    clearError: () => set({ error: null }),
}));
