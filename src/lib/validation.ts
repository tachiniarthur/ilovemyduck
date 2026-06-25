/**
 * Lightweight, visual-only form validation for the auth screens. There is no
 * backend wired up yet, these helpers just decide when to show inline hints.
 * Swap/extend freely when real authentication is connected.
 */

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isStrongEnough(password: string): boolean {
  return password.length >= 6;
}
