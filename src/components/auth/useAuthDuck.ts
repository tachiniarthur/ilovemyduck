"use client";

import { useCallback, useRef, useState } from "react";
import type { AuthDuckProps, DuckMood, DuckStatus } from "./AuthDuck";

/**
 * Centralises the little bit of state the auth screens feed to <AuthDuck>:
 * which field is focused, whether the password is revealed, the form status,
 * button hover and a short-lived "typing" pulse. Each page calls this once,
 * spreads `duckProps` onto the duck, and wires the returned handlers to its
 * fields and submit button so all three screens behave consistently.
 */
export function useAuthDuck(mood: DuckMood = "default") {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [status, setStatus] = useState<DuckStatus>("idle");
  const [submitHover, setSubmitHover] = useState(false);
  const [typing, setTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flag "typing" for a short moment after each keystroke.
  const notifyTyping = useCallback(() => {
    setStatus("idle");
    setTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 500);
  }, []);

  const onFieldFocus = useCallback((name: string) => setFocusedField(name), []);
  const onFieldBlur = useCallback(() => setFocusedField(null), []);

  const submitHoverHandlers = {
    onMouseEnter: () => setSubmitHover(true),
    onMouseLeave: () => setSubmitHover(false),
    onFocus: () => setSubmitHover(true),
    onBlur: () => setSubmitHover(false),
  };

  const duckProps: AuthDuckProps = {
    focusedField,
    passwordVisible,
    status,
    submitHover,
    typing,
    mood,
  };

  return {
    duckProps,
    onFieldFocus,
    onFieldBlur,
    onRevealChange: setPasswordVisible,
    notifyTyping,
    submitHoverHandlers,
    reset: useCallback(() => setStatus("idle"), []),
    fail: useCallback(() => setStatus("error"), []),
    succeed: useCallback(() => setStatus("success"), []),
  };
}
