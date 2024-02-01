import { NETWORKS } from "../constants";

const { ethers, utils } = require("ethers");

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

  balanceOf = address => {
    return this.contract.balanceOf(address);
  };

  symbol = () => {
    return this.contract.symbol();
  };

  decimals = () => {
    return this.contract.decimals();
  };

  transfer = (toAddress, amount, decimals) => {
    return this.contract.transfer(toAddress, this.getDecimalCorrectedAmountBigNumber(amount, decimals));
  };

  transferPopulateTransaction = (toAddress, amount, decimals) => {
    return this.contract.populateTransaction.transfer(
      toAddress,
      this.getDecimalCorrectedAmountBigNumber(amount, decimals),
    );
  };

  getDecimalCorrectedAmountBigNumber = async (amount, decimals) => {
    if (!decimals) {
      decimals = await this.decimals();
    }

    const decimalCorrectedAmountBigNumber = utils.parseUnits(amount.toString(), decimals);

    return decimalCorrectedAmountBigNumber;
  };

  getInverseDecimalCorrectedAmountNumber = async (amount, decimals) => {
    if (!decimals) {
      decimals = await this.decimals();
    }

    const decimalCorrectedAmountString = utils.formatUnits(amount.toString(), decimals);

    return Number(decimalCorrectedAmountString);
  };
}

export const getTransferTxParams = (token, to, amount) => {
  const erc20Helper = new ERC20Helper(token.address);

  return erc20Helper.transferPopulateTransaction(to, amount, token.decimals);
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

export const getTokenBalance = async (token, rpcURL, address, price) => {
  const erc20Helper = new ERC20Helper(token.address, null, rpcURL);

  const balance = await erc20Helper.balanceOf(address);

  const inverseDecimalCorrectedAmountNumber = await erc20Helper.getInverseDecimalCorrectedAmountNumber(
    balance,
    token.decimals,
  );

  let digits = 2;

  if (price > 1.1) {
    digits = 4;
  }

  // if (isTokenAddressMainnetWETH(token.address)) {
  //   digits = 4;
  // }

  const roundedDown = Math.floor(inverseDecimalCorrectedAmountNumber * Math.pow(10, digits)) / Math.pow(10, digits);

  return roundedDown.toFixed(digits);
};
