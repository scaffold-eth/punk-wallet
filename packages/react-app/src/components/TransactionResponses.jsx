import React, { useEffect, useState } from "react";

import { HistoryOutlined } from "@ant-design/icons";

import { TransactionHistory } from "./";
import { TransactionManager } from "../helpers/TransactionManager";

import { getDeletedOrderIdsFromLocalStorage, getChainId } from "../helpers/MoneriumHelper";

export default function TransactionResponses({provider, signer, injectedProvider, address, chainId, blockExplorer, moneriumOrders, showHistory, setShowHistory}) {
  const transactionManager = new TransactionManager(provider, signer, true);

  const [transactionResponsesArray, setTransactionResponsesArray] = useState([]);

  let filteredMoneriumOrders = undefined;

  const initTransactionResponsesArray = () => {
    const deletedOrderIdsFromLocalStorage = getDeletedOrderIdsFromLocalStorage();

    if (moneriumOrders) {
      filteredMoneriumOrders = moneriumOrders.filter(
        moneriumOrder => {
          return (getChainId(moneriumOrder) == chainId) && !deletedOrderIdsFromLocalStorage.includes(moneriumOrder.id);
        })
    }

    if (injectedProvider !== undefined) {
      setTransactionResponsesArray([]);
    }
    else {
      if (!address || !chainId) {
        return;
      }

      const onChainTransactions = filterResponsesAddressAndChainId(
          transactionManager.getTransactionResponsesArray());

      let onAndOffChainTransactions = onChainTransactions;

      if (moneriumOrders) {
        onAndOffChainTransactions = onChainTransactions.concat(filteredMoneriumOrders);
      }

      setTransactionResponsesArray(onAndOffChainTransactions);    
    }
  }

  const filterResponsesAddressAndChainId = (transactionResponsesArray) => {
    return transactionResponsesArray.filter(
      transactionResponse => {
        return ((transactionResponse.from == address) || (transactionResponse?.origin == address)) && (transactionResponse.chainId == chainId);
      })
  }

  useEffect(() => {
    initTransactionResponsesArray();

    // Listen for storage change events from the same and from other windows as well
    window.addEventListener("storage", initTransactionResponsesArray);
    window.addEventListener(transactionManager.getLocalStorageChangedEventName(), initTransactionResponsesArray);

    return () => {
      window.removeEventListener("storage", initTransactionResponsesArray);
      window.removeEventListener(transactionManager.getLocalStorageChangedEventName(), initTransactionResponsesArray);
    }
  }, [injectedProvider, address, chainId, moneriumOrders]);
  
    return (
      <>
        {((transactionResponsesArray.length > 0) || (filteredMoneriumOrders && filteredMoneriumOrders.length > 0)) &&
          <div 
            style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", fontSize:"2em", cursor: "pointer"}}
            onClick={
              () => {
                setShowHistory(!showHistory)
              } 
            }
          >
              <HistoryOutlined style={{ color: showHistory ? "black" : "gray"}}/>
          </div>
        }

        {(transactionResponsesArray.length > 0) && showHistory && <TransactionHistory transactionResponsesArray={transactionResponsesArray} transactionManager={transactionManager} blockExplorer={blockExplorer}/>}
      </>
    );  
  }
