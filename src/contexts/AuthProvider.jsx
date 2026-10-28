import { useEffect, useMemo, useState } from 'react';
import { clearSession, readSession, registerChurch, registerUser, saveSession, signIn, signOut } from '../api/auth';
import { AuthContext } from './AuthContext';

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  useEffect(() => {
    const syncSession = () => setSession(readSession());
    window.addEventListener('kanisati:session-change', syncSession);
    return () => window.removeEventListener('kanisati:session-change', syncSession);
  }, []);

  const value = useMemo(() => {
    const account = session?.account ?? session?.user ?? session;
    const role = session?.role ?? account?.role;
    const isSignedIn = Boolean(session?.accessToken);
    const establishSession = async (action, details) => {
      const nextSession = await action(details);
      saveSession(nextSession);
      setSession(nextSession);
    };
    return {
      session,
      account,
      isSignedIn,
      accountKey: isSignedIn ? String(account?.id ?? account?.email ?? 'signed-in') : 'guest',
      canUseUserFeatures: isSignedIn && (!role || role === 'USER'),
      signIn: (credentials) => establishSession(signIn, credentials),
      registerUser: (details) => establishSession(registerUser, details),
      registerChurch: (details) => establishSession(registerChurch, details),
      signOut: async () => {
        try {
          await signOut(readSession()?.refreshToken);
        } finally {
          clearSession();
          setSession(null);
        }
      },
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
