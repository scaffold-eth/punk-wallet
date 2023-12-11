import { isEIP3091Explorer } from "./ChainHelper";

export const SELECTED_BLOCK_EXPORER_NAME_KEY = "selectedBlockExplorerName";

export const getBLockExplorers = (chain) => chain.explorers.filter(explorer => isEIP3091Explorer(explorer));

export const getBLockExplorer = (chain, name) => chain.explorers.find(blockExplorer => blockExplorer.name == name);

export const migrateSelectedNetworkStorageSetting = (networkSettingsHelper) => {
    // Old code
    //const cachedNetwork = window.localStorage.getItem("network");

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