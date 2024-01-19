import { signMessage } from "./WalletConnectV2Helper";

import { NETWORKS } from "../constants";

import { LOCAL_STORAGE_CHANGED_EVENT_NAME } from "./TransactionManager";

const { AccountState, MoneriumClient, PaymentStandard, placeOrderMessage, constants } = require("@monerium/sdk");

const ibantools = require("ibantools");

const { ethers } = require("ethers");

const MONERIUM_AUTHORIZATION_CLIENT_ID = process.env.REACT_APP_MONERIUM_AUTHORIZATION_CLIENT_ID;
const RELAYER_PK = process.env.REACT_APP_RELAYER_PK;

const REDIRECT_URI = "https://punkwallet.io/";
//const REDIRECT_URI = "https://localhost:3000/";
//const REDIRECT_URI = "https://redirectmeto.com/http://localhost:3000";
//const REDIRECT_URI = "https://redirectmeto.com/http://192.168.0.101:3000/";
//const REDIRECT_URI = "https://redirectmeto.com/http://192.168.1.76:3000/";

const KEY_CODE_VERIFIER = "moneriumCodeVerifier";
const KEY_REFRESH_TOKEN = "moneriumRefreshToken";
const KEY_DELETED_ODER_IDS = "moneriumDeletedOrderIds";

export const ON_CHAIN_IBAN_VALUE = "OnChainIban";
export const CROSS_CHAIN_VALUE = "CrossChain";
export const isCrossChain = value => {
  return value == CROSS_CHAIN_VALUE;
};

const TARGET_CHAIN_NAMES = ["ethereum", "gnosis", "polygon"];
export const getAvailableTargetChainNames = currentChainName =>
  TARGET_CHAIN_NAMES.filter(targetChainName => targetChainName.toLowerCase() !== currentChainName.toLowerCase());

export const capitalizeFirstLetter = networkName => networkName.charAt(0).toUpperCase() + networkName.slice(1);
export const getNetwork = networkName =>
  Object.values(NETWORKS).find(network => network.name.toLowerCase() == networkName.toLowerCase());
export const getNetworkColor = networkName => getNetwork(networkName).color;
export const getNetworkChainId = networkName => getNetwork(networkName).chainId;

export const getNewMoneriumClient = () => {
  return new MoneriumClient("production");
};

export const getAuthFlowURI = async () => {
  try {
    const client = new MoneriumClient("production");

    // Construct the authFlowUrl for your application and redirect your customer.
    const authFlowUrl = await client.getAuthFlowURI({
      client_id: MONERIUM_AUTHORIZATION_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
    });

    // Store the code verifier in localStorage
    window.localStorage.setItem(KEY_CODE_VERIFIER, client.codeVerifier);

    // Redirecting to the Monerium onboarding / Authentication flow.
    window.location.replace(authFlowUrl);
  } catch (error) {
    console.log("Something went wrong", error);
  }
};

export const authorize = async (client, code) => {
  const codeVerifier = window.localStorage.getItem(KEY_CODE_VERIFIER);

  await client.auth({
    client_id: MONERIUM_AUTHORIZATION_CLIENT_ID,
    code: code,
    code_verifier: codeVerifier,
    redirect_url: REDIRECT_URI,
  });

  window.localStorage.setItem(KEY_REFRESH_TOKEN, client.bearerProfile.refresh_token);
};

export const authorizeWithRefreshToken = async client => {
  try {
    const refreshToken = window.localStorage.getItem(KEY_REFRESH_TOKEN);

    if (!refreshToken) {
      return;
    }

    await client.auth({
      client_id: MONERIUM_AUTHORIZATION_CLIENT_ID,
      refresh_token: refreshToken,
    });

    window.localStorage.setItem(KEY_REFRESH_TOKEN, client.bearerProfile.refresh_token);

    return true;
  } catch (error) {
    localStorage.removeItem(KEY_REFRESH_TOKEN);
    console.log("Something went wrong", error);

    return false;
  }
};

export const cleanStorage = async client => {
  localStorage.removeItem(KEY_CODE_VERIFIER);
  localStorage.removeItem(KEY_REFRESH_TOKEN);
};

export const getData = async (client, currentPunkAddress) => {
  try {
    const authContext = await client.getAuthContext();

    const profileId = authContext.profiles[0].id;

    const profile = await client.getProfile(profileId);
    const name = profile.name;

    const accountArrayIban = [];
    const addressesSet = new Set();

    for (const account of profile.accounts) {
      addressesSet.add(account.address.toLowerCase());

      if (account?.iban && account?.state == AccountState.approved) {
        accountArrayIban.push(account);
      }
    }

    const addressesArray = Array.from(addressesSet);
    placeAddressToFirstPlace(currentPunkAddress, addressesArray);

    const punkConnected = addressesArray.includes(currentPunkAddress);

    let punkBalances = {};

    if (punkConnected) {
      const balancesObjectArray = await client.getBalances(profileId);

      for (const balanceObject of balancesObjectArray) {
        if (balanceObject.address.toLowerCase() != currentPunkAddress) {
          continue;
        }

        const balancesArray = balanceObject.balances;

        for (const balance of balancesArray) {
          if (!balance.currency == "eur") {
            continue;
          }

          punkBalances[balanceObject.chain] = Number(balance.amount).toFixed(2);
        }
      }
    }

    return {
      name,
      accountArrayIban,
      addressesArray,
      //addressesArray: addressesArray.toSpliced(1, addressesArray.length - 4),
      punkConnected,
      punkBalances,
    };
  } catch (error) {
    console.log("Something went wrong", error);

    return {};
  }
};

