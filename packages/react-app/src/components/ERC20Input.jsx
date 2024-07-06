import React, { useState, useEffect } from "react";

import { Input } from "antd";

import AmountDollarSwitch from "./AmountDollarSwitch";
import TokenDisplay from "./TokenDisplay";

import { getDisplayNumberWithDecimals, getInverseDecimalCorrectedAmountNumber } from "../helpers/ERC20Helper";

const { ethers } = require("ethers");

// ToDo: add check if enough balance is available, otherwise don't allow user to send
// ToDo: address check if valid

const calcAmount = (userValueNumber, dollarMode, price) => {
  if (!dollarMode) {
    return userValueNumber;
  }

  return userValueNumber / price;
};

const Prefix = ({ dollarMode, token }) => {
  if (dollarMode) {
    return "$";
  }

  return <TokenDisplay token={token} showName={false} />;
};

const calcDisplayValue = (token, amount, dollarMode, price) => {
  if (ethers.utils.isHexString(amount)) {
    amount = getInverseDecimalCorrectedAmountNumber(amount, token.decimals);
  }

  let displayValue;

  if (!dollarMode) {
    displayValue = amount;
  } else {
    displayValue = amount * price;
  }

  if (Math.floor(displayValue) === displayValue) {
    return displayValue;
  }

  return getDisplayNumberWithDecimals(displayValue, dollarMode);
};

const handleMax = (token, setAmount, balance, setDisplayValue, dollarMode, price, setUserValue) => {
  setAmount(balance);

  setDisplayValue(calcDisplayValue(token, balance, dollarMode, price));
  setUserValue(0);
};

const resetValues = (setUserValue, setDisplayValue, setAmount) => {
  setUserValue(undefined);
  setDisplayValue(undefined);
  setAmount(undefined);
};

export default function ERC20Input({
  token,
  balance,
  dollarMode,
  setDollarMode,
  price,
  amount,
  setAmount,
  receiveMode,
}) {
  const [userValue, setUserValue] = useState();
  const [displayValue, setDisplayValue] = useState();

  const [tempAmount, setTempAmount] = useState();

  useEffect(() => {
    if (userValue === 0 || userValue === undefined) {
      return;
    }

    setDisplayValue(userValue);

    const userValueNumber = parseFloat(userValue);

    if (Number.isNaN(userValueNumber) || !(userValueNumber > 0)) {
      console.log("Not a valid amount", userValueNumber);

      setAmount(undefined);

      return;
    }

    setAmount(calcAmount(userValueNumber, dollarMode, price));
  }, [userValue]);

  useEffect(() => {
    if (!amount || !price || typeof amount === "object") {
      return;
    }

    setDisplayValue(calcDisplayValue(token, amount, dollarMode, price));
    setUserValue(0);
  }, [dollarMode]);

  useEffect(() => {
    resetValues(setUserValue, setDisplayValue, setAmount);
  }, [token]);

  useEffect(() => {
    // After we hit send, amount is set to the empty string
    // setAmount("");
    if (typeof amount === "string" && amount.length === 0) {
      resetValues(setUserValue, setDisplayValue, setAmount);
    }

    if (typeof amount === "object") {
      const decimalCorrectedAmount = parseFloat(ethers.utils.formatUnits(amount, token.decimals));

      setAmount(decimalCorrectedAmount);
      setTempAmount(decimalCorrectedAmount);
    }
  }, [amount]);

  useEffect(() => {
    if (!tempAmount || !price) {
      return;
    }

    setDisplayValue(calcDisplayValue(token, tempAmount, dollarMode, price));
    setTempAmount(undefined);

  }, [tempAmount, price]);

  return (
    <div>
      {!receiveMode && (
        <span
          style={{
            cursor: "pointer",
            color: "red",
            float: "right",
            marginTop: "-5px",
          }}
          onClick={() => {
            handleMax(token, setAmount, balance, setDisplayValue, dollarMode, price, setUserValue);
          }}
        >
          max
        </span>
      )}
      <Input
        value={displayValue}
        placeholder={"amount in " + (dollarMode ? "USD" : token.name)}
        prefix={<Prefix dollarMode={dollarMode} token={token} />}
        addonAfter={<AmountDollarSwitch token={token} dollarMode={dollarMode} setDollarMode={setDollarMode} />}
        onChange={async e => {
          if (e.target.value === "") {
            resetValues(setUserValue, setDisplayValue, setAmount);
          }
          else {
            setUserValue(e.target.value);
          }
        }}
      />
    </div>
  );
}
