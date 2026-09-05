import { forwardRef } from 'react';

const Sheet = forwardRef(function Sheet(
  {
    section,
    children,
    isActive,
    disabled,
    onSelect,
    surfaceRef,
    imageRef,
    contentRef,
  },
  ref
) {
  const rotation = section.sheetImageRotation
    ? `rotate(${section.sheetImageRotation}deg)`
    : undefined;

  return (
    <div ref={ref} className={`sheet-plane${isActive ? ' is-active' : ''}`}>
      <img
        ref={imageRef}
        className="sheet-plane__asset"
        src={section.sheetImage}
        alt=""
        draggable="false"
        style={{
          objectFit: section.sheetFit ?? 'contain',
          objectPosition: section.sheetObjectPosition ?? '50% 50%',
          transform: rotation,
        }}
      />

      {!isActive && (
        <button
          type="button"
          className="sheet-plane__hit"
          disabled={disabled}
          onClick={() => onSelect(section.id)}
          aria-label={`Open ${section.label}`}
          style={{
            transform: rotation,
            clipPath: section.sheetHitClip ?? undefined,
          }}
        >
          <span className="sr-only">{section.label}</span>
        </button>
      )}

      <div ref={surfaceRef} className="sheet-plane__surface" />
      <div
        ref={contentRef}
        className="sheet-plane__content"
        tabIndex={-1}
        aria-hidden={!isActive}
      >
        {children}
      </div>
    </div>
  );
});

export default Sheet;
