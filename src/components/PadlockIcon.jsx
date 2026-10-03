import React from "react";

// Sits behind the grid mark on locked tiles, so only the shackle and the
// shoulders of the body read against the card.
const PadlockIcon = ({ size = 76, color = "#b0b0b0" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M32 50 V34 a18 18 0 0 1 36 0 V50"
      fill="none"
      stroke={color}
      strokeWidth="11"
      strokeLinecap="round"
    />
    <rect x="24" y="48" width="52" height="40" rx="7" fill={color} />
  </svg>
);

export default PadlockIcon;
