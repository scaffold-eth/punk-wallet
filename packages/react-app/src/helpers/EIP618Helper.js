import React from "react";
import { Modal } from "antd";
import { parse } from 'eth-url-parser';

import { SendOutlined } from "@ant-design/icons";
import { WalletConnectTransactionDisplay } from "../components";
//import { ERC20Helper } from "./ERC20Helper";

const { confirm } = Modal;
const { BigNumber, ethers, utils } = require("ethers");


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


class ERC20Helper {
	constructor(tokenAddress, wallet) {
		this.tokenAddress = tokenAddress;
		this.wallet = wallet;
		this.contract = new ethers.Contract(tokenAddress, abi, wallet);
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
}

export class EIP618Helper {
	constructor(tx, provider, chainId, address, userProvider) {
		this.tx = tx;
		this.provider = provider;
		this.chainId = chainId;
		this.address = address;
		this.userProvider = userProvider;
	}



	confirmTxModal = async (eipURL) => {
		const parsedObject = parse(eipURL);

/*  Sending ERC-20 example
	{
	    "scheme": "ethereum",
	    "target_address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
	    "function_name": "transfer",
	    "parameters": {
	        "address": "0x8c9D11cE64289701eFEB6A68c16e849E9A2e781d",
	        "uint256": "0.33"
	 	}
	}

{
    "scheme": "ethereum",
    "target_address": "0x6b175474e89094c44da98b954eedeac495271d0f",
    "prefix": "pay",
    "chain_id": "137",
    "function_name": "transfer",
    "parameters": {
        "address": "0x8c9D11cE64289701eFEB6A68c16e849E9A2e781d",
        "uint256": "4.2"
    }
}
}
*/

/* Sending ETH example
	{
	    "scheme": "ethereum",
	    "target_address": "0x8c9D11cE64289701eFEB6A68c16e849E9A2e781d",
	    "prefix": "pay",
	    "chain_id": "137",
	    "parameters": {
	        "value": "420000000000000"
	    }
	}
*/

		console.log("parsedObject", parsedObject);

		let erc20Object = null;	

		if (parsedObject.function_name && parsedObject.function_name == "transfer") { // Assume this is an ERC-20 transfer, pobably a better validation will be needed

			const erc20TokenAddress = parsedObject.target_address;
			console.log("parsedObject", parsedObject);

			const erc20Helper = new ERC20Helper(erc20TokenAddress, this.userProvider.getSigner());
			console.log("erc20Helper", erc20Helper);

			const symbol = await erc20Helper.symbol();

			const toAddress = parsedObject.parameters.address;
			console.log("toAddress", toAddress);

			const amount = parsedObject.parameters.uint256;
			console.log("amount", amount);



			const decimalCorrectedAmountBigNumber = await erc20Helper.getDecimalCorrectedAmountBigNumber(amount);

			let populatedTx = await erc20Helper.transferPopulateTransaction(toAddress, decimalCorrectedAmountBigNumber);
			console.log("populatedTx", populatedTx);

			erc20Object = {
				erc20TokenAddress:erc20TokenAddress,
				erc20Helper:erc20Helper,
				symbol:symbol,
				toAddress:toAddress,
				amount:amount,
				decimalCorrectedAmountBigNumber:decimalCorrectedAmountBigNumber,
				populatedTx:populatedTx
			}
		}

		confirm({
			width: "90%",
			size: "large",
			title: "Send Transaction?",
			icon: <SendOutlined />,

			content: (
				this.txDisplay(parsedObject, erc20Object)
			),
			
			onOk: async () => {
				this.executeTx(parsedObject, erc20Object);
			},
			onCancel: () => {
				console.log("Cancel");
			},
		});
	}

	executeTx = async (parsedObject, erc20Object) => {
		let txConfig;

		if (erc20Object) {
			txConfig = erc20Object.populatedTx;
		}
		else {
			txConfig = {
		        to: parsedObject.target_address,
		        value: BigNumber.from(parsedObject.parameters.value),
		    };
		}

		txConfig.chainId = this.chainId;
		txConfig.from = this.address;

	    this.tx(txConfig);
  }

  txDisplay = (parsedObject, erc20Object) => {
/*
  	{
    "id": 1673867274004124,
    "jsonrpc": "2.0",
    "method": "eth_sendTransaction",
    "params": [
        {
            "from": "0xc54c244200d657650087455869f1ad168537d3b3",
            "to": "0xc54c244200d657650087455869f1ad168537d3b3",
            "gas": "0x5208",
            "value": "0x1662b959d4ada9c",
            "data": ""
        }
    ]
}
*/

/*
	{
    "scheme": "ethereum",
    "target_address": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    "function_name": "transfer",
    "parameters": {
        "address": "0x8c9D11cE64289701eFEB6A68c16e849E9A2e781d",
        "uint256": "1"
    }
}

	const payload = {
		method: "eth_sendTransaction",
		params: [{
			from: this.address,
			to: parsedObject.target_address,
			value: BigNumber.from(parsedObject.parameters.value).toHexString()
		}]
	}	

*/
	const toAddress = erc20Object ? erc20Object.toAddress : parsedObject.target_address;


	//value = ethers.utils.formatEther(payload?.params[0]?.value);
	const value = erc20Object ? 0 : BigNumber.from(parsedObject.parameters.value).toHexString()

	const payload = {
		method: "eth_sendTransaction",
		params: [{
			from: this.address,
			to: toAddress,
			//data: tx.data,
			value: value,
			chainId:this.chainId
		}],
		erc20Object:erc20Object
	}	

	return (
		<WalletConnectTransactionDisplay
            payload={payload}
            provider={this.provider}
            chainId={this.chainId}
        />
	);

  	/*
	return (
		<pre>
			{JSON.stringify(parsedObject, null, 2)}
		</pre>
	);
	*/
  }
}




