import React from "react";
import { Modal } from "antd";
import { parse } from 'eth-url-parser';

import { SendOutlined } from "@ant-design/icons";
import { WalletConnectTransactionDisplay } from "../components";

const { confirm } = Modal;
const { BigNumber, ethers } = require("ethers");



export class EIP618Helper {
	constructor(tx, provider, chainId, address) {
		this.tx = tx;
		this.provider = provider;
		this.chainId = chainId;
		this.address = address;
	}

	confirmTxModal = (eipURL) => {
		const parsedObject = parse(eipURL);

		console.log("parsedObject", parsedObject);

		confirm({
			width: "90%",
			size: "large",
			title: "Send Transaction?",
			icon: <SendOutlined />,

			content: (
				this.txDisplay(parsedObject)
			),
			
			onOk: async () => {
				this.executeTx(parsedObject);
			},
			onCancel: () => {
				console.log("Cancel");
			},
		});
	}

	executeTx = (parsedObject) => {
	/*	
		let txConfig = {
	        to: parsedObject.target_address,
	        //chainId: props.selectedChainId,
	        chainId: this.chainId,
	        value: BigNumber.from(parsedObject.parameters.value),
	      };
	*/
	    const tx =  {
		  data: '0xa9059cbb0000000000000000000000008c9d11ce64289701efeb6a68c16e849e9a2e781d0000000000000000000000000000000000000000000000000000000000000001',
		  to: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
		  from: '0xc54C244200d657650087455869f1aD168537d3B3',
		  chainId: this.chainId
		}

	    //this.tx(txConfig);
	    this.tx(tx);
  }

  txDisplay = (parsedObject) => {
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
*/


	const tx =  {
	  data: '0xa9059cbb0000000000000000000000008c9d11ce64289701efeb6a68c16e849e9a2e781d0000000000000000000000000000000000000000000000000000000000000001',
	  to: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
	  from: '0x8c9D11cE64289701eFEB6A68c16e849E9A2e781d',
	}

	const payload = {
		method: "eth_sendTransaction",
		params: [{
			from: this.address,
			//to: parsedObject.target_address,
			to: tx.to,
			data: tx.data,
			value: 0,
			chainId:137
		}]
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




