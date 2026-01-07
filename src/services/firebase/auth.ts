// Firebase Authentication Service
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    type User,
    type UserCredential,
} from 'firebase/auth';
import { auth, googleProvider } from './config';

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
    email: string,
    password: string
): Promise<UserCredential> => {
    try {
        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error('Error signing in with email:', error);
        throw error;
    }
};

/**
 * Create new user with email and password
 */
export const signUpWithEmail = async (
    email: string,
    password: string,
    displayName?: string
): Promise<UserCredential> => {
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);

        if (displayName && credential.user) {
            await updateProfile(credential.user, { displayName });
        }

        return credential;
    } catch (error) {
        console.error('Error signing up with email:', error);
        throw error;
    }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<User> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

/**
 * Sign out (alias for compatibility)
 */
export const signOutUser = signOut;

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

/**
 * Subscribe to authentication state changes
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Get the current user
 */
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!auth.currentUser;
};

/**
 * Get user ID token
 */
export const getUserToken = async (): Promise<string | null> => {
    const user = getCurrentUser();
    if (!user) return null;
    return user.getIdToken();
};

/**
 * Update user profile
 */
export const updateUserProfile = async (updates: {
    displayName?: string;
    photoURL?: string;
}): Promise<void> => {
    const user = getCurrentUser();
    if (!user) {
        throw new Error('No user logged in');
    }
    return updateProfile(user, updates);
};
