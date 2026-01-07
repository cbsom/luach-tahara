// Firebase Services - Main Export
export { auth, db, googleProvider } from './config';
export {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOutUser as signOut,
    resetPassword,
    onAuthChange,
    getCurrentUser,
    isAuthenticated,
    getUserToken,
    updateUserProfile,
} from './auth';
export {
    getDocument,
    getUserDocuments,
    setDocument,
    updateDocument,
    deleteDocument,
    batchSetDocuments,
} from './firestore';
export {
    syncToFirebase,
    pullFromFirebase,
    fullSync,
    startAutoSync,
    stopAutoSync,
} from './sync';
export {
    useAuth,
    useSync,
    useAutoSync,
} from './hooks';
