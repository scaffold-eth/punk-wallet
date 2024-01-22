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
  isTxSent,
}) {
  const [balance, setBalance] = useState(null);
  const [price, setPrice] = useState(0);

  const [loading, setLoading] = useState(true);

  // ToDo: Update balance after we hit Send -- solved

  // ToDo: Get rid of the error (when switching networks qickly): -- couldn't solve it from time to time the error appears
  // Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
  // https://medium.com/doctolib/react-stop-checking-if-your-component-is-mounted-3bb2568a4934

  // ToDo: Switch between token amount and token price, same as how we can switch between ETH and USD - solved

  useEffect(() => {
    async function getPrice() {
      setPrice(await getTokenPrice(targetNetwork.chainId, token.address));
    }

    getPrice();
  }, [targetNetwork, token]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const getBalance = async () => {
      if (!address) {
        return;
      }
      if (signal.aborted) {
        return;
      }

      setLoading(true);

      try {
        const response = await getTokenBalance(token, rpcURL, address);
        setBalance(response);
      } catch (error) {
        console.error("Coudn't fetch balance", error);
      }

      setLoading(false);
    };

    getBalance();

    return () => {
      abortController.abort();
    };
  }, [address, token, rpcURL, isTxSent]);

  return (
    <div>
      <span
        style={{ verticalAlign: "middle", fontSize: size ? size : 24, padding: 8, cursor: "pointer" }}
        onClick={() => {
          setDollarMode(!dollarMode);
        }}
      >
        {loading ? <Spin /> : balance && (dollarMode && price !== 0 ? "$" + (balance * price).toFixed(2) : balance)}
      </span>
    </div>
  );
}
