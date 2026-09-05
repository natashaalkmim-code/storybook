import { forwardRef, useState } from 'react';

// Two refs: `ref` is the sheet itself (the thing FolderStack flies through
// 3D space), `contentRef` is the inner wrapper (the thing FolderStack fades
// in once the spatial flight is nearly done, and focuses for keyboard/screen
// reader users once a section opens). Kept separate so the content reveal
// never fights the spatial GSAP tween for the same transform.
const Sheet = forwardRef(function Sheet({ section, isActive, contentRef, children }, ref) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div ref={ref} className={`sheet${isActive ? ' sheet--active' : ''}`}>
      <span className="sheet__paper">
        {imageFailed ? (
          <span className="sheet__fallback" aria-hidden="true" />
        ) : (
          <img
            className="sheet__image"
            src={section.sheetImage}
            alt=""
            draggable="false"
            onError={() => setImageFailed(true)}
          />
        )}
      </span>
      <div ref={contentRef} className="sheet__content" tabIndex={-1} inert={!isActive} aria-hidden={!isActive}>
        {children}
      </div>
    </div>
  );
});

export default Sheet;
