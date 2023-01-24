const { ethers, utils } = require("ethers");

//const ERC20_ABI = '[ { "constant": true, "inputs": [], "name": "name", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "name": "", "type": "uint8" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "balance", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" } ]';

// https://docs.ethers.org/v5
// A Human-Readable ABI; for interacting with the contract, we
// must include any fragment we wish to use
const abi = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",

    // Authenticated Functions
    "function transfer(address to, uint amount) returns (bool)",

    // Events
    //"event Transfer(address indexed from, address indexed to, uint amount)"
];


export class ERC20Helper {
	constructor(tokenAddress, wallet, rpcURL) {
		this.tokenAddress = tokenAddress;
		this.wallet = wallet;

		let provider;

		if (!wallet) {
			provider = new ethers.providers.StaticJsonRpcProvider(rpcURL);
		}

		this.contract = new ethers.Contract(tokenAddress, abi, wallet ? wallet : provider);
	}

	balanceOf = async (address) => { 
		let balance = await this.contract.balanceOf(address);

		return balance;
	}

	decimals = async () => { 
		console.log("contract", this.contract);
		let decimals = await this.contract.decimals();

		return decimals;
	}

	symbol = async () => { 
		try {
			let symbol = await this.contract.symbol();

			return symbol;	
		}
		catch (error) {
			console.log("Coudn't get symbol, returning the tokenAddress", error);

			return this.tokenAddress
		}
		
	}

	transfer = async (toAddress, amount) => { 
		// // Transfer 1.23 tokens to the ENS name "ricmoo.eth"
		// tx = await erc20_rw.transfer("ricmoo.eth", parseUnits("1.23"));

		//const tx = this.contract.transfer(toAddress, 1);

		const decimals = await this.decimals();

		const tx = this.contract.transfer(toAddress, utils.parseUnits(amount, decimals));
	}

	transferPopulateTransaction = async (toAddress, amountBigNumber) => { 
		// // Transfer 1.23 tokens to the ENS name "ricmoo.eth"
		// tx = await erc20_rw.transfer("ricmoo.eth", parseUnits("1.23"));

		//const tx = this.contract.populateTransaction.transfer(toAddress, amount);

		const populatedTx = this.contract.populateTransaction.transfer(toAddress, amountBigNumber);

		return populatedTx;
	}

	getDecimalCorrectedAmountBigNumber = async (amount) => { 
		const decimals = await this.decimals();

		const decimalCorrectedAmountBigNumber = utils.parseUnits(amount.toString(), decimals)

		return decimalCorrectedAmountBigNumber;
	}

	getInverseDecimalCorrectedAmountNumber = async (amount) => { 
		const decimals = await this.decimals();

		const decimalCorrectedAmountString = utils.formatUnits(amount.toString(), decimals)

		return Number(decimalCorrectedAmountString);
	}
}




























