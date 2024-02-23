import { StaticJsonRpcProvider } from "@ethersproject/providers";

import { getBLockExplorer, getChain } from "./ChainHelper";

export const NETWORK_SETTINGS_STORAGE_KEY = "networkSettings";

export const SELECTED_BLOCK_EXPORER_NAME_KEY = "selectedBlockExplorerName";
export const CUSTOM_RPC_KEY = "customRPC";

export const getNetworkWithSettings = (network, networkSettings) => {
  const networkWithSettings = {};

  const selectedBlockExplorerName = networkSettings[SELECTED_BLOCK_EXPORER_NAME_KEY];

  if (selectedBlockExplorerName) {
    // add true as second parameter to getChain if it fails: getChain(network.chainId, true)
    const blockExplorer = getBLockExplorer(getChain(network.chainId), selectedBlockExplorerName);

    networkWithSettings.blockExplorer = blockExplorer.url + "/";
  }

  const customRPC = networkSettings[CUSTOM_RPC_KEY];

  if (customRPC) {
    networkWithSettings.rpcUrl = customRPC;
  }

  return { ...network, ...networkWithSettings };
};

export const getShortRPC = rpc => {
  const RPC_URL_BEGINNING = "://";

  try {
    let startIndex = rpc.indexOf(RPC_URL_BEGINNING);

    if (startIndex === -1) {
      startIndex = 0;
    } else {
      startIndex = startIndex + RPC_URL_BEGINNING.length;
    }

    let endIndex = rpc.indexOf("/", startIndex);

    if (endIndex === -1) {
      endIndex = rpc.length;
    }

    return rpc.substring(startIndex, endIndex);
  } catch (error) {
    console.error("Couldn't get short RPC", error);

    return rpc;
  }
};

export const migrateSelectedNetworkStorageSetting = networkSettingsHelper => {
  // Old code
  // const cachedNetwork = window.localStorage.getItem("network");

  try {
    const oldKey = "network";

    const oldValue = localStorage.getItem(oldKey);

    if (!oldValue) {
      return;
    }

    localStorage.removeItem(oldKey);

    networkSettingsHelper.updateSelectedName(oldValue);
  } catch (error) {
    console.error("Coudn't migrate selected token name setting", error);
  }
};

export const validateRPC = async (
  setLoading,
  network,
  rpc,
  currentPunkAddress,
  networkSettingsHelper,
  setTargetNetwork,
  setValidRPC,
) => {
  setLoading(true);

  const validRPC = await isValidRPC(rpc, currentPunkAddress, network);

  if (validRPC) {
    networkSettingsHelper.updateItemSettings(network, {
      [CUSTOM_RPC_KEY]: rpc,
    });

    setTargetNetwork(networkSettingsHelper.getSelectedItem(true));
  }

  setValidRPC(validRPC);

  setLoading(false);
};

const isValidRPC = async (rpc, currentPunkAddress, network) => {
  try {
    const provider = new StaticJsonRpcProvider(rpc);

    const nonce = await provider.getTransactionCount(currentPunkAddress);

    const rpcNetwork = await provider.getNetwork();

    if (network?.chainId !== rpcNetwork?.chainId) {
      console.log("ChainId doesn't match current networ's chainId", network?.chainId, rpcNetwork?.chainId);

      return false;
    }

    return true;
  } catch (error) {
    console.log("Couldn't validate RPC", error);

    return false;
  }
};
