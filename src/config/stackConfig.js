/*
  Closed-state geometry.

  The uploaded divider PNGs do not all have the same amount of transparent
  space above their horizontal "shoulder" line. So spacing the raw image tops
  evenly does NOT look evenly spaced.

  Instead, every divider exposes a visual shoulder anchor (stored per section)
  and those anchors are separated by one identical step. This keeps the visible
  filing rhythm uniform while preserving the original PNGs untouched.
*/
const DESKTOP = {
  perspective: 1200,
  rotateX: 0,
  stackAnchorTopRatio: 0.345,
  dividerAnchorStepRatio: 0.118,
  dividerWidthRatio: 1.01,
  dividerWidthMax: 1700,
  dividerZStep: 1,
  sheetWidthRatio: 0.42,
  sheetWidthMax: 700,
  tabHitWidthRatio: 0.24,
  tabHitHeightRatio: 0.085,
  hoverZ: 18,
  hoverY: -4,
};

const TABLET = {
  perspective: 1100,
  rotateX: 0,
  stackAnchorTopRatio: 0.345,
  dividerAnchorStepRatio: 0.118,
  dividerWidthRatio: 1.01,
  dividerWidthMax: 1200,
  dividerZStep: 1,
  sheetWidthRatio: 0.42,
  sheetWidthMax: 520,
  tabHitWidthRatio: 0.27,
  tabHitHeightRatio: 0.095,
  hoverZ: 12,
  hoverY: -3,
};

const MOBILE = {
  perspective: 950,
  rotateX: 0,
  stackAnchorTopRatio: 0.345,
  dividerAnchorStepRatio: 0.118,
  dividerWidthRatio: 1.01,
  dividerWidthMax: 900,
  dividerZStep: 1,
  sheetWidthRatio: 0.42,
  sheetWidthMax: 390,
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
  const dividerWidth = Math.min(
    viewport.width * config.dividerWidthRatio,
    config.dividerWidthMax
  );
  const dividerHeight = dividerWidth / section.dividerRatio;

  // Equal spacing is based on the visible horizontal shoulder of each folder,
  // not the raw top of its transparent PNG canvas.
  const anchorTop = viewport.height * config.stackAnchorTopRatio;
  const anchorStep = viewport.height * config.dividerAnchorStepRatio;
  const dividerAnchorY = anchorTop + index * anchorStep;
  const dividerTop = dividerAnchorY - dividerWidth * section.shoulderYRatio;
  const dividerY = dividerTop + dividerHeight / 2 - viewport.height / 2;
  const dividerZ = index * config.dividerZStep;

  // The loose-paper placement is intentionally art-directed per section to
  // match the supplied composition, while remaining responsive through ratios.
  const sheetWidthRatio = section.sheetWidthRatio ?? config.sheetWidthRatio;
  const sheetWidth = Math.min(
    viewport.width * sheetWidthRatio,
    section.sheetWidthMax ?? config.sheetWidthMax
  );
  const sheetHeight = sheetWidth / section.sheetRatio;
  const sheetTop = viewport.height * section.sheetTopRatio;
  const sheetX = viewport.width * (section.sheetXRatio ?? 0);
  const sheetY = sheetTop + sheetHeight / 2 - viewport.height / 2;

  // Closed-state depth is intentionally almost frontal, matching the supplied
  // mockup. The 3D separation happens during hover/open transitions.
  const sheetZ = dividerZ - (section.sheetDepthOffset ?? 0.5);

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
      x: sheetX,
      y: sheetY,
      z: sheetZ,
      rotationZ: 0,
    },
  };
}
