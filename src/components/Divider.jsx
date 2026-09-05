import { forwardRef, useState } from 'react';

// The divider IS the navigation — a real <button> so it's focusable and
// activatable with the keyboard for free, with aria-expanded describing the
// "this opens into a full page" relationship rather than a generic toggle.
const Divider = forwardRef(function Divider(
  { section, isActive, isAnimating, onSelect, onHoverChange },
  ref
) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      ref={ref}
      type="button"
      className={`divider divider--${section.color}${isActive ? ' divider--active' : ''}`}
      onClick={() => onSelect(section.id)}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onHoverChange(section.id)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onHoverChange(null)}
      onFocus={() => onHoverChange(section.id)}
      onBlur={() => onHoverChange(null)}
      disabled={isAnimating}
      aria-expanded={isActive}
      aria-label={`${isActive ? 'Close' : 'Open'} ${section.label}`}
    >
      <span className="divider__shape">
        {imageFailed ? (
          <span className="divider__fallback" aria-hidden="true" />
        ) : (
          <img
            className="divider__image"
            src={section.dividerImage}
            alt=""
            draggable="false"
            onError={() => setImageFailed(true)}
          />
        )}
      </span>
      <span className="divider__label">{section.label}</span>
    </button>
  );
});

export default Divider;
