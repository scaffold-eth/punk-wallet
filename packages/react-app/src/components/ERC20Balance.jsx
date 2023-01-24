import React, { useEffect, useState } from "react";
import { ERC20Helper } from "../helpers/ERC20Helper";

export default function ERC20Balance({erc20TokenAddress, rpcURL, size, address}) {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    async function getBalance() {
      if (!address) {
        return;
      }

      try {
          const erc20Helper = new ERC20Helper(erc20TokenAddress, null, rpcURL);

          let balance = await (erc20Helper.balanceOf(address));
          console.log("balance erc20TokenAddress:", erc20TokenAddress , balance);

          let inverseDecimalCorrectedAmountNumber = await erc20Helper.getInverseDecimalCorrectedAmountNumber(balance);

          setBalance(inverseDecimalCorrectedAmountNumber.toFixed(2));
      }
      catch (error) {
        console.error("Coudn't fetch balance", error)
      }
    }

    getBalance();
  }, [address])

  return (
    <div>
      <span
        style={{
          verticalAlign: "middle",
          fontSize: size ? size : 24,
          padding: 8,
        }}
      >
        
        {balance && balance}
      </span>
    </div>
  );
}
