import { useState, useCallback, useRef } from 'react';

interface UndoRedoReturn<T> {
  state: T;
  setState: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (newState: T) => void;
}

const MAX_HISTORY = 30;

export function useUndoRedo<T>(initialState: T): UndoRedoReturn<T> {
  const [state, setInternalState] = useState<T>(initialState);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);

  const setState = useCallback((newState: T) => {
    past.current = [...past.current.slice(-(MAX_HISTORY - 1)), state];
    future.current = [];
    setInternalState(newState);
  }, [state]);

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    const prev = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    future.current = [state, ...future.current];
    setInternalState(prev);
  }, [state]);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    const next = future.current[0];
    future.current = future.current.slice(1);
    past.current = [...past.current, state];
    setInternalState(next);
  }, [state]);

  const reset = useCallback((newState: T) => {
    past.current = [];
    future.current = [];
    setInternalState(newState);
  }, []);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    reset,
  };
}
