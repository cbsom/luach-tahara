// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth immediately
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const googleProvider = new GoogleAuthProvider();

// Initialize App Check
const initAppCheck = () => {
    try {
        if (import.meta.env.DEV) {
            // @ts-expect-error - self.FIREBASE_APPCHECK_DEBUG_TOKEN is not in typings
            self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
            if (import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN) {
                console.log('🔧 App Check debug mode enabled');
            }
        }

        const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
        if (recaptchaSiteKey) {
            const appCheckInstance = initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider(recaptchaSiteKey),
                isTokenAutoRefreshEnabled: true,
            });
            console.log('✅ Firebase App Check initialized');

            // Diagnostics
            import('firebase/app-check').then(({ onTokenChanged }) => {
                onTokenChanged(appCheckInstance, (tokenResult) => {
                    if (tokenResult.token) {
                        console.log(
                            '🔄 App Check token refreshed:',
                            tokenResult.token.substring(0, 10) + '...'
                        );
                    }
                });
            });
        }
    } catch (e) {
        console.error('❌ App Check init failed:', e);
    }
};

initAppCheck();

// Initialize Firestore
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
    }),
});

// Analytics (Safe Init)
const initAnalytics = async () => {
    try {
        const { isSupported, getAnalytics } = await import('firebase/analytics');
        if (await isSupported()) getAnalytics(app);
    } catch (_e) {
        // Ignore analytics fail
    }
};
initAnalytics();

// Export the app instance
export default app;
