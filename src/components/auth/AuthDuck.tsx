"use client";

import { useEffect, useRef, useState } from "react";

export type DuckStatus = "idle" | "error" | "success";
export type DuckMood = "default" | "pensive";

export interface AuthDuckProps {
  /** Name of the field currently focused ("email" | "password" | "name") or null. */
  focusedField?: string | null;
  /** True while the password is being revealed: the duck covers its eyes. */
  passwordVisible?: boolean;
  /** Transient form state, drives the sad/happy reactions. */
  status?: DuckStatus;
  /** True while the primary button is hovered: the duck shows anticipation. */
  submitHover?: boolean;
  /** True for a short moment after each keystroke: a curious head wobble. */
  typing?: boolean;
  /** "pensive" gives the recover-password screen a thoughtful, scratching pose. */
  mood?: DuckMood;
  className?: string;
}

// How far (in SVG user units) the irises may drift inside the eye globes.
const GAZE_MAX = 5;
// How far down the duck looks when a field is focused.
const GAZE_DOWN = 6;

/**
 * The signature mascot of the auth screens: a hand-built SVG duck whose body
 * parts each animate independently. The eyes follow the pointer (or the focused
 * field on touch), the wings rise to cover the eyes when the password is
 * revealed, and the face reacts to typing, errors, success and hover. All loops
 * and the pointer-tracking are disabled under prefers-reduced-motion, leaving a
 * calm, static duck.
 */
