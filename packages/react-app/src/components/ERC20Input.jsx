import React, { useState, useEffect } from "react";

import { Input } from "antd";

import { TokenSwitch } from "./TokenSwitch";

// ToDo: Prefix could be updated with token symbol instead of ticker
// ToDo: Link Balance on top with toggle in Input, so that when it is clicked both values are changed
// ToDo: add max Button
// ToDo: add check if enough balance is available, otherwise don't allow user to send
// ToDo: address check if valid

export default function ERC20Input({ token, onChange, balance, dollarMode, setDollarMode, price }) {
  const [display, setDisplay] = useState();
  const [displayMax, setDisplayMax] = useState();

  const prefix = dollarMode ? "$" : token.name;

  const amountCalculation = _value => {
    if (dollarMode) {
      const numericValue = parseFloat(_value);
      const amountToken = numericValue / price;
      onChange(amountToken);
      if (displayMax) {
        setDisplay((numericValue * price).toFixed(2));
      }
    } else {
      onChange(_value);
      if (displayMax) {
        setDisplay(_value);
      }
    }
  };

  useEffect(() => {
    if (displayMax) {
      amountCalculation(balance);
    }
    // for tokenswitch so that switch to usd can be disabled
    if (price === 0) {
      setDollarMode(false);
    }
  }, [token, displayMax]);

  return (
    <div>
      <span
        style={{ cursor: "pointer", color: "red", float: "right", marginTop: "-5px" }}
        onClick={() => {
          setDisplayMax(true);
          amountCalculation(balance);
          console.log("dollarMode", dollarMode);
        }}
      >
        max
      </span>
      <Input
        value={display}
        placeholder="...insert amout"
        prefix={prefix}
        addonAfter={
          <TokenSwitch
            token={token}
            price={price}
            setDisplay={setDisplay}
            display={display}
            dollarMode={dollarMode}
            setDollarMode={setDollarMode}
          />
        }
        onChange={async e => {
          amountCalculation(e.target.value);
          setDisplay(e.target.value);
          setDisplayMax(false);
        }}
      />
    </div>
  );
}
