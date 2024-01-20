import { formatEther } from "@ethersproject/units";
import React, { useState, useEffect } from "react";
import { useBalance } from "../hooks";

/*
  ~ What it does? ~

  Displays a balance of given address in ether & dollar

  ~ How can I use? ~

  <Balance
    address={address}
    provider={mainnetProvider}
    price={price}
  />

  ~ If you already have the balance as a bignumber ~
  <Balance
    balance={balance}
    price={price}
  />

  ~ Features ~

  - Provide address={address} and get balance corresponding to given address
  - Provide provider={mainnetProvider} to access balance on mainnet or any other network (ex. localProvider)
  - Provide price={price} of ether and get your balance converted to dollars
*/

export default function Balance(props, isTxSent) {
  // const [listening, setListening] = useState(false);
  const [displayBalance, setDisplayBalance] = useState("");

  const dollarMode = props.dollarMode;
  const setDollarMode = props.setDollarMode;

  const balance = useBalance(props.provider, props.address);

  let floatBalance = parseFloat("0.00");

  let usingBalance = balance;

  if (typeof props.balance !== "undefined") {
    usingBalance = props.balance;
  }
  if (typeof props.value !== "undefined") {
    usingBalance = props.value;
  }

  if (usingBalance) {
    const etherBalance = formatEther(usingBalance);
    parseFloat(etherBalance).toFixed(2);
    floatBalance = parseFloat(etherBalance);
  }

  const price = props.price || props.dollarMultiplier;

  useEffect(() => {
    let newDisplayBalance = floatBalance.toFixed(4);

    if (price && dollarMode) {
      newDisplayBalance = "$" + (floatBalance * price).toFixed(2);
    }

    setDisplayBalance(newDisplayBalance);
  }, [floatBalance, dollarMode, price]);

  // Recalculate displayBalance when tx is sent
  useEffect(() => {
    let newDisplayBalance = floatBalance.toFixed(4);

    if (price && dollarMode) {
      newDisplayBalance = "$" + (floatBalance * price).toFixed(2);
    }

    setDisplayBalance(newDisplayBalance);
  }, [isTxSent]);

  return (
    <span
      style={{
        verticalAlign: "middle",
        fontSize: props.size ? props.size : 24,
        padding: 8,
        cursor: "pointer",
      }}
      onClick={() => {
        setDollarMode(!dollarMode);
      }}
    >
      {displayBalance}
    </span>
  );
}
