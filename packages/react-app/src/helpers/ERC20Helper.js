const { ethers, utils } = require("ethers");

// https://docs.ethers.org/v5/single-page/#/v5/api/contract/example/-%23-example-erc-20-contract--connecting-to-a-contract
// A Human-Readable ABI; for interacting with the contract, we
// must include any fragment we wish to use
const abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
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

		let signerOrProvider = wallet ? wallet : (provider ? provider : undefined);

		this.contract = new ethers.Contract(tokenAddress, abi, signerOrProvider);
	}

	balanceOf = (address) => { 
		return this.contract.balanceOf(address);
	}

	decimals = () => { 
		return this.contract.decimals();
	}

	transfer = (toAddress, amount, decimals) => { 
		return this.contract.transfer(toAddress, this.getDecimalCorrectedAmountBigNumber(amount, decimals));
	}

	transferPopulateTransaction = (toAddress, amount, decimals) => {
		return this.contract.populateTransaction.transfer(toAddress, this.getDecimalCorrectedAmountBigNumber(amount, decimals));
	}

	getDecimalCorrectedAmountBigNumber = async (amount, decimals) => { 
		if (!decimals) {
			decimals = await this.decimals();
		}

		const decimalCorrectedAmountBigNumber = utils.parseUnits(amount.toString(), decimals)

		return decimalCorrectedAmountBigNumber;
	}

	getInverseDecimalCorrectedAmountNumber = async (amount, decimals) => { 
		if (!decimals) {
			decimals = await this.decimals();
		}

		const decimalCorrectedAmountString = utils.formatUnits(amount.toString(), decimals)

		return Number(decimalCorrectedAmountString);
	}
}

export const getTransferTxParams = (token, to, amount) => {
	const erc20Helper = new ERC20Helper(token.address);

	return erc20Helper.transferPopulateTransaction(to, amount, token.decimals);
}

export const getTokenBalance = async (token, rpcURL, address) => {
    const erc20Helper = new ERC20Helper(token.address, null, rpcURL);

	const balance = await (erc20Helper.balanceOf(address));

    const inverseDecimalCorrectedAmountNumber = await erc20Helper.getInverseDecimalCorrectedAmountNumber(balance, token.decimals);

    const DIGITS = 2;

    const roundedDown = Math.floor(inverseDecimalCorrectedAmountNumber * Math.pow(10, DIGITS)) / Math.pow(10, DIGITS);

    return roundedDown.toFixed(DIGITS);
}

