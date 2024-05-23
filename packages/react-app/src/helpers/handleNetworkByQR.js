import { NETWORKS } from "../constants";

export const handleNetworkByQR = (chainId, networkSettingsHelper, setTargetNetwork) => {
  if (chainId) {
    const incomingNetwork = Object.values(NETWORKS).find(network => network.chainId === parseInt(chainId));

    if (incomingNetwork) {
      console.log("incoming network:", incomingNetwork);
      networkSettingsHelper.updateSelectedName(incomingNetwork.name);
      setTargetNetwork(networkSettingsHelper.getSelectedItem(true));
    } else {
      // error screen that chainId is not supported
    }
  } else {
    // warning screen that chainId is not provided
  }
};
