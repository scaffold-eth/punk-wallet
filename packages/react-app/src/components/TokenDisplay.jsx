import React from "react";

export default function TokenDisplay({ token, divStyle, spanStyle }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: token.name == "" ? "center" : "space-evenly",
        ...divStyle,
      }}
    >
      {token?.imgSrc && <img style={{ height: "1em", width: "1em" }} src={token.imgSrc} />}

      <span style={{ ...spanStyle }}>{token.name}</span>
    </div>
  );
}
