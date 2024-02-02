import React, { useState, useEffect } from "react";

import { Input } from "antd";

import { TokenSwitch } from "./TokenSwitch";
import TokenDisplay from "./TokenDisplay";

// ToDo: add check if enough balance is available, otherwise don't allow user to send
// ToDo: address check if valid

export default function ERC20Input({ token, balance, dollarMode, setDollarMode, price, setAmount }) {
  const [display, setDisplay] = useState();
  const [displayMax, setDisplayMax] = useState();
  const [value, setValue] = useState();

  const amountCalculation = _value => {
    if (dollarMode) {
      const numericValue = parseFloat(_value);
      const amountToken = numericValue / price;
      setAmount(amountToken);
      if (displayMax) {
        setDisplay((numericValue * price).toFixed(2));
      }
    } else {
      setAmount(_value);
      if (displayMax) {
        setDisplay(_value);
      }
    }
  };
  // for tokenswitch so that switch to usd can be disabled
  if (price === 0 && !dollarMode) {
    setDollarMode(false);
  }

  useEffect(() => {
    if (displayMax) {
      amountCalculation(balance);
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
        placeholder={"amount in " + (dollarMode ? "USD" : token.name)}
        prefix={<Prefix dollarMode={dollarMode} token={token} />}
        addonAfter={
          <TokenSwitch
            token={token}
            price={price}
            setDisplay={setDisplay}
            display={display}
            dollarMode={dollarMode}
            setDollarMode={setDollarMode}
            value={value}
            setValue={setValue}
          />
        }
        onChange={async e => {
          amountCalculation(e.target.value);
          setValue(e.target.value);
          setDisplay(e.target.value);
          setDisplayMax(false);
        }}
      />
    </div>
  );
}

const Prefix = ({ dollarMode, token }) => {
  if (dollarMode) {
    return "$";
  }

  return <TokenDisplay token={token} showName={false} />;
};
