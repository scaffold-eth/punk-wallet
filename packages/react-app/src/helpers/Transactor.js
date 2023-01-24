import { hexlify } from "@ethersproject/bytes";
import { parseUnits } from "@ethersproject/units";
import { notification } from "antd";
import Notify from "bnc-notify";
import { BLOCKNATIVE_DAPPID } from "../constants";
import { TransactionManager } from "./TransactionManager";
import { Wallet, Contract, utils, Provider, EIP712Signer } from "zksync-web3";

const { ethers, BigNumber } = require("ethers");

const ERC20ABI = '[ { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]';

// this should probably just be renamed to "notifier"
// it is basically just a wrapper around BlockNative's wonderful Notify.js
// https://docs.blocknative.com/notify

export default function Transactor(provider, gasPrice, etherscan, injectedProvider, ERC20Mode, address, targetNetwork) {
  if (typeof provider !== "undefined") {
    // eslint-disable-next-line consistent-return
    return async tx => {
      const to = tx.to;
      const amount = tx?.value;

      if (ERC20Mode) {
        const privateKey = localStorage.getItem('metaPrivateKey');
        let wallet = new ethers.Wallet(privateKey);

        const decimals = targetNetwork.erc20TokenDecimals;
        const amountNumber = tx.value * Math.pow(10, decimals);
        const amountHex = BigNumber.from(amountNumber.toString()).toHexString();

        let nonce;
        try {
          nonce = await provider.getTransactionCount(address);  
        }
        catch(error) {
          console.error("Cannot fetch nonce for address", address, error);
        }

        if ((targetNetwork.name == "zksyncalpha")) {
          const zksyncProvider = new Provider(targetNetwork.rpcUrl);

          wallet = new Wallet(wallet);
          wallet = wallet.connect(zksyncProvider);  

          const erc20Contract = new Contract(targetNetwork.erc20TokenAddress, ERC20ABI, injectedProvider ? injectedProvider.getSigner() : wallet);

          try {
            const paymasterParams =
                utils.getPaymasterParams(
                  targetNetwork.paymasterAddress,
                  {
                      type: "General",
                      innerInput: new Uint8Array(),
                  }
            );

            const receipt = await (
                await erc20Contract.transfer(tx.to, amountHex, { 
                  // paymaster info
                  customData: {
                    paymasterParams
                  },
                })
            ).wait();

           console.log("receipt", receipt);

            if (injectedProvider === undefined) {
              const transactionManager = new TransactionManager(provider, provider.getSigner());

              const txResponse = {};
              txResponse.confirmations = 100;
              txResponse.from = receipt.from;
              txResponse.to = to;
              txResponse.hash = receipt.transactionHash;
              txResponse.erc20Value = amount.toString();
              
              txResponse.chainId = targetNetwork.chainId;
              txResponse.ERC20Mode = true;

              function randomIntFromInterval(min, max) { // min and max included 
                return Math.floor(Math.random() * (max - min + 1) + min)
              }
              txResponse.nonce = nonce ? nonce : randomIntFromInterval(0, 100000);

              transactionManager.setTransactionResponse(txResponse);

              return receipt.hash;
            }
          }
          catch (error) {
            console.log("Something ent wrong", error);
          }

          return;   
        }
        else {
          const erc20Contract = new ethers.Contract(targetNetwork.erc20TokenAddress, ERC20ABI, provider.getSigner());

          tx = await erc20Contract.populateTransaction.transfer(tx.to, amountHex);
          tx.chainId = targetNetwork.chainId;

          console.log("populatedTx", tx);
        }
      }

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
          //if (!tx.gasPrice) {
          //  tx.gasPrice = gasPrice || parseUnits("4.1", "gwei");
          //}
          //if (!tx.gasLimit) {
          //  tx.gasLimit = hexlify(120000);
          //}
          console.log("RUNNING TX", tx);
          result = await signer.sendTransaction(tx);

          // Store transactionResponse in localStorage, so we can speed up the transaction if needed
          // Injected providers like MetaMask can manage their transactions on their own
          if (injectedProvider === undefined) {
            const transactionManager = new TransactionManager(provider, provider.getSigner());
            if (ERC20Mode) {
              result.ERC20Mode = true;
              result.to = to;
              result.erc20Value = amount.toString();
            }

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
