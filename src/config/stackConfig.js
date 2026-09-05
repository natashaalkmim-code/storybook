// ---------------------------------------------------------------------------
// STACK CONFIG
// ---------------------------------------------------------------------------
// The single source of truth for the folder stack's geometry and timing.
// Nothing in the components should hardcode a translateZ/translateY/duration —
// it should read from here. Tune the scene by editing the numbers below, not
// by touching FolderStack.jsx, Divider.jsx or Sheet.jsx.
//
// Three tiers (desktop / tablet / mobile) exist because a steep, deep 3D
// scene that reads as "depth" on a large screen reads as "clutter" on a
// small one. getStackConfig() resolves the right tier from viewport width;
// everything downstream (geometry.js, FolderStack.jsx) just consumes numbers.

const TIERS = {
  desktop: {
    id: 'desktop',
    minWidth: 900,
    perspective: 1800, // distance of the "camera" — bigger = flatter depth
    dividerDepthStep: 88, // z distance between one divider and the next
    dividerYStep: 66, // vertical cascade between one divider and the next
    stackRotateX: 12, // resting tilt of the whole stack, degrees
    dividerWidth: 460, // resting width of a divider, px
    dividerHeight: 128, // resting height of a divider, px
    sheetWidth: 352, // resting width of a sheet, px
    sheetHeight: 460, // resting height of a sheet, px
    sheetTiltDeg: 2.5, // alternating paper tilt at rest
    hoverLift: 30, // extra z travel on hover
    hoverShift: 14, // x travel on hover
    parallaxRange: 3, // max degrees of pointer-driven rotation
    openZ: 70,
    openWidth: 860,
    openHeight: 860,
    edgePushX: -190, // how far the resting stack slides toward the edge when a page is open
    edgePushZ: -150,
  },
  tablet: {
    id: 'tablet',
    minWidth: 620,
    perspective: 1500,
    dividerDepthStep: 62,
    dividerYStep: 50,
    stackRotateX: 9,
    dividerWidth: 360,
    dividerHeight: 104,
    sheetWidth: 288,
    sheetHeight: 372,
    sheetTiltDeg: 2,
    hoverLift: 20,
    hoverShift: 10,
    parallaxRange: 1.5,
    openZ: 55,
    openWidth: 560,
    openHeight: 680,
    edgePushX: -120,
    edgePushZ: -110,
  },
  mobile: {
    id: 'mobile',
    minWidth: 0,
    perspective: 1100,
    dividerDepthStep: 34,
    dividerYStep: 42, // taller than desktop's ratio to sheetHeight — mobile has less width to expose a tab via side overhang, so it leans on vertical gap instead
    stackRotateX: 5,
    dividerWidth: 268,
    dividerHeight: 78,
    sheetWidth: 216,
    sheetHeight: 208, // resting peek only — smaller than desktop's ratio on purpose, so every tab keeps a comfortable uncovered strip on a narrow screen. Doesn't affect reading size (see openHeight).
    sheetTiltDeg: 1.2,
    hoverLift: 0, // no hover state on touch
    hoverShift: 0,
    parallaxRange: 0, // no parallax on touch
    openZ: 35,
    openWidth: 340,
    openHeight: 460,
    edgePushX: -60,
    edgePushZ: -60,
  },
};

// Fraction of the divider-to-divider gap (in both Z and Y) that a sheet sits
// at. One ratio drives both axes so the sheet never "pushes" the following
// divider further away — see src/config/geometry.js.
export const SHEET_OFFSET_RATIO = 0.46;

// How much extra open width/height to allow for, as a fraction of the
// viewport, on top of each tier's openWidth/openHeight ceiling.
export const OPEN_VIEWPORT_RATIO = { width: 0.9, height: 0.86 };

export const DURATION = {
  hover: 0.35,
  navShift: 0.55, // other dividers making room
  separate: 0.5, // the clicked divider stepping apart
  open: 1.05, // sheet flight to full page
  close: 0.8,
  content: 0.5, // inner page content fade/rise once open
  intro: 1.2,
};

// Smooth, non-elastic curves only — no bounce/back/elastic anywhere.
export const EASE = {
  standard: 'power3.inOut',
  enter: 'power3.out',
  exit: 'power2.inOut',
  soft: 'power2.out',
};

function pickTier(width) {
  if (width >= TIERS.desktop.minWidth) return TIERS.desktop;
  if (width >= TIERS.tablet.minWidth) return TIERS.tablet;
  return TIERS.mobile;
}

export function getStackConfig(width) {
  const w = typeof width === 'number' ? width : typeof window !== 'undefined' ? window.innerWidth : 1200;
  return pickTier(w);
}

export const BREAKPOINTS = TIERS;
