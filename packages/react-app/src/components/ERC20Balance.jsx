import React, { useEffect, useState } from "react";

import { Spin } from "antd";

import {
  getDisplayNumberWithDecimals,
  getTokenBalance,
  getInverseDecimalCorrectedAmountNumber,
} from "../helpers/ERC20Helper";

import { getTokenPrice } from "../helpers/LiFiTokenPriceHelper";

const { BigNumber } = require("ethers");

export default function ERC20Balance({
  targetNetwork,
  token,
  rpcURL,
  size,
  address,
  dollarMode,
  setDollarMode,
  balance,
  setBalance,
  price,
  setPrice,
}) {
  const [loading, setLoading] = useState(true);

  const [displayedNumber, setDisplayedNumber] = useState();

  useEffect(() => {
    // Price 0 means that there was an error when fetching token price
    if (price === 0) {
      setDollarMode(false);
    }

    if (!balance || (!price && price !== 0)) {
      return;
    }

    let displayNumber;

    const balanceNumber = getInverseDecimalCorrectedAmountNumber(BigNumber.from(balance), token.decimals);

    if (!dollarMode) {
      displayNumber = balanceNumber;
    } else {
      displayNumber = balanceNumber * price;
    }

    if (Math.floor(displayNumber) === displayNumber && displayNumber !== 0) {
      setDisplayedNumber(displayNumber);
      return;
    }

    setDisplayedNumber(getDisplayNumberWithDecimals(displayNumber, dollarMode));
  }, [balance, price, dollarMode]);

  // ToDo: Get rid of the error (when switching networks qickly):
  // Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
  // https://medium.com/doctolib/react-stop-checking-if-your-component-is-mounted-3bb2568a4934

  useEffect(() => {
    if (price === 0) {
      return;
    }

    async function getPrice() {
      setPrice(await getTokenPrice(targetNetwork.chainId, token.address));
    }

    getPrice();
  }, [targetNetwork, token]);

  useEffect(() => {
    if (price !== null) {
      return;
    }

    async function getPrice() {
      setPrice(await getTokenPrice(targetNetwork.chainId, token.address));
    }

    getPrice();
  }, [price]);

  useEffect(() => {
    async function getBalance() {
      if (!address) {
        return;
      }

      setLoading(true);

      try {
        const balanceBigNumber = await getTokenBalance(token, rpcURL, address);

        setBalance(balanceBigNumber.toHexString());
      } catch (error) {
        console.error("Coudn't fetch balance", error);
      }

      setLoading(false);
    }

    getBalance();
  }, [address, token, rpcURL]);

  return (
    <div>
      <span
        style={{ verticalAlign: "middle", fontSize: size ? size : 24, padding: 8, cursor: price ? "pointer" : "" }}
        onClick={() => {
          if (price) {
            setDollarMode(!dollarMode);
          }
        }}
      >
        {!displayedNumber || loading ? <Spin /> : <Display displayedNumber={displayedNumber} dollarMode={dollarMode} />}
      </span>
    </div>
  );
}

const Display = ({ displayedNumber, dollarMode }) => {
  if (dollarMode) {
    return "$" + displayedNumber;
  } else {
    return displayedNumber;
  }
};
