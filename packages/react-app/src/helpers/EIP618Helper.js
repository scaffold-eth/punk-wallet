const { BigNumber, ethers } = require("ethers");

export class EIP618Helper {
	constructor(tx) {
		this.tx = tx;
	}

	confirmTx = (parsedObject) => {
		let txConfig = {
            to: parsedObject.target_address,
            //chainId: props.selectedChainId,
            chainId: 137,
            value: BigNumber.from(parsedObject.parameters.value),
          };

        this.tx(txConfig);

	/*	
      confirm({
        width: "90%",
        size: "large",
        title: "harr",
        
        content: (
          <EIP618Display parsedObject={parsedObject} />
        ),
        onOk: async () => {
          let txConfig = {
            to: parsedObject.target_address,
            chainId: props.selectedChainId,
            value:ethers.BigNumber.from(parsedObject.parameters.value),
          };

          props.tx(txConfig);
        },
        onCancel: () => {
          console.log("Cancel");
        },
      });
    */
  }
}




