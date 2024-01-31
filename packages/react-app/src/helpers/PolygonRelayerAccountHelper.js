import { sendTransaction } from "./EIP1559Helper";

const { ethers } = require("ethers");

const RELAYER_PK = process.env.REACT_APP_RELAYER_PK;

export const sendTransactionViaRelayerAccount = async (txParams, origin, provider) => {
	const relayerWallet = new ethers.Wallet(RELAYER_PK, provider);

	const result = await sendTransaction(txParams, undefined, undefined, relayerWallet);

	result.origin = origin;

	return result;
}
