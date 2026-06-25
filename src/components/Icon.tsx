import type { SVGProps } from "react";

/**
 * A small set of stroke icons (1.75px, currentColor) used wherever the old UI
 * leaned on emoji as functional iconography. Emoji now survives only in playful
 * microcopy, never as a feature/affordance icon.
 */
export type IconName =
  | "upload"
  | "scissors"
  | "sliders"
  | "download"
  | "shield"
  | "play"
  | "check"
  | "stories"
  | "sparkle"
  | "clock"
  | "arrow-right"
  | "lock"
  | "mail"
  | "user"
  | "eye"
  | "eye-off"
  | "menu"
  | "close";

const PATHS: Record<IconName, React.ReactNode> = {
  upload: (
    <>
      <path d="M12 15V4" />
      <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
      <path d="M4 14v3.5A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V14" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M8.2 7.6 20 18" />
      <path d="M8.2 16.4 20 6" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 8h10M18 8h2" />
      <circle cx="16" cy="8" r="2" />
      <path d="M4 16h2M10 16h10" />
      <circle cx="8" cy="16" r="2" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M4 18.5h16" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 19 6v5.5c0 4.3-3 7.4-7 8.9-4-1.5-7-4.6-7-8.9V6l7-2.5Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  play: <path d="M8 5.5v13l11-6.5-11-6.5Z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  stories: (
    <>
      <rect x="6" y="3.5" width="12" height="17" rx="2.5" />
      <path d="M9 7.5h6" />
    </>
  ),
  sparkle: (
    <path d="M12 3.5c.6 3.7 1.8 4.9 5.5 5.5-3.7.6-4.9 1.8-5.5 5.5-.6-3.7-1.8-4.9-5.5-5.5 3.7-.6 4.9-1.8 5.5-5.5ZM18.5 14c.3 1.7.9 2.3 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.2 2.2-.8 2.5-2.5Z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.2l2.6 1.8" />
    </>
  ),
  "arrow-right": <path d="M4 12h15m-6-6 6 6-6 6" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7 7.5 5.5L19.5 7" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </>
  ),
  "eye-off": (
    <>
      <path d="M4 4.5 20 20m-5.3-5.3a3 3 0 0 1-4.4-4.4" />
      <path d="M9.5 6c.8-.3 1.6-.5 2.5-.5 6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.8 3.4M6.2 7.7A16 16 0 0 0 2.5 12S6 18.5 12 18.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export default function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
