import { CaretUpOutlined, ScanOutlined, SendOutlined, HistoryOutlined } from "@ant-design/icons";
import { StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { formatEther, parseEther } from "@ethersproject/units";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Alert, Button, Checkbox, Col, Row, Select, Spin, Switch, Input, Modal, notification } from "antd";
import "antd/dist/antd.css";
import { useUserAddress } from "eth-hooks";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import Web3Modal from "web3modal";
import { parse } from "eth-url-parser";
import "./App.css";
import {
  Account,
  Address,
  AddressInput,
  Balance,
  ERC20Balance,
  ERC20Input,
  SelectorWithSettings,
  EtherInput,
  Faucet,
  GasGauge,
  Header,
  IFrame,
  Monerium,
  MoneriumCrossChainAddressSelector,
  MoneriumOnChainCrossChainRadio,
  NetworkDisplay,
  NetworkDetailedDisplay,
  SettingsModal,
  QRPunkBlockie,
  Ramp,
  Reload,
  TokenDetailedDisplay,
  TokenDisplay,
  TokenImportDisplay,
  TransactionResponses,
  Wallet,
  WalletConnectTransactionPopUp,
  WalletConnectV2ConnectionError,
} from "./components";
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import { handleNetworkByQR } from "./helpers/handleNetworkByQR";
import { useBalance, useExchangePrice, useGasPrice, useLocalStorage, usePoller, useUserProvider } from "./hooks";

import WalletConnect from "@walletconnect/client";

import {
  isWalletConnectV2Connected,
  disconnectWallectConnectV2Sessions,
  connectWalletConnectV2,
  updateWalletConnectSession,
  createWeb3wallet,
  onSessionProposal,
} from "./helpers/WalletConnectV2Helper";

import {
  ON_CHAIN_IBAN_VALUE,
  getAvailableTargetChainNames,
  isCrossChain,
  getMemo,
  getNewMoneriumClient,
  getFilteredOrders,
  getShortAddress,
  isValidIban,
  placeCrossChainOrder,
  placeIbanOrder,
  isIbanAddressObjectValid,
} from "./helpers/MoneriumHelper";

import { SettingsHelper } from "./helpers/SettingsHelper";

import { monitorBalance } from "./helpers/ERC20Helper";

import {
  NETWORK_SETTINGS_STORAGE_KEY,
  migrateSelectedNetworkStorageSetting,
  getNetworkWithSettings,
} from "./helpers/NetworkSettingsHelper";

import {
  TOKEN_SETTINGS_STORAGE_KEY,
  getSelectedErc20Token,
  getTokens,
  migrateSelectedTokenStorageSetting,
} from "./helpers/TokenSettingsHelper";

const { confirm } = Modal;

const { ethers } = require("ethers");

const { OrderState } = require("@monerium/sdk");

/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

let scanner;

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
        rpc: {
          10: "https://mainnet.optimism.io", // xDai
          100: "https://rpc.gnosischain.com", // xDai
          137: "https://polygon-rpc.com",
          280: "https://zksync2-testnet.zksync.dev", // zksync alpha tesnet
          31337: "http://localhost:8545",
          42161: "https://arb1.arbitrum.io/rpc",
          80001: "https://rpc-mumbai.maticvigil.com",
          80216: "https://chain.buidlguidl.com:8545",
        },
      },
    },
  },
});

// 😬 Sorry for all the console logging
const DEBUG = false;

const networks = Object.values(NETWORKS);

