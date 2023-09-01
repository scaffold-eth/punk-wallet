import React from "react";

import { Modal, notification,  Popconfirm } from "antd";
import { SendOutlined } from "@ant-design/icons";

import { WalletConnectTransactionDisplay } from "./";

import { sendWalletConnectTx, approveRequestV1, approveRequestV2, rejectRequestV1, rejectRequestV2, signTransaction, signMessage } from "../helpers/WalletConnectV2Helper";
import { getChainIdNumber } from "../helpers/EIP1559Helper";

export default function WalletConnectTransactionPopUp(
    payload, userProvider, connector, web3wallet,
    currentlySelectedChainId) {

    const popUp = () => {
        // V2 sends a more complex object than V1
        let event;
        if (web3wallet) {
            event = payload;
            payload = payload.params.request;
        }

        const requestChainId = getRequestChainId(payload, event);
        const chainId = requestChainId ? requestChainId : currentlySelectedChainId;

        Modal.confirm({
            width: "90%",
            size: "large",
            title: getTitle(payload.method),
            icon: <SendOutlined />,
            content: (
                <WalletConnectTransactionDisplay
                    payload={payload}
                    chainId={chainId}
                    currentlySelectedChainId={currentlySelectedChainId}
                />
            ),
            onOk: async () => {
                let result;

                if (payload.method === "eth_sendTransaction") {                         // In case of mainnet and polygon we will use ethers wallet with EIP-1559 type-2 transactions
                    result = await sendWalletConnectTx(userProvider, payload, chainId);
                }
                else if (payload.method === "eth_signTransaction") {                    // eth_signTransaction didn't work with userProvider, sign with ethersWallet
                    result = await signTransaction(payload.params[0]);
                }
                else if (payload.method === "personal_sign") {                          // another exception
                    result = await signMessage(payload.params[0]);
                }                                                                                                                                              
                else {                                                                  // We could use ethers to sign these messages as well,
                    result = await userProvider.send(payload.method, payload.params);   // but I didn't want to change what is working
                }

                console.log("RESULT:", result);

                let wcRecult = result.hash ? result.hash : result.raw ? result.raw : result;

                if (connector) {
                    approveRequestV1(connector, payload.id, wcRecult);
                }

                if (web3wallet) {
                    approveRequestV2(web3wallet, event, wcRecult);
                }

                notification.info({
                    message: "Wallet Connect Transaction Sent",
                    description: wcRecult,
                    placement: "bottomRight",
                });
            },
            onCancel: () => {
                if (web3wallet) {
                    rejectRequestV2(web3wallet, event)
                }

                if (connector) {
                    rejectRequestV1(connector, payload.id);
                }
            },
        });
    }


    return popUp();
}

const getRequestChainId = (payload, event) => {
    // I'm not sure if all the Dapps send an array or not
    let params = payload.params;
    if (Array.isArray(params)) {
        params = params[0];
    }

    if (params.chainId) {
        return getChainIdNumber({chainId:params.chainId});
    }

    // V2
    if (event) {
        const requestChainIdString = event?.params?.chainId; // Something like "eip155:137"
        if (requestChainIdString) {
            return getChainIdNumber({chainId:requestChainIdString.split(":")[1]})
        }    
    }

    return undefined;
}   

const getTitle = (method) => {
    // https://github.com/WalletConnect/walletconnect-test-wallet/blob/7b209c10f02014ed5644fc9991de94f9d96dcf9d/src/engines/ethereum.ts#L45-L104
    let title;

    switch (method) {
        case "eth_sendTransaction":
            title = "Send Transaction?";
            break;
        case "eth_signTransaction":
            title = "Sign Transaction?";
            break;
        case "eth_sign":
        case "personal_sign":
            title = "Sign Message?";
            break;
        case "eth_signTypedData":
        case "eth_signTypedData_v4":
            title = "Sign Typed Data?";
            break;
        default:
            title = "Unknown method";
            break;
    }

    return title;
}

