// ---------------------------------------------------------------------------
// GEOMETRY
// ---------------------------------------------------------------------------
// Pure math only. Given a section index and the active tier config, these
// functions return the RESTING transform for a divider or a sheet. Every
// caller always recomputes from these formulas — nothing stores a "current"
// position and nudges it — which is what guarantees that opening and closing
// the stack any number of times never drifts from the original geometry.
//
// Depth model (see the brief): divider(i) sits in front of sheet(i), and
// sheet(i) sits in front of divider(i+1). That ordering falls out of the Z
// math alone, so the browser's own preserve-3d depth sort renders everything
// correctly without any manual z-index bookkeeping:
//
//   dividerZ(i) = -(i * depthStep)
//   sheetZ(i)   = dividerZ(i) - (depthStep * ratio)      [0 < ratio < 1]
//
// sheetZ(i) is always less negative than dividerZ(i+1), so sheet(i) renders
// in front of divider(i+1) — exactly the "sheet lives inside the gap"
// requirement — for any config where 0 < SHEET_OFFSET_RATIO < 1.

import { SHEET_OFFSET_RATIO } from './stackConfig';

// Every transform below is a complete, explicit set of the transform
// components the elements ever use (x, y, z, rotationX, rotationZ). GSAP
// tracks each transform component independently per element, so leaving one
// out of a target object doesn't reset it — it leaves whatever the *previous*
// tween set. Being explicit here, even about zeros, is what keeps a divider
// that was mid-transition from carrying a stray rotationX/rotationZ into its
// next resting state.

export function dividerTransform(index, config) {
  return {
    x: 0,
    y: index * config.dividerYStep,
    z: -(index * config.dividerDepthStep),
    rotationX: 0,
    rotationZ: 0,
  };
}

export function sheetRestTransform(index, config) {
  const zOffset = config.dividerDepthStep * SHEET_OFFSET_RATIO;
  const yOffset = config.dividerYStep * SHEET_OFFSET_RATIO;
  const tilt = index % 2 === 0 ? -config.sheetTiltDeg : config.sheetTiltDeg;
  return {
    x: 0,
    y: index * config.dividerYStep + yOffset,
    z: -(index * config.dividerDepthStep) - zOffset,
    rotationX: 0,
    rotationZ: tilt,
  };
}

// Where a non-active divider/sheet recedes to while another section is open —
// same resting formula, just pushed further back and toward one edge so the
// stack stays perceptible without competing with the open page.
export function edgeTransform(baseTransform, config) {
  return {
    ...baseTransform,
    x: baseTransform.x + config.edgePushX,
    z: baseTransform.z + config.edgePushZ,
  };
}

// The open-page target for a sheet: centred, frontmost, frontal (its own
// rotationX cancels the stack's resting tilt), sized to fill most of the
// viewport without exceeding the tier's ceiling. Depends on live viewport
// size, so unlike the two functions above this is computed at animation time
// rather than baked into the tier config — but it's still a pure function of
// its inputs, recalculated fresh every time, so the same no-drift guarantee
// holds: closing and reopening never accumulates error.
// NOTE on openZ: under a CSS `perspective`, translateZ isn't just a
// stacking cue — it visually SCALES the element (perspective / (perspective
// - z)). Keep config.openZ small; the open sheet doesn't need much forward
// travel to read as frontmost, since every other divider/sheet has already
// been pushed well back via edgePushZ. A large openZ (this shipped at 560
// once, by mistake) blows the sheet up ~40-50% past its width/height and
// pushes it off-screen — caught by the smoke test, not by eye.
export function sheetOpenTransform(config, viewportWidth, viewportHeight, openRatio) {
  return {
    x: 0,
    y: 0,
    z: config.openZ,
    rotationX: -config.stackRotateX,
    rotationZ: 0,
    width: Math.min(config.openWidth, viewportWidth * openRatio.width),
    height: Math.min(config.openHeight, viewportHeight * openRatio.height),
  };
}
