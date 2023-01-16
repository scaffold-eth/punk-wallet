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
		let txConfig = {
	        to: parsedObject.target_address,
	        //chainId: props.selectedChainId,
	        chainId: this.chainId,
	        value: BigNumber.from(parsedObject.parameters.value),
	      };

	    this.tx(txConfig);
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
	const payload = {
		method: "eth_sendTransaction",
		params: [{
			from: this.address,
			to: parsedObject.target_address,
			value: BigNumber.from(parsedObject.parameters.value).toHexString()
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




