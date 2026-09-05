/*
  One geometry system controls the entire closed stack.

  Crucially:
  - every divider top is separated by exactly dividerYStep
  - every divider depth is separated by exactly dividerZStep
  - each sheet sits BEHIND its own divider, but INSIDE the fixed interval
    between that divider and the divider directly behind it
  - no section has hand-tuned translateY / translateZ values
*/
const DESKTOP = {
  perspective: 1250,
  rotateX: 55,
  stackTopRatio: 0.39,
  dividerWidthRatio: 1.12,
  dividerWidthMax: 2100,
  dividerYStep: 190,
  dividerZStep: 70,
  sheetBetweenRatio: 0.58,
  sheetBehindZRatio: 0.2,
  sheetWidthRatio: 0.34,
  sheetWidthMax: 560,
  tabHitWidthRatio: 0.24,
  tabHitHeightRatio: 0.085,
  hoverZ: 18,
  hoverY: -4,
};

const TABLET = {
  perspective: 1050,
  rotateX: 50,
  stackTopRatio: 0.405,
  dividerWidthRatio: 1.22,
  dividerWidthMax: 1450,
  dividerYStep: 145,
  dividerZStep: 52,
  sheetBetweenRatio: 0.58,
  sheetBehindZRatio: 0.2,
  sheetWidthRatio: 0.39,
  sheetWidthMax: 440,
  tabHitWidthRatio: 0.27,
  tabHitHeightRatio: 0.095,
  hoverZ: 12,
  hoverY: -3,
};

const MOBILE = {
  perspective: 850,
  rotateX: 35,
  stackTopRatio: 0.48,
  dividerWidthRatio: 1.42,
  dividerWidthMax: 900,
  dividerYStep: 82,
  dividerZStep: 34,
  sheetBetweenRatio: 0.58,
  sheetBehindZRatio: 0.2,
  sheetWidthRatio: 0.52,
  sheetWidthMax: 350,
  tabHitWidthRatio: 0.32,
  tabHitHeightRatio: 0.12,
  hoverZ: 0,
  hoverY: 0,
};

export const TIMING = {
  intro: 1.0,
  separate: 0.42,
  open: 0.95,
  surface: 0.42,
  content: 0.38,
  close: 0.86,
  hover: 0.3,
};

export const EASE = {
  standard: 'power3.inOut',
  enter: 'power3.out',
  exit: 'power2.inOut',
};

export function resolveStackConfig(width) {
  if (width < 640) return MOBILE;
  if (width < 1024) return TABLET;
  return DESKTOP;
}

export function measureScene(section, index, viewport, config) {
  const dividerWidth = Math.min(viewport.width * config.dividerWidthRatio, config.dividerWidthMax);
  const dividerHeight = dividerWidth / section.dividerRatio;

  // A divider's *top edge* follows one constant step. Its different source
  // image height does not affect the spacing of the stack.
  const dividerTop = viewport.height * config.stackTopRatio + index * config.dividerYStep;
  const dividerY = dividerTop + dividerHeight / 2 - viewport.height / 2;
  const dividerZ = index * config.dividerZStep;

  const sheetWidth = Math.min(viewport.width * config.sheetWidthRatio, config.sheetWidthMax);
  const sheetHeight = sheetWidth / section.sheetRatio;

  // For index > 0 this lands the sheet between the previous divider and this
  // divider. It is slightly farther from the camera than its own divider, so
  // the folder genuinely sits in front of its paper.
  const sheetTop = dividerTop - config.dividerYStep * config.sheetBetweenRatio;
  const sheetY = sheetTop + sheetHeight / 2 - viewport.height / 2;
  const sheetZ = dividerZ - config.dividerZStep * config.sheetBehindZRatio;

  return {
    divider: {
      width: dividerWidth,
      height: dividerHeight,
      x: 0,
      y: dividerY,
      z: dividerZ,
      rotationZ: 0,
    },
    sheet: {
      width: sheetWidth,
      height: sheetHeight,
      x: 0,
      y: sheetY,
      z: sheetZ,
      rotationZ: 0,
    },
  };
}
