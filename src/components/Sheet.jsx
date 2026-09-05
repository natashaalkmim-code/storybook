import { forwardRef } from 'react';

const Sheet = forwardRef(function Sheet(
  { section, children, isActive, surfaceRef, imageRef, contentRef },
  ref
) {
  return (
    <div ref={ref} className={`sheet-plane${isActive ? ' is-active' : ''}`} aria-hidden={!isActive}>
      <img ref={imageRef} className="sheet-plane__asset" src={section.sheetImage} alt="" draggable="false" />
      <div ref={surfaceRef} className="sheet-plane__surface" />
      <div ref={contentRef} className="sheet-plane__content" tabIndex={-1}>
        {children}
      </div>
    </div>
  );
});

export default Sheet;
