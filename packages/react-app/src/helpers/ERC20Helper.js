import { NETWORKS } from "../constants";

const { ethers, BigNumber, utils } = require("ethers");

// https://docs.ethers.org/v5/single-page/#/v5/api/contract/example/-%23-example-erc-20-contract--connecting-to-a-contract
// A Human-Readable ABI; for interacting with the contract, we
// must include any fragment we wish to use
const abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint amount) returns (bool)",
];

export class ERC20Helper {
  constructor(tokenAddress, wallet, rpcURL) {
    this.tokenAddress = tokenAddress;
    this.wallet = wallet;

    let provider;

    if (!wallet && rpcURL) {
      provider = new ethers.providers.StaticJsonRpcProvider(rpcURL);
    }

    let signerOrProvider = wallet ? wallet : provider ? provider : undefined;

    this.contract = new ethers.Contract(tokenAddress, abi, signerOrProvider);
  }

  balanceOf = address => this.contract.balanceOf(address);

  symbol = () => this.contract.symbol();

  decimals = () => this.contract.decimals();

  transfer = (toAddress, amount) => this.contract.transfer(toAddress, amount);

  transferPopulateTransaction = (toAddress, amount) => this.contract.populateTransaction.transfer(toAddress, amount);
}

export const getAmount = (amount, decimals) => {
  if (utils.isHexString(amount)) {
    return amount;
  }

  return getDecimalCorrectedAmountBigNumber(amount, decimals).toHexString();
};

export const getDecimalCorrectedAmountBigNumber = (amountNumber, decimals) =>
  utils.parseUnits(amountNumber.toString(), decimals);

export const getInverseDecimalCorrectedAmountNumber = (amountBigNumber, decimals) =>
  Number(utils.formatUnits(amountBigNumber.toString(), decimals));

export const getDisplayNumberWithDecimals = (number, dollarMode) => {
  let decimals = 2;

  if (!dollarMode && number < 1) {
    decimals = 4;
  }

  return number.toFixed(decimals);
};

export const getTokenBalance = async (token, rpcURL, address) => {
  const erc20Helper = new ERC20Helper(token.address, null, rpcURL);

  const balanceBigNumber = await erc20Helper.balanceOf(address);

  return balanceBigNumber;
};

export const getTransferTxParams = (token, to, amount) => {
  const erc20Helper = new ERC20Helper(token.address);

  return erc20Helper.transferPopulateTransaction(to, getAmount(amount, token.decimals));
};

const checkBalance = async (token, rpcURL, address, balance, setBalance, intervalId) => {
  try {
    const balanceBigNumber = BigNumber.from(balance);

    const currentBalanceBigNumber = await getTokenBalance(token, rpcURL, address);

    if (!balanceBigNumber.eq(currentBalanceBigNumber)) {
      setBalance(currentBalanceBigNumber.toHexString());

      clearInterval(intervalId);
    }
  } catch (error) {
    console.error("Couldn't check balance", error);
  }
};

export const monitorBalance = (token, rpcURL, address, balance, setBalance) => {
  if (!token || !balance || !address) {
    return;
  }

  let intervalId;

  const checkBalanceAndUpdate = () => {
    checkBalance(token, rpcURL, address, balance, setBalance, intervalId);
  };

  intervalId = setInterval(checkBalanceAndUpdate, 1000);

  setTimeout(() => {
    clearInterval(intervalId);
  }, 30 * 1000);
};

const isTokenAddressMainnetWETH = tokenAddress => {
  const tokens = NETWORKS?.ethereum?.erc20Tokens;

  if (!tokens) {
    return false;
  }

  let tokenAddressWETH = undefined;

  for (const token of tokens) {
    if (token.name === "WETH") {
      tokenAddressWETH = token.address;
      break;
    }
  }

  if (tokenAddress == tokenAddressWETH) {
    return true;
  }

  return false;
};