export default function AuthDuck({
  focusedField = null,
  passwordVisible = false,
  status = "idle",
  submitHover = false,
  typing = false,
  mood = "default",
  className = "",
}: AuthDuckProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const leftIris = useRef<SVGGElement>(null);
  const rightIris = useRef<SVGGElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const [blink, setBlink] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Honour the reduced-motion preference (and react if it changes live).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Track the pointer / last touch position globally so the eyes can follow it.
  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) pointer.current = { x: t.clientX, y: t.clientY };
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  // Smoothly interpolate the irises toward their target each frame.
  useEffect(() => {
    if (reduced) {
      // Centre the gaze and stop here, no animation loop.
      if (leftIris.current) leftIris.current.style.transform = "translate(0,0)";
      if (rightIris.current) rightIris.current.style.transform = "translate(0,0)";
      return;
    }

    let raf = 0;
    const cur = { x: 0, y: 0 };

    const target = () => {
      // Eyes are hidden (covered) or squinting with joy: rest at centre.
      if (passwordVisible || status === "success") return { x: 0, y: 0 };
      // Looking at the field the user is filling in.
      if (focusedField) return { x: 0, y: GAZE_DOWN };
      const svg = svgRef.current;
      const p = pointer.current;
      if (!svg || !p) return { x: 0, y: 0 };
      const r = svg.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.34; // roughly the eye line
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(dist / 200, 1); // proportional, then capped
      return { x: (dx / dist) * GAZE_MAX * reach, y: (dy / dist) * GAZE_MAX * reach };
    };

    const loop = () => {
      const t = target();
      cur.x += (t.x - cur.x) * 0.18;
      cur.y += (t.y - cur.y) * 0.18;
      const tf = `translate(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px)`;
      if (leftIris.current) leftIris.current.style.transform = tf;
      if (rightIris.current) rightIris.current.style.transform = tf;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, focusedField, passwordVisible, status]);

  // Natural, random blinking while idle.
  useEffect(() => {
    if (reduced) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        setTimeout(() => alive && setBlink(false), 130);
        schedule();
      }, 2500 + Math.random() * 4000);
    };
    schedule();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [reduced]);

  // ---- Derived classes for each animated part -------------------------------
  const success = status === "success";
  const error = status === "error";
  const pensive = mood === "pensive" && status === "idle";

  const rootCls = success ? "is-jump" : submitHover ? "is-anticipate" : "";
  const headAnimCls = success ? "" : error ? "is-shake" : typing ? "is-wobble" : "";
  const headTiltStyle =
    focusedField && !passwordVisible
      ? { transform: "translateY(3px) rotate(4deg)" }
      : undefined;

  const leftWingCls = passwordVisible
    ? "is-cover-left"
    : success || submitHover
      ? "is-flap-left"
      : "";
  const rightWingCls = passwordVisible
    ? "is-cover-right"
    : pensive && !submitHover
      ? "is-scratch"
      : success || submitHover
        ? "is-flap-right"
        : "";

  const eyeCls = `duck-eye ${blink && !success ? "is-blinking" : ""} ${
    success ? "is-happy" : ""
  }`;
  const cheekCls = `duck-cheeks ${passwordVisible ? "is-blush" : ""}`;

  return (
    <div className={`auth-duck ${rootCls} ${className}`} aria-hidden="true">
      <svg ref={svgRef} viewBox="0 0 220 216" role="presentation">
        <g className="duck-bob">
          {/* Body */}
          <ellipse cx="110" cy="170" rx="80" ry="46" fill="#ffce3f" />
          <ellipse cx="110" cy="178" rx="54" ry="36" fill="#ffe588" />

          {/* Head + face (tilt on focus, shake/wobble on error/typing) */}
          <g className="duck-head-tilt" style={headTiltStyle}>
            <g className={`duck-head-anim ${headAnimCls}`}>
              {/* little tuft */}
              <path
                d="M101 28 c-3 -15 12 -19 13 -6 c9 -7 17 5 7 12 z"
                fill="#ffce3f"
              />
              <circle cx="110" cy="80" r="56" fill="#ffd54a" />

              {/* cheeks (blush when covering the eyes) */}
              <g className={cheekCls}>
                <ellipse cx="72" cy="96" rx="11" ry="7.5" fill="#ff8a3d" />
                <ellipse cx="148" cy="96" rx="11" ry="7.5" fill="#ff8a3d" />
              </g>

              {/* eyes */}
              <g className={eyeCls}>
                <ellipse
                  cx="88"
                  cy="74"
                  rx="15"
                  ry="16"
                  fill="#ffffff"
                  stroke="#e3d4b8"
                  strokeWidth="1.5"
                />
                <g ref={leftIris} className="duck-iris">
                  <circle cx="88" cy="76" r="7" fill="#241a12" />
                  <circle cx="85.4" cy="73" r="2.4" fill="#ffffff" />
                </g>
              </g>
              <g className={eyeCls}>
                <ellipse
                  cx="132"
                  cy="74"
                  rx="15"
                  ry="16"
                  fill="#ffffff"
                  stroke="#e3d4b8"
                  strokeWidth="1.5"
                />
                <g ref={rightIris} className="duck-iris">
                  <circle cx="132" cy="76" r="7" fill="#241a12" />
                  <circle cx="129.4" cy="73" r="2.4" fill="#ffffff" />
                </g>
              </g>

              {/* worried brows (only on error) */}
              <g className={`duck-brows ${error ? "is-on" : ""}`}>
                <path
                  d="M76 58 L98 53"
                  stroke="#b06a00"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M144 58 L122 53"
                  stroke="#b06a00"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </g>

              {/* beak */}
              <path
                d="M84 98 q26 -10 52 0 q2 12 -10 17 q-16 7 -32 0 q-12 -5 -10 -17 z"
                fill="#ff7a18"
              />
              <path
                d="M88 106 q22 9 44 0"
                stroke="#d95400"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="101" cy="101" r="1.6" fill="#d95400" />
              <circle cx="119" cy="101" r="1.6" fill="#d95400" />
            </g>
          </g>

          {/* Wings: drawn on top so they can rise to cover the face */}
          <g className={`duck-wing ${leftWingCls}`}>
            <ellipse
              cx="46"
              cy="150"
              rx="22"
              ry="34"
              fill="#ffc41f"
              stroke="#e9a900"
              strokeWidth="1.5"
              transform="rotate(12 46 150)"
            />
            <path
              d="M40 134 q5 28 3 46"
              stroke="#e9a900"
              strokeWidth="2"
              fill="none"
            />
          </g>
          <g className={`duck-wing ${rightWingCls}`}>
            <ellipse
              cx="174"
              cy="150"
              rx="22"
              ry="34"
              fill="#ffc41f"
              stroke="#e9a900"
              strokeWidth="1.5"
              transform="rotate(-12 174 150)"
            />
            <path
              d="M180 134 q-5 28 -3 46"
              stroke="#e9a900"
              strokeWidth="2"
              fill="none"
            />
          </g>

          {/* pensive thought dots */}
          <g className={`duck-dots ${pensive ? "is-on" : ""}`}>
            <circle className="dot" cx="176" cy="46" r="3" fill="#6d6052" />
            <circle className="dot" cx="190" cy="34" r="4" fill="#6d6052" />
            <circle className="dot" cx="206" cy="22" r="5" fill="#6d6052" />
          </g>

          {/* success sparkles */}
          <g className={`duck-sparkles ${success ? "is-on" : ""}`}>
            <g transform="translate(40, 44)">
              <path
                className="spark"
                d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z"
                fill="#ffce3f"
              />
            </g>
            <g transform="translate(178, 48)">
              <path
                className="spark"
                d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z"
                fill="#ff9d4d"
              />
            </g>
            <g transform="translate(110, 16)">
              <path
                className="spark"
                d="M0 -5 L1.3 -1.3 L5 0 L1.3 1.3 L0 5 L-1.3 1.3 L-5 0 L-1.3 -1.3 Z"
                fill="#ffd54a"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
