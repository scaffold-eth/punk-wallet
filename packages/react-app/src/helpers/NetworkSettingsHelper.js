import { getBLockExplorer, getChain } from "./ChainHelper";

export const NETWORK_SETTINGS_STORAGE_KEY = "networkSettings";

export const SELECTED_BLOCK_EXPORER_NAME_KEY = "selectedBlockExplorerName";

export const getNetworkWithSettings = (network, networkSettings) => {
    const networkWithSettings = {};

    const selectedBlockExplorerName = networkSettings[SELECTED_BLOCK_EXPORER_NAME_KEY];

    if (selectedBlockExplorerName) {
        const blockExplorer = getBLockExplorer(getChain(network.chainId), selectedBlockExplorerName);

        networkWithSettings.blockExplorer = blockExplorer.url + "/";
    }

    return {...network, ...networkWithSettings};
}

export const migrateSelectedNetworkStorageSetting = (networkSettingsHelper) => {
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
    }
    catch (error) {
        console.error("Coudn't migrate selected token name setting", error);
    }
}

