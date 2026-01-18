import { useCallback, useMemo, useState } from "react";

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    setState((currentState) => {
      const { past, present, future } = currentState;
      if (past.length === 0) return currentState;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((currentState) => {
      const { past, present, future } = currentState;
      if (future.length === 0) return currentState;

      const next = future[0];
      const newFuture = future.slice(1);

      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const set = useCallback((newPresent: T) => {
    setState((currentState) => {
      const { past, present } = currentState;
      
      // If state matches current, do nothing (avoid dupes)
      if (JSON.stringify(present) === JSON.stringify(newPresent)) {
        return currentState;
      }

      return {
        past: [...past, present],
        present: newPresent,
        future: [], // Clearing future on new action is standard
      };
    });
  }, []);
  
  // Helper to update present without adding to history (for transient updates during drag)
  // Wait, usually we want drag end to add to history, but drag updates to only update view.
  // The consumer should handle "commit" vs "update".
  
  const updater = useCallback((val: T | ((prev: T) => T)) => { 
        // This is a direct setter that DOES add to history.
        setState(curr => {
            const next = typeof val === 'function' ? (val as any)(curr.present) : val;
             if (JSON.stringify(curr.present) === JSON.stringify(next)) return curr;
            return {
                past: [...curr.past, curr.present],
                present: next,
                future: []
            };
        });
    }, []);

  // Raw setter for transient updates (DOES NOT add to history)
  // Wrapped in callback to stabilize reference
  const updateTransient = useCallback((val: T) => {
      setState(curr => ({ ...curr, present: val }));
  }, []);

  return useMemo(() => ({
    state: state.present,
    set, // Adds to history
    updater,
    updateTransient,
    undo,
    redo,
    canUndo,
    canRedo,
    history: state // exposing full history if needed
  }), [state.present, state, set, updater, updateTransient, undo, redo, canUndo, canRedo]);
}
