import React from "react";
import { Modal } from "antd";

export default function WalletConnectV2ConnectionError(error, proposer) {
    const popUp = () => {
        const proposerName = proposer?.metadata?.name;
        const title = "Coudn't connect to " + (proposerName ? proposerName : "the Dapp") + "!";

        Modal.confirm({
            width: "90%",
            title: title,
            maskClosable:true,
            cancelButtonProps:{ style: { display: 'none' }},
            content: (
                <div>
                    {error.message} 
                </div>
            ),
        });
    }

    return popUp();
}