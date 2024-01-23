import React, { useState, useEffect } from "react";

import { Input } from "antd";
import { getTokenPrice } from "../helpers/LiFiTokenPriceHelper";

import { TokenSwitch } from "./TokenSwitch";

// ToDo: Prefix could be updated with token symbol instead of ticker
// ToDo: Link Balance on top with toggle in Input, so that when it is clicked both values are changed
// ToDo: add max Button
// ToDo: add check if enough balance is available, otherwise don't allow user to send
// ToDo: address check if valid

export default function ERC20Input({ token, targetNetwork, onChange }) {
  const [mode, setMode] = useState(token.name);
  const [price, setPrice] = useState(0);
  const [display, setDisplay] = useState();

  const prefix = mode === "USD" ? "$" : token.name;
  const placeholder = `amount in ${mode}`;

  async function getPrice() {
    try {
      const newPrice = await getTokenPrice(targetNetwork.chainId, token.address);
      setPrice(newPrice);
    } catch (error) {
      console.error("Error fetching token price", error);
    }
  }

  const amountCalculation = _value => {
    if (mode === "USD") {
      const numericValue = parseFloat(_value);
      const amountToken = numericValue / price;
      onChange(amountToken);
    } else {
      onChange(_value);
    }
  };

  useEffect(() => {
    getPrice();

    // Call price update just every 30sec instead of having price updates every second
    const interval = setInterval(getPrice, 30000);

    // Clear interval on component unmount to prevent memory overflow
    return () => clearInterval(interval);
  }, [targetNetwork, token]);

  return (
    <div>
      <Input
        value={display}
        placeholder={placeholder}
        prefix={prefix}
        addonAfter={
          <TokenSwitch
            token={token}
            setMode={setMode}
            mode={mode}
            toggle
            price={price}
            setDisplay={setDisplay}
            display={display}
          />
        }
        onChange={async e => {
          amountCalculation(e.target.value);
          setDisplay(e.target.value);
        }}
      />
    </div>
  );
}
