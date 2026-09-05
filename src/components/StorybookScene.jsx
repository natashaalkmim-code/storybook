import { useRef } from 'react';
import { Link } from 'react-router-dom';
import BrandHeader from './BrandHeader';
import FolderStack from './FolderStack';
import { SECTIONS } from '../data/sections';

export default function StorybookScene() {
  // Shared with FolderStack so its GSAP timeline can shrink/return the
  // header in step with the stack, without lifting header state up further
  // than it needs to go.
  const headerRef = useRef(null);

  return (
    <div className="storybook-scene">
      <BrandHeader ref={headerRef} />
      <FolderStack headerRef={headerRef} />

      {/*
        The stack IS the primary navigation. This list is the accessibility /
        SEO fallback mentioned in the brief: real links, invisible but
        reachable, for screen readers, keyboard users who prefer landmarks,
        and crawlers.
      */}
      <nav className="sr-only" aria-label="Sections">
        <ul>
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <Link to={`/${section.id}`}>{section.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
