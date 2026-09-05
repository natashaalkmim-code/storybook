import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

// Renders the wordmark as styled text, so the site looks finished before any
// logo asset exists. If a real mark is dropped at
// /public/assets/branding/logo.webp later, swap the <span> flourish below for
// an <img src="/assets/branding/logo.webp" alt="Storybook Studio" /> — the
// surrounding layout and the open/close scale animation don't need to change.
const BrandHeader = forwardRef(function BrandHeader(_props, ref) {
  return (
    <header ref={ref} className="brand-header">
      <Link to="/" className="brand-header__mark" aria-label="Storybook Studio — home">
        <svg className="brand-header__flourish" viewBox="0 0 64 30" aria-hidden="true">
          <path d="M32 28C32 19 20 19 20 11c0-5 5-8 12-3 7-5 12-2 12 3 0 8-12 8-12 17Z" />
        </svg>
        <span className="brand-header__wordmark">
          <span className="brand-header__wordmark-main">Storybook</span>
          <span className="brand-header__wordmark-sub">Studio</span>
        </span>
      </Link>
    </header>
  );
});

export default BrandHeader;
