import React from "react";

export default function NetworkDisplay({network, style}) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: network.color, ...style }}>
          {network.name}
        </div>
    );
}