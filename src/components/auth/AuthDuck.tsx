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
        {/* Soft, hand-illustrated shading: warm volume gradients, a beak with
            two mandibles, layered feathers and catch-lit eyes. The structural
            groups, refs and class names are untouched so every animation in the
            stylesheet keeps driving the same parts. */}
        <defs>
          <radialGradient id="duckBody" cx="38%" cy="24%" r="86%">
            <stop offset="0%" stopColor="#ffe79a" />
            <stop offset="48%" stopColor="#ffc62a" />
            <stop offset="100%" stopColor="#e59c05" />
          </radialGradient>
          <radialGradient id="duckHead" cx="36%" cy="26%" r="84%">
            <stop offset="0%" stopColor="#ffe9a6" />
            <stop offset="50%" stopColor="#ffcf3f" />
            <stop offset="100%" stopColor="#eaa206" />
          </radialGradient>
          <linearGradient id="duckBelly" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff4c8" />
            <stop offset="100%" stopColor="#ffe287" />
          </linearGradient>
          <linearGradient id="duckBeak" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffb152" />
            <stop offset="55%" stopColor="#fb841a" />
            <stop offset="100%" stopColor="#e35e00" />
          </linearGradient>
          <linearGradient id="duckBeakLow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f3790d" />
            <stop offset="100%" stopColor="#cf5300" />
          </linearGradient>
          <linearGradient id="duckWing" x1="0.15" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#ffd85d" />
            <stop offset="100%" stopColor="#eaa00a" />
          </linearGradient>
          <radialGradient id="duckCheek" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ffa367" />
            <stop offset="100%" stopColor="#ff7c3c" />
          </radialGradient>
        </defs>

        <g className="duck-bob">
          {/* Contact shadow on the ground */}
          <ellipse cx="110" cy="208" rx="60" ry="8" fill="#bf8400" opacity="0.15" />

          {/* Tail feathers peeking out behind the body */}
          <path
            d="M176 148 q26 -8 35 3 q-10 9 -25 13 q-12 2 -10 -16 z"
            fill="url(#duckWing)"
            stroke="#e09a00"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Body */}
          <ellipse cx="110" cy="170" rx="80" ry="46" fill="url(#duckBody)" />
          {/* Lighter chest / belly */}
          <path
            d="M70 156 q40 48 80 0 q-5 42 -40 42 q-35 0 -40 -42 z"
            fill="url(#duckBelly)"
            opacity="0.9"
          />
          {/* Rim light across the top of the body */}
          <path
            d="M42 154 q68 -50 136 0"
            stroke="#fff2c4"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Head + face (tilt on focus, shake/wobble on error/typing) */}
          <g className="duck-head-tilt" style={headTiltStyle}>
            <g className={`duck-head-anim ${headAnimCls}`}>
              {/* topknot quiff */}
              <path
                d="M112 26 c-3 -14 -15 -15 -16 -4 c6 -3 11 0 12 6 c1 -12 13 -14 14 -4 c1 5 -3 9 -9 11 z"
                fill="url(#duckHead)"
                stroke="#e7a705"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* head */}
              <path
                d="M110 22 C142 22 167 45 167 78 C167 110 144 134 110 134 C76 134 53 110 53 78 C53 45 78 22 110 22 Z"
                fill="url(#duckHead)"
              />
              {/* forehead highlight + soft jaw shadow for volume */}
              <ellipse cx="92" cy="50" rx="30" ry="19" fill="#fff1c2" opacity="0.45" />
              <path
                d="M66 104 q44 30 88 0 q-16 28 -44 28 q-28 0 -44 -28 z"
                fill="#e6a200"
                opacity="0.16"
              />

              {/* soft sockets to set the eyes into the face */}
              <ellipse cx="88" cy="75" rx="17" ry="18.5" fill="#eaad12" opacity="0.32" />
              <ellipse cx="132" cy="75" rx="17" ry="18.5" fill="#eaad12" opacity="0.32" />

              {/* cheeks (blush when covering the eyes) */}
              <g className={cheekCls}>
                <ellipse cx="69" cy="99" rx="12" ry="8" fill="url(#duckCheek)" />
                <ellipse cx="151" cy="99" rx="12" ry="8" fill="url(#duckCheek)" />
              </g>

              {/* eyes */}
              <g className={eyeCls}>
                <ellipse
                  cx="88"
                  cy="74"
                  rx="15.5"
                  ry="17"
                  fill="#ffffff"
                  stroke="#e7cfa0"
                  strokeWidth="1.2"
                />
                <ellipse cx="88" cy="65" rx="13" ry="5" fill="#e9d4ab" opacity="0.4" />
                <g ref={leftIris} className="duck-iris">
                  <circle cx="88" cy="76" r="7.6" fill="#2b1d10" />
                  <circle cx="85" cy="72.5" r="2.8" fill="#ffffff" />
                  <circle cx="91" cy="79" r="1.3" fill="#ffffff" opacity="0.8" />
                </g>
              </g>
              <g className={eyeCls}>
                <ellipse
                  cx="132"
                  cy="74"
                  rx="15.5"
                  ry="17"
                  fill="#ffffff"
                  stroke="#e7cfa0"
                  strokeWidth="1.2"
                />
                <ellipse cx="132" cy="65" rx="13" ry="5" fill="#e9d4ab" opacity="0.4" />
                <g ref={rightIris} className="duck-iris">
                  <circle cx="132" cy="76" r="7.6" fill="#2b1d10" />
                  <circle cx="129" cy="72.5" r="2.8" fill="#ffffff" />
                  <circle cx="135" cy="79" r="1.3" fill="#ffffff" opacity="0.8" />
                </g>
              </g>

              {/* worried brows (only on error) */}
              <g className={`duck-brows ${error ? "is-on" : ""}`}>
                <path
                  d="M74 56 q12 -7 24 -3"
                  stroke="#b06a00"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M146 56 q-12 -7 -24 -3"
                  stroke="#b06a00"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>

              {/* beak: lower mandible behind, upper mandible on top */}
              <path
                d="M89 108 q21 9 42 0 q-3 13 -21 13 q-18 0 -21 -13 z"
                fill="url(#duckBeakLow)"
              />
              <path
                d="M82 95 q28 -12 56 0 q1 11 -9 16 q-19 8 -38 0 q-10 -5 -9 -16 z"
                fill="url(#duckBeak)"
                stroke="#cf560a"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
              <path
                d="M93 96 q17 -6 34 0"
                stroke="#ffd7a3"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.7"
              />
              <ellipse cx="101" cy="100" rx="1.7" ry="1.2" fill="#b8480a" />
              <ellipse cx="119" cy="100" rx="1.7" ry="1.2" fill="#b8480a" />
            </g>
          </g>

          {/* Wings: drawn on top so they can rise to cover the face */}
          <g className={`duck-wing ${leftWingCls}`}>
            <path
              d="M40 124 q-14 22 -6 44 q5 13 18 14 q12 -30 6 -58 q-9 -6 -18 0 z"
              fill="url(#duckWing)"
              stroke="#e09a00"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M40 138 q4 22 8 36"
              stroke="#dd9500"
              strokeWidth="1.6"
              fill="none"
              opacity="0.55"
            />
            <path
              d="M49 134 q4 22 7 34"
              stroke="#dd9500"
              strokeWidth="1.3"
              fill="none"
              opacity="0.4"
            />
          </g>
          <g className={`duck-wing ${rightWingCls}`}>
            <path
              d="M180 124 q14 22 6 44 q-5 13 -18 14 q-12 -30 -6 -58 q9 -6 18 0 z"
              fill="url(#duckWing)"
              stroke="#e09a00"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M180 138 q-4 22 -8 36"
              stroke="#dd9500"
              strokeWidth="1.6"
              fill="none"
              opacity="0.55"
            />
            <path
              d="M171 134 q-4 22 -7 34"
              stroke="#dd9500"
              strokeWidth="1.3"
              fill="none"
              opacity="0.4"
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
