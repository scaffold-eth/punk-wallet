// Tokens on Polygon implement Meta Transactions
// https://github.com/maticnetwork/pos-portal/blob/ece4e54546a4e075f3a03b2699bc6bd92a5bc065/contracts/common/NativeMetaTransaction.sol
// https://wiki.polygon.technology/docs/pos/design/transactions/meta-transactions/meta-transactions

// Instead of calling the transfer function on the token contract and pay for the transaction fee,
// we can sign the transfer message, and call the executeMetaTransaction function with the signature,
// from a different "relayer account", who has MATIC to pay for the transaction.

import { createEthersWallet } from "./EIP1559Helper";
import { sendTransactionViaRelayerAccount } from "./PolygonRelayerAccountHelper";
import { NETWORKS } from "../constants";

import { getTransferTxParams } from "./ERC20Helper";

const { ethers } = require("ethers");

const ABI = [
    "function getNonce(address user) view returns (uint256)",
    "function executeMetaTransaction(address userAddress,bytes calldata functionSignature, bytes32 sigR, bytes32 sigS, uint8 sigV) payable returns (bytes)"
];

const getExecuteMetaTransactionSignature = async (token, signer, nonce, functionSignature) => {
  const name = token.NativeMetaTransaction.name;
  const version = token.NativeMetaTransaction.ERC712_VERSION;
  const verifyingContract = token.address;
  const salt = ethers.utils.hexZeroPad(ethers.utils.hexlify(NETWORKS.polygon.chainId), 32);

  return ethers.utils.splitSignature(
    await signer._signTypedData(
      {
        name,
        version,
        verifyingContract,
        salt
      },
      {
        MetaTransaction: [
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "from",
            type: "address",
          },
          {
            name: "functionSignature",
            type: "bytes",
          }
        ],
      },
      {
        nonce,
        from: signer.address,
        functionSignature
      }
    )
  )
}

export const transferNativeMetaTransaction = async (token, to, amount) => {
	console.log("Gasless token transfer: ", token, to, amount);

  const transferTxParams = await getTransferTxParams(token, to, amount);
  console.log("transferTxParams", transferTxParams);

	const transferData = transferTxParams.data;
	console.log("transferData", transferData);

	const signerWallet = createEthersWallet();

	const provider = new ethers.providers.JsonRpcProvider(NETWORKS.polygon.rpcUrl);
	const contract = new ethers.Contract(token.address, ABI, provider);

	const signerNonce = await contract.getNonce(signerWallet.address);
	console.log("signerNonce", signerNonce);

	const executeMetaTransactionSignature =
		await getExecuteMetaTransactionSignature(token, signerWallet, signerNonce, transferData);

	console.log("executeMetaTransactionSignature", executeMetaTransactionSignature);

	const txParams =
		await contract.populateTransaction.executeMetaTransaction(
			signerWallet.address, transferData, executeMetaTransactionSignature.r, executeMetaTransactionSignature.s, executeMetaTransactionSignature.v);

	console.log("txParams", JSON.parse(JSON.stringify(txParams)));

	txParams.chainId = NETWORKS.polygon.chainId;

  return sendTransactionViaRelayerAccount(txParams, signerWallet.address, provider);
}











