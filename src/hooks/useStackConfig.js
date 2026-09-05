import { useEffect, useState } from 'react';
import { getStackConfig } from '../config/stackConfig';

// Re-resolves the active tier on resize, but only publishes a new config
// object when the resolved TIER actually changes (desktop -> tablet, etc.),
// not on every pixel of a drag-resize. Consumers should treat a config
// change as a cue to re-lay-out (gsap.set, not .to — see FolderStack).
export function useStackConfig() {
  const [config, setConfig] = useState(() => getStackConfig());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let frame = null;
    const handleResize = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = getStackConfig(window.innerWidth);
        setConfig((prev) => (prev.id === next.id ? prev : next));
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return config;
}
