import React from "react";

import { Blockie, Punk } from "./";
import { BLOCKIES_DEFAULT_SIZE } from "./QRPunkBlockie";

export default function PunkBlockie({ address, size, style }) {
  return (
    <div style={{...style}}>
      <div className="outer">
        <div className="below" style={{ opacity: "0.5", width: size, height: size }}>
          <Blockie address={address} scale={size / BLOCKIES_DEFAULT_SIZE} />
        </div>
        <div className="top">
          <Punk address={address} size={size} />
        </div>
      </div>
    </div>
  );
}
