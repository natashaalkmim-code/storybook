export default function CloseButton({ onClick, disabled }) {
  return (
    <button className="close-button" type="button" onClick={onClick} disabled={disabled} aria-label="Close section">
      <span />
      <span />
    </button>
  );
}