export const linkAddress = async (client, currentPunkAddress) => {
  const LINK_MESSAGE = constants.LINK_MESSAGE;
  console.log("LINK_MESSAGE", LINK_MESSAGE);

  const signedMessage = await signMessage(LINK_MESSAGE);
  console.log("signedMessage", signedMessage);

  const authContext = await client.getAuthContext();

  try {
    const result = await client.linkAddress(authContext.defaultProfile, {
      address: currentPunkAddress,
      message: LINK_MESSAGE,
      signature: signedMessage,
      accounts: [
        {
          network: "mainnet",
          chain: "ethereum",
          currency: "eur",
        },
        {
          network: "mainnet",
          chain: "gnosis",
          currency: "eur",
        },
        {
          network: "mainnet",
          chain: "polygon",
          currency: "eur",
        },
      ],
    });

    console.log("result", result);
  } catch (error) {
    console.log("Something went wrong", error);
  }
};

export const getShortAddress = address => {
  let checksummedAddress = address;

  try {
    checksummedAddress = ethers.utils.getAddress(address);
  } catch (error) {
    console.error("Coudn't get checksummed address", error);
  }

  return checksummedAddress.slice(0, 6) + "..." + checksummedAddress.slice(checksummedAddress.length - 2);
};

export const getMemo = address => {
  return "Punk " + getShortAddress(address);
};

export const getFilteredOrders = async (client, filterObject) => {
  const orders = await client.getOrders(filterObject);
  // Can be filtered by address, txHash, profile, memo, accountId and state
  //{
  //    address: address,
  //    memo: getMemo(address)
  // }

  return orders;
};

export const placeCrossChainOrder = async (client, currentPunkAddress, crossChainObject, amount, chain) => {
  try {
    amount = amount.toString();

    const placeOrderMessageString = placeOrderMessage(
      amount,
      crossChainObject.address,
      getNetworkChainId(crossChainObject.targetChainName),
    );

    const signedPlaceOrderMessage = await signMessage(placeOrderMessageString);

    const counterpart = {
      identifier: {
        standard: PaymentStandard.chain,
        address: crossChainObject.address,
        chain: crossChainObject.targetChainName,
        network: "mainnet",
      },
    };

    const orderObject = {
      amount: amount,
      message: placeOrderMessageString,
      signature: signedPlaceOrderMessage,
      address: currentPunkAddress,
      counterpart: counterpart,
      chain: chain,
      network: "mainnet",
    };

    const order = await client.placeOrder(orderObject);

    return order;
  } catch (error) {
    console.log("Something went wrong", error);
  }
};

export const placeIbanOrder = async (client, currentPunkAddress, ibanAddressObject, amount, chain) => {
  try {
    amount = amount.toString();

    const placeOrderMessageString = placeOrderMessage(amount, ibanAddressObject.iban);

    const signedPlaceOrderMessage = await signMessage(placeOrderMessageString);

    const counterpart = {
      identifier: {
        standard: PaymentStandard.iban,
        iban: removeWhiteSpaces(ibanAddressObject.iban),
      },
      details: {
        firstName: ibanAddressObject.firstName,
        lastName: ibanAddressObject.lastName,
      },
    };

    const orderObject = {
      amount: amount,
      message: placeOrderMessageString,
      signature: signedPlaceOrderMessage,
      address: currentPunkAddress,
      counterpart: counterpart,
      chain: chain,
    };

    if (ibanAddressObject?.memo) {
      orderObject.memo = ibanAddressObject.memo; // ToDo: Question mark breaks the memo: "field must be between 5 and 140 regular characters"
    }

    const order = await client.placeOrder(orderObject);

    return order;
  } catch (error) {
    console.log("Something went wrong", error);
  }
};

export const removeWhiteSpaces = stringy => {
  if (!stringy) {
    return "";
  }

  return stringy.trim().replace(/\s+/g, "");
};

export const isIbanAddressObjectValid = ibanAddressObject => {
  const firstName = ibanAddressObject.firstName;
  const lastName = ibanAddressObject.lastName;
  const memo = ibanAddressObject.memo;

  return isNameValid(firstName) && isNameValid(lastName) && isMemoValid(memo);
};

export const isValidIban = iban => {
  return ibantools.isValidIBAN(removeWhiteSpaces(iban));
};

export const getChainId = order => {
  return NETWORKS[order.chain].chainId;
};

export const saveDeletedOrderIdsToLocalStorage = ids => {
  localStorage.setItem(KEY_DELETED_ODER_IDS, JSON.stringify(ids));
};

export const getDeletedOrderIdsFromLocalStorage = () => {
  const storedIds = localStorage.getItem(KEY_DELETED_ODER_IDS);
  return storedIds ? JSON.parse(storedIds) : [];
};

export const appendDeletedOrderIdToLocalStorage = id => {
  const storedIds = getDeletedOrderIdsFromLocalStorage();
  storedIds.push(id);
  saveDeletedOrderIdsToLocalStorage(storedIds);

  // StorageEvent doesn't work in the same window
  window.dispatchEvent(new CustomEvent("localStorageChanged"));
};

const isNameValid = name => {
  if (!name) {
    return false;
  }

  if (name.length < 2) {
    return false;
  }

  return true;
};

const isMemoValid = memo => {
  if (!memo) {
    return true;
  }

  if (memo.length < 5) {
    return false;
  }

  return true;
};

const placeAddressToFirstPlace = (address, addressesArray) => {
  try {
    const index = addressesArray.indexOf(address);

    if (index !== -1) {
      addressesArray.splice(index, 1);

      addressesArray.unshift(address);
    }
  } catch (error) {
    console.error("Coudn't place address to first place", address, addressesArray, error);
  }
};


