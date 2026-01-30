import React, { useState } from 'react';
import { Modal } from '../Modal';
import { useAuth } from '../../services/firebase/hooks';
import { useTranslation } from '../../i18n/hooks';
import { Mail, Lock, User, AlertCircle, Loader } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot-password';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { signIn, signUp, signInGoogle, sendPasswordReset } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
    setSuccessMessage(null);
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        onClose();
      } else if (mode === 'signup') {
        await signUp(email, password, displayName);
        onClose();
      } else if (mode === 'forgot-password') {
        await sendPasswordReset(email);
        setSuccessMessage(t('auth.passwordResetSent') || 'Password reset email sent');
        setLoading(false); // Don't close modal, show success message
        return;
      }
    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'An error occurred');
    } finally {
      if (mode !== 'forgot-password') {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInGoogle();
      onClose();
    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'An error occurred during Google Sign In');
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    login: 'Sign In',
    signup: 'Create Account',
    'forgot-password': 'Reset Password',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titles[mode]} maxWidth="400px">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start gap-2 text-red-400 text-sm">
            <AlertCircle size={16} className="mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg flex items-start gap-2 text-green-400 text-sm">
            <span>{successMessage}</span>
          </div>
        )}

        {mode === 'signup' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium opacity-70">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={18} />
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:border-accent-amber transition-colors"
                placeholder="Your Name"
                required
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium opacity-70">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={18} />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:border-accent-amber transition-colors"
              placeholder="email@example.com"
              required
            />
          </div>
        </div>

        {mode !== 'forgot-password' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium opacity-70">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={18} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:border-accent-amber transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-accent-amber hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader className="animate-spin" size={18} /> : null}
          {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
        </button>

        {mode !== 'forgot-password' && (
          <>
            <div className="flex items-center gap-2 my-2 opacity-50">
              <div className="h-px bg-current flex-grow" />
              <span className="text-xs uppercase">Or</span>
              <div className="h-px bg-current flex-grow" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#ffffff"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#ffffff"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#ffffff"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#ffffff"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </>
        )}

        <div className="mt-2 text-center text-sm opacity-70">
          {mode === 'login' ? (
            <>
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('signup')}
                  className="text-accent-amber hover:underline"
                >
                  Sign Up
                </button>
              </p>
              <p className="mt-1">
                <button
                  type="button"
                  onClick={() => handleModeChange('forgot-password')}
                  className="text-xs hover:text-white transition-colors"
                >
                  Forgot your password?
                </button>
              </p>
            </>
          ) : mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="text-accent-amber hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="text-accent-amber hover:underline"
              >
                Back to Login
              </button>
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
};
