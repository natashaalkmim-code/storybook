import { forwardRef } from 'react';

const PANEL_COLOR = { light: '#e6e6eb', dark: '#2b2528' };

const Sheet = forwardRef(function Sheet(
  {
    section,
    children,
    isActive,
    disabled,
    onSelect,
    imageRef,
    panelRef,
    contentRef,
  },
  ref
) {
  const rotation = section.sheetImageRotation
    ? `rotate(${section.sheetImageRotation}deg)`
    : undefined;
  const panelColor = section.sheetTone === 'dark' ? PANEL_COLOR.dark : PANEL_COLOR.light;

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
      {/* The real, tilted paper artwork — what you see in the closed stack. */}
      <img
        ref={imageRef}
        className="sheet-plane__asset"
        src={section.sheetImage}
        alt=""
        draggable="false"
        style={{
          objectFit: 'contain',
          objectPosition: section.sheetObjectPosition ?? '50% 50%',
          transform: rotation,
        }}
      />

      {/* A flat, colour-matched stand-in used only while opening/open/closing.
          The rotation is baked into the PNG's pixels, so growing the image
          itself toward a fullscreen, axis-aligned rectangle would either
          warp it or leak its transparent corners. This panel is the exact
          measured colour of that same paper, so the swap (timed in
          FolderStack, not here) is effectively invisible — but it can grow
          to any size/aspect ratio as a clean right angle, with nothing to
          mask. */}
      <div
        ref={panelRef}
        className="sheet-plane__panel"
        style={{ background: panelColor }}
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
