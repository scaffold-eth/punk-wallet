import React, { useEffect } from "react";

export default function ERC20Balance({size}) {
  let displayBalance = 20;

  return (
    <span
      style={{
        verticalAlign: "middle",
        fontSize: size ? size : 24,
        padding: 8,
      }}

    >
      {displayBalance.toFixed(2)}
    </span>
  );
}
