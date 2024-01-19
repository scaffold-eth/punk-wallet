import React, { useState } from "react";
import { Button, Divider, List } from 'antd';

import InfiniteScroll from 'react-infinite-scroll-component';

import { TransactionResponseDisplay, TransactionDisplay } from "./";

import { appendDeletedOrderIdToLocalStorage, getChainId } from "../helpers/MoneriumHelper";

import { NETWORKS } from "../constants";

const getDate = (transactionResponse) => {
  return transactionResponse?.date ? transactionResponse.date : transactionResponse?.meta?.placedAt;
}

export default function TransactionHistory({ transactionResponsesArray, transactionManager, blockExplorer, useInfiniteScroll = false }) {
  const sortedTransactionResponsesArray = transactionResponsesArray.sort(
    (a, b) => {
      return new Date(getDate(b)) - new Date(getDate(a));
    }
  )

  const transactionList = (
    <List
      itemLayout="vertical"
      dataSource={sortedTransactionResponsesArray}
      renderItem={(transactionResponse) => (
        <List.Item>
          <List.Item.Meta
            description=
              {
                transactionResponse?.id ?
                  <TransactionDisplay 
                    moneriumOrder={transactionResponse}
                    erc20TokenName = {"EURe"}
                    erc20ImgSrc = {"/EURe.png"}
                    amount = {transactionResponse.amount}
                    date = {transactionResponse?.meta?.placedAt}
                    chainId = {getChainId(transactionResponse)}
                    showClearButton = {true}
                    clearButtonAction = {
                      () => {
                        appendDeletedOrderIdToLocalStorage(transactionResponse.id);
                      }
                    }
                  />
                  :
                  <TransactionResponseDisplay
                    transactionResponse={transactionResponse}
                    transactionManager={transactionManager}
                    blockExplorer={blockExplorer}
                  />
              }
          />
        </List.Item>
      )}
    />
  );

  const onClearAllTransactions = () => {
    transactionResponsesArray.forEach(
      (transactionResponse) => {
        if (transactionResponse?.id) {
          appendDeletedOrderIdToLocalStorage(transactionResponse.id);
        }
        else {
          transactionManager.removeTransactionResponse(transactionResponse)
        }
        
      } 
    );
  }

  const clearAllButton = (
    <Button style={{ marginBottom: 10 }} onClick={onClearAllTransactions}>🗑 🗑 🗑</Button>
  );

  return (
    <div>
       {useInfiniteScroll ?
          <div
            id="scrollableDiv"
            style={{
              height: 250,
              overflow: 'auto',
              padding: '0 16px',
              border: '1px solid rgba(140, 140, 140, 0.35)',
            }}
          >
            <InfiniteScroll
              dataLength={transactionResponsesArray.length}
              hasMore={true}
              scrollableTarget="scrollableDiv"
            >
              {transactionList}
           </InfiniteScroll>
         
            {(transactionResponsesArray.length > 2) && clearAllButton}
          </div>
          :
          <>
            {transactionList}
            {(transactionResponsesArray.length > 1) && clearAllButton }
            <Divider style={{ backgroundColor:"black", margin:0 }} />
          </>
        }
    </div>
  );
}
