import CloseButton from './CloseButton';

export default function SectionPage({ section, onClose, isAnimating, children }) {
  return (
    <article className="section-page">
      <div className="section-page__head">
        <h1 className="section-page__title">{section.label}</h1>
        <CloseButton onClose={onClose} disabled={isAnimating} />
      </div>
      <div className="section-page__body">{children}</div>
    </article>
  );
}
