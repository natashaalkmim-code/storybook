import CloseButton from './CloseButton';

export default function SectionPage({ title, onClose, disabled, children }) {
  return (
    <article className="section-page">
      <header className="section-page__header">
        <p className="section-page__eyebrow">Storybook Studio</p>
        <div className="section-page__title-row">
          <h1>{title}</h1>
          <CloseButton onClick={onClose} disabled={disabled} />
        </div>
      </header>
      <div className="section-page__body">{children}</div>
    </article>
  );
}
