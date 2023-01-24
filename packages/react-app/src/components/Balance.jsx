import { formatEther } from "@ethersproject/units";
import React, { useState } from "react";
import { useBalance } from "../hooks";
import { ERC20Balance } from "./";
import { Select} from "antd";

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

export default function Balance(props) {
  const targetNetwork = props.targetNetwork;

  const erc20TokenAddress = targetNetwork?.erc20TokenAddress;

  const ERC20_MODE = targetNetwork?.erc20TokenDisplayName ? targetNetwork.erc20TokenDisplayName : "ERC20";
  const ETH_MODE = targetNetwork?.networkETHName ? targetNetwork.networkETHName : "ETH";
 
  const [dollarMode, setDollarMode] = useState(true);

  // const [listening, setListening] = useState(false);

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

  let displayBalance = floatBalance.toFixed(4);

  const price = props.price || props.dollarMultiplier;

  if (price && dollarMode) {
    displayBalance = "$" + (floatBalance * price).toFixed(2);
  }
  if (!dollarMode) {
   displayBalance = "Ξ" + displayBalance;  
  }

  const options = [];

  options.push(
    <Select.Option key={ERC20_MODE} value={ERC20_MODE}>
      <span style={{ color: "purple", fontSize: 24 }}>{ERC20_MODE}</span>
    </Select.Option>,
  );

  options.push(
    <Select.Option key={ETH_MODE} value={ETH_MODE}>
      <span style={{ color: "black", fontSize: 24 }}>{ETH_MODE}</span>
    </Select.Option>,
  );

  const buidlSelect = (
    <div>
      <Select
        size="large"
        defaultValue={props.ERC20Mode ? ERC20_MODE : ETH_MODE}
        style={{ textAlign: "left", width: 170, fontSize: 30 }}
        listHeight={1024}
        onChange={value => {
          if (value == ERC20_MODE) {
            window.localStorage.setItem("ERC20Mode" + targetNetwork?.name, true);
          }
          else {
            window.localStorage.setItem("ERC20Mode" + targetNetwork?.name, false);
          }
          setTimeout(() => {
            window.location.reload();
          }, 1);
        }}
      >
        {options}
      </Select>
    </div>
  );

  return (
   <>
     {erc20TokenAddress && buidlSelect}
     {(!erc20TokenAddress || !props.ERC20Mode) && 
        <div>
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
        </div>
      }
      {props.ERC20Mode &&  erc20TokenAddress && <ERC20Balance erc20TokenAddress={erc20TokenAddress} size={props.size} userProvider={props.userProvider} rpcURL={props.targetNetwork.rpcUrl} address={props.address} />}
    </>
  );
}
