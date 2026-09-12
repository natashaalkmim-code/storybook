import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { SECTIONS, getSectionIndex } from '../data/sections';
import { PAGE_COMPONENTS } from '../pages';
import { EASE, TIMING, measureScene, resolveStackConfig } from '../config/stackConfig';
import Divider from './Divider';
import Sheet from './Sheet';
import SectionPage from './SectionPage';

function getViewport() {
  return { width: window.innerWidth, height: window.innerHeight };
}

function useViewport() {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === 'undefined' ? 1440 : window.innerWidth,
    height: typeof window === 'undefined' ? 900 : window.innerHeight,
  }));

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setViewport(getViewport()));
    };
    window.addEventListener('resize', update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
    };
  }, []);

  return viewport;
}

const SHEET_LAYER_BASE = 20;
const OVERLAY_SHEET_LAYER = 1000;

function sheetLayer(index) {
  return SHEET_LAYER_BASE + index * 2;
}

function dividerLayer(index) {
  return SHEET_LAYER_BASE + index * 2 + 1;
}

export default function FolderStack() {
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const viewport = useViewport();
  const config = useMemo(() => resolveStackConfig(viewport.width), [viewport.width]);
  const activeIndex = getSectionIndex(sectionId);
  const activeId = activeIndex >= 0 ? sectionId : null;

  const stageRef = useRef(null);
  const stackRef = useRef(null);
  const dividerRefs = useRef([]);
  const sheetRefs = useRef([]);
  const sheetImageRefs = useRef([]);
  const panelRefs = useRef([]);
  const contentRefs = useRef([]);
  const timelineRef = useRef(null);
  const previousActiveRef = useRef(activeIndex);
  const mountedRef = useRef(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const measurements = useMemo(
    () => SECTIONS.map((section, index) => measureScene(section, index, viewport, config)),
    [viewport, config]
  );

  // Dividers never move again after this. Every open/close beat below only
  // ever touches the one selected sheet — the divider it sits under, and
  // every other pair on the stack, stay exactly where they are.
  const setPairRest = useCallback((index) => {
    const d = dividerRefs.current[index];
    const s = sheetRefs.current[index];
    const image = sheetImageRefs.current[index];
    const panel = panelRefs.current[index];
    const content = contentRefs.current[index];
    const m = measurements[index];

    if (d) {
      gsap.set(d, {
        ...m.divider,
        z: 0,
        zIndex: dividerLayer(index),
        xPercent: -50,
        yPercent: -50,
        opacity: 1,
        scale: 1,
        force3D: false,
      });
    }

    if (s) {
      gsap.set(s, {
        ...m.sheet,
        z: 0,
        zIndex: sheetLayer(index),
        xPercent: -50,
        yPercent: -50,
        opacity: 1,
        force3D: false,
      });
    }

    // Resting state always shows the real, tilted paper artwork. The flat
    // colour panel only exists for the open/close journey.
    if (image) gsap.set(image, { opacity: 1 });
    if (panel) gsap.set(panel, { opacity: 0 });
    if (content) gsap.set(content, { opacity: 0, y: 16, pointerEvents: 'none' });
  }, [measurements]);

  const setRestState = useCallback(() => {
    if (stackRef.current) {
      gsap.set(stackRef.current, {
        rotationX: 0,
        rotationY: 0,
        x: 0,
        y: 0,
        z: 0,
        force3D: false,
      });
    }
    SECTIONS.forEach((_, index) => setPairRest(index));
  }, [setPairRest]);

  const setOpenState = useCallback((index) => {
    setRestState();

    const selected = sheetRefs.current[index];
    const image = sheetImageRefs.current[index];
    const panel = panelRefs.current[index];
    const content = contentRefs.current[index];

    if (selected) {
      gsap.set(selected, {
        x: 0,
        y: 0,
        z: 0,
        width: viewport.width,
        height: viewport.height,
        xPercent: -50,
        yPercent: -50,
        opacity: 1,
        zIndex: OVERLAY_SHEET_LAYER,
        force3D: false,
      });
    }

    if (image) gsap.set(image, { opacity: 0 });
    if (panel) gsap.set(panel, { opacity: 1 });
    if (content) gsap.set(content, { opacity: 1, y: 0, pointerEvents: 'auto' });
  }, [measurements, setRestState, viewport.height, viewport.width]);

  useLayoutEffect(() => {
    if (timelineRef.current) timelineRef.current.kill();

    const isFirstMount = !mountedRef.current;

    if (activeIndex >= 0) {
      setOpenState(activeIndex);
      mountedRef.current = true;
      stageRef.current?.classList.add('is-ready');
      return undefined;
    }

    // Dividers and loose sheets land straight in their final, fully visible
    // position — no staggered/cascading entrance on load.
    setRestState();

    if (isFirstMount) {
      mountedRef.current = true;
      stageRef.current?.classList.add('is-ready');
    }

    return undefined;
    // Route changes are handled by the animation effect below. This layout
    // effect is for first paint and real viewport/config changes only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport.width, viewport.height, config, setRestState, setOpenState]);

  useEffect(() => {
    const from = previousActiveRef.current;
    const to = activeIndex;
    previousActiveRef.current = to;

    if (!mountedRef.current || from === to) return undefined;
    timelineRef.current?.kill();

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = reduce ? 0.08 : 1;
    const t = (value) => value * speed;

    const tl = gsap.timeline({
      onStart: () => setIsAnimating(true),
      onComplete: () => {
        setIsAnimating(false);
        timelineRef.current = null;
        if (to >= 0) contentRefs.current[to]?.focus({ preventScroll: true });
      },
    });
    timelineRef.current = tl;

    // CLOSE -----------------------------------------------------------
    // Drops straight down out of fullscreen and tucks back in behind its
    // own divider (and whatever else already sits in front of it in the
    // stack) — the z-index resets the moment the shrink starts, not after,
    // so the divider genuinely covers it on the way down like a page
    // sliding back under a folder tab. The flat colour panel is what
    // actually moves; it swaps back to the real, tilted artwork only once
    // it's essentially home.
    if (from >= 0 && to < 0) {
      const content = contentRefs.current[from];
      const image = sheetImageRefs.current[from];
      const panel = panelRefs.current[from];
      const selectedSheet = sheetRefs.current[from];
      const m = measurements[from];
      const duration = t(TIMING.close);
      const shrinkStart = t(0.08);
      const dropPortion = 0.62;
      const settlePortion = 0.38;
      const overshoot = Math.min(70, viewport.height * 0.06);

      tl.set(content, { pointerEvents: 'none' }, 0)
        .to(content, { opacity: 0, y: 10, duration: t(0.18), ease: EASE.exit }, 0)
        .set(selectedSheet, { zIndex: sheetLayer(from) }, shrinkStart)
        .to(selectedSheet, {
          x: m.sheet.x,
          width: m.sheet.width,
          height: m.sheet.height,
          duration,
          ease: EASE.standard,
          force3D: false,
        }, shrinkStart)
        // Falls past its resting spot first, then settles down into it —
        // the last beat of motion always reads top-to-bottom.
        .to(selectedSheet, {
          y: m.sheet.y - overshoot,
          duration: duration * dropPortion,
          ease: 'power2.in',
          force3D: false,
        }, shrinkStart)
        .to(selectedSheet, {
          y: m.sheet.y,
          duration: duration * settlePortion,
          ease: 'power2.out',
          force3D: false,
        }, shrinkStart + duration * dropPortion)
        .to(panel, { opacity: 0, duration: t(0.3), ease: EASE.exit }, shrinkStart + duration * 0.7)
        .to(image, { opacity: 1, duration: t(0.3), ease: EASE.enter }, shrinkStart + duration * 0.7)
        .add(() => {
          // Reached its exact resting geometry before anything else resets,
          // so this never flashes or jumps once settled.
          setPairRest(from);
        }, shrinkStart + duration + t(0.01));

      return () => tl.kill();
    }

    // OPEN --------------------------------------------------------------
    // Mirrors CLOSE: it starts at its normal stacking level — behind its
    // own divider, same as every other pair — lifts up and out from that
    // slot first, and only rises above the stack (z-index) once it's clear
    // of it. Only then does it grow to fill the screen. The flat colour
    // panel, not the tilted artwork, is what moves, so it's a clean right
    // angle throughout; the divider it came from, and every other pair,
    // never move.
    if (from < 0 && to >= 0) {
      const selectedSheet = sheetRefs.current[to];
      const selectedImage = sheetImageRefs.current[to];
      const selectedPanel = panelRefs.current[to];
      const selectedContent = contentRefs.current[to];
      const duration = t(TIMING.open);
      const liftOffset = Math.min(70, viewport.height * 0.06);
      const liftDuration = duration * 0.22;
      const growStart = liftDuration;
      const growDuration = duration - liftDuration;

      // Still tucked behind its own divider here — this is the "sliding out
      // from between the folders" beat.
      tl.to(selectedSheet, {
        y: `-=${liftOffset}`,
        duration: liftDuration,
        ease: 'power2.out',
        force3D: false,
      }, 0);

      // Clear of the stack now — safe to rise above everything and grow.
      tl.set(selectedSheet, { zIndex: OVERLAY_SHEET_LAYER }, growStart);

      tl.to(selectedSheet, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
        duration: growDuration,
        ease: EASE.standard,
        force3D: false,
      }, growStart);

      tl.to(selectedPanel, { opacity: 1, duration: t(0.16), ease: EASE.enter }, 0);
      tl.to(selectedImage, { opacity: 0, duration: t(0.16), ease: EASE.exit }, 0);

      tl.set(selectedContent, { pointerEvents: 'auto' }, duration * 0.6);
      tl.to(selectedContent, {
        opacity: 1,
        y: 0,
        duration: t(TIMING.content),
        ease: EASE.enter,
      }, duration * 0.62);

      return () => tl.kill();
    }

    return () => tl.kill();
  }, [activeIndex, measurements, setPairRest, viewport.height, viewport.width]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && activeId && !isAnimating) navigate('/');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeId, isAnimating, navigate]);

  const hoverDivider = (index, entering) => {
    if (activeId || isAnimating) return;
    const el = dividerRefs.current[index];
    if (!el) return;
    const m = measurements[index].divider;
    gsap.to(el, {
      y: entering ? m.y - 3 : m.y,
      duration: TIMING.hover,
      ease: EASE.enter,
      overwrite: true,
      force3D: false,
    });
  };

  const openSection = (id) => {
    if (isAnimating) return;
    navigate(`/${id}`);
  };

  const closeSection = () => {
    if (isAnimating) return;
    navigate('/');
  };

  return (
    <div
      ref={stageRef}
      className={`stack-stage${activeId ? ' has-open-page' : ''}`}
      style={{ '--scene-perspective': `${config.perspective}px` }}
    >
      <div ref={stackRef} className="stack3d">
        {SECTIONS.map((section, index) => {
          const Page = PAGE_COMPONENTS[section.id];
          const m = measurements[index];
          const hitWidth = m.divider.width * config.tabHitWidthRatio;
          const hitHeight = m.divider.width * config.tabHitHeightRatio;
          const hitLeft = m.divider.width * section.tabX - hitWidth / 2;

          return (
            <div className="stack-pair" key={section.id}>
              <Sheet
                ref={(el) => { sheetRefs.current[index] = el; }}
                section={section}
                isActive={activeIndex === index}
                disabled={isAnimating || Boolean(activeId)}
                onSelect={openSection}
                imageRef={(el) => { sheetImageRefs.current[index] = el; }}
                panelRef={(el) => { panelRefs.current[index] = el; }}
                contentRef={(el) => { contentRefs.current[index] = el; }}
              >
                <SectionPage title={section.label} onClose={closeSection} disabled={isAnimating}>
                  <Page />
                </SectionPage>
              </Sheet>

              <Divider
                ref={(el) => { dividerRefs.current[index] = el; }}
                section={section}
                disabled={isAnimating || Boolean(activeId)}
                onSelect={openSection}
                onHover={() => hoverDivider(index, true)}
                onLeave={() => hoverDivider(index, false)}
                hitStyle={{
                  left: `${hitLeft}px`,
                  top: 0,
                  width: `${hitWidth}px`,
                  height: `${hitHeight}px`,
                }}
              />
            </div>
          );
        })}
      </div>

      <nav className="sr-only" aria-label="Storybook Studio sections">
        {SECTIONS.map((section) => (
          <a key={section.id} href={`/${section.id}`}>{section.label}</a>
        ))}
      </nav>
    </div>
  );
}
