import { createContext, useCallback, useContext } from 'react';
import { ApiError } from './api.js';

/**
 * Context lives here, apart from the provider component, so that this module
 * exports only hooks and constants and the provider module exports only a
 * component. That keeps Fast Refresh boundaries clean.
 */
export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/**
 * Wraps an async call so that a 401 anywhere in the dashboard immediately
 * clears local state and returns the operator to the login screen.
 */
export function useGuardedRequest() {
  const { handleUnauthorized } = useAuth();
  return useCallback(
    async (fn) => {
      try {
        return await fn();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) handleUnauthorized();
        throw error;
      }
    },
    [handleUnauthorized]
  );
}
