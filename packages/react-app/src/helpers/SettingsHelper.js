const STORAGE_KEY_KEY = "storageKey";

const INDEX_MAP_KEY = "indexMap";
const REMOVED_NAMES_KEY = "removedNames";
const SELECTED_NAME_KEY = "selectedName";

// These settings were added later, so it is possible 
// that they don't exist yet for someone
const CUSTOM_ITEMS_KEY = "customItems";
const CUSTOM_ITEMS_DEFAULT_VALUE = [];
const ITEMS_SETTINGS_KEY = "itemSettings";
const ITEMS_SETTINGS_DEFAULT_VALUE = {};

const ITEM_SETTINGS_DEFAULT_VALUE = {};

const modalSettingsKeys = [INDEX_MAP_KEY, ITEMS_SETTINGS_KEY, REMOVED_NAMES_KEY];

export class SettingsHelper {
    constructor(storageKey, items, settings, setSettings, getItemWithSettings) {
        this.storageKey = storageKey;
        this.items = items;
        this.storedSettings = settings;
        this.settings = {...getInitialSettings(this.storageKey, this.items), ...this.storedSettings};
        this.setSettings = setSettings;
        this.getItemWithSettings = getItemWithSettings;

        const {sortedItems, removedItems, selectedItem} = splitItems(getAllItems(this.items, this.settings), this.settings);

        this.sortedItems = sortedItems;
        this.removedItems = removedItems;
        this.selectedItem = selectedItem;
    }

    addCustomItem = (item) => {
        setCustomItems(getCustomItems(this.settings).concat(item), this.settings);

        return updateSettings(this.settings, this.setSettings);
    }

    addItem = (item) => {
        // Remove item name from deleted names 
        setRemovedNames(getRemovedNames(this.settings).filter(removedName => removedName != item.name), this.settings);

        // Extend index map with item
        setIndexMap(createIndexMap([...this.sortedItems, item]), this.settings);

        // Update state and storage
        return updateSettings(this.settings, this.setSettings);
    }

    getCustomItems = () => {
        return getCustomItems(this.settings);
    }

    getExistingItem = (item, keyProperty) => {
        let existingItem;

        getAllItems(this.items, this.settings).some(
            (otherItem) => {
                if (this.isItemsTheSame(otherItem, item, keyProperty)) {
                    existingItem = otherItem;

                    return true;
                }
            }
        )

        return existingItem;
    }

    getSelectedItem = (getItemSettings) => {
        const selectedName = getSelectedName(this.settings);

        const selectedItem = getAllItems(this.items, this.settings).find(item => item.name === selectedName);

        if (getItemSettings && this.getItemWithSettings) {
            return this.getItemWithSettings(selectedItem, this.getItemSettings(selectedItem));
        }

        return selectedItem;
    }

    isCustomItem = (item, keyProperty) => {
        return this.getCustomItems().some(customItem => this.isItemsTheSame(customItem, item, keyProperty));
    }

    isItemsTheSame = (item1, item2, keyProperty) => {
        if (!keyProperty) {
            keyProperty = "name";
        }

        return item1[keyProperty] && item2[keyProperty] && (item1[keyProperty].toLowerCase() == item2[keyProperty].toLowerCase());
    }

    isModalSettingsModified = () => {
        return modalSettingsKeys.some(key => this.storedSettings.hasOwnProperty(key));
    }

    removeCustomItem = (item) => {
        setCustomItems(this.getCustomItems().filter(customItem => customItem.name != item.name), this.settings);

        return updateSettings(this.settings, this.setSettings);
    }

    removeItem = (item) => {

        // Extend deleted names with item name
        setRemovedNames([...getRemovedNames(this.settings), item.name], this.settings);

        // Update index map by removing the item from sorted items
        setIndexMap(createIndexMap(this.sortedItems.filter(sortedItem => sortedItem.name != item.name)), this.settings);

        // Update state and storage
        return updateSettings(this.settings, this.setSettings);
    }

    resetModalSettings = () => {
        modalSettingsKeys.forEach(
            (key) => delete this.settings[key]
        );

        return updateSettings(this.settings, this.setSettings);
    }

    getItemSettings = (item) => getItemsSettings(this.settings)[item.name] ?? ITEM_SETTINGS_DEFAULT_VALUE;

    updateIndexMap = (item, direction) => {
        const itemIndex = this.sortedItems.indexOf(item);

        const otherItemIndex = itemIndex + (direction ? 1 : -1)

        this.sortedItems[itemIndex] = this.sortedItems[otherItemIndex];
        this.sortedItems[otherItemIndex] = item;

        return updateSettings(setIndexMap(createIndexMap(this.sortedItems), this.settings), this.setSettings);
    }

    updateItemSettings = (item, setting) => {
        const itemsSettings = getItemsSettings(this.settings);

        const currentItemSettings = this.getItemSettings(item);

        itemsSettings[item.name] = {...currentItemSettings, ...setting};

        return updateSettings(setItemsSettings(itemsSettings, this.settings), this.setSettings)
    }

