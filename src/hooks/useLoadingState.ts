import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

export interface UseLoadingStateReturn extends LoadingState {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: boolean) => void;
  reset: () => void;
  execute: <T>(asyncFunction: () => Promise<T>) => Promise<T | null>;
}

export const useLoadingState = (initialState: Partial<LoadingState> = {}): UseLoadingStateReturn => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    isSuccess: false,
    ...initialState,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
      error: loading ? null : prev.error, // Clear error when starting to load
      isSuccess: loading ? false : prev.isSuccess, // Clear success when starting to load
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
      isSuccess: false,
    }));
  }, []);

  const setSuccess = useCallback((success: boolean) => {
    setState(prev => ({
      ...prev,
      isSuccess: success,
      isLoading: false,
      error: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  const execute = useCallback(async <T>(asyncFunction: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      const result = await asyncFunction();
      setSuccess(true);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return null;
    }
  }, [setLoading, setError, setSuccess]);

  return {
    ...state,
    setLoading,
    setError,
    setSuccess,
    reset,
    execute,
  };
};
