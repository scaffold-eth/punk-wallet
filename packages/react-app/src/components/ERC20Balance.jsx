import React, { useEffect, useState } from "react";

import { Spin } from "antd";

import { getTokenBalance } from "../helpers/ERC20Helper";

export default function ERC20Balance({ token, rpcURL, size, address }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getBalance() {
      if (!address) {
        return;
      }

      setLoading(true);

      try {
        setBalance(await getTokenBalance(token, rpcURL, address));
      } catch (error) {
        console.error("Coudn't fetch balance", error);
      }

      setLoading(false);
    }

    getBalance();
  }, [address, token, rpcURL]);

  return (
    <div>
      <span style={{ verticalAlign: "middle", fontSize: size ? size : 24, padding: 8 }}>
        {loading ? <Spin /> : balance && balance}
      </span>
    </div>
  );
}
