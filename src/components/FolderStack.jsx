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
const OVERLAY_DIVIDER_LAYER = 1001;

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
  const surfaceRefs = useRef([]);
  const contentRefs = useRef([]);
  const timelineRef = useRef(null);
  const previousActiveRef = useRef(activeIndex);
  const mountedRef = useRef(false);
  const introPlayedRef = useRef(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const measurements = useMemo(
    () => SECTIONS.map((section, index) => measureScene(section, index, viewport, config)),
    [viewport, config]
  );

  const setPairRest = useCallback((index) => {
    const d = dividerRefs.current[index];
    const s = sheetRefs.current[index];
    const image = sheetImageRefs.current[index];
    const surface = surfaceRefs.current[index];
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
        borderRadius: 0,
        scaleX: 1,
        scaleY: 1,
        force3D: false,
      });
    }

    if (image) gsap.set(image, { opacity: 1 });
    if (surface) gsap.set(surface, { opacity: 0 });
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

  const setNonSelectedRest = useCallback((selectedIndex) => {
    SECTIONS.forEach((_, index) => {
      if (index !== selectedIndex) setPairRest(index);
    });
  }, [setPairRest]);

  const setOpenState = useCallback((index) => {
    setRestState();

    const selected = sheetRefs.current[index];
    const divider = dividerRefs.current[index];
    const image = sheetImageRefs.current[index];
    const surface = surfaceRefs.current[index];
    const content = contentRefs.current[index];
    const m = measurements[index];

    if (selected) {
      gsap.set(selected, {
        x: 0,
        y: 0,
        z: 0,
        width: viewport.width + 2,
        height: viewport.height + 2,
        xPercent: -50,
        yPercent: -50,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        zIndex: OVERLAY_SHEET_LAYER,
        force3D: false,
      });
    }

    if (divider) {
      gsap.set(divider, {
        ...m.divider,
        y: m.divider.y + viewport.height * 0.9,
        z: 0,
        zIndex: OVERLAY_DIVIDER_LAYER,
        xPercent: -50,
        yPercent: -50,
        opacity: 0,
        force3D: false,
      });
    }

    if (image) gsap.set(image, { opacity: 0 });
    if (surface) gsap.set(surface, { opacity: 1 });
    if (content) gsap.set(content, { opacity: 1, y: 0, pointerEvents: 'auto' });
  }, [measurements, setRestState, viewport.height, viewport.width]);

  useLayoutEffect(() => {
    if (timelineRef.current) timelineRef.current.kill();

    const isFirstMount = !mountedRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (activeIndex >= 0) {
      setOpenState(activeIndex);
      mountedRef.current = true;
      stageRef.current?.classList.add('is-ready');
      return undefined;
    }

    setRestState();

    if (!introPlayedRef.current && !reduceMotion) {
      // The artwork is deliberately flattened into integer CSS layers. Each
      // sheet is always one layer behind its own divider, so the intro cannot
      // generate 3D crossover flashes while the PNGs are being composited.
      const revealOrder = SECTIONS.map((_, index) => index).reverse();

      revealOrder.forEach((index) => {
        const d = dividerRefs.current[index];
        const s = sheetRefs.current[index];
        const m = measurements[index];

        if (d) {
          gsap.set(d, {
            y: m.divider.y - 20,
            opacity: 0,
            scale: 0.988,
            zIndex: dividerLayer(index),
            force3D: false,
          });
        }
        if (s) {
          gsap.set(s, {
            y: m.sheet.y - 13,
            opacity: 0,
            scaleX: 0.992,
            scaleY: 0.992,
            zIndex: sheetLayer(index),
            force3D: false,
          });
        }
      });

      mountedRef.current = true;
      stageRef.current?.classList.add('is-ready');

      let cancelled = false;
      let intro = null;

      const startIntro = () => {
        if (cancelled) return;
        introPlayedRef.current = true;

        intro = gsap.timeline({
          onStart: () => setIsAnimating(true),
          onComplete: () => {
            setRestState();
            setIsAnimating(false);
            timelineRef.current = null;
          },
        });
        timelineRef.current = intro;

        revealOrder.forEach((index, orderIndex) => {
          const m = measurements[index];
          const start = orderIndex * 0.13;

          // Each section arrives as one layer: divider first, loose paper a few
          // frames later, then both make a tiny final settle instead of stopping
          // abruptly. This gives the “terminando de assentar” feeling.
          intro.to(dividerRefs.current[index], {
            y: m.divider.y + 3,
            opacity: 1,
            scale: 1,
            duration: 0.58,
            ease: 'power3.out',
            force3D: false,
          }, start);
          intro.to(dividerRefs.current[index], {
            y: m.divider.y,
            duration: 0.2,
            ease: 'sine.inOut',
            force3D: false,
          }, start + 0.5);

          intro.to(sheetRefs.current[index], {
            y: m.sheet.y + 2,
            opacity: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 0.66,
            ease: 'power3.out',
            force3D: false,
          }, start + 0.055);
          intro.to(sheetRefs.current[index], {
            y: m.sheet.y,
            duration: 0.22,
            ease: 'sine.inOut',
            force3D: false,
          }, start + 0.57);
        });
      };

      const images = [
        ...dividerRefs.current.map((el) => el?.querySelector('img')),
        ...sheetImageRefs.current,
      ].filter(Boolean);

      Promise.allSettled(images.map((img) => (
        typeof img.decode === 'function' ? img.decode().catch(() => undefined) : Promise.resolve()
      ))).then(() => requestAnimationFrame(startIntro));

      return () => {
        cancelled = true;
        intro?.kill();
      };
    }

    if (reduceMotion) introPlayedRef.current = true;

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

    // CLOSE ---------------------------------------------------------------
    if (from >= 0 && to < 0) {
      const image = sheetImageRefs.current[from];
      const surface = surfaceRefs.current[from];
      const content = contentRefs.current[from];
      const selectedDivider = dividerRefs.current[from];
      const selectedSheet = sheetRefs.current[from];
      const m = measurements[from];

      const fullWidth = viewport.width + 2;
      const fullHeight = viewport.height + 2;
      const dividerDrop = Math.min(190, viewport.height * 0.2);
      const dividerEntryY = m.divider.y + Math.max(dividerDrop, viewport.height * 0.42);
      const returnStart = t(0.2);
      const returnDuration = t(0.84);

      // All the other folders are already sitting in their exact homepage
      // positions underneath the fullscreen paper. Nothing else “rebuilds” on
      // close: only this divider and this sheet move.
      setNonSelectedRest(from);

      gsap.set(selectedSheet, {
        zIndex: OVERLAY_SHEET_LAYER,
        width: fullWidth,
        height: fullHeight,
        xPercent: -50,
        yPercent: -50,
        force3D: false,
      });
      gsap.set(selectedDivider, {
        ...m.divider,
        xPercent: -50,
        yPercent: -50,
        y: dividerEntryY,
        z: 0,
        zIndex: OVERLAY_DIVIDER_LAYER,
        opacity: 0,
        force3D: false,
      });

      tl.set(content, { pointerEvents: 'none' }, 0)
        .to(content, { opacity: 0, y: 10, duration: t(0.18), ease: EASE.exit }, 0)
        .to(surface, { opacity: 0, duration: t(0.24), ease: EASE.exit }, t(0.02))
        .to(image, { opacity: 1, duration: t(0.3), ease: 'sine.out' }, t(0.04))
        .to(selectedDivider, {
          y: m.divider.y + dividerDrop,
          opacity: 1,
          duration: t(0.34),
          ease: 'power3.out',
          force3D: false,
        }, t(0.03))
        .to(selectedSheet, {
          x: m.sheet.x,
          y: m.sheet.y,
          z: 0,
          scaleX: m.sheet.width / fullWidth,
          scaleY: m.sheet.height / fullHeight,
          opacity: 1,
          duration: returnDuration,
          ease: EASE.standard,
          force3D: false,
        }, returnStart)
        .to(selectedDivider, {
          y: m.divider.y,
          opacity: 1,
          duration: returnDuration,
          ease: EASE.standard,
          force3D: false,
        }, returnStart)
        .add(() => {
          // The pair reaches its exact closed geometry before we restore its
          // normal stacking level. The z-index swap therefore reveals the
          // already-stationary front folders with no crossover animation.
          setPairRest(from);
        }, returnStart + returnDuration + t(0.01));

      return () => tl.kill();
    }

    // OPEN ---------------------------------------------------------------
    if (from < 0 && to >= 0) {
      const selectedDivider = dividerRefs.current[to];
      const selectedSheet = sheetRefs.current[to];
      const selectedImage = sheetImageRefs.current[to];
      const selectedSurface = surfaceRefs.current[to];
      const selectedContent = contentRefs.current[to];
      const m = measurements[to];

      const dividerDrop = Math.min(190, viewport.height * 0.2);
      const separationDuration = t(0.52);
      const frontExitStart = t(0.22);
      const frontExitDuration = t(0.34);
      const zoomStart = t(0.58);
      const zoomDuration = t(0.86);
      const fullWidth = viewport.width + 2;
      const fullHeight = viewport.height + 2;

      // First beat: lower the divider in front of the chosen paper. It stays
      // above its own sheet for the entire transition.
      tl.to(selectedDivider, {
        y: m.divider.y + dividerDrop,
        duration: separationDuration,
        ease: 'power3.out',
        force3D: false,
      }, 0);

      // Only layers physically in front of the selected section briefly clear
      // the path. They use flat 2D motion + opacity; no element ever travels
      // through another element's Z plane.
      SECTIONS.forEach((_, index) => {
        if (index <= to) return;
        const frontY = Math.min(54, viewport.height * 0.065);
        tl.to(dividerRefs.current[index], {
          y: measurements[index].divider.y + frontY,
          opacity: 0,
          duration: frontExitDuration,
          ease: 'power2.inOut',
          force3D: false,
        }, frontExitStart);
        tl.to(sheetRefs.current[index], {
          y: measurements[index].sheet.y + frontY,
          opacity: 0,
          duration: frontExitDuration,
          ease: 'power2.inOut',
          force3D: false,
        }, frontExitStart);
      });

      // Once the front layers are practically gone, lift only the selected
      // pair to a temporary overlay level. The divider remains exactly one
      // layer above the paper, so the paper can never flash in front of it.
      tl.set(selectedSheet, { zIndex: OVERLAY_SHEET_LAYER }, zoomStart);
      tl.set(selectedDivider, { zIndex: OVERLAY_DIVIDER_LAYER }, zoomStart);

      // Freeze the sheet box at fullscreen dimensions once, then animate only
      // transforms. This avoids frame-by-frame layout work while zooming.
      tl.set(selectedSheet, {
        width: fullWidth,
        height: fullHeight,
        scaleX: m.sheet.width / fullWidth,
        scaleY: m.sheet.height / fullHeight,
        xPercent: -50,
        yPercent: -50,
        force3D: false,
      }, zoomStart);

      tl.to(selectedSheet, {
        x: 0,
        y: 0,
        z: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        duration: zoomDuration,
        ease: EASE.standard,
        force3D: false,
      }, zoomStart);

      // The divider keeps leading the paper while it exits downward. It never
      // crosses behind the sheet; it simply leaves the viewport and fades.
      tl.to(selectedDivider, {
        y: m.divider.y + viewport.height * 0.82,
        opacity: 0,
        duration: t(0.7),
        ease: 'power3.inOut',
        force3D: false,
      }, zoomStart + t(0.02));

      tl.to(selectedImage, {
        opacity: 0,
        duration: t(TIMING.surface),
        ease: EASE.exit,
      }, zoomStart + t(0.36));
      tl.to(selectedSurface, {
        opacity: 1,
        duration: t(TIMING.surface),
        ease: EASE.enter,
      }, zoomStart + t(0.34));
      tl.set(selectedContent, { pointerEvents: 'auto' }, zoomStart + t(0.5));
      tl.to(selectedContent, {
        opacity: 1,
        y: 0,
        duration: t(TIMING.content),
        ease: EASE.enter,
      }, zoomStart + t(0.54));

      // As soon as the fullscreen paper is opaque enough to hide the stack,
      // silently put every other layer back at rest. This is why closing later
      // does not have to make the folders “settle back in” one by one.
      tl.add(() => setNonSelectedRest(to), zoomStart + zoomDuration + t(0.02));

      return () => tl.kill();
    }

    return () => tl.kill();
  }, [activeIndex, measurements, setNonSelectedRest, setPairRest, viewport.height, viewport.width]);

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
                surfaceRef={(el) => { surfaceRefs.current[index] = el; }}
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
