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
  const [isAnimating, setIsAnimating] = useState(false);

  const measurements = useMemo(
    () => SECTIONS.map((section, index) => measureScene(section, index, viewport, config)),
    [viewport, config]
  );

  const setRestState = useCallback((animate = false) => {
    const duration = animate ? TIMING.close : 0;
    const method = animate ? gsap.to : gsap.set;

    if (stackRef.current) {
      method(stackRef.current, {
        rotationX: config.rotateX,
        rotationY: 0,
        x: 0,
        y: 0,
        z: 0,
        duration,
        ease: EASE.standard,
      });
    }

    SECTIONS.forEach((_, index) => {
      const d = dividerRefs.current[index];
      const s = sheetRefs.current[index];
      const image = sheetImageRefs.current[index];
      const surface = surfaceRefs.current[index];
      const content = contentRefs.current[index];
      const m = measurements[index];

      if (d) {
        method(d, {
          ...m.divider,
          xPercent: -50,
          yPercent: -50,
          opacity: 1,
          duration,
          ease: EASE.standard,
        });
      }

      if (s) {
        method(s, {
          ...m.sheet,
          xPercent: -50,
          yPercent: -50,
          opacity: 1,
          borderRadius: 0,
          duration,
          ease: EASE.standard,
        });
      }
      if (image) method(image, { opacity: 1, duration: duration * 0.65, ease: EASE.exit });
      if (surface) method(surface, { opacity: 0, duration: duration * 0.65, ease: EASE.exit });
      if (content) method(content, { opacity: 0, y: 16, pointerEvents: 'none', duration: duration * 0.45 });
    });
  }, [config, measurements]);

  useLayoutEffect(() => {
    if (timelineRef.current) timelineRef.current.kill();

    const isFirstMount = !mountedRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Always calculate the exact final geometry first. On the first homepage
    // visit we then hide the individual planes before the browser paints and
    // reveal them in the requested back-to-front order.
    if (activeIndex < 0) {
      setRestState(false);

      if (isFirstMount && !reduceMotion) {
        const revealOrder = SECTIONS.map((_, index) => index).reverse();

        // Put every plane at its FINAL depth before it becomes visible.
        // Especially for the loose papers, animating through Z while a large
        // transparent PNG is being composited can look slightly stepped. The
        // intro therefore keeps the correct interleaved depth from frame one
        // and uses only a tiny Y/scale settle.
        revealOrder.forEach((index) => {
          const divider = dividerRefs.current[index];
          const sheet = sheetRefs.current[index];
          const m = measurements[index];

          if (divider) {
            gsap.set(divider, {
              ...m.divider,
              xPercent: -50,
              yPercent: -50,
              y: m.divider.y - 18,
              z: m.divider.z,
              scale: 0.994,
              autoAlpha: 0,
              force3D: true,
            });
          }

          if (sheet) {
            gsap.set(sheet, {
              ...m.sheet,
              xPercent: -50,
              yPercent: -50,
              y: m.sheet.y - 10,
              z: m.sheet.z,
              scale: 0.997,
              autoAlpha: 0,
              force3D: true,
            });
          }
        });

        mountedRef.current = true;
        if (stageRef.current) stageRef.current.classList.add('is-ready');

        let cancelled = false;
        let intro = null;

        const startIntro = () => {
          if (cancelled) return;

          const dividerDuration = 0.72;
          const dividerStep = 0.15;
          const sheetDuration = 0.88;
          const sheetStep = 0.12;
          let cursor = 0;

          intro = gsap.timeline({
            onStart: () => setIsAnimating(true),
            onComplete: () => {
              // Restore the exact art-directed coordinates after the intro so
              // the animated and non-animated homepage are pixel-identical.
              setRestState(false);
              dividerRefs.current.forEach((el) => el && gsap.set(el, { scale: 1, clearProps: 'visibility' }));
              sheetRefs.current.forEach((el) => el && gsap.set(el, { scale: 1, clearProps: 'visibility' }));
              setIsAnimating(false);
              timelineRef.current = null;
            },
          });
          timelineRef.current = intro;

          // Process → Services → About → Contact → Projects.
          revealOrder.forEach((index) => {
            const m = measurements[index];
            intro.to(
              dividerRefs.current[index],
              {
                y: m.divider.y,
                scale: 1,
                autoAlpha: 1,
                duration: dividerDuration,
                ease: 'sine.out',
                force3D: true,
              },
              cursor
            );
            cursor += dividerStep;
          });

          // The papers follow bottom-to-top. They are already at the correct Z
          // (behind their own divider) and simply finish settling vertically.
          // Longer overlap + sine easing removes the stop/start feeling.
          cursor += 0.02;
          revealOrder.forEach((index) => {
            const m = measurements[index];
            intro.to(
              sheetRefs.current[index],
              {
                y: m.sheet.y,
                scale: 1,
                autoAlpha: 1,
                duration: sheetDuration,
                ease: 'sine.out',
                force3D: true,
              },
              cursor
            );
            cursor += sheetStep;
          });
        };

        // Decode the supplied PNGs before moving them. This prevents the first
        // animation frames from stuttering while the browser rasterizes a large
        // transparent paper/folder image for the first time.
        const images = [
          ...dividerRefs.current.map((el) => el?.querySelector('img')),
          ...sheetImageRefs.current,
        ].filter(Boolean);

        const decodeJobs = images.map((img) => {
          if (typeof img.decode !== 'function') return Promise.resolve();
          return img.decode().catch(() => undefined);
        });

        Promise.allSettled(decodeJobs).then(() => {
          requestAnimationFrame(startIntro);
        });

        return () => {
          cancelled = true;
          if (intro) intro.kill();
        };
      }
    } else {
      // A deep-linked open page is shown directly rather than replaying the
      // homepage intro first.
      setRestState(false);
      const selected = sheetRefs.current[activeIndex];
      const image = sheetImageRefs.current[activeIndex];
      const surface = surfaceRefs.current[activeIndex];
      const content = contentRefs.current[activeIndex];
      if (stackRef.current) gsap.set(stackRef.current, { rotationX: 0 });
      dividerRefs.current.forEach((el) => el && gsap.set(el, { y: `+=${viewport.height * 0.72}`, z: '-=220', opacity: 0 }));
      sheetRefs.current.forEach((el, index) => {
        if (!el || index === activeIndex) return;
        gsap.set(el, { y: `+=${viewport.height * 0.72}`, z: '-=220', opacity: 0 });
      });
      if (selected) gsap.set(selected, { x: 0, y: 0, z: 0, width: viewport.width + 2, height: viewport.height + 2, xPercent: -50, yPercent: -50, opacity: 1 });
      if (image) gsap.set(image, { opacity: 0 });
      if (surface) gsap.set(surface, { opacity: 1 });
      if (content) gsap.set(content, { opacity: 1, y: 0, pointerEvents: 'auto' });
    }

    if (isFirstMount) {
      mountedRef.current = true;
      if (stageRef.current) stageRef.current.classList.add('is-ready');
    }
  // Deliberately NOT dependent on activeIndex. Route changes are animated by
  // the effect below. This layout effect only handles first paint and real
  // viewport/config changes, preventing navigation from snapping directly to
  // the final state before GSAP gets a chance to animate it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport.width, viewport.height, config, setRestState]);

  useEffect(() => {
    const from = previousActiveRef.current;
    const to = activeIndex;
    previousActiveRef.current = to;

    if (!mountedRef.current || from === to) return undefined;
    if (timelineRef.current) timelineRef.current.kill();

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

      // While a page is open, its sheet is at z: 0 and its divider has been
      // pushed far behind the viewport. If both simply tween back from those
      // values, the paper necessarily travels IN FRONT of its own divider for
      // most of the closing animation. Put the divider one depth unit in front
      // BEFORE it comes back on-screen, then tween both with the same timing.
      // Their Z gap therefore stays positive for the entire return.
      if (selectedDivider && selectedSheet) {
        gsap.set(selectedDivider, {
          z: 1,
          force3D: true,
        });
      }

      tl.to(content, { opacity: 0, y: 12, duration: t(0.22), ease: EASE.exit }, 0)
        .to(surface, { opacity: 0, duration: t(0.25), ease: EASE.exit }, 0.06)
        .to(image, { opacity: 1, duration: t(0.34), ease: 'sine.out' }, 0.08)
        .to(stackRef.current, { rotationX: config.rotateX, duration: t(TIMING.close), ease: EASE.standard }, 0.02);

      SECTIONS.forEach((_, index) => {
        const m = measurements[index];
        tl.to(dividerRefs.current[index], {
          ...m.divider,
          xPercent: -50,
          yPercent: -50,
          opacity: 1,
          duration: t(TIMING.close),
          ease: EASE.standard,
          force3D: true,
        }, 0.02);
        tl.to(sheetRefs.current[index], {
          ...m.sheet,
          xPercent: -50,
          yPercent: -50,
          opacity: 1,
          borderRadius: 0,
          duration: t(TIMING.close),
          ease: EASE.standard,
          force3D: true,
        }, 0.02);
      });

      // Force the exact mathematically defined homepage state once the reverse
      // animation finishes. This prevents any accumulated GSAP transform from
      // leaving a sheet centered or a few pixels away from its original place.
      tl.add(() => setRestState(false), t(TIMING.close) + 0.03);
      tl.set(content, { pointerEvents: 'none' });
      return () => tl.kill();
    }

    // OPEN ---------------------------------------------------------------
    if (from < 0 && to >= 0) {
      const selectedDivider = dividerRefs.current[to];
      const selectedSheet = sheetRefs.current[to];
      const selectedImage = sheetImageRefs.current[to];
      const selectedSurface = surfaceRefs.current[to];
      const selectedContent = contentRefs.current[to];

      // First the folder itself steps forward/down to make the paper behind it
      // physically readable as a separate plane. No bounce or overshoot.
      tl.to(selectedDivider, {
        y: measurements[to].divider.y + Math.min(90, viewport.height * 0.1),
        z: measurements[to].divider.z + 75,
        duration: t(TIMING.separate),
        ease: EASE.enter,
      }, 0);

      // Then the whole filing stack gently flattens while the loose sheet moves
      // toward camera/center. The same wrapper becomes the reading page.
      tl.to(stackRef.current, { rotationX: 0, duration: t(TIMING.open), ease: EASE.standard }, 0.16);

      SECTIONS.forEach((_, index) => {
        const d = dividerRefs.current[index];
        const s = sheetRefs.current[index];
        if (d) {
          tl.to(d, {
            y: measurements[index].divider.y + viewport.height * 0.72,
            z: measurements[index].divider.z - 220,
            opacity: index === to ? 0.18 : 0,
            duration: t(TIMING.open * 0.9),
            ease: EASE.standard,
          }, 0.18);
        }
        if (s && index !== to) {
          tl.to(s, {
            y: measurements[index].sheet.y + viewport.height * 0.72,
            z: measurements[index].sheet.z - 220,
            opacity: 0,
            duration: t(TIMING.open * 0.9),
            ease: EASE.standard,
          }, 0.18);
        }
      });

      tl.to(selectedSheet, {
        x: 0,
        y: 0,
        z: 0,
        width: viewport.width + 2,
        height: viewport.height + 2,
        opacity: 1,
        duration: t(TIMING.open),
        ease: EASE.standard,
      }, 0.14)
        .to(selectedImage, { opacity: 0, duration: t(TIMING.surface), ease: EASE.exit }, 0.52)
        .to(selectedSurface, { opacity: 1, duration: t(TIMING.surface), ease: EASE.enter }, 0.5)
        .set(selectedContent, { pointerEvents: 'auto' }, 0.64)
        .to(selectedContent, { opacity: 1, y: 0, duration: t(TIMING.content), ease: EASE.enter }, 0.67);

      return () => tl.kill();
    }

    return () => tl.kill();
  }, [activeIndex, config, measurements, viewport.height, viewport.width]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && activeId && !isAnimating) navigate('/');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeId, isAnimating, navigate]);

  const hoverDivider = (index, entering) => {
    if (activeId || isAnimating || config.hoverZ === 0) return;
    const el = dividerRefs.current[index];
    if (!el) return;
    const m = measurements[index].divider;
    gsap.to(el, {
      y: entering ? m.y + config.hoverY : m.y,
      z: entering ? m.z + config.hoverZ : m.z,
      duration: TIMING.hover,
      ease: EASE.enter,
      overwrite: true,
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
