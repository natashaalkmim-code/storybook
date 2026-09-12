import { forwardRef } from 'react';

const Sheet = forwardRef(function Sheet(
  {
    section,
    children,
    isActive,
    disabled,
    onSelect,
    contentRef,
  },
  ref
) {
  const rotation = section.sheetImageRotation
    ? `rotate(${section.sheetImageRotation}deg)`
    : undefined;

  const activateSheet = () => {
    if (!isActive && !disabled) onSelect(section.id);
  };

  return (
    <div
      ref={ref}
      className={`sheet-plane${isActive ? ' is-active' : ''}${section.sheetTone === 'dark' ? ' sheet-plane--dark' : ''}`}
      // Fallback hit area for the actual PNG bounds. The clipped button below
      // remains the precise target for most sheets, while this makes exposed
      // paper pixels (especially the farthest Projects sheet) reliably open.
      style={{ pointerEvents: !isActive && !disabled ? 'auto' : undefined }}
      onClick={(event) => {
        if (event.target === event.currentTarget) activateSheet();
      }}
    >
      <img
        className="sheet-plane__asset"
        src={section.sheetImage}
        alt=""
        draggable="false"
        style={{
          // At rest the plane's own aspect ratio always matches the asset's
          // (see measureScene), so cover never crops anything here — it only
          // kicks in once the plane's box stretches toward the fullscreen
          // aspect ratio while opening, where it crops the flat paper
          // instead of letterboxing/distorting it. The extra scale(1.5) only
          // applies once open: it pushes the asset's own rotated-corner
          // transparency (baked into the PNG) safely outside the frame,
          // since a cover crop alone isn't always enough margin when the
          // viewport's aspect ratio happens to sit close to the asset's own.
          objectFit: 'cover',
          objectPosition: section.sheetObjectPosition ?? '50% 50%',
          transform: isActive ? 'scale(2.2)' : rotation,
        }}
      />

      {!isActive && (
        <button
          type="button"
          className="sheet-plane__hit"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            activateSheet();
          }}
          aria-label={`Open ${section.label}`}
          style={{
            transform: rotation,
            clipPath: section.sheetHitClip ?? undefined,
          }}
        >
          <span className="sr-only">{section.label}</span>
        </button>
      )}

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
