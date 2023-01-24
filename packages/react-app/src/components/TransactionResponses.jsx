import React, { useEffect, useState } from "react";
import { TransactionManager } from "../helpers/TransactionManager";
import { TransactionHistory } from "./";

export default function TransactionResponses({provider, signer, injectedProvider, address, chainId, blockExplorer, ERC20Mode, erc20TokenDisplayName}) {
  const transactionManager = new TransactionManager(provider, signer, true);

  const [transactionResponsesArray, setTransactionResponsesArray] = useState([]);

  const initTransactionResponsesArray = () => {
    if (injectedProvider !== undefined) {
      setTransactionResponsesArray([]);
    }
    else {
      setTransactionResponsesArray(
        filterResponsesAddressAndChainId(
          transactionManager.getTransactionResponsesArray()));    
    }
  }

  const filterResponsesAddressAndChainId = (transactionResponsesArray) => {
    return transactionResponsesArray.filter(
      transactionResponse => {
        if (transactionResponse.from != address) {
          return false;
        }

        if (transactionResponse.chainId != chainId) {
          return false;
        }

        let transactionResponseERC20Mode = false;
        if (transactionResponse?.ERC20Mode) {
          transactionResponseERC20Mode = true;
        }

        if (ERC20Mode) {
          return transactionResponseERC20Mode;
        }
        else {
          return !transactionResponseERC20Mode;
        }
      })
  }

  useEffect(() => {
    if (!address) {
      return;
    }

    initTransactionResponsesArray();

    // Listen for storage change events from the same and from other windows as well
    window.addEventListener("storage", initTransactionResponsesArray);
    window.addEventListener(transactionManager.getLocalStorageChangedEventName(), initTransactionResponsesArray);

    return () => {
      window.removeEventListener("storage", initTransactionResponsesArray);
      window.removeEventListener(transactionManager.getLocalStorageChangedEventName(), initTransactionResponsesArray);
    }
  }, [injectedProvider, address, chainId]);
  
    return (
      <>
      {(transactionResponsesArray.length > 0) && <TransactionHistory transactionResponsesArray={transactionResponsesArray} transactionManager={transactionManager} blockExplorer={blockExplorer} ERC20Mode={ERC20Mode} erc20TokenDisplayName={erc20TokenDisplayName}/>}
      </>
    );  
  }
