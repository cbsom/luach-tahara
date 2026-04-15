// React hooks for Firebase authentication and sync
import { useState, useEffect, useCallback } from 'react';
import { type User } from 'firebase/auth';
import {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOutUser,
    resetPassword,
    onAuthChange,
    getCurrentUser,
} from './auth';
import {
    syncToFirebase,
    pullFromFirebase,
    fullSync,
    startAutoSync,
    stopAutoSync,
    forceMarkEverythingPending as markEverythingPending,
} from './sync';

/**
 * Hook to manage authentication state
 */
export function useAuth() {
    const [user, setUser] = useState<User | null>(getCurrentUser());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            setUser(user);
            setLoading(false);

            // Start auto-sync when user logs in
            if (user) {
                startAutoSync();
            } else {
                stopAutoSync();
            }
        });

        return () => {
            unsubscribe();
            stopAutoSync();
        };
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            setError(null);
            await signInWithEmail(email, password);
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, []);

    const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
        try {
            setError(null);
            await signUpWithEmail(email, password, displayName);
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, []);

    const signInGoogle = useCallback(async () => {
        try {
            setError(null);
            await signInWithGoogle();
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            setError(null);
            await signOutUser();
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, []);

    const sendPasswordReset = useCallback(async (email: string) => {
        try {
            setError(null);
            await resetPassword(email);
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, []);

    return {
        user,
        loading,
        error,
        signIn,
        signUp,
        signInGoogle,
        signOut,
        sendPasswordReset,
        isAuthenticated: !!user,
    };
}

/**
 * Hook to manage sync state
 */
export function useSync() {
    const [syncing, setSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [syncError, setSyncError] = useState<string | null>(null);

    const sync = useCallback(async () => {
        setSyncing(true);
        setSyncError(null);

        try {
            const result = await syncToFirebase();

            if (result.success) {
                setLastSyncTime(new Date());
            } else {
                setSyncError(result.error || 'Sync failed');
            }

            return result;
        } finally {
            setSyncing(false);
        }
    }, []);

    const pull = useCallback(async () => {
        setSyncing(true);
        setSyncError(null);

        try {
            const result = await pullFromFirebase();

            if (result.success) {
                setLastSyncTime(new Date());
            } else {
                setSyncError(result.error || 'Pull failed');
            }

            return result;
        } finally {
            setSyncing(false);
        }
    }, []);

    const fullSyncNow = useCallback(async () => {
        setSyncing(true);
        setSyncError(null);

        try {
            const result = await fullSync();

            if (result.success) {
                setLastSyncTime(new Date());
            } else {
                setSyncError(result.error || 'Full sync failed');
            }

            return result;
        } finally {
            setSyncing(false);
        }
    }, []);

    const forceFullSync = useCallback(async () => {
        setSyncing(true);
        setSyncError(null);
        try {
            await markEverythingPending();
            const result = await syncToFirebase();
            if (result.success) {
                setLastSyncTime(new Date());
            } else {
                setSyncError(result.error || 'Force sync failed');
            }
            return result;
        } finally {
            setSyncing(false);
        }
    }, []);

    return {
        syncing,
        lastSyncTime,
        syncError,
        sync,
        pull,
        fullSync: fullSyncNow,
        forceFullSync,
    };
}

/**
 * Hook to automatically sync on mount and when user logs in
 */
export function useAutoSync(enabled = true) {
    const { user } = useAuth();
    const { fullSync } = useSync();

    useEffect(() => {
        if (enabled && user) {
            // Perform initial sync when user logs in
            fullSync();
        }
    }, [enabled, user, fullSync]);

    // Force Firestore to re-sync when tab regains focus or network reconnects
    useEffect(() => {
        if (!enabled || !user) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                console.log("👁️ Tab became visible — nudging Firestore to sync...");
            }
        };

        const handleOnline = () => {
            console.log("🌐 Network reconnected — Firestore will auto-resume listeners");
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("online", handleOnline);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("online", handleOnline);
        };
    }, [enabled, user]);
}
