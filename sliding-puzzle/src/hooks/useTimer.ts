import { useState, useEffect, useRef, useCallback } from "react";

export function useTimer(isActive: boolean, initialSeconds: number = 0) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = globalThis.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const resetTimer = useCallback(() => {
    setSeconds(0);
  }, []);

  const formatTime = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return { seconds, setSeconds, resetTimer, formatTime };
}
