// Single source of truth for the CodeForge mark: a forge anvil struck by a
// hammer, rendered in the red→yellow→green brand gradient.
const Logo = ({ size = 40, showGlow = true, gradientId = "cf-logo-gradient" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="CodeForge"
    style={showGlow ? { filter: "drop-shadow(0 2px 10px rgba(210, 153, 34, 0.35))" } : undefined}
  >
    <defs>
      <linearGradient id={gradientId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f85149" />
        <stop offset="0.5" stopColor="#d29922" />
        <stop offset="1" stopColor="#3fb950" />
      </linearGradient>
    </defs>

    <rect x="1.5" y="1.5" width="45" height="45" rx="12" stroke={`url(#${gradientId})`} strokeWidth="3" />

    {/* Anvil */}
    <path
      d="M12 26h18c2.2 0 4-1.8 4-4v-1h3.5c.8 0 1.5.7 1.5 1.5 0 4.7-3.8 8.5-8.5 8.5H27v3h4a1.5 1.5 0 0 1 0 3H17a1.5 1.5 0 0 1 0-3h4v-3h-4a5 5 0 0 1-5-5Z"
      fill={`url(#${gradientId})`}
    />
    {/* Hammer head + handle */}
    <path
      d="M13.6 9.7 9.7 13.6a1.5 1.5 0 0 0 0 2.1l4.6 4.6a1.5 1.5 0 0 0 2.1 0l3.9-3.9a1.5 1.5 0 0 0 0-2.1l-4.6-4.6a1.5 1.5 0 0 0-2.1 0Z"
      fill={`url(#${gradientId})`}
      opacity="0.85"
    />
  </svg>
);

export default Logo;
