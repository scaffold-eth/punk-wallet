import React from "react";
import { Modal } from "antd";
import { parse } from 'eth-url-parser';

const { confirm } = Modal;
const { BigNumber, ethers } = require("ethers");

export class EIP618Helper {
	constructor(tx) {
		this.tx = tx;
	}

	confirmTxModal = (eipURL) => {
		const parsedObject = parse(eipURL);

		confirm({
			width: "90%",
			size: "large",
			title: "harr",

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
	        chainId: 137,
	        value: BigNumber.from(parsedObject.parameters.value),
	      };

	    this.tx(txConfig);
  }

  txDisplay = (parsedObject) => {
	return (
		<pre>
			{JSON.stringify(parsedObject, null, 2)}
		</pre>
	);
  }
}




