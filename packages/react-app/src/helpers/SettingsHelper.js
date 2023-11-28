const STORAGE_KEY_KEY = "storageKey";

const INDEX_MAP_KEY = "indexMap";
const REMOVED_NAMES_KEY = "removedNames";
const SELECTED_NAME_KEY = "selectedName";

const modalSettingsKeys = [INDEX_MAP_KEY, REMOVED_NAMES_KEY];

export class SettingsHelper {
    constructor(storageKey, items, settings, setSettings) {
        this.storageKey = storageKey;
        this.items = items;
        this.storedSettings = settings;
        this.settings = {...getInitialSettings(this.storageKey, this.items), ...this.storedSettings};
        this.setSettings = setSettings;

        const {sortedItems, removedItems, selectedItem} = getItems(this.items, this.settings);

        this.sortedItems = sortedItems;
        this.removedItems = removedItems;
        this.selectedItem = selectedItem;
    }

    addItem = (item) => {
        // Remove item name from deleted names 
        setRemovedNames(getRemovedNames(this.settings).filter(removedName => removedName != item.name), this.settings);

        // Extend index map with item
        setIndexMap(createIndexMap([...this.sortedItems, item]), this.settings);

        // Update state and storage
        return updateSettings(this.settings, this.setSettings);
    }

    getSelectedItem = () => {
        const selectedName = getSelectedName(this.settings);

        return this.items.find(item => item.name === selectedName);
    }

    isModalSettingsModified = () => {
        return modalSettingsKeys.some(key => this.storedSettings.hasOwnProperty(key));
    }

    removeItem = (item) => {

        // Extend deleted names with item name
        setRemovedNames([...getRemovedNames(this.settings), item.name], this.settings);

        // Update index map by removing the item from sorted items
        setIndexMap(createIndexMap(this.sortedItems.filter(sortedItem => sortedItem.name != item.name)), this.settings);

        // Update state and storage
        return updateSettings(this.settings, this.setSettings);
    }

    updateSelectedName = (name) => {
        return updateSettings(setSelectedName(name, this.settings), this.setSettings);
    }

    resetModalSettings = () => {
        modalSettingsKeys.forEach(
            (key) => delete this.settings[key]
        );

        return updateSettings(this.settings, this.setSettings);
    }

    updateIndexMap = (item, direction) => {
        const itemIndex = this.sortedItems.indexOf(item);

        const otherItemIndex = itemIndex + (direction ? 1 : -1)

        this.sortedItems[itemIndex] = this.sortedItems[otherItemIndex];
        this.sortedItems[otherItemIndex] = item;

        return updateSettings(setIndexMap(createIndexMap(this.sortedItems), this.settings), this.setSettings);
    }
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

const getIndexMap = (settings) => {
    return settings[INDEX_MAP_KEY];
}

const getInitialSettings = (storageKey, items) => {
    if (!items) {
        return undefined;
    }

    return {
        [STORAGE_KEY_KEY]: storageKey,
        [INDEX_MAP_KEY]: createIndexMap(items),
        [REMOVED_NAMES_KEY]: [],
        [SELECTED_NAME_KEY]: items[0].name
    }
}

// Split items into displayed items (sorted), removed items and currently selected item according to the settings
const getItems = (items, settings) => {
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

const getRemovedNames = (settings) => {
    return settings[REMOVED_NAMES_KEY];
}

const getSelectedName = (settings) => {
    return settings[SELECTED_NAME_KEY];
}

const getStorageKey = (settings) => {
    return settings[STORAGE_KEY_KEY];
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

const setIndexMap = (indexMap, settings) => {
    return setSetting(INDEX_MAP_KEY, indexMap, settings);
}

const setRemovedNames = (removedNames, settings) => {
    return setSetting(REMOVED_NAMES_KEY, removedNames, settings);
}

const setSelectedName = (selectedName, settings) => {
    return setSetting(SELECTED_NAME_KEY, selectedName, settings);
}

// Updates the settings without changing the state and storage
const setSetting = (key, value, settings) => {
    settings[key] = value;

    return settings;
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
   "selectedName":"optimism"
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
   "selectedName":"EURe"
}
*/