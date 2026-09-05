import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { SECTIONS, getSectionIndex } from '../data/sections';
import { PAGES } from '../pages';
import { DURATION, EASE, OPEN_VIEWPORT_RATIO } from '../config/stackConfig';
import { dividerTransform, sheetRestTransform, edgeTransform, sheetOpenTransform } from '../config/geometry';
import { useStackConfig } from '../hooks/useStackConfig';
import { useReducedMotion } from '../hooks/useReducedMotion';
import Divider from './Divider';
import Sheet from './Sheet';
import SectionPage from './SectionPage';

function getViewport() {
  return {
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  };
}

export default function FolderStack({ headerRef }) {
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const activeId = sectionId && getSectionIndex(sectionId) !== -1 ? sectionId : null;
  const activeIndex = activeId ? getSectionIndex(activeId) : -1;

  const config = useStackConfig();
  const reducedMotion = useReducedMotion();

  const stageRef = useRef(null);
  const stackRef = useRef(null);
  const dividerRefs = useRef([]);
  const sheetRefs = useRef([]);
  const contentRefs = useRef([]);

  const isAnimatingRef = useRef(false);
  const hasMountedRef = useRef(false); // guards the layout effect's one-time intro
  const hasSyncedIndexRef = useRef(false); // guards the transition effect's first (no-op) run
  const prevIndexRef = useRef(activeIndex);
  const timelineRef = useRef(null);

  const [isAnimating, setIsAnimating] = useState(false);

  // Resting/edge/open targets for every divider and sheet, for a given active
  // index. Always derived fresh from the geometry formulas — see geometry.js
  // for why that's what prevents drift across repeated open/close cycles.
  const computeTargets = useCallback(
    (activeIdx) => {
      const viewport = getViewport();
      const dividers = SECTIONS.map((_, i) => {
        const rest = dividerTransform(i, config);
        const t = activeIdx !== -1 ? edgeTransform(rest, config) : rest;
        return { ...t, width: config.dividerWidth, height: config.dividerHeight };
      });
      const sheets = SECTIONS.map((_, i) => {
        if (i === activeIdx) {
          return sheetOpenTransform(config, viewport.width, viewport.height, OPEN_VIEWPORT_RATIO);
        }
        const rest = sheetRestTransform(i, config);
        const t = activeIdx !== -1 ? edgeTransform(rest, config) : rest;
        return { ...t, width: config.sheetWidth, height: config.sheetHeight };
      });
      return { dividers, sheets };
    },
    [config]
  );

  const applyInstant = useCallback(
    (activeIdx) => {
      const { dividers, sheets } = computeTargets(activeIdx);
      SECTIONS.forEach((_, i) => {
        const dEl = dividerRefs.current[i];
        if (dEl) gsap.set(dEl, { ...dividers[i], xPercent: -50, yPercent: -50 });
        const sEl = sheetRefs.current[i];
        if (sEl) gsap.set(sEl, { ...sheets[i], xPercent: -50, yPercent: -50 });
        const cEl = contentRefs.current[i];
        if (cEl) gsap.set(cEl, { opacity: i === activeIdx ? 1 : 0, y: 0 });
      });
      if (stackRef.current) gsap.set(stackRef.current, { rotationX: config.stackRotateX, rotationY: 0 });
      if (headerRef?.current) {
        gsap.set(headerRef.current, { scale: activeIdx !== -1 ? 0.86 : 1, y: activeIdx !== -1 ? -8 : 0 });
      }
    },
    [computeTargets, config, headerRef]
  );

  // --- mount, and every breakpoint change: lay out instantly ---------------
  useLayoutEffect(() => {
    const firstRun = !hasMountedRef.current;
    applyInstant(activeIndex);

    if (firstRun) {
      hasMountedRef.current = true;
      if (stageRef.current) stageRef.current.classList.add('is-ready');

      if (!reducedMotion && activeIndex === -1) {
        // The one non-user-triggered animation in the whole scene: a quiet
        // settle from a slightly compressed stack into resting geometry.
        const dividers = dividerRefs.current.filter(Boolean);
        if (dividers.length) {
          // No clearProps here: the tween already ends exactly on the
          // resting value applyInstant just set (that's what "to" defaults
          // to in gsap.from). Clearing z/y would strip the WHOLE composed
          // transform, not just those two axes, since transform is one
          // atomic CSS property — that also wipes x/xPercent/yPercent/
          // rotation and drops the element back to its CSS default.
          gsap.from(dividers, {
            z: '+=160',
            y: '-=36',
            duration: DURATION.intro,
            ease: EASE.enter,
            stagger: 0.07,
          });
        }
      }
    }
    // Re-run only when the resolved tier changes; applyInstant/reducedMotion
    // are read fresh each time via closure, not treated as retrigger deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  // --- navigation: animate open / close / switch ----------------------------
  useEffect(() => {
    if (!hasSyncedIndexRef.current) {
      // First run just syncs the "previous index" pointer — the layout
      // effect above already placed a deep-linked section correctly, with
      // no flight animation to fly in from.
      hasSyncedIndexRef.current = true;
      prevIndexRef.current = activeIndex;
      return undefined;
    }

    const fromIndex = prevIndexRef.current;
    const toIndex = activeIndex;
    prevIndexRef.current = toIndex;
    if (fromIndex === toIndex) return undefined;

    if (timelineRef.current) timelineRef.current.kill();

    const closing = fromIndex !== -1;
    const opening = toIndex !== -1;
    const scale = reducedMotion ? 0.12 : 1; // collapses travel time, keeps the same choreography
    const d = (base) => base * scale;

    const tl = gsap.timeline({
      defaults: { ease: EASE.standard },
      onStart: () => {
        isAnimatingRef.current = true;
        setIsAnimating(true);
      },
      onComplete: () => {
        isAnimatingRef.current = false;
        setIsAnimating(false);
        timelineRef.current = null;
        if (toIndex !== -1) {
          const openEl = contentRefs.current[toIndex];
          if (openEl) openEl.focus({ preventScroll: true });
        }
      },
    });
    timelineRef.current = tl;

    // 1. the page that was open fades out first, quickly
    if (closing) {
      const outEl = contentRefs.current[fromIndex];
      if (outEl) tl.to(outEl, { opacity: 0, y: 10, duration: d(DURATION.content * 0.6), ease: EASE.exit }, 0);
    }

    // 2. its sheet returns from the page back toward its folder
    if (closing) {
      const rest = sheetRestTransform(fromIndex, config);
      const target = opening ? edgeTransform(rest, config) : rest;
      tl.to(
        sheetRefs.current[fromIndex],
        { ...target, width: config.sheetWidth, height: config.sheetHeight, duration: d(DURATION.close), ease: EASE.exit },
        0
      );
    }

    const groupStart = closing ? d(DURATION.close) * 0.35 : 0;

    // 3. every divider/sheet not involved moves to its new resting spot
    //    (full rest if nothing will be open, edge cluster if something will)
    const { dividers: dTargets, sheets: sTargets } = computeTargets(toIndex);
    SECTIONS.forEach((_, i) => {
      if (i === toIndex) return; // toIndex's divider AND sheet are both handled by the dedicated "opening" block below

      // The divider always needs a target here, fromIndex included: when
      // switching sections its edge target equals where it already sits (a
      // harmless no-op), but when closing to nothing (toIndex === -1) its
      // target is true rest — different from the edge position it was
      // sitting at while active. Skipping it in that case left it stranded
      // off-center after close (caught visually, not by the build).
      const dEl = dividerRefs.current[i];
      if (dEl) tl.to(dEl, { ...dTargets[i], duration: d(DURATION.navShift), ease: EASE.standard }, groupStart);

      if (closing && i === fromIndex) return; // its SHEET is already animated back at step 2 above
      const sEl = sheetRefs.current[i];
      if (sEl) {
        tl.to(
          sEl,
          { ...sTargets[i], width: config.sheetWidth, height: config.sheetHeight, duration: d(DURATION.navShift), ease: EASE.standard },
          groupStart
        );
      }
    });

    if (opening) {
      // 4. the clicked divider separates from the pack, then joins it at the edge
      const clickedDivider = dividerRefs.current[toIndex];
      if (clickedDivider) {
        const kick = config.hoverLift ? config.hoverLift * 1.6 : 30;
        // A relative kick is safe here because it's immediately followed by
        // an absolute correction below — any accumulated error is erased,
        // not carried forward.
        tl.to(clickedDivider, { z: `+=${kick}`, duration: d(DURATION.separate * 0.4), ease: EASE.enter }, groupStart).to(
          clickedDivider,
          { ...dTargets[toIndex], duration: d(DURATION.separate * 0.6), ease: EASE.standard },
          groupStart + d(DURATION.separate * 0.4)
        );
      }

      // 5. its sheet flies out and becomes the page
      const viewport = getViewport();
      const openTransform = sheetOpenTransform(config, viewport.width, viewport.height, OPEN_VIEWPORT_RATIO);
      const openStart = groupStart + 0.05;
      tl.to(sheetRefs.current[toIndex], { ...openTransform, duration: d(DURATION.open), ease: EASE.standard }, openStart);

      // 6. page content rises in once the flight is most of the way there
      const inEl = contentRefs.current[toIndex];
      if (inEl) {
        tl.set(inEl, { opacity: 0, y: 14 }, openStart).to(
          inEl,
          { opacity: 1, y: 0, duration: d(DURATION.content), ease: EASE.soft },
          openStart + d(DURATION.open) * 0.65
        );
      }
    }

    // 7. the header recedes into a mark, or returns to full size
    if (headerRef?.current) {
      tl.to(
        headerRef.current,
        { scale: opening ? 0.86 : 1, y: opening ? -8 : 0, duration: d(DURATION.navShift), ease: EASE.standard },
        0
      );
    }

    return () => tl.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // --- subtle desktop hover lift --------------------------------------------
  const handleHoverChange = useCallback(
    (id) => {
      if (isAnimatingRef.current || activeId || !config.hoverLift) return;
      SECTIONS.forEach((section, i) => {
        const el = dividerRefs.current[i];
        if (!el) return;
        const rest = dividerTransform(i, config);
        const isHovered = section.id === id;
        gsap.to(el, {
          z: isHovered ? rest.z + config.hoverLift : rest.z,
          x: isHovered ? rest.x + config.hoverShift : rest.x,
          duration: DURATION.hover,
          ease: isHovered ? EASE.enter : EASE.exit,
          overwrite: 'auto',
        });
      });
    },
    [activeId, config]
  );

  // --- very subtle pointer parallax on the resting stack --------------------
  useEffect(() => {
    if (activeId || !config.parallaxRange) return undefined;
    if (reducedMotion || typeof window === 'undefined') return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const stackEl = stackRef.current;
    const stageEl = stageRef.current;
    if (!stackEl || !stageEl) return undefined;

    const quickRotateY = gsap.quickTo(stackEl, 'rotationY', { duration: 0.7, ease: 'power3' });
    const handleMove = (event) => {
      const rect = stageEl.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      quickRotateY(relX * config.parallaxRange * 2);
    };
    const handleLeave = () => quickRotateY(0);

    stageEl.addEventListener('pointermove', handleMove);
    stageEl.addEventListener('pointerleave', handleLeave);
    return () => {
      stageEl.removeEventListener('pointermove', handleMove);
      stageEl.removeEventListener('pointerleave', handleLeave);
      quickRotateY(0);
    };
  }, [activeId, config.parallaxRange, reducedMotion]);

  // --- selection, close, escape, document title -----------------------------
  const handleSelect = useCallback(
    (id) => {
      if (isAnimatingRef.current) return;
      navigate(id === activeId ? '/' : `/${id}`);
    },
    [activeId, navigate]
  );

  const handleClose = useCallback(() => {
    if (isAnimatingRef.current) return;
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    if (!activeId) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isAnimatingRef.current) navigate('/');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeId, navigate]);

  useEffect(() => {
    const base = 'Storybook Studio';
    document.title = activeIndex !== -1 ? `${SECTIONS[activeIndex].label} \u00B7 ${base}` : base;
  }, [activeIndex]);

  return (
    <div ref={stageRef} className="stack-scene" style={{ '--stack-perspective': `${config.perspective}px` }}>
      <div ref={stackRef} className="stack3d">
        {SECTIONS.map((section, i) => (
          <Divider
            key={section.id}
            ref={(el) => {
              dividerRefs.current[i] = el;
            }}
            section={section}
            isActive={section.id === activeId}
            isAnimating={isAnimating}
            onSelect={handleSelect}
            onHoverChange={handleHoverChange}
          />
        ))}
        {SECTIONS.map((section, i) => {
          const Page = PAGES[section.id];
          const isActive = section.id === activeId;
          return (
            <Sheet
              key={section.id}
              ref={(el) => {
                sheetRefs.current[i] = el;
              }}
              contentRef={(el) => {
                contentRefs.current[i] = el;
              }}
              section={section}
              isActive={isActive}
            >
              <SectionPage section={section} onClose={handleClose} isAnimating={isAnimating}>
                <Page />
              </SectionPage>
            </Sheet>
          );
        })}
      </div>
    </div>
  );
}
