import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';
import { AuthContext } from './useAuth.js';

/**
 * Holds the signed-in administrator. On mount it probes `/auth/me`; a 401 is a
 * normal, expected answer (nobody is signed in) rather than an error state.
 */
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('checking'); // checking | anonymous | authenticated

  const refresh = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
      setStatus('authenticated');
      return data.user;
    } catch {
      setUser(null);
      setStatus('anonymous');
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    setUser(data.user);
    setStatus('authenticated');
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    setUser(null);
    setStatus('anonymous');
  }, []);

  /** Called when any request 401s, so an expired session drops to the login screen. */
  const handleUnauthorized = useCallback(() => {
    setUser(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo(
    () => ({ user, status, login, logout, refresh, handleUnauthorized }),
    [user, status, login, logout, refresh, handleUnauthorized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