    updateSelectedName = (name) => updateSettings(setSelectedName(name, this.settings), this.setSettings);
}

const createIndexMap = (sortedItems) => {
    const orderSetting = {};

    sortedItems.forEach(
        (item, index) => {
            orderSetting[item.name] = index;
        }
    );

    return orderSetting;
}

const getAllItems = (items, settings) => items.concat(getCustomItems(settings));

const getCustomItems = (settings) => settings[CUSTOM_ITEMS_KEY] ?? CUSTOM_ITEMS_DEFAULT_VALUE;

const getItemsSettings = (settings) => settings[ITEMS_SETTINGS_KEY] ?? ITEMS_SETTINGS_DEFAULT_VALUE;

const getIndexMap = (settings) => settings[INDEX_MAP_KEY];

const getInitialSettings = (storageKey, items) => {
    if (!items) {
        return undefined;
    }

    return {
        [STORAGE_KEY_KEY]: storageKey,
        [INDEX_MAP_KEY]: createIndexMap(items),
        [REMOVED_NAMES_KEY]: [],
        [SELECTED_NAME_KEY]: items[0].name,
        [CUSTOM_ITEMS_KEY]: CUSTOM_ITEMS_DEFAULT_VALUE,
        [ITEMS_SETTINGS_KEY]: ITEMS_SETTINGS_DEFAULT_VALUE,
    }
}

const getRemovedNames = (settings) => settings[REMOVED_NAMES_KEY];

const getSelectedName = (settings) => settings[SELECTED_NAME_KEY];

const getStorageKey = (settings) => settings[STORAGE_KEY_KEY];

// Split items into displayed items (sorted), removed items and currently selected item according to the settings
const splitItems = (items, settings) => {
    const removedNames = getRemovedNames(settings);
    const filterMethod = removedNames.length ? (item) => removedNames.includes(item.name) : undefined;

    const selectedName = getSelectedName(settings);

    const result = items.reduce(
        (accumulator, item) => {
            if (filterMethod && filterMethod(item)) {
                accumulator.removedItems.push(item);
            }
            else {
                accumulator.sortedItems.push(item)
            }

            if (item.name == selectedName) {
                accumulator.selectedItem = item;
            }

            return accumulator;
        },
        {
            sortedItems:[],
            removedItems:[],
            selectedItem: items[0]
        }
    );

    return {
        ...result,
        sortedItems : sortItems(result.sortedItems, settings)
    }
}

const setCustomItems = (customItems, settings) => setSetting(CUSTOM_ITEMS_KEY, customItems, settings);
const setItemsSettings = (itemsSettings, settings) => setSetting(ITEMS_SETTINGS_KEY, itemsSettings, settings);
const setIndexMap = (indexMap, settings) => setSetting(INDEX_MAP_KEY, indexMap, settings);
const setRemovedNames = (removedNames, settings) => setSetting(REMOVED_NAMES_KEY, removedNames, settings);
const setSelectedName = (selectedName, settings) => setSetting(SELECTED_NAME_KEY, selectedName, settings);

// Updates the settings without changing the state and storage
const setSetting = (key, value, settings) => {
    settings[key] = value;

    return settings;
}

const sortItems = (items, settings) => {
    const order = getIndexMap(settings);

    // I'm not sure if toSorted is widely enough supported
    //return items.toSorted(
    //    (a, b) => order[a.name] - order[b.name]
    //);

    return items.slice().sort(
        (a, b) => order[a.name] - order[b.name]
    );
}

const updateSettings = (settings, setSettings) => {
    setSettings(
        settings ? {...settings} : settings
    );

    return settings;
}

// Settings example 
/*

{
   "storageKey":"networkSettings",
   "indexMap":{
      "ethereum":0,
      "optimism":1,
      "base":2,
      "arbitrum":3,
      "polygon":4,
      "gnosis":5
   },
   "removedNames":[
      "canto",
      "zkSyncEra",
      "buidlguidl",
      "goerli",
      "sepolia",
      "localhost",
      "zkSyncTest",
      "mumbai",
      "scroll",
      "testnetHarmony",
      "harmony"
   ],
   "selectedName":"optimism",
   "itemsSettings": {
      "ethereum": {
         "selectedBlockExplorerName": "blockscout"
      },
      "polygon": {
         "selectedBlockExplorerName": "dexguru"
      }
   }
}

{
   "storageKey":"polygonTokenSettings",
   "indexMap":{
      "USDC":0,
      "EURe":1,
      "MATIC":2
   },
   "removedNames":[
      "DAI",
      "USDT"
   ],
   "selectedName":"EURe",
   "customItems":[
      {
         "address":"0x9C9e5fD8bbc25984B178FdCE6117Defa39d2db39",
         "name":"BUSD",
         "decimals":18
      },
      {
         "address":"0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3",
         "name":"BNB",
         "decimals":18
      },
      {
         "address":"0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b",
         "name":"AVAX",
         "decimals":18
      }
   ]
}
*/