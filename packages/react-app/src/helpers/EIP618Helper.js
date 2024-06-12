import showModal from "../components/GenericModal";
import { NETWORKS, ERROR_MESSAGES } from "../constants";
import { parse } from "eth-url-parser";
import BigNumber from 'bignumber.js';

const { CHAIN_ERROR } = ERROR_MESSAGES;

const handleNetworkChange = (chainId, networkSettingsHelper, setTargetNetwork) => {
  if (chainId) {
    const incomingNetwork = Object.values(NETWORKS).find(network => network.chainId === parseInt(chainId));

    if (incomingNetwork) {
      const currentNetwork = networkSettingsHelper.getSelectedItem();

      if (currentNetwork.chainId !== incomingNetwork.chainId) {
        networkSettingsHelper.updateSelectedName(incomingNetwork.name);
        setTargetNetwork(networkSettingsHelper.getSelectedItem(true));
      }
    } else {
      showModal(CHAIN_ERROR.NOT_SUPPORTED + " : " + chainId);
    }
  } else {
    showModal(CHAIN_ERROR.NOT_PROVIDED);
  }
};

export const parseEIP618 = (eip681URL, networkSettingsHelper, setTargetNetwork, setToAddress, setAmount) => {
  const eip681Object = parse(eip681URL);

  const chainId = eip681Object.chain_id;

  handleNetworkChange(chainId, networkSettingsHelper, setTargetNetwork);

  const functionName = eip681Object.function_name;

  let amount;
  let toAddress;
  
  if (functionName == "transfer") {
    const tokenAddress = eip681Object.target_address;

    if (tokenAddress) {
      localStorage.setItem("switchToTokenAddress", tokenAddress);
      amount = eip681Object.parameters?.uint256;
    }
    
    toAddress = eip681Object.parameters?.address;
  } else {
    localStorage.setItem("switchToEth", true);

    amount = eip681Object.parameters?.value;
    toAddress = eip681Object.target_address;
  }

  if (amount) {
    localStorage.setItem("amount", new BigNumber(amount).toFixed());
  }
  else {
    setAmount("");
  }

  if (toAddress) {
    setToAddress(toAddress);
  }
};
