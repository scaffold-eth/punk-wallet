
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