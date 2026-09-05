export default function CloseButton({ onClose, disabled }) {
  return (
    <button
      type="button"
      className="close-button"
      onClick={onClose}
      disabled={disabled}
      aria-label="Close and return to the stack"
    >
      <span className="close-button__line" />
      <span className="close-button__line" />
    </button>
  );
}
