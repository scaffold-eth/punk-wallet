import { NETWORKS } from "../constants";
import { TransactionManager } from "./TransactionManager";

const axios = require("axios");
const { ethers, BigNumber, utils } = require("ethers");

const POLYGON_GAS_API_URL = "https://gasstation.polygon.technology/v2";

// Create an ethers wallet from the localStorage private key, for EIP-1559 type-2 transactions
// Mainnet and polygon only
export const getEthersWallet = txParams => {
  const chainId = getChainIdNumber(txParams);
  if (!chainId) {
    return;
  }

  let rpcUrl;
  if (chainId == NETWORKS.ethereum.chainId) {
    rpcUrl = NETWORKS.ethereum.rpcUrl;
  } else if (chainId == NETWORKS.polygon.chainId) {
    rpcUrl = NETWORKS.polygon.rpcUrl;
  } else {
    console.error("Only mainnet and polygon support EIP-1559");
    return;
  }

  const ethersProvider = new ethers.providers.StaticJsonRpcProvider(rpcUrl);

  return createEthersWallet(ethersProvider);
};

export const createEthersWallet = ethersProvider => {
  const privakeKey = localStorage.getItem("metaPrivateKey");

  if (ethersProvider) {
    return new ethers.Wallet(privakeKey, ethersProvider);
  }

  return new ethers.Wallet(privakeKey);
};

// Create EIP-1559 type-2 transactions on mainnet and polygon
// Other networks use legacy transactions with gasPrice
export const sendTransaction = (txParams, signer, injectedProvider) => {
  const chainId = getChainIdNumber(txParams);

  let result;

  if (
    injectedProvider !== undefined || // In case of an injected provider like metamask, let them handle the transaction
    !chainId ||
    (chainId != NETWORKS.ethereum.chainId && chainId != NETWORKS.polygon.chainId)
  ) {
    // Legacy transaction if we're not on mainnet/polygon

    return signer.sendTransaction(txParams);
  }

  cleanGasParams(txParams);
  txParams.chainId = chainId; // Ethers is quite strict, chainId should be a numbner like 137, not "0x89" which is sent by paraswap via WalletConnect

  if (chainId == NETWORKS.ethereum.chainId) {
    return sendTransactionMainnet(txParams);
  } else if (chainId == NETWORKS.polygon.chainId) {
    return sendTransactionPolygon(txParams, signer);
  }
};

// This should work for strings, hexa and decimal numbers: "1", 1, "0x01", 0x01
export const getChainIdNumber = txParams => {
  let chainId = txParams?.chainId;
  if (!chainId) {
    console.error("Missing chainId");
    return undefined;
  }

  return BigNumber.from(chainId.toString()).toNumber();
};

// Ethers can figure out maxFeePerGas and maxPriorityFeePerGas properly
// maxFeePerGas is set to the baseFee * 2
// maxPriorityFeePerGas is set to 1.5 gwei
// See https://github.com/ethers-io/ethers.js/blob/0bfa7f497dc5793b66df7adfb42c6b846c51d794/packages/abstract-provider/src.ts/index.ts#L252-L253
const sendTransactionMainnet = txParams => {
  const ethersWallet = getEthersWallet(txParams);
  return ethersWallet.sendTransaction(txParams);
};

// Ethers cannot figure out maxFeePerGas and maxPriorityFeePerGas properly
// https://github.com/ethers-io/ethers.js/issues/2828#issuecomment-1283014250
const sendTransactionPolygon = async (txParams, signer) => {
  let gasData = (await axios.get(POLYGON_GAS_API_URL)).data;

  /* Example response
			{
			   "safeLow":{
			      "maxPriorityFee":34.48322525326667,
			      "maxFee":442.23888966826667
			   },
			   "standard":{
			      "maxPriorityFee":42.196067745533334,
			      "maxFee":449.95173216053337
			   },
			   "fast":{
			      "maxPriorityFee":60.52780058893333,
			      "maxFee":468.2834650039333
			   },
			   "estimatedBaseFee":407.755664415,
			   "blockTime":2,
			   "blockNumber":41986526
		*/

  // https://support.polygon.technology/support/solutions/articles/82000902417-what-is-the-difference-between-eth-estimategas-eth-gasprice-how-does-polygon-gas-station-compare-t

  const gas = gasData["fast"];

  const priority = Math.trunc(gas.maxPriorityFee * 10 ** 9);
  const max = Math.trunc(gas.maxFee * 10 ** 9);
  console.log("using gasData", priority.toString(), max.toString());
  const maxFeePerGas = max.toString();
  const maxPriorityFeePerGas = priority.toString();
  console.log("maxFeePerGas: ", maxFeePerGas);
  console.log("maxPriorityFeePerGas: ", maxPriorityFeePerGas);

  txParams.maxFeePerGas = maxFeePerGas;
  txParams.maxPriorityFeePerGas = maxPriorityFeePerGas;

  console.log("updated txParams", txParams);

  const ethersWallet = signer ? signer : getEthersWallet(txParams);
  return ethersWallet.sendTransaction(txParams);
};

const getHexStringFromGasNumber = gasNumber => {
  const gasString = Math.floor(gasNumber).toString();

  const gasBigNumber = utils.parseUnits(gasString, "gwei");
  return gasBigNumber.toHexString();
};

// Clean gas params
// Simply sending a tx with PunkWallet won't need this,
// however WalletConnect transactions migh have wrong gas data set already
const cleanGasParams = txParams => {
  delete txParams.gasPrice; // for legacy transacitons
  delete txParams.maxPriorityFeePerGas; // for EIP-1559 type-2 transacitons
  delete txParams.maxFeePerGas; // for EIP-1559 type-2 transacitons
};
