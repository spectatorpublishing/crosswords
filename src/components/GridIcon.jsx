import React from "react";

const GridIcon = ({ cell = "#60a0e5", size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    aria-hidden="true"
    focusable="false"
  >
    <rect
      x="4"
      y="4"
      width="46"
      height="46"
      fill={cell}
      stroke="#000"
      strokeWidth="8"
    />
    <rect
      x="50"
      y="4"
      width="46"
      height="46"
      fill="#fff"
      stroke="#000"
      strokeWidth="8"
    />
    <rect
      x="4"
      y="50"
      width="46"
      height="46"
      fill="#fff"
      stroke="#000"
      strokeWidth="8"
    />
    <rect
      x="50"
      y="50"
      width="46"
      height="46"
      fill={cell}
      stroke="#000"
      strokeWidth="8"
    />
  </svg>
);

export default GridIcon;
