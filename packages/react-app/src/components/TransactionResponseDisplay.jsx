import { ETHERSCAN_KEY, NETWORKS } from "../constants";
import { Button, Popover } from "antd";
import React, { useEffect, useState } from "react";

import { TransactionManager } from "../helpers/TransactionManager";

import { TransactionDisplay } from "./";

import axios from "axios";

import {tokenDisplay} from "./ERC20Selector";

const { BigNumber, ethers } = require("ethers");

export default function TransactionResponseDisplay({transactionResponse, transactionManager, blockExplorer}) {
  const [confirmations, setConfirmations] = useState();
  const [loadingSpeedUp, setLoadingSpeedUp] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [estimatedConfirmationSeconds, setEstimatedConfirmationSeconds] = useState(0);

  const erc20 = transactionResponse?.erc20;

  const updateConfirmations = async () => {
    if (transactionResponse.confirmations > 0) {
      return;
    }

    let confirmations = await transactionManager.getConfirmations(transactionResponse);

    if (confirmations >= 1) {
      transactionResponse.confirmations = confirmations;
      transactionManager.updateTransactionResponse(transactionResponse);
    }

    setConfirmations(confirmations);
  }

  if (transactionResponse.confirmations == 0) {
    transactionManager.log("Pending tx:", transactionResponse.nonce, transactionResponse.hash, confirmations);
  }

  useEffect(() => {
    updateConfirmations();

    // Skip estimation, transactions are confirmed on mainnet quickly, in the next 1 or two blocks.
    // https://github.com/ethers-io/ethers.js/issues/2828#issuecomment-1283014250
    /*
    if ((transactionResponse.confirmations > 0) || (transactionResponse?.chainId != NETWORKS.ethereum.chainId)) {
      return;
    }

    getConfirmationEstimation(transactionResponse.gasPrice);
    */
  },[transactionResponse, transactionManager]);

  useEffect(() => {
    if (transactionResponse.confirmations > 0) {
      return;
    }

    const interval = setInterval(() => {
      updateConfirmations();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTransactionPopoverContent = () => {
    return (
      <div style={{ margin: "1em"}}>
        {isCancelTransaction(transactionResponse) && <p style={{ marginBottom: "2em"}}><b>The original transaciton was replaced by a cancel transaction - sending 0 to yourself</b></p>}
        <p><b>From:</b> {transactionResponse.from}</p>
        <p><b>To:</b> {transactionResponse.to}</p>
        <p><b>Value:</b> {ethers.utils.formatEther(BigNumber.from(transactionResponse.value).toString())} Ξ</p>
        <p><b>Hash:</b> {transactionResponse.hash}</p>
      </div>);
  }

  const getGasPriceGwei = () => {
    let gasPrice = transactionResponse.gasPrice ? transactionResponse.gasPrice : transactionResponse.maxPriorityFeePerGas;

    let gasPriceGwei = ethers.utils.formatUnits(gasPrice, "gwei");

    return gasPriceGwei.substring(0,5);
  }

  const handleSpeedUp = async (nonce, speedUpPercentage, cancelTransaction = false) => {
    if (cancelTransaction) {
      setLoadingCancel(true);
    }
    else {
      setLoadingSpeedUp(true);
    }
    
    let newTransactionResponse;
    try {
      if (cancelTransaction) {
        newTransactionResponse = await transactionManager.cancelTransaction(transactionManager.getTransactionResponseKey(transactionResponse));
      }
      else {
        newTransactionResponse = await transactionManager.speedUpTransaction(transactionManager.getTransactionResponseKey(transactionResponse), 10);
      }

      transactionManager.log("handleSpeedUp", newTransactionResponse, transactionResponse.hash);  

      // Sleep a little bit, the previous tx might have been confirmed in the meantime
      await new Promise(r => setTimeout(r, 6000));

      let confirmations = await transactionManager.getConfirmations(transactionResponse);

      if (confirmations > 0) {
        console.log("Previous tx has been confirmed");
        newTransactionResponse = undefined;
      }
    }
    catch(error){
      transactionManager.log("speedUpTransaction failed, previous transactionHash was probably comfirmed in the meantime", transactionResponse.hash, error);
    }

    if (cancelTransaction) {
      setLoadingCancel(false);
    }
    else {
      setLoadingSpeedUp(false);
    }

    if (newTransactionResponse) {
      if (erc20) {
        newTransactionResponse.erc20 = erc20;
      }
      
      transactionManager.setTransactionResponse(newTransactionResponse);  
    }
    else {
      transactionManager.log("newTransactionResponse is undefined", transactionResponse.nonce);
    }
  }

  const isCancelTransaction = (transactionResponse) => {
    if ((transactionResponse?.from == transactionResponse?.to) &&
        ((transactionResponse?.value == "0x") || BigNumber.from("0x0").eq(transactionResponse?.value))) {

      return true;
    }
    else {
      return false;
    }
  }


  // https://api.etherscan.io/api?module=gastracker&action=gasestimate&gasprice=8000000000&apikey=
  const getConfirmationEstimation = (gasPrice) => {
    let apiURL = "https://api.etherscan.io/api?module=gastracker&action=gasestimate&apikey=" + ETHERSCAN_KEY;

    apiURL += "&gasprice=" + BigNumber.from(gasPrice).toString();

    console.log("getConfirmationEstimation");

    axios
      .get(apiURL)
      .then(response => {
        console.log("response", apiURL,  response);
        let estimatedConfirmationSeconds = response.data.result;
        console.log("estimatedConfirmationSeconds", estimatedConfirmationSeconds);
        setEstimatedConfirmationSeconds(estimatedConfirmationSeconds);
      })
      .catch(error => console.log(error));
  }

  const getEstimatedConfirmationDuration = () => {
    if (estimatedConfirmationSeconds < 60) {
      return estimatedConfirmationSeconds + " sec"
    }
    else if (estimatedConfirmationSeconds >= 3600) {
      let hours = parseInt(parseInt(estimatedConfirmationSeconds) / 3600);

      return "> " + hours + ((hours > 1) ? " hours" : " hour");
    }
    else {
      let minutes = parseInt(parseInt(estimatedConfirmationSeconds) / 60);

      return minutes + ((minutes > 1) ? " minutes" : " minute");
    }
  }

  return  (
    <div style={{ padding: 16 }}>
      {!isCancelTransaction(transactionResponse) ?
          <TransactionDisplay 
            toAddress={erc20?.to ? erc20.to : transactionResponse.to}
            txHash={transactionResponse?.hash}
            txDisplayName={transactionResponse?.origin ? "Gasless tx " + transactionResponse?.nonce : transactionResponse?.nonce}
            erc20TokenName={erc20?.token?.name}
            erc20ImgSrc={erc20?.token?.imgSrc}
            amount={erc20?.amount ? erc20.amount : transactionResponse?.value}
            blockExplorer={blockExplorer}
            date={transactionResponse?.date}
            showClearButton={transactionResponse.confirmations != 0}
            clearButtonAction={
              () => {
                transactionManager.removeTransactionResponse(transactionResponse);
              }
            }
            chainId = {transactionResponse.chainId}
          />
        :
          <p>
            Transaction cancelled
          </p>
      }

      {(confirmations == 0) &&    
        <div>        
          <div style={{ textAlign: "center"}}>
            <Popover placement="right" content={getTransactionPopoverContent()} trigger="click">
              <Button style={{ padding: 0 }}type="link" >Transaction</Button>
            </Popover>
            <b> {transactionResponse.nonce} </b> is pending, <b> {transactionResponse.gasPrice ? "gasPrice:" : "priorityFee:"} {getGasPriceGwei()} </b>            
          </div>

          <div>
          {estimatedConfirmationSeconds ? "Estimated Confirmation Duration " + getEstimatedConfirmationDuration() : ""}
          </div>

          <div style={ !isCancelTransaction(transactionResponse) ? { display: "flex", justifyContent: "space-between"} : {}}>
            {!isCancelTransaction(transactionResponse) && <Button 
              style={{}}
              onClick={async () => {
                await handleSpeedUp(transactionResponse.nonce, 10, true);
              }}
              size="large"
              shape="round"
              loading={loadingCancel}
              disabled={loadingSpeedUp || loadingCancel || transactionResponse.origin}
             >
              Cancel
             </Button>
            }

            <Button 
              style={{}}
              onClick={async () => {
                await handleSpeedUp(transactionResponse.nonce, 10);
              }}
              size="large"
              shape="round"
              loading={loadingSpeedUp}
              disabled={loadingSpeedUp || loadingCancel || transactionResponse.origin}
             >
              {!isCancelTransaction(transactionResponse) ? <> Speed Up 10% </> : <> Speed Up This Cancellation 10% </>}
             </Button>
          </div>
        </div>
     }

    </div>
  );
}
