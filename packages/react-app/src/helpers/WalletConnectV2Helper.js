import { Core } from "@walletconnect/core";
import { Web3Wallet } from "@walletconnect/web3wallet";

import { NETWORKS } from "../constants";
import { getSdkError } from "@walletconnect/utils";

import { buildApprovedNamespaces } from "@walletconnect/utils";

import { WalletConnectV2ConnectionError } from "../components";
import { TransactionManager } from "./TransactionManager";
import { sendTransaction, createEthersWallet } from "./EIP1559Helper";

import { ethers } from "ethers";

export const createWeb3wallet = async () => {
  const core = new Core({
    logger: "debug",
    projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
  });

  return await Web3Wallet.init({
    core, // <- pass the shared `core` instance
    metadata: {
      description: "Forkable web wallet for small/quick transactions.",
      url: "https://punkwallet.io",
      icons: ["https://punkwallet.io/punk.png"],
      name: "🧑‍🎤 PunkWallet.io",
    },
  });
};

export const onSessionProposal = async (web3wallet, address, proposal) => {
  console.log("proposal", proposal);

  const { id, params } = proposal;
  const { proposer, requiredNamespaces, relays } = params;

  // https://docs.walletconnect.com/2.0/web/web3wallet/wallet-usage#-namespaces-builder-util
  let approvedNamespaces;
  try {
    approvedNamespaces = buildApprovedNamespaces({
      proposal: params,
      supportedNamespaces: {
        eip155: {
          chains: getSupportedChainIds().map(chainId => "eip155:" + chainId), // ["eip155:1", "eip155:137", ...]
          methods: [
            "eth_sendTransaction",
            "eth_signTransaction",
            "eth_sign",
            "personal_sign",
            "eth_signTypedData",
            "eth_signTypedData_v4",
          ],
          events: ["accountsChanged", "chainChanged"],
          accounts: getSupportedChainIds().map(chainId => "eip155:" + chainId + ":" + address), // ["eip155:1:0x8c9D11cE64289701eFEB6A68c16e849E9A2e781d", "eip155:137:0x8c9D11cE64289701eFEB6A68c16e849E9A2e781d", ...]
        },
      },
    });
  } catch (error) {
    console.error("Something is wrong with the namespaces", error);

    // ToDo display error
    web3wallet.rejectSession({
      id: id,
      reason: getSdkError("UNSUPPORTED_CHAINS"), // Best guess, we could parse the error message to figure out the exact reason
    });

    WalletConnectV2ConnectionError(error, proposer);

    return;
  }

  await web3wallet.approveSession({
    id,
    relayProtocol: relays[0].protocol,
    namespaces: approvedNamespaces,
  });
};

export const approveRequestV2 = (web3wallet, event, result) => {
  const { topic, id } = event;
  console.log("Approving Wallet Connect V2 request", id);

  const response = { id, result, jsonrpc: "2.0" };

  web3wallet.respondSessionRequest({ topic, response });
};

export const rejectRequestV2 = (web3wallet, event) => {
  const { topic, id } = event;
  console.log("Rejecting Wallet Connect V2 request", id);

  const response = {
    id,
    jsonrpc: "2.0",
    error: {
      code: 5000,
      message: "User rejected.",
    },
  };

  web3wallet.respondSessionRequest({ topic, response });
};

// Get All
const getSupportedChainIds = () => {
  const supportedChainIds = [];

  for (const network of Object.values(NETWORKS)) {
    supportedChainIds.push(network.chainId);
  }

  return supportedChainIds;
};

export const getWalletConnectV2ActiveSessions = web3wallet => {
  return Object.values(web3wallet.getActiveSessions());
};

export const getPeerMeta = (web3wallet, topic) => {
  const activeSessions = getWalletConnectV2ActiveSessions(web3wallet);

  const activeSession = activeSessions.find(session => session.topic === topic);

  return activeSession?.peer?.metadata;
};