function App(props) {
  const [dollarMode, setDollarMode] = useLocalStorage("dollarMode", true);

  const [networkSettingsModalOpen, setNetworkSettingsModalOpen] = useState(false);
  const [networkSettings, setNetworkSettings] = useLocalStorage(NETWORK_SETTINGS_STORAGE_KEY, {});
  const networkSettingsHelper = new SettingsHelper(
    NETWORK_SETTINGS_STORAGE_KEY,
    networks,
    networkSettings,
    setNetworkSettings,
    getNetworkWithSettings,
  );

  const [targetNetwork, setTargetNetwork] = useState(() => networkSettingsHelper.getSelectedItem(true));

  const [localProvider, setLocalProvider] = useState(() => new StaticJsonRpcProvider(targetNetwork.rpcUrl));
  useEffect(() => {
    setLocalProvider(prevProvider =>
      localProvider?.connection?.url == targetNetwork.rpcUrl
        ? prevProvider
        : new StaticJsonRpcProvider(targetNetwork.rpcUrl),
    );
  }, [targetNetwork]);

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  const networkName = targetNetwork.name;
  const erc20Tokens = targetNetwork?.erc20Tokens;

  const tokenSettingsStorageKey = networkName + TOKEN_SETTINGS_STORAGE_KEY;
  const tokens = getTokens(targetNetwork?.nativeToken, erc20Tokens);
  const [tokenSettingsModalOpen, setTokenSettingsModalOpen] = useState(false);
  const [tokenSettings, setTokenSettings] = useLocalStorage(tokenSettingsStorageKey, {});

  const tokenSettingsHelper = tokens
    ? new SettingsHelper(tokenSettingsStorageKey, tokens, tokenSettings, setTokenSettings)
    : undefined;

  useEffect(() => {
    migrateSelectedTokenStorageSetting(networkName, tokenSettingsHelper);
    migrateSelectedNetworkStorageSetting(networkSettingsHelper);
  }, []);

  const selectedErc20Token = tokenSettingsHelper
    ? getSelectedErc20Token(
        tokenSettingsHelper.getSelectedItem(),
        erc20Tokens.concat(tokenSettingsHelper.getCustomItems()),
      )
    : undefined;

  if (selectedErc20Token) {
    const switchToEth = localStorage.getItem("switchToEth");
    if (switchToEth) {
      localStorage.removeItem("switchToEth");

      if (targetNetwork?.nativeToken?.name) {
        tokenSettingsHelper.updateSelectedName(targetNetwork.nativeToken.name);
        console.log("Switched to native token");
      }
    }
  }

  const switchToTokenAddress = localStorage.getItem("switchToTokenAddress");

  if (switchToTokenAddress) {
    localStorage.removeItem("switchToTokenAddress");

    let tokens = targetNetwork?.erc20Tokens;

    if (tokens) {
      const customTokens = tokenSettingsHelper.getCustomItems();

      if (customTokens.length > 0) {
        tokens = tokens.concat(customTokens);
      }

      const token = tokens.find(token => token.address == switchToTokenAddress);

      if (token) {
        tokenSettingsHelper.updateSelectedName(token.name);
      }
      else {
        // error screen that token is not supported
      }
    }
  }

  const mainnetProvider = new StaticJsonRpcProvider(NETWORKS.ethereum.rpcUrl);

  const [injectedProvider, setInjectedProvider] = useState();

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && injectedProvider.provider.disconnect) {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast", localProvider);
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);

  // You can warn the user if you would like them to be on a specific network
  // I think the naming is misleading a little bit
  // localChainId is what we can select with the chainId selector on the UI
  // selectedChainId is different in case we connect with MetaMask (or Wallet Connect) and we're on a different chain
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice, undefined, injectedProvider);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  const balance = yourLocalBalance && formatEther(yourLocalBalance);

  const [showHistory, setShowHistory] = useLocalStorage("showHistory", true);

  const [moneriumClient, setMoneriumClient] = useState(getNewMoneriumClient());
  const [moneriumConnected, setMoneriumConnected] = useState(false);
  const [moneriumClientData, setMoneriumClientData] = useState(null);
  const [punkConnectedToMonerium, setPunkConnectedToMonerium] = useState(false);
  const [moneriumOrders, setMoneriumOrders] = useState(null);
  const [moneriumRadio, setMoneriumRadio] = useLocalStorage("moneriumRadio", ON_CHAIN_IBAN_VALUE);
  const [moneriumTargetChain, setMoneriumTargetChain] = useLocalStorage(
    networkName + "MoneriumTargetChain",
    getAvailableTargetChainNames(networkName)[0],
  );
  const [moneriumTargetAddress, setMoneriumTargetAddress] = useState(address);
  useEffect(() => {
    setMoneriumTargetAddress(prevAddress => (prevAddress == address ? prevAddress : address));
  }, [address]);

  const memoizedMonerium = useMemo(
    () => (
      <Monerium
        moneriumClient={moneriumClient}
        setMoneriumClient={setMoneriumClient}
        moneriumConnected={moneriumConnected}
        setMoneriumConnected={setMoneriumConnected}
        clientData={moneriumClientData}
        setClientData={setMoneriumClientData}
        punkConnectedToMonerium={punkConnectedToMonerium}
        setPunkConnectedToMonerium={setPunkConnectedToMonerium}
        currentPunkAddress={address}
      />
    ),
    [moneriumClient, moneriumConnected, moneriumClientData, punkConnectedToMonerium, address],
  );

  const initMoneriumOrders = async sleepMs => {
    if (sleepMs) {
      await new Promise(r => setTimeout(r, sleepMs));
    }

    const filterObject = {
      address: address,
    };

    try {
      const moneriumOrders = await getFilteredOrders(moneriumClient, filterObject);
      setMoneriumOrders(moneriumOrders);
    } catch (error) {
      console.log("Something went wrong", error);
    }
  };

  useEffect(() => {
    if (!moneriumConnected || !punkConnectedToMonerium || !address) {
      return;
    }

    initMoneriumOrders();
  }, [moneriumClient, moneriumConnected, punkConnectedToMonerium, address]);

  useEffect(() => {
    if (!moneriumOrders) {
      return;
    }

    let pendingOrder = false;

    for (const order of moneriumOrders) {
      const state = order?.meta?.state;
      if ((state && state == OrderState.placed) || state == OrderState.pending) {
        console.log("There is a pending order", order);
        pendingOrder = true;
        break;
      }
    }

    if (pendingOrder) {
      initMoneriumOrders(3000);
    }
  }, [moneriumOrders]);

  const [ibanAddressObject, setIbanAddressObject] = useState({});

  const isMoneriumDataLoading =
    moneriumConnected && !moneriumClientData && selectedErc20Token && selectedErc20Token.name == "EURe";
  const isMoneriumTransferReady =
    moneriumConnected && punkConnectedToMonerium && selectedErc20Token && selectedErc20Token.name == "EURe";

  const connectWallet = sessionDetails => {
    console.log(" 📡 Connecting to Wallet Connect....", sessionDetails);

    let connector;
    try {
      connector = new WalletConnect(sessionDetails);
      const { peerMeta } = connector;
      if (peerMeta) {
        setWalletConnectPeerMeta(peerMeta);
      }
    } catch (error) {
      console.error("Coudn't connect to", sessionDetails, error);
      localStorage.removeItem("walletConnectUrl");
      return;
    }

    setWallectConnectConnector(connector);

    // Subscribe to session requests
    connector.on("session_request", (error, payload) => {
      if (error) {
        throw error;
      }

      console.log("SESSION REQUEST");
      // Handle Session Request

      connector.approveSession({
        accounts: [
          // required
          address,
        ],
        chainId: targetNetwork.chainId, // required
      });

      setWalletConnectConnected(true);
      setWallectConnectConnectorSession(connector.session);
      const { peerMeta } = payload.params[0];
      if (peerMeta) {
        setWalletConnectPeerMeta(peerMeta);
      }

      /* payload:
      {
        id: 1,
        jsonrpc: '2.0'.
        method: 'session_request',
        params: [{
          peerId: '15d8b6a3-15bd-493e-9358-111e3a4e6ee4',
          peerMeta: {
            name: "WalletConnect Example",
            description: "Try out WalletConnect v1.0",
            icons: ["https://example.walletconnect.org/favicon.ico"],
            url: "https://example.walletconnect.org"
          }
        }]
      }
      */
    });

    // Subscribe to call requests
    connector.on("call_request", async (error, payload) => {
      if (error) {
        throw error;
      }

      console.log("call_request payload", payload);

      WalletConnectTransactionPopUp(payload, userProvider, connector, undefined, targetNetwork.chainId);
    });

    connector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }
      console.log("disconnect");

      disconnectFromWalletConnect();
    });
  };

  const disconnectFromWalletConnect = async (wallectConnectConnector, web3wallet) => {
    try {
      if (wallectConnectConnector) {
        console.log("Disconnect from Wallet Connect V1");
        await wallectConnectConnector.killSession();
      }
    } catch (error) {
      console.error("Coudn't disconnect from Wallet Connect V1", error);
    }

    try {
      if (web3wallet && isWalletConnectV2Connected(web3wallet)) {
        console.log("Disconnect from Wallet Connect V2");
        await disconnectWallectConnectV2Sessions(web3wallet);
      }
    } catch (error) {
      console.error("Coudn't disconnect from Wallet Connect V2", error);

      // This is a hack to remove the session manually
      // Otherwise if an old session is stuck, we cannot delete it
      localStorage.removeItem("wc@2:client:0.3//session");
    }

    setWalletConnectUrl("");
    setWalletConnectPeerMeta();
    setWallectConnectConnector();
    setWallectConnectConnectorSession("");

    // This has to be the last, so we don't try to reconnect in "Wallet Connect Hook" too early
    setWalletConnectConnected(false);
  };

  const [walletConnectUrl, setWalletConnectUrl] = useLocalStorage("walletConnectUrl");
  const [walletConnectConnected, setWalletConnectConnected] = useState();
  const [walletConnectPeerMeta, setWalletConnectPeerMeta] = useState();

  const [wallectConnectConnector, setWallectConnectConnector] = useState();
  //store the connector session in local storage so sessions persist through page loads ( thanks Pedro <3 )
  const [wallectConnectConnectorSession, setWallectConnectConnectorSession] = useLocalStorage(
    "wallectConnectConnectorSession",
  );

  const [web3wallet, setWeb3wallet] = useState();
  // Wallet Connect V2 initialization and listeners
  useEffect(() => {
    if (!address) {
      return;
    }

    async function initWeb3wallet() {
      const web3wallet = await createWeb3wallet();

      web3wallet.on("session_proposal", proposal => {
        onSessionProposal(
          web3wallet,
          address,
          proposal,
          disconnectFromWalletConnect,
          setWalletConnectUrl,
          setWalletConnectConnected,
          setWalletConnectPeerMeta,
        );
      });

      web3wallet.on("session_request", async requestEvent => {
        console.log("session_request requestEvent", requestEvent);

        WalletConnectTransactionPopUp(requestEvent, userProvider, undefined, web3wallet, targetNetwork.chainId);
      });

      web3wallet.on("session_update", async event => {
        console.log("session_update event", event);
      });

      web3wallet.on("session_delete", async event => {
        console.log("session_delete event", event);

        await disconnectFromWalletConnect(undefined, web3wallet);
      });

      web3wallet.on("session_event", async event => {
        console.log("session_event", event);
      });

      web3wallet.on("session_ping", async event => {
        console.log("session_ping", event);
      });

      web3wallet.on("session_expire", async event => {
        console.log("session_expire", event);
      });

      web3wallet.on("session_extend", async event => {
        console.log("session_extend", event);
      });

      web3wallet.on("proposal_expire", async event => {
        console.log("proposal_expire", event);
      });

      setWeb3wallet(web3wallet);
    }

    initWeb3wallet();
  }, [address]);

  useEffect(() => {
    if (!web3wallet) {
      return;
    }

    connectWalletConnectV2(web3wallet, setWalletConnectConnected, setWalletConnectPeerMeta);
  }, [web3wallet]);

  // Add an event listener to kill Wallet Connect V1 session when V2 Dapp reconnects
  // and there was an existing V1 session
  useEffect(() => {
    if (!web3wallet || !wallectConnectConnector) {
      return;
    }

    const listener = () => {
      if (wallectConnectConnector) {
        console.log("Kill Wallet Connect V1 session");
        wallectConnectConnector.killSession();
      }
    };

    web3wallet.on("session_proposal", listener);

    return () => {
      web3wallet.off("session_proposal", listener);
    };
  }, [web3wallet, wallectConnectConnector]);

  useEffect(() => {
    if (wallectConnectConnector && wallectConnectConnector.connected && address && localChainId) {
      const connectedAccounts = wallectConnectConnector?.accounts;
      let connectedAddress;

      if (connectedAccounts) {
        connectedAddress = connectedAccounts[0];
      }

      // Use Checksummed addresses
      if (connectedAddress && ethers.utils.getAddress(connectedAddress) != ethers.utils.getAddress(address)) {
        console.log("Updating wallet connect session with the new address");
        console.log("Connected address", ethers.utils.getAddress(connectedAddress));
        console.log("New address ", ethers.utils.getAddress(address));

        updateWalletConnectSession(wallectConnectConnector, address, localChainId);
      }

      const connectedChainId = wallectConnectConnector?.chainId;

      if (connectedChainId && connectedChainId != localChainId) {
        console.log("Updating wallet connect session with the new chainId");
        console.log("Connected chainId", connectedChainId);
        console.log("New chainId ", localChainId);

        updateWalletConnectSession(wallectConnectConnector, address, localChainId);
      }
    }
  }, [address, localChainId, wallectConnectConnector]);

  // "Wallet Connect Hook"
  useEffect(() => {
    if (!walletConnectConnected && address) {
      if (wallectConnectConnectorSession) {
        console.log("NOT CONNECTED AND wallectConnectConnectorSession", wallectConnectConnectorSession);
        connectWallet(wallectConnectConnectorSession);
        setWalletConnectConnected(true);
      } else if (walletConnectUrl) {
        // Version 2 is handled separately
        if (walletConnectUrl.includes("@2")) {
          return;
        }

        //CLEAR LOCAL STORAGE?!?
        console.log("clear local storage and connect...");
        localStorage.removeItem("walletconnect"); // lololol
        connectWallet(
          {
            // Required
            uri: walletConnectUrl,
            // Required
            clientMeta: {
              description: "Forkable web wallet for small/quick transactions.",
              url: "https://punkwallet.io",
              icons: ["https://punkwallet.io/punk.png"],
              name: "🧑‍🎤 PunkWallet.io",
            },
          } /*,
              {
                // Optional
                url: "<YOUR_PUSH_SERVER_URL>",
                type: "fcm",
                token: token,
                peerMeta: true,
                language: language,
              }*/,
        );
      }
    }
  }, [walletConnectUrl, address, walletConnectConnected, wallectConnectConnectorSession]);

  useEffect(() => {
    async function pairWalletConnectV2() {
      if (
        walletConnectUrl &&
        walletConnectUrl.includes("@2") &&
        web3wallet &&
        !isWalletConnectV2Connected(web3wallet)
      ) {
        console.log(" 📡 Connecting to Wallet Connect V2....", walletConnectUrl);
        try {
          await web3wallet.core.pairing.pair({ uri: walletConnectUrl });
        } catch (error) {
          console.log("Cannot create pairing", error);
          WalletConnectV2ConnectionError(error, undefined);
          setWalletConnectUrl("");
        }
      }
    }

    pairWalletConnectV2();
  }, [walletConnectUrl, web3wallet]);

  // Forcing white background for the QR code - Dark Reader issue
  useEffect(() => {
    setTimeout(() => {
      const element = document.getElementById('QRPunkBlockieDiv');
      if (element) {
        element.removeAttribute('data-darkreader-inline-bgcolor');
      }
    }, 50);
  }, []);

  useMemo(() => {
    if (address && window.location.pathname) {
      if (window.location.pathname.indexOf("/wc") >= 0) {
        // ToDo
        console.log("WALLET CONNECT!!!!!", window.location.search);
        let uri = window.location.search.replace("?uri=", "");
        console.log("WC URI:", uri);
        setWalletConnectUrl(decodeURIComponent(uri));
      }
    }
  }, [injectedProvider, localProvider, address]);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  /*
  useEffect(()=>{
    if(DEBUG && mainnetProvider && address && selectedChainId && yourLocalBalance && yourMainnetBalance && readContracts && writeContracts && mainnetDAIContract){
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________")
      console.log("🌎 mainnetProvider",mainnetProvider)
      console.log("🏠 localChainId",localChainId)
      console.log("👩‍💼 selected address:",address)
      console.log("🕵🏻‍♂️ selectedChainId:",selectedChainId)
      console.log("💵 yourLocalBalance",yourLocalBalance?formatEther(yourLocalBalance):"...")
      console.log("💵 yourMainnetBalance",yourMainnetBalance?formatEther(yourMainnetBalance):"...")
      console.log("📝 readContracts",readContracts)
      console.log("🌍 DAI contract on mainnet:",mainnetDAIContract)
      console.log("🔐 writeContracts",writeContracts)
    }
  }, [mainnetProvider, address, selectedChainId, yourLocalBalance, yourMainnetBalance, readContracts, writeContracts, mainnetDAIContract])
  */

  let networkDisplay = "";
  if (localChainId && selectedChainId && localChainId !== selectedChainId) {
    const networkSelected = NETWORK(selectedChainId);
    const networkLocal = NETWORK(localChainId);
    if (selectedChainId === 1337 && localChainId === 31337) {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
                HardHat.
                <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    } else {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network"
            description={
              <div>
                You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
                <b>{networkLocal && networkLocal.name}</b>.
                <Button
                  style={{ marginTop: 4 }}
                  onClick={async () => {
                    const ethereum = window.ethereum;
                    const data = [
                      {
                        chainId: "0x" + targetNetwork.chainId.toString(16),
                        chainName: networkName,
                        nativeCurrency: targetNetwork.nativeCurrency,
                        rpcUrls: [targetNetwork.rpcUrl],
                        blockExplorerUrls: [targetNetwork.blockExplorer],
                      },
                    ];
                    console.log("data", data);

                    let switchTx;

                    try {
                      console.log("first trying to add...");
                      switchTx = await ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: data,
                      });
                    } catch (addError) {
                      // handle "add" error
                      console.log("error adding, trying to switch");
                      try {
                        console.log("Trying a switch...");
                        switchTx = await ethereum.request({
                          method: "wallet_switchEthereumChain",
                          params: [{ chainId: data[0].chainId }],
                        });
                      } catch (switchError) {
                        // not checking specific error code, because maybe we're not using MetaMask
                      }
                    }
                    // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods

                    if (switchTx) {
                      console.log(switchTx);
                    }
                  }}
                >
                  <span style={{ paddingRight: 4 }}>switch to</span> <b>{NETWORK(localChainId).name}</b>
                </Button>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    }
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {networkName}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    provider.on("disconnect", () => {
      console.log("LOGOUT!");
      logoutOfWeb3Modal();
    });
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  let faucetHint = "";
  const faucetAvailable = localProvider && localProvider.connection && networkName == "localhost";

  const [faucetClicked, setFaucetClicked] = useState(false);
  if (
    !faucetClicked &&
    localProvider &&
    localProvider._network &&
    localProvider._network.chainId == 31337 &&
    yourLocalBalance &&
    formatEther(yourLocalBalance) <= 0
  ) {
    faucetHint = (
      <div style={{ padding: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            faucetTx({
              to: address,
              value: parseEther("0.01"),
            });
            setFaucetClicked(true);
          }}
        >
          💰 Grab funds from the faucet ⛽️
        </Button>
      </div>
    );
  }

  const [toAddress, setToAddress] = useLocalStorage("punkWalletToAddress", "", 120000);

  const [amount, setAmount] = useState();

  const [amountEthMode, setAmountEthMode] = useState(false);

  const [receiveMode, setReceiveMode] = useState(false);

  if (window.location.pathname !== "/") {
    try {
      const path = window.location.pathname.replace("/", "");

      if (path.startsWith("ethereum:")) {
        const eip681URL = window.location.href.substring(window.location.href.indexOf("ethereum:"));

        const eip681Object = parse(eip681URL);
        console.log("eip681Object", eip681Object);

        const chainId = eip681Object.chain_id;

        handleNetworkByQR(chainId, networkSettingsHelper, setTargetNetwork)

        const functionName = eip681Object.function_name;
        const tokenAddress = eip681Object?.target_address;

        let toAddress;

        if (functionName == "transfer" && tokenAddress) {
          localStorage.setItem("switchToTokenAddress", tokenAddress);
          toAddress = eip681Object?.params?.address;
        }
        else {
          localStorage.setItem("switchToEth", true);
          toAddress = eip681Object?.target_address
        }
      }

      window.history.pushState({}, "", "/");
    } catch (error) {
      console.log("Coudn't parse EIP681", error);
    }
  }

  if (window.location.pathname !== "/") {
    try {
      const incoming = window.location.pathname.replace("/", "");

      if (incoming) {
        const incomingParts = incoming.split(":");

        let index = 0;
        let pushState = false;

        const incomingNetworkName = incomingParts[index];
        let incomingNetwork;

        if (incomingNetworkName) {
          incomingNetwork = Object.values(NETWORKS).find(network => network.name.startsWith(incomingNetworkName));

          if (incomingNetwork) {
            console.log("incoming network:", incomingNetwork);

            networkSettingsHelper.updateSelectedName(incomingNetwork.name);
            setTargetNetwork(networkSettingsHelper.getSelectedItem(true));

            let pushStateURL = "/";

            if (incomingParts.length > 1 && incomingParts[1] == "pk") {
              pushStateURL = "pk" + window.location.hash;
            }

            window.history.pushState({}, "", pushStateURL);
            pushState = true;

            index++;
          }
        }

        let validAddress = false;

        if (incomingParts.length > index) {
          const incomingAddress = incomingParts[index];

          if (incomingAddress && ethers.utils.isAddress(incomingAddress)) {
            console.log("incoming address:", incomingAddress);

            validAddress = true;

            setToAddress(incomingAddress);

            if (!pushState) {
              window.history.pushState({}, "", "/");
              pushState = true;
            }
          }

          index++;
        }

        if (validAddress && incomingParts.length > index) {
          const incomingAmount = parseFloat(incomingParts[index]);

          if (incomingAmount > 0) {
            console.log("incoming amount:", incomingAmount);
            setAmount(incomingAmount);
            setAmountEthMode(true);

            if (!incomingNetwork) {
              if (targetNetwork?.nativeToken?.name) {
                tokenSettingsHelper.updateSelectedName(targetNetwork.nativeToken.name);
                console.log("Switched to native token");
              }
            }

            if (incomingNetwork?.nativeToken) {
              localStorage.setItem("switchToEth", true);
            }
          }

          if (!pushState) {
            window.history.pushState({}, "", "/");
          }
        }
      }
    } catch (error) {
      console.error("Coudn't parse incoming address/amount/network", error);
    }
  }

  const [data, setData] = useState();

  const [walletConnectTx, setWalletConnectTx] = useState();

  const [loading, setLoading] = useState(false);

  const [depositing, setDepositing] = useState();
  const [depositAmount, setDepositAmount] = useState();

  // ERC20 Token balance to use in ERC20Balance and in ERC20Input
  const [balanceERC20, setBalanceERC20] = useState(null);

  const [priceERC20, setPriceERC20] = useState();

  const walletDisplay =
    web3Modal && web3Modal.cachedProvider ? (
      ""
    ) : (
      <Wallet key="wallet" address={address} provider={userProvider} ensProvider={mainnetProvider} price={price} />
    );

  return (
    <div className="App">
      {networkSettingsHelper && (
        <SettingsModal
          settingsHelper={networkSettingsHelper}
          itemCoreDisplay={network => <NetworkDisplay network={network} />}
          itemDetailedDisplay={(
            networkSettingsHelper,
            networkDetailed,
            networkCoreDisplay,
            network,
            setItemDetailed,
            setTargetNetwork,
          ) => (
            <NetworkDetailedDisplay
              networkSettingsHelper={networkSettingsHelper}
              network={networkDetailed}
              networkCoreDisplay={networkCoreDisplay}
              setTargetNetwork={setTargetNetwork}
              currentPunkAddress={address}
            />
          )}
          modalOpen={networkSettingsModalOpen}
          setModalOpen={setNetworkSettingsModalOpen}
          title={"Network Settings"}
          setTargetNetwork={setTargetNetwork}
        />
      )}

      {tokenSettingsHelper && (
        <SettingsModal
          settingsHelper={tokenSettingsHelper}
          itemCoreDisplay={token => (
            <TokenDisplay
              token={token}
              divStyle={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              spanStyle={{ paddingLeft: "0.2em" }}
            />
          )}
          itemDetailedDisplay={(tokenSettingsHelper, tokenDetailed, tokenCoreDisplay, network, setItemDetailed) => (
            <TokenDetailedDisplay
              tokenSettingsHelper={tokenSettingsHelper}
              token={tokenDetailed}
              tokenCoreDisplay={tokenCoreDisplay}
              network={network}
              setItemDetailed={setItemDetailed}
            />
          )}
          itemImportDisplay={(tokenSettingsHelper, tokenCoreDisplay, tokenDetailedDisplay, network, setImportView) => (
            <TokenImportDisplay
              tokenSettingsHelper={tokenSettingsHelper}
              tokenCoreDisplay={tokenCoreDisplay}
              tokenDetailedDisplay={tokenDetailedDisplay}
              network={network}
              setImportView={setImportView}
            />
          )}
          modalOpen={tokenSettingsModalOpen}
          setModalOpen={setTokenSettingsModalOpen}
          title={"Token Settings"} // ToDo: Reuse TOKEN_SETTINGS_STORAGE_KEY and colored network name
          network={targetNetwork}
        />
      )}

      <div className="site-page-header-ghost-wrapper">
        <Header
          extra={[
            <Address
              key="address"
              fontSize={32}
              address={address}
              ensProvider={mainnetProvider}
              blockExplorer={blockExplorer}
            />,
            /* <span style={{ verticalAlign: "middle", paddingLeft: 16, fontSize: 32 }}>
              <Tooltip title="History">
                <HistoryOutlined onClick={async () => {
                  window.open("https://zapper.fi/transactions?address="+address)
                }}/>
              </Tooltip>
            </span>, */
            walletDisplay,

            <Reload
              key="checkBalances"
              currentPunkAddress={address}
              localProvider={localProvider}
              networkSettingsHelper={networkSettingsHelper}
              setTargetNetwork={setTargetNetwork}
            />,
            <Account
              key="account"
              address={address}
              localProvider={localProvider}
              userProvider={userProvider}
              mainnetProvider={mainnetProvider}
              price={price}
              web3Modal={web3Modal}
              loadWeb3Modal={loadWeb3Modal}
              logoutOfWeb3Modal={logoutOfWeb3Modal}
              blockExplorer={blockExplorer}
            />,
          ]}
        />
      </div>

      {/* ✏️ Edit the header and change the title to your project name */}

      <div
        style={{ clear: "both", opacity: yourLocalBalance ? 1 : 0.2, width: 500, margin: "auto", position: "relative" }}
      >
        <div>
          {selectedErc20Token ? (
            <ERC20Balance
              targetNetwork={targetNetwork}
              token={selectedErc20Token}
              rpcURL={targetNetwork.rpcUrl}
              size={12 + window.innerWidth / 16}
              address={address}
              dollarMode={dollarMode}
              setDollarMode={setDollarMode}
              balance={balanceERC20}
              setBalance={setBalanceERC20}
              setPrice={setPriceERC20}
              price={priceERC20}
            />
          ) : (
            <Balance
              value={yourLocalBalance}
              size={12 + window.innerWidth / 16}
              price={price}
              dollarMode={dollarMode}
              setDollarMode={setDollarMode}
            />
          )}
        </div>

        <span style={{ verticalAlign: "middle" }}>
          <div
            style={{ display: "flex", justifyContent: erc20Tokens ? "space-evenly" : "center", alignItems: "center" }}
          >
            <div>
              <SelectorWithSettings
                settingsHelper={networkSettingsHelper}
                settingsModalOpen={setNetworkSettingsModalOpen}
                itemCoreDisplay={network => <NetworkDisplay network={network} />}
                onChange={value => {
                  setTargetNetwork(networkSettingsHelper.getSelectedItem(true));
                }}
                optionStyle={{ lineHeight: 1.1 }}
              />
            </div>
            <div>
              {" "}
              {tokenSettingsHelper && (
                <SelectorWithSettings
                  settingsHelper={tokenSettingsHelper}
                  settingsModalOpen={setTokenSettingsModalOpen}
                  itemCoreDisplay={token => <TokenDisplay token={token} />}
                />
              )}
            </div>
          </div>
          {faucetHint}
        </span>
      </div>

      {address && (
        <div id="QRPunkBlockieDiv" style={{ padding: 16, cursor: "pointer", backgroundColor: "#FFFFFF", width: 420, margin: "auto" }}>
          <QRPunkBlockie
            address={address}
            showAddress={true}
            withQr
            receiveMode={receiveMode}
            chainId={targetNetwork.chainId}
            amount={amount}
            selectedErc20Token={selectedErc20Token}
          />
        </div>
      )}

      <div
        style={{
          position: "relative",
          width: 320,
          margin: "auto",
          textAlign: "center",
          marginTop: 32,
          backgroundColor: "",
        }}
      >
        <div style={{ padding: 10 }}>
          {isMoneriumDataLoading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: -25,
                paddingBottom: 25,
              }}
            >
              <img
                src={"/MoneriumLogo.png"}
                alt={"Monerium Data loading"}
                style={{
                  width: "2em",
                  height: "2em",
                }}
              />
              <Spin />
            </div>
          )}
            <div style={{ visibility: !receiveMode ? 'visible' : 'hidden' }}>
              {isMoneriumTransferReady && (
                <MoneriumOnChainCrossChainRadio moneriumRadio={moneriumRadio} setMoneriumRadio={setMoneriumRadio} />
              )}
              {isMoneriumTransferReady && isCrossChain(moneriumRadio) ? (
                <MoneriumCrossChainAddressSelector
                  clientData={moneriumClientData}
                  currentPunkAddress={address}
                  targetChain={moneriumTargetChain}
                  setTargetChain={setMoneriumTargetChain}
                  targetAddress={moneriumTargetAddress}
                  setTargetAddress={setMoneriumTargetAddress}
                  networkName={targetNetwork.name}
                />
              ) : (
                <AddressInput
                  key={receiveMode}
                  ensProvider={mainnetProvider}
                  placeholder={isMoneriumTransferReady ? "to address / IBAN" : "to address"}
                  disabled={walletConnectTx}
                  value={toAddress}
                  setAmount={setAmount}
                  setToAddress={setToAddress}
                  hoistScanner={toggle => {
                    scanner = toggle;
                  }}
                  isMoneriumTransferReady={isMoneriumTransferReady}
                  ibanAddressObject={ibanAddressObject}
                  setIbanAddressObject={setIbanAddressObject}
                  setAmountEthMode={setAmountEthMode}
                  networkSettingsHelper={networkSettingsHelper}
                  setTargetNetwork={setTargetNetwork}
                  walletConnect={async wcLink => {
                    if (walletConnectConnected) {
                      await disconnectFromWalletConnect(wallectConnectConnector, web3wallet);
                    }

                    setWalletConnectUrl(wcLink);
                  }}
                />
              )}
            </div>
        </div>

        <div style={{ padding: !receiveMode ? 10 : 0 }}>
          {walletConnectTx ? (
            <Input disabled={true} value={amount} />
          ) : selectedErc20Token ? (
            <ERC20Input
              key={amount}
              token={selectedErc20Token}
              value={amount}
              amount={amount}
              setAmount={setAmount}
              balance={balanceERC20}
              price={priceERC20}
              setPrice={setPriceERC20}
              dollarMode={dollarMode}
              setDollarMode={setDollarMode}
              receiveMode={receiveMode}
            />
          ) : (
            <EtherInput
              key={amount}
              price={price || targetNetwork.price}
              value={amount}
              token={targetNetwork.token || "ETH"}
              ethMode={amountEthMode}
              address={address}
              provider={localProvider}
              gasPrice={gasPrice}
              onChange={value => {
                setAmount(value);
              }}
              receiveMode={receiveMode}
            />
          )}
        </div>

        <div style={{ position: "relative", top: 10, left: 40 }}> {networkDisplay} </div>

        <div style={{ padding: 10, visibility: !receiveMode ? "visible" : "hidden", }}>
            <Button
              key={receiveMode}
              type="primary"
              disabled={
                loading ||
                !amount ||
                (!toAddress && !(isMoneriumTransferReady && isCrossChain(moneriumRadio))) ||
                (isValidIban(toAddress) && !isIbanAddressObjectValid(ibanAddressObject))
              }
              loading={loading}
              onClick={async () => {
                setLoading(true);

                if (isMoneriumTransferReady && isCrossChain(moneriumRadio)) {
                  const order = await placeCrossChainOrder(
                    moneriumClient,
                    address,
                    { targetChainName: moneriumTargetChain, address: moneriumTargetAddress },
                    amount,
                    networkName,
                  );
                  await initMoneriumOrders();
                } else if (isValidIban(toAddress)) {
                  const order = await placeIbanOrder(moneriumClient, address, ibanAddressObject, amount, networkName);
                  await initMoneriumOrders();
                } else {
                  let txConfig = {
                    chainId: selectedChainId,
                  };

                  if (!selectedErc20Token) {
                    let value;
                    try {
                      console.log("PARSE ETHER", amount);
                      value = parseEther("" + amount);
                      console.log("PARSEDVALUE", value);
                    } catch (e) {
                      const floatVal = parseFloat(amount).toFixed(8);

                      console.log("floatVal", floatVal);
                      // failed to parseEther, try something else
                      value = parseEther("" + floatVal);
                      console.log("PARSEDfloatVALUE", value);
                    }

                    txConfig.to = toAddress;
                    txConfig.value = value;
                  } else {
                    if (selectedErc20Token) {
                      txConfig.erc20 = {
                        token: selectedErc20Token,
                        to: toAddress,
                        amount: amount,
                      };
                    }
                  }

                  if (networkName == "arbitrum") {
                    //txConfig.gasLimit = 21000;
                    //ask rpc for gas price
                  } else if (networkName == "optimism") {
                    //ask rpc for gas price
                  } else if (networkName == "gnosis") {
                    //ask rpc for gas price
                  } else if (networkName == "polygon") {
                    //ask rpc for gas price
                  } else if (networkName == "goerli") {
                    //ask rpc for gas price
                  } else if (networkName == "base") {
                    //ask rpc for gas price
                  } else if (networkName == "sepolia") {
                    //ask rpc for gas price
                  } else {
                    txConfig.gasPrice = gasPrice;
                  }

                  console.log("SEND AND NETWORK", targetNetwork);

                  let result = tx(txConfig);
                  result = await result;
                  console.log(result);
                }

                // setToAddress("")
                setAmount("");
                setData("");

                setShowHistory(true);
                setLoading(false);

                monitorBalance(selectedErc20Token, targetNetwork.rpcUrl, address, balanceERC20, setBalanceERC20);
              }}
            >
              {loading ||
              !amount ||
              (!toAddress && !(isMoneriumTransferReady && isCrossChain(moneriumRadio))) ||
              (isValidIban(toAddress) && !isIbanAddressObjectValid(ibanAddressObject)) ? (
                <CaretUpOutlined />
              ) : (
                <SendOutlined style={{ color: "#FFFFFF" }} />
              )}{" "}
              Send
            </Button>
        </div>
      </div>

      <div style={{ padding: 16, backgroundColor: "#FFFFFF", width: 420, margin: "auto" }}>
        {
          <TransactionResponses
            provider={userProvider}
            signer={userProvider.getSigner()}
            injectedProvider={injectedProvider}
            address={address}
            chainId={targetNetwork.chainId}
            blockExplorer={blockExplorer}
            moneriumOrders={moneriumOrders}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
          />
        }
      </div>

      <div style={{ padding: "1em" }}>
        <Switch
          checkedChildren="Send"
          unCheckedChildren="Receive"
          defaultChecked
          onChange={() => setReceiveMode(!receiveMode)}
        />
      </div>

      <div style={{ zIndex: -1, paddingTop: 20, opacity: 0.5, fontSize: 12 }}>
        <Button
          style={{ margin: 8, marginTop: 16 }}
          onClick={() => {
            window.open("https://zapper.fi/account/" + address + "?tab=history");
          }}
        >
          <span style={{ marginRight: 8 }}>📜</span>History
        </Button>

        <Button
          style={{ margin: 8, marginTop: 16 }}
          onClick={() => {
            window.open("https://zapper.fi/account/" + address);
          }}
        >
          <span style={{ marginRight: 8 }}>👛</span> Inventory
        </Button>
      </div>

      <div style={{ clear: "both", maxWidth: "100%", width: 975, margin: "auto", marginTop: 32, position: "relative" }}>
        {wallectConnectConnector && !wallectConnectConnector.connected && (
          <div>
            <Spin />
            <div>Connecting to the Dapp...</div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {walletConnectConnected ? (
            <>
              {walletConnectPeerMeta?.icons[0] ? (
                <span style={{ paddingRight: 10 }}>
                  {walletConnectPeerMeta?.icons[0] && (
                    <img
                      style={{ width: 40 }}
                      src={walletConnectPeerMeta.icons[0]}
                      alt={walletConnectPeerMeta.name ? walletConnectPeerMeta.name : ""}
                    />
                  )}
                </span>
              ) : (
                <span style={{ fontSize: 30, paddingRight: 10 }}>✅</span>
              )}
            </>
          ) : (
            ""
          )}
          <Input
            style={{ width: "40%", textAlign: "center" }}
            placeholder={"wallet connect url (or use the scanner-->)"}
            value={walletConnectPeerMeta?.name ? walletConnectPeerMeta.name : walletConnectUrl}
            disabled={walletConnectConnected}
            onChange={e => {
              setWalletConnectUrl(e.target.value);
            }}
          />
          {walletConnectConnected ? (
            <span
              style={{ cursor: "pointer", fontSize: 30, paddingLeft: 10 }}
              onClick={() => {
                disconnectFromWalletConnect(wallectConnectConnector, web3wallet);
              }}
            >
              🗑
            </span>
          ) : (
            ""
          )}
        </div>
        <IFrame address={address} userProvider={userProvider} />

        <div style={{ paddingTop: "2em" }}>{memoizedMonerium}</div>
      </div>

      {networkName == "ethereum" ? (
        <div style={{ zIndex: -1, padding: 64, opacity: 0.5, fontSize: 12 }}>
          {depositing ? (
            <div style={{ width: 200, margin: "auto" }}>
              <EtherInput
                /*price={price || targetNetwork.price}*/
                value={depositAmount}
                token={targetNetwork.token || "ETH"}
                // address={address}
                // provider={localProvider}
                // gasPrice={gasPrice}
                onChange={value => {
                  setDepositAmount(value);
                }}
              />
              <Button
                style={{ margin: 8, marginTop: 16 }}
                onClick={() => {
                  console.log("DEPOSITING", depositAmount);
                  tx({
                    to: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
                    value: ethers.utils.parseEther(depositAmount),
                    gasLimit: 175000,
                    gasPrice: gasPrice,
                    data:
                      "0xb1a1a882000000000000000000000000000000000000000000000000000000000013d62000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000",
                  });
                  setDepositAmount();
                  setDepositing();
                }}
              >
                <span style={{ marginRight: 8 }}>🔴</span>Deposit
              </Button>
            </div>
          ) : (
            <div>
              <Button
                style={{ margin: 8, marginTop: 16 }}
                onClick={() => {
                  setDepositing(true);
                  /*tx({
                  to: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
                  value: ethers.utils.parseEther("0.01"),
                  gasLimit: 175000,
                  gasPrice: gasPrice,
                  data: "0xb1a1a882000000000000000000000000000000000000000000000000000000000013d62000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000"
                })*/
                }}
              >
                <span style={{ marginRight: 8 }}>🔴</span>Deposit to OE
              </Button>
            </div>
          )}
        </div>
      ) : (
        ""
      )}

      <div style={{ zIndex: -1, padding: 64, opacity: 0.5, fontSize: 12 }}>
        created with <span style={{ marginRight: 4 }}>🏗</span>
        <a href="https://github.com/austintgriffith/scaffold-eth#-scaffold-eth" target="_blank">
          scaffold-eth
        </a>
      </div>
      <div style={{ padding: 32 }} />

      <div
        style={{
          transform: "scale(2.7)",
          transformOrigin: "70% 80%",
          position: "fixed",
          textAlign: "right",
          right: 0,
          bottom: 16,
          padding: 10,
        }}
      >
        <Button
          type="primary"
          shape="circle"
          style={{ backgroundColor: targetNetwork.color, borderColor: targetNetwork.color }}
          size="large"
          onClick={() => {
            scanner(true);
          }}
        >
          <ScanOutlined style={{ color: "#FFFFFF" }} />
        </Button>
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[16, 16]}>
          <Col span={12}>
            <Ramp price={price} address={address} networks={NETWORKS} />
          </Col>

          {networkName == "arbitrum" ||
          networkName == "gnosis" ||
          networkName == "optimism" ||
          networkName == "polygon" ? (
            ""
          ) : (
            <Col span={12} style={{ textAlign: "center", opacity: 0.8 }}>
              <GasGauge gasPrice={gasPrice} />
            </Col>
          )}
        </Row>

        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {faucetAvailable ? (
              <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
            ) : (
              ""
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}

/* eslint-disable */
window.ethereum &&
  window.ethereum.on("chainChanged", chainId => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 3000);
  });

window.ethereum &&
  window.ethereum.on("accountsChanged", accounts => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1);
  });
/* eslint-enable */

export default App;
