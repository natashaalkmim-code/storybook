import { forwardRef } from 'react';

const Divider = forwardRef(function Divider(
  { section, disabled, onSelect, onHover, onLeave, hitStyle },
  ref
) {
  return (
    <div ref={ref} className="divider-plane" aria-hidden="false">
      <img className="divider-plane__image" src={section.dividerImage} alt="" draggable="false" />
      <button
        type="button"
        className="divider-plane__hit"
        style={hitStyle}
        disabled={disabled}
        onClick={() => onSelect(section.id)}
        onPointerEnter={(event) => event.pointerType === 'mouse' && onHover()}
        onPointerLeave={(event) => event.pointerType === 'mouse' && onLeave()}
        onFocus={onHover}
        onBlur={onLeave}
        aria-label={`Open ${section.label}`}
      >
        <span className="sr-only">{section.label}</span>
      </button>
    </div>
  );
});

export default Divider;