export const isWalletConnectV2Connected = web3wallet => {
  const activeSessions = getWalletConnectV2ActiveSessions(web3wallet);
  if (activeSessions.length > 0) {
    return true;
  }
  return false;
};

const disconnectSession = async (web3wallet, topic) => {
    console.log("Disconnecting from session:", topic);

    await web3wallet.disconnectSession({ topic, reason: getSdkError("USER_DISCONNECTED") });
}
export const disconnectWallectConnectV2Session = async (web3wallet, topic) => {
  try {
    await disconnectSession(web3wallet, topic);
  } catch (error) {
    console.error("Coudn't disconnect from Wallet Connect V2", error);

    try {
      // Let's try to disconnect from all sessions in case of an error
      await disconnectWallectConnectV2Sessions(web3wallet);
    } catch (error) {
      // This is a hack to remove the sessions manually
      // Otherwise if an old session is stuck, we cannot delete it
      localStorage.removeItem("wc@2:client:0.3//session");
      window.location.reload();
    }
  }
};
export const disconnectWallectConnectV2Sessions = async web3wallet => {
  console.log("Disconnecting from Wallet Connect 2 sessions");

  // Wallet Connect V2 has a lot more options than V1, we could have multiple sessions and pairings
  // But for now let's use only one session and disconnect from all sessions

  const topics = Object.keys(web3wallet.getActiveSessions());

  for (const topic of topics) {
    await disconnectSession(web3wallet, topic);
  }

  /*  We could also disconnect from the pairings, but I think it is a better user experience if we keep them
		  Dapps can keep the pairings and reconnect

		web3wallet.engine.signClient.core.pairing.pairings.values
		.forEach(
		  async (pairing) => {
		      const topic = pairing.topic;
		      console.log("Disconnecting from pair ", topic);
		      await web3wallet.disconnectSession({ topic, reason: getSdkError('USER_DISCONNECTED') })
		});
	*/
};

export const signTransaction = txParams => {
  const ethersWallet = createEthersWallet();

  // Ethers uses gasLimit instead of gas
  if (txParams.gas) {
    txParams.gasLimit = txParams.gas;
    delete txParams.gas;
  }

  return ethersWallet.signTransaction(txParams);
};

export const signMessage = message => {
  const ethersWallet = createEthersWallet();

  if (ethers.utils.isHexString(message)) {
    message = ethers.utils.toUtf8String(message);
  }

  return ethersWallet.signMessage(message);
};

export const sendWalletConnectTx = async (userProvider, payload, chainId) => {
  let result;

  try {
    let signer = userProvider.getSigner();

    // I'm not sure if all the Dapps send an array or not
    let params = payload.params;
    if (Array.isArray(params)) {
      params = params[0];
    }

    // Ethers uses gasLimit instead of gas
    if (params.gas) {
      let gasLimit = params.gas;
      params.gasLimit = gasLimit;
      delete params.gas;
    }

    // Speed up transaction list is filtered by chainId
    if (!params.chainId) {
      params.chainId = chainId;
    }

    // Remove empty data
    // I assume wallet connect adds "data" here: https://github.com/WalletConnect/walletconnect-monorepo/blob/7573fa9e1d91588d4af3409159b4fd2f9448a0e2/packages/helpers/utils/src/ethereum.ts#L78
    // And ethers cannot hexlify this: https://github.com/ethers-io/ethers.js/blob/8b62aeff9cce44cbd16ff41f8fc01ebb101f8265/packages/providers/src.ts/json-rpc-provider.ts#L694
    if (params.data === "") {
      delete params.data;
    }

    result = await sendTransaction(params, signer);

    const transactionManager = new TransactionManager();
    transactionManager.setTransactionResponse(result);
  } catch (error) {
    // Fallback to original code without the speed up option
    console.error("Coudn't create transaction which can be speed up", error);
    result = await userProvider.send(payload.method, payload.params);
  }

  return result;
};
