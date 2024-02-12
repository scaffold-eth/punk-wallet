import { hexlify } from "@ethersproject/bytes";
import { parseUnits } from "@ethersproject/units";
import { notification } from "antd";
import Notify from "bnc-notify";
import { BLOCKNATIVE_DAPPID } from "../constants";
import { TransactionManager } from "./TransactionManager";
import { sendTransaction } from "./EIP1559Helper";
import { getDisplayValue, getInverseDecimalCorrectedAmountNumber, getTransferTxParams } from "./ERC20Helper";
import { transferWithAuthorization } from "./PolygonTransferWithAuthorizationHelper";
import { transferNativeMetaTransaction } from "./PolygonNativeMetaTransaction";
import { transferViaPaymaster } from "./zkSyncTestnetHelper";
import { ZK_TESTNET_USDC_ADDRESS, POLYGON_USDC_ADDRESS } from "../constants";

const { ethers } = require("ethers");

// this should probably just be renamed to "notifier"
// it is basically just a wrapper around BlockNative's wonderful Notify.js
// https://docs.blocknative.com/notify

export default function Transactor(provider, gasPrice, etherscan, injectedProvider) {
  if (typeof provider !== "undefined") {
    // eslint-disable-next-line consistent-return
    return async tx => {
      const signer = provider.getSigner();
      const network = await provider.getNetwork();
      console.log("network", network);
      const options = {
        dappId: BLOCKNATIVE_DAPPID, // GET YOUR OWN KEY AT https://account.blocknative.com
        system: "ethereum",
        networkId: network.chainId,
        // darkMode: Boolean, // (default: false)
        transactionHandler: txInformation => {
          console.log("HANDLE TX", txInformation);
        },
      };
      const notify = Notify(options);

      let etherscanNetwork = "";
      if (network.name && network.chainId > 1) {
        etherscanNetwork = network.name + ".";
      }

      let etherscanTxUrl = "https://" + etherscanNetwork + "etherscan.io/tx/";
      if (network.chainId === 100) {
        etherscanTxUrl = "https://blockscout.com/poa/xdai/tx/";
      }

      try {
        let result;
        if (tx instanceof Promise) {
          console.log("AWAITING TX", tx);
          result = await tx;
        } else {
          const erc20 = tx.erc20;

          if (erc20) {
            if (erc20?.token?.address == ZK_TESTNET_USDC_ADDRESS) {
              const zkResult = await transferViaPaymaster(erc20.token, erc20.to, erc20.amount);
              console.log("zkResult", zkResult);
              result = await provider.getTransaction(zkResult.transactionHash);
            } else if (erc20?.token?.address == POLYGON_USDC_ADDRESS) {
              result = await transferWithAuthorization(erc20.token, erc20.to, erc20.amount);
            } else if (erc20?.token?.NativeMetaTransaction) {
              result = await transferNativeMetaTransaction(erc20.token, erc20.to, erc20.amount);
            } else {
              const transferTxParams = await getTransferTxParams(erc20.token, erc20.to, erc20.amount);

              tx.to = transferTxParams.to;
              tx.data = transferTxParams.data;

              delete tx.erc20;
            }
          }

          if (!result) {
            console.log("RUNNING TX", tx);
            result = await sendTransaction(tx, signer, injectedProvider);
          }

          // Store transactionResponse in localStorage, so we can speed up the transaction if needed
          // Injected providers like MetaMask can manage their transactions on their own
          if (injectedProvider === undefined) {
            if (erc20) {
              result.erc20 = erc20;

              if (ethers.utils.isHexString(result?.erc20?.amount)) {
                result.erc20.amount = getInverseDecimalCorrectedAmountNumber(
                  ethers.BigNumber.from(result.erc20.amount),
                  result.erc20.token.decimals,
                );
              }
            }

            const transactionManager = new TransactionManager(provider, provider.getSigner());

            transactionManager.setTransactionResponse(result);
          }
        }
        console.log("RESULT:", result);
        // console.log("Notify", notify);

        // if it is a valid Notify.js network, use that, if not, just send a default notification
        if ([1, 3, 4, 5, 42, 100].indexOf(network.chainId) >= 0) {
          const { emitter } = notify.hash(result.hash);
          emitter.on("all", transaction => {
            return {
              onclick: () => window.open((etherscan || etherscanTxUrl) + transaction.hash),
            };
          });
        } else {
          notification.info({
            message: "Local Transaction Sent",
            description: result.hash,
            placement: "bottomRight",
          });
        }

        return result;
      } catch (e) {
        console.log(e);
        console.log("Transaction Error:", e.message);
        notification.error({
          message: "Transaction Error",
          description: e.message,
        });
      }
    };
  }
}
