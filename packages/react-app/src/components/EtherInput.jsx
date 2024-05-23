import { Input } from "antd";
import React, { useEffect, useState } from "react";
import { useBalance } from "eth-hooks";

const { utils } = require("ethers");

// small change in useEffect, display currentValue if it's provided by user

/*
  ~ What it does? ~

  Displays input field for ETH/USD amount, with an option to convert between ETH and USD

  ~ How can I use? ~

  <EtherInput
    autofocus
    price={price}
    value=100
    placeholder="Enter amount"
    onChange={value => {
      setAmount(value);
    }}
  />

  ~ Features ~

  - Provide price={price} of ether and easily convert between USD and ETH
  - Provide value={value} to specify initial amount of ether
  - Provide placeholder="Enter amount" value for the input
  - Control input change by onChange={value => { setAmount(value);}}
*/

export default function EtherInput(props) {
  const [mode, setMode] = useState(props.ethMode ? props.token : props.price ? "USD" : props.token);
  const [value, setValue] = useState();
  const [displayMax, setDisplayMax] = useState();

  const currentValue = typeof props.value !== "undefined" ? props.value : value;

  const [display, setDisplay] = useState(currentValue);

  const balance = useBalance(props.provider, props.address, 1000);
  let floatBalance = parseFloat("0.00");
  const usingBalance = balance;

  let gasCost = 0;

  if (usingBalance) {
    if (props.gasPrice) {
      gasCost = (parseInt(props.gasPrice, 10) * 150000) / 10 ** 18;
    }

    const etherBalance = utils.formatEther(usingBalance);
    parseFloat(etherBalance).toFixed(2);
    floatBalance = parseFloat(etherBalance - gasCost);
    if (floatBalance < 0) {
      floatBalance = 0;
    }
  }

  let displayBalance = floatBalance.toFixed(4);

  const price = props.price;

  function getBalance(_mode) {
    setValue(floatBalance);
    if (_mode === "USD") {
      displayBalance = (floatBalance * price).toFixed(2);
    } else {
      displayBalance = floatBalance.toFixed(4);
    }
    return displayBalance;
  }

  const option = title => {
    if (!props.price) return "";
    return (
      <div
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (mode === "USD") {
            setMode(props.token);
            displayMax ? setDisplay(getBalance("ETH")) : setDisplay(currentValue);
          } else if (mode === "ETH") {
            setMode("USD");
            if (currentValue) {
              const usdValue = "" + (parseFloat(currentValue) * props.price).toFixed(2);
              displayMax ? setDisplay(getBalance("USD")) : setDisplay(usdValue);
            } else {
              setDisplay(currentValue);
            }
          }
        }}
      >
        {title}
      </div>
    );
  };

  let prefix;
  let addonAfter;
  if (mode === "USD") {
    prefix = "$";
    addonAfter = option("USD 🔀");
  } else {
    prefix = "Ξ";
    addonAfter = option(props.token + " 🔀");
  }

  useEffect(() => {
    if (!currentValue && !displayMax) {
      setDisplay("");
    }
  }, [currentValue]);

  return (
    <div>
      <span
        style={{
          cursor: "pointer",
          color: "red",
          float: "right",
          marginTop: "-5px",
          visibility: !props.receiveMode ? "visible" : "hidden",
        }}
        onClick={() => {
          setDisplay(getBalance(mode));
          setDisplayMax(true);
          if (typeof props.onChange === "function") {
            props.onChange(floatBalance);
          }
        }}
      >
        max
      </span>
      <Input
        placeholder={props.placeholder ? props.placeholder : "amount in " + mode}
        autoFocus={props.autoFocus}
        prefix={prefix}
        value={display}
        addonAfter={addonAfter}
        onChange={async e => {
          const newValue = e.target.value;
          setDisplayMax(false);

          if (e.target.value === "") {
            if (typeof props.onChange === "function") {
              props.onChange(undefined);
            }
          }

          if (mode === "USD") {
            const possibleNewValue = parseFloat(newValue);
            if (possibleNewValue) {
              const ethValue = possibleNewValue / props.price;
              setValue(ethValue);
              if (typeof props.onChange === "function") {
                props.onChange(ethValue);
              }
              setDisplay(newValue);
            } else {
              setDisplay(newValue);
            }
          } else {
            setValue(newValue);
            if (typeof props.onChange === "function") {
              props.onChange(newValue);
            }
            setDisplay(newValue);
          }
        }}
      />
    </div>
  );
}
