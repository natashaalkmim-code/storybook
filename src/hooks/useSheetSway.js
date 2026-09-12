import { useEffect, useRef } from 'react';

// Subtle "candle app" style sway: each loose sheet tilts and drifts a couple
// of degrees/pixels in response to phone tilt (deviceorientation), with a
// mouse-move fallback on devices that have no orientation sensor. Values are
// smoothed (lerp) every frame so the motion feels like drift, not jitter.

const MAX_ROTATE_DEG = 3.2;
const MAX_SHIFT_PX = 7;
const LERP = 0.07;
const GAMMA_RANGE = 26; // degrees of phone tilt mapped to full sway
const BETA_CENTER = 45; // roughly "held upright" resting pitch
const BETA_RANGE = 26;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Gives each sheet a slightly different amount of sway so they don't all
// move in lockstep, like separate loose papers would.
function depthFor(index, total) {
  if (total <= 1) return 1;
  return 0.7 + (index / (total - 1)) * 0.3;
}

export function useSheetSway(tiltRefs, sectionCount, { enabled }) {
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let usingOrientation = false;
    let cancelled = false;

    const handleOrientation = (event) => {
      if (event.gamma === null || event.beta === null) return;
      usingOrientation = true;
      targetRef.current = {
        x: clamp(event.gamma / GAMMA_RANGE, -1, 1),
        y: clamp((event.beta - BETA_CENTER) / BETA_RANGE, -1, 1),
      };
    };

    const handleMouseMove = (event) => {
      if (usingOrientation) return;
      targetRef.current = {
        x: clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1),
        y: clamp((event.clientY / window.innerHeight) * 2 - 1, -1, 1),
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const requestOrientationAccess = () => {
      if (typeof DeviceOrientationEvent === 'undefined') return;
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then((state) => {
            if (!cancelled && state === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(() => {});
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS requires the permission prompt to fire from a real user gesture.
      // The whole page is tap-driven, so the first tap anywhere unlocks it.
      window.addEventListener('pointerdown', requestOrientationAccess, { once: true });
    } else {
      requestOrientationAccess();
    }

    let rafId = requestAnimationFrame(function tick() {
      const t = targetRef.current;
      const c = currentRef.current;
      c.x += (t.x - c.x) * LERP;
      c.y += (t.y - c.y) * LERP;

      const els = tiltRefs.current;
      for (let index = 0; index < els.length; index += 1) {
        const el = els[index];
        if (!el) continue;
        const depth = depthFor(index, sectionCount);
        const rotate = c.x * MAX_ROTATE_DEG * depth;
        const shiftX = c.x * MAX_SHIFT_PX * depth;
        const shiftY = c.y * MAX_SHIFT_PX * depth * 0.6;
        el.style.transform = `translate(${shiftX}px, ${shiftY}px) rotate(${rotate}deg)`;
      }

      rafId = requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('pointerdown', requestOrientationAccess);
      currentRef.current = { x: 0, y: 0 };
      targetRef.current = { x: 0, y: 0 };
      tiltRefs.current.forEach((el) => {
        if (el) el.style.transform = '';
      });
    };
  }, [enabled, tiltRefs, sectionCount]);
}
