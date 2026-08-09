// Signature element: a thin ECG-style line used sparingly as a section break.
export default function PulseDivider({ animated = false }) {
  return (
    <svg
      className={`pulse-divider${animated ? " animated" : ""}`}
      viewBox="0 0 400 28"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0 14 H130 L145 4 L160 24 L175 14 L185 20 L195 14 H400" />
    </svg>
  );
}
