import React from "react";

export default function TokenDisplay({ token, divStyle, spanStyle, optionalEnding }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: token.name === "" ? "center" : "space-evenly",
        ...divStyle,
      }}
    >
      {token.imgSrc && <img style={{ height: "1em", width: "1em" }} src={token.imgSrc} alt="Token Icon" />}

      <span style={{ ...spanStyle }}>
        {token.name} {optionalEnding}
      </span>
    </div>
  );
}
