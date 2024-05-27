import showModal from "../components/GenericModal";
import { NETWORKS, ERROR_MESSAGES } from "../constants";

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
