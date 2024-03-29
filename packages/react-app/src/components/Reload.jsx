import React, { useState } from "react";

import { ReloadOutlined } from "@ant-design/icons";

import { ethers } from "ethers";
import { JsonRpcProvider} from "@ethersproject/providers";
import { formatEther } from "@ethersproject/units";

import { NETWORKS } from "../constants";

export default function Reload({ currentPunkAddress, localProvider, networkSettingsHelper, setTargetNetwork }) {
  const [checkingBalances, setCheckingBalances] = useState();

  return (
    <span
      style={{
        color: "#1890ff",
        cursor: "pointer",
        fontSize: 30,
        opacity: checkingBalances ? 0.2 : 1,
        paddingLeft: 16,
        verticalAlign: "middle",
      }}
      onClick={() => {
        checkBalances(currentPunkAddress, checkingBalances, setCheckingBalances, localProvider, networkSettingsHelper, setTargetNetwork);
      }}
    >
      <ReloadOutlined />
    </span>
  );
}

// ToDo: It could be nice to run this automatically when someone first visits the page, so we would switch to the network with some balance

// a function to check your balance on every network and switch networks if found...
const checkBalances = async (address, checkingBalances, setCheckingBalances, localProvider, networkSettingsHelper, setTargetNetwork) => {
  if (!checkingBalances) {
    setCheckingBalances(true);
    setTimeout(() => {
      setCheckingBalances(false);
    }, 5000);
    //getting current balance
    const currentBalance = await localProvider.getBalance(address);
    if (currentBalance && ethers.utils.formatEther(currentBalance) == "0.0") {
      console.log("No balance found... searching...");
      for (const n in NETWORKS) {
        try {
          const tempProvider = new JsonRpcProvider(NETWORKS[n].rpcUrl);
          const tempBalance = await tempProvider.getBalance(address);
          const result = tempBalance && formatEther(tempBalance);
          if (result != 0) {
            console.log("Found a balance in ", n);
            networkSettingsHelper.updateSelectedName(n);
            setTargetNetwork(networkSettingsHelper.getSelectedItem(true));
            break;
          }
        } catch (e) {
          console.log(e);
        }
      }
    } else {
      window.location.reload(true);
    }
  }
};
