import React, { useState } from "react";

// toggle functionality for switching between ERC20 token and USD
export const TokenSwitch = ({
  token,
  divStyle,
  spanStyle,
  setMode,
  mode,
  price,
  setDisplay,
  display,
  setPlaceholder,
  setDisabledInput,
}) => {
  // serves a placeholder for the display value when price is 0
  const [tempDisplay, setTempDisplay] = useState();

  const toggleUSDERC20 = () => {
    if (mode === "USD") {
      if (display && price !== 0) {
        setDisplay((display / price).toFixed(4));
        setPlaceholder(`amount in ${mode}`);
      }
      if (price === 0) {
        setDisabledInput(false);
        setDisplay(tempDisplay);
      }
      setMode(token.name);
    } else {
      if (display) {
        if (price !== 0) {
          setDisplay((display * price).toFixed(2));
          setPlaceholder(`amount in ${mode}`);
        } else {
          setTempDisplay(display);
          setDisplay();
          setDisabledInput(true);
          setPlaceholder(`no price available`);
        }
      }
      setMode("USD");
    }
  };

  const switching = () => {
    return mode === token.name ? (
      <>
        {token.imgSrc && (
          <img style={{ height: "1em", width: "1em", marginRight: "5px" }} src={token.imgSrc} alt="token" />
        )}
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
        toggleUSDERC20();
      }}
    >
      {switching()}
    </div>
  );
};
