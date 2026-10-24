/** Animated ECG trace, used as a decorative divider. */
export default function Ecg({ className = "" }: { className?: string }) {
  const d =
    "M0 40 H260 l14 -6 l10 6 H330 l8 18 l12 -56 l12 66 l10 -28 H420 l16 -10 l16 10 H700 l14 -6 l10 6 H770 l8 18 l12 -56 l12 66 l10 -28 H860 l16 -10 l16 10 H1200";
  return (
    <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="ecg-fade" x1="0" x2="1">
          <stop offset="0" stopColor="#fd291b" stopOpacity="0" />
          <stop offset="0.25" stopColor="#fd291b" stopOpacity="0.9" />
          <stop offset="0.75" stopColor="#fd291b" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fd291b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="rgba(253,41,27,0.14)" strokeWidth="1.5" />
      <path
        d={d}
        fill="none"
        stroke="url(#ecg-fade)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="220 780"
        className="animate-ecg"
        style={{ filter: "drop-shadow(0 0 6px rgba(253,41,27,0.8))" }}
      />
    </svg>
  );
}
