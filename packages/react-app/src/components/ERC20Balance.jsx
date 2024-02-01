import React, { useEffect, useState } from "react";

import { Spin } from "antd";

import { getTokenBalance } from "../helpers/ERC20Helper";

import { getTokenPrice } from "../helpers/LiFiTokenPriceHelper";

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

  // ToDo: Update balance after we hit Send

  // ToDo: Get rid of the error (when switching networks qickly):
  // Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
  // https://medium.com/doctolib/react-stop-checking-if-your-component-is-mounted-3bb2568a4934

  useEffect(() => {
    async function getPrice() {
      setPrice(await getTokenPrice(targetNetwork.chainId, token.address));
    }

    getPrice();
  }, [targetNetwork, token]);

  useEffect(() => {
    async function getBalance() {
      if (!address) {
        return;
      }

      setLoading(true);

      try {
        setBalance(await getTokenBalance(token, rpcURL, address, price));
      } catch (error) {
        console.error("Coudn't fetch balance", error);
      }

      setLoading(false);
    }

    getBalance();
  }, [address, token, rpcURL, price]);

  return (
    <div>
      <span
        style={{ verticalAlign: "middle", fontSize: size ? size : 24, padding: 8, cursor: "pointer" }}
        onClick={() => {
          setDollarMode(!dollarMode);
        }}
      >
        {loading ? <Spin /> : balance && (dollarMode && price != 0 ? "$" + (balance * price).toFixed(2) : balance)}
      </span>
    </div>
  );
}
