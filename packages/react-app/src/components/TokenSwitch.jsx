import React from "react";
import TokenDisplay from "./TokenDisplay";

// toggle functionality for switching between ERC20 token and USD
export const TokenSwitch = ({ token, divStyle, spanStyle, price, setDisplay, display, dollarMode, setDollarMode }) => {
  const toggleUSDERC20 = () => {
    if (dollarMode) {
      if (display) {
        setDisplay((display / price).toFixed(4));
      }
      setDollarMode(false);
    } else {
      if (display) {
        setDisplay((display * price).toFixed(2));
      }
      setDollarMode(true);
    }
  };

  const switching = () => {
    return dollarMode ? (
      <>💵 USD 🔀</>
    ) : (
      <>
        <TokenDisplay
          token={token}
          divStyle={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          spanStyle={{ paddingLeft: "0.2em" }}
          optionalEnding="🔀"
        />
      </>
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
        if (price !== 0) {
          toggleUSDERC20();
        } else {
          console.log("price not available");
        }
      }}
    >
      {switching()}
    </div>
  );
};
