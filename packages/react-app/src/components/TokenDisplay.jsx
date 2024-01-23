import React from "react";

// toggle functionality for switching between ERC20 token and USD
export default function TokenDisplay({
  token,
  divStyle,
  spanStyle,
  setMode,
  mode,
  toggle,
  price,
  setDisplay,
  display,
}) {
  const toggleUSDERC20 = () => {
    if (mode === "USD") {
      setDisplay((display / price).toFixed(4));
      setMode(token.name);
    } else {
      setDisplay((display * price).toFixed(2));
      setMode("USD");
    }
  };

  const switchMode = () => {
    return mode === token.name ? (
      <>
        <img style={{ height: "1em", width: "1em", marginRight: "0.5em" }} alt="Token symbol" src={token.imgSrc} />
        <span style={{ ...spanStyle }}>{token.name} 🔀</span>
      </>
    ) : (
      <>💵 USD 🔀</>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: token.name === "" ? "center" : "space-evenly",
        ...divStyle,
      }}
      onClick={() => {
        if (toggle) {
          toggleUSDERC20();
        }
      }}
    >
      {toggle ? (
        token.imgSrc && switchMode()
      ) : (
        <>
          {token.imgSrc && <img style={{ height: "1em", width: "1em" }} src={token.imgSrc} alt="token" />}
          <span style={{ ...spanStyle }}>{token.name}</span>
        </>
      )}
    </div>
  );
}
