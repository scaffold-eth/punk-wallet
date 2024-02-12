import React from "react";
import TokenDisplay from "./TokenDisplay";

// toggle functionality for switching between ERC20 token and USD
export default function AmountDollarSwitch({ token, dollarMode, setDollarMode }) {
  return (
    <div
      onClick={() => {
        setDollarMode(!dollarMode);
      }}
    >
      <Switch dollarMode={dollarMode} token={token} />
    </div>
  );
}

const Switch = ({ dollarMode, token }) => {
  return dollarMode ? (
    <>💵 USD 🔀</>
  ) : (
    <>
      <TokenDisplay token={token} spanStyle={{ paddingLeft: "0.2em" }} optionalEnding="🔀" />
    </>
  );
};
