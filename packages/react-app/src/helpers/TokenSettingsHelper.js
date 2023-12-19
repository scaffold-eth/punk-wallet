export const TOKEN_SETTINGS_STORAGE_KEY = "TokenSettings";

export const getSelectedErc20Token = (selectedToken, erc20Tokens) => {
    if (!selectedToken || !erc20Tokens) {
        return undefined;
    }

    return erc20Tokens.find(token => token.name === selectedToken.name);
}

export const getTokens = (nativeToken, erc20Tokens) => {
    let tokens;

    if (!nativeToken && !erc20Tokens) {
        return tokens
    }

    if (nativeToken) {
        tokens = [nativeToken];
    }

    if (erc20Tokens) {
        if (tokens) {
            tokens.push(...erc20Tokens);
        }
        else {
            tokens = [...erc20Tokens]
        }
    }

    return tokens;
}

export const migrateSelectedTokenStorageSetting = (networkName, tokenSettingsHelper) => {
    // Old code
    // const [tokenName, setTokenName] = useLocalStorage(targetNetwork.name + "TokenName");

    try {
        const oldKey = networkName + "TokenName";

        const storedOldValue = localStorage.getItem(oldKey);

        if (!storedOldValue) {
            return;
        }

        localStorage.removeItem(oldKey);

        // value was stored with double quotes, e.g.: "DAI"
        const oldValue = storedOldValue.replace(/"/g, '');

        // when the default native token was selected, the storage value was: ""
        if (oldValue != '""') {
            tokenSettingsHelper.updateSelectedName(oldValue);
        }
    }
    catch (error) {
        console.error("Coudn't migrate selected token name setting", error);
    }

}