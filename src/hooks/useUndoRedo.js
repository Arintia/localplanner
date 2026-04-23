/**
 * @file useUndoRedo.js
 * @description State-agnostic hook for managing undo/redo history stacks.
 */

import { useRef, useCallback } from "react";
import toast from "react-hot-toast";

export const useUndoRedo = (
  currentState,
  setStateCallback,
  isInternalUpdateRef,
) => {
  const historyRef = useRef([]);
  const futureRef = useRef([]);

  /**
   * Captures a snapshot of the current state.
   */
  const trackAction = useCallback((state) => {
    const snapshot = JSON.stringify(state);
    const lastSnapshot = historyRef.current[historyRef.current.length - 1];

    if (snapshot !== lastSnapshot) {
      historyRef.current.push(snapshot);
      if (historyRef.current.length > 50) historyRef.current.shift();
      futureRef.current = [];
    }
  }, []);

  /**
   * Restores the previous state from history.
   */
  const undo = useCallback(() => {
    if (historyRef.current.length <= 1) {
      toast("Nothing to undo", { icon: "↩️" });
      return;
    }

    const currentSnapshot = historyRef.current.pop();
    futureRef.current.push(currentSnapshot);

    const prevSnapshot = historyRef.current[historyRef.current.length - 1];
    const prevState = JSON.parse(prevSnapshot);

    isInternalUpdateRef.current = true;
    setStateCallback(prevState);
    toast.success("Successfully reverted last action.", {
      icon: "↩️",
      duration: 1000,
    });
  }, [setStateCallback, isInternalUpdateRef]);

  /**
   * Restores the next state from the future stack.
   */
  const redo = useCallback(() => {
    if (futureRef.current.length === 0) {
      toast("Nothing to redo", { icon: "↪️" });
      return;
    }

    const nextSnapshot = futureRef.current.pop();
    historyRef.current.push(nextSnapshot);

    const nextState = JSON.parse(nextSnapshot);

    isInternalUpdateRef.current = true;
    setStateCallback(nextState);
    toast.success("Successfully re-did the last action.", {
      icon: "↪️",
      duration: 1000,
    });
  }, [setStateCallback, isInternalUpdateRef]);

  return { trackAction, undo, redo };
};
