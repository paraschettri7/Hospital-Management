export default function LoadingScreen({ label = "Loading" }) {
  return (
    <div className="full-center" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span className="text-soft" style={{ marginLeft: "0.6rem" }}>
        {label}…
      </span>
    </div>
  );
}
