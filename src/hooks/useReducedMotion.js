import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function getInitial() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

// Live-tracks prefers-reduced-motion so the stack can drop straight into its
// resting geometry instead of animating there, and so open/close transitions
// can collapse to near-instant while still moving through the same states.
export function useReducedMotion() {
  const [reduced, setReduced] = useState(getInitial);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia(QUERY);
    const handleChange = (event) => setReduced(event.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return reduced;
}
