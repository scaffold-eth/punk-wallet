import React from "react";
import { Modal } from "antd";
import { parse } from 'eth-url-parser';

import { SendOutlined } from "@ant-design/icons";
import { WalletConnectTransactionDisplay } from "../components";
import { ERC20Helper } from "./ERC20Helper";

const { confirm } = Modal;
const { BigNumber, ethers, utils } = require("ethers");

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




