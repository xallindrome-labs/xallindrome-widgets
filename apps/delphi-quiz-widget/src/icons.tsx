// Line icons replacing emoji. Emoji render differently on every OS/version and
// read as unfinished next to a dark champagne brand; a consistent stroke set in
// a tinted tile is what makes an option list look designed rather than assembled.
// All 24x24, stroke-based, inheriting currentColor so the tile controls tone.

export type IconName =
  | "sparkle" | "wrench" | "leaf" | "tooth" | "home"
  | "bolt" | "clock" | "sun" | "hourglass"
  | "repeat" | "messages" | "message" | "messageOff"
  | "moonCheck" | "sunrise" | "shrug"
  | "note" | "clockOff" | "circleSlash"
  | "bars1" | "bars2" | "bars3" | "bars4"
  | "seed" | "chartUp" | "rocket" | "crown" | "lock"
  | "bucket" | "ghost" | "moon" | "rings" | "drop";

const P: Record<IconName, string> = {
  // niches
  sparkle: "M12 3l1.9 4.8L19 10l-5.1 2.2L12 17l-1.9-4.8L5 10l5.1-2.2zM18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z",
  wrench: "M14.7 6.3a4 4 0 0 0 5 5L15 16l-4-4zM11 12l-6 6a2 2 0 0 0 2.8 2.8l6-6",
  leaf: "M4 20c0-8 6-14 16-14 0 10-6 15-13 15M4 20c3-3 6-5 10-7",
  tooth: "M7 3.5c2 0 2.2 1 5 1s3-1 5-1c2.2 0 3 2 2.4 5.3-.5 2.6-.6 3-1 6C18 17 17.4 21 15.6 21c-1.6 0-1.5-3.6-3.6-3.6S9.9 21 8.3 21C6.6 21 6 17 5.6 13.8c-.4-3-.5-3.4-1-6C4 5.5 4.8 3.5 7 3.5z",
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H4a1 1 0 0 1-1-1z",
  // speed to lead
  bolt: "M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5.2l3.4 2",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  hourglass: "M6 2h12M6 22h12M8 2c0 4 8 6 8 10s-8 6-8 10M16 2c0 4-8 6-8 10s8 6 8 10",
  // follow-up
  repeat: "M17 2l4 4-4 4M21 6H8a5 5 0 0 0-5 5v1M7 22l-4-4 4-4M3 18h13a5 5 0 0 0 5-5v-1",
  messages: "M8 13.5h8M8 9.5h8M21 12a8 8 0 0 1-8 8H8l-5 3 1.2-4.6A8 8 0 1 1 21 12z",
  message: "M21 12a8 8 0 0 1-8 8H8l-5 3 1.2-4.6A8 8 0 1 1 21 12z",
  messageOff: "M21 12a8 8 0 0 1-8 8H8l-5 3 1.2-4.6A8 8 0 1 1 21 12zM9.5 9.5l5 5M14.5 9.5l-5 5",
  // after hours
  moonCheck: "M20 14.5A8.5 8.5 0 1 1 9.5 4a6.7 6.7 0 0 0 10.5 10.5zM9 12.5l2 2 4-4",
  sunrise: "M12 15a4 4 0 0 1 8 0M2 19h20M12 2v4M5.5 8.5 7 10M18.5 8.5 17 10M4 15h2M12 15a4 4 0 0 0-8 0",
  shrug: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.2 9.3a3 3 0 0 1 5.6 1c0 2-2.8 2.3-2.8 4M12 17.2h.01",
  // rebooking
  note: "M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM15 3v5h5M8 13h8M8 17h5",
  clockOff: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM4 4l16 16",
  circleSlash: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM5.6 5.6l12.8 12.8",
  // owner hours (magnitude)
  bars1: "M4 21V17M10 21v-4M16 21v-4M22 21v-4",
  bars2: "M4 21V13M10 21v-8M16 21v-4M22 21v-4",
  bars3: "M4 21V9M10 21V9M16 21v-8M22 21v-4",
  bars4: "M4 21V5M10 21V5M16 21V5M22 21V5",
  // revenue
  seed: "M12 21v-7M12 14c0-4 3-7 7-7 0 4-3 7-7 7zM12 14c0-3-2.5-5.5-5.5-5.5 0 3 2.5 5.5 5.5 5.5z",
  chartUp: "M3 20h18M6 20V13M11 20V9M16 20v-6M14 5h6v6",
  rocket: "M9 15c-2 1-3 3-3 6 3 0 5-1 6-3M14.5 4.5a10 10 0 0 1 5 5L14 18l-6-6zM12 9.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z",
  crown: "M3 8l4 4 5-7 5 7 4-4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z",
  lock: "M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4",
  // archetypes
  bucket: "M4 7h16l-1.6 12.2a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8zM9 3h6M12 11v5",
  ghost: "M5 21V10a7 7 0 1 1 14 0v11l-2.3-2-2.3 2-2.4-2-2.3 2L7.3 19zM9.5 9.5h.01M14.5 9.5h.01",
  moon: "M20 14.5A8.5 8.5 0 1 1 9.5 4a6.7 6.7 0 0 0 10.5 10.5z",
  rings: "M8 16a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM16 20a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
  drop: "M12 2.7s6.5 7.3 6.5 12a6.5 6.5 0 0 1-13 0c0-4.7 6.5-12 6.5-12z"
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={P[name]} />
    </svg>
  );
}
