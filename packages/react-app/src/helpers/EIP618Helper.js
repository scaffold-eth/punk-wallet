import showModal from "../components/GenericModal";
import { NETWORKS, ERROR_MESSAGES } from "../constants";
import { parse } from "eth-url-parser";

const { CHAIN_ERROR } = ERROR_MESSAGES;

export const handleNetworkByQR = (chainId, networkSettingsHelper, setTargetNetwork) => {
  if (chainId) {
    const incomingNetwork = Object.values(NETWORKS).find(network => network.chainId === parseInt(chainId));
    if (incomingNetwork) {
      console.log("incoming network:", incomingNetwork);
      networkSettingsHelper.updateSelectedName(incomingNetwork.name);
      setTargetNetwork(networkSettingsHelper.getSelectedItem(true));
    } else {
      // error screen that chainId is not supported
      showModal(CHAIN_ERROR.NOT_SUPPORTED, true);
    }
  } else {
    // warning screen that chainId is not provided
    showModal(CHAIN_ERROR.NOT_PROVIDED, false);
  }
};

export const parseEIP618 = (eip681URL, networkSettingsHelper, setTargetNetwork) => {
  const eip681Object = parse(eip681URL);
  console.log("eip681Object", eip681Object);

  const chainId = eip681Object.chain_id;

  handleNetworkByQR(chainId, networkSettingsHelper, setTargetNetwork);

  const functionName = eip681Object.function_name;
  const tokenAddress = eip681Object?.target_address;

  let toAddress;

  if (functionName == "transfer" && tokenAddress) {
    localStorage.setItem("switchToTokenAddress", tokenAddress);
    toAddress = eip681Object?.params?.address;
  } else {
    localStorage.setItem("switchToEth", true);
    toAddress = eip681Object?.target_address;
  }
};
