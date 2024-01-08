import axios from "axios";
import { usePoller } from "eth-hooks";
import { useEffect, useState } from "react";
import { ETHERSCAN_KEY } from "../constants";
import { ethers } from "ethers";

export default function useGasPrice(targetNetwork, speed, providerToAsk) {
  const [gasPrice, setGasPrice] = useState();

  useEffect(() => {
    setGasPrice();
    loadGasPrice();
  }, [targetNetwork]);

  const loadGasPrice = async () => {
    
    if (targetNetwork.gasPrice) {
      setGasPrice(targetNetwork.gasPrice);
    } else {
      if(providerToAsk){
        try{
          const gasPriceResult = await providerToAsk.getGasPrice();
          if(gasPriceResult) setGasPrice(gasPriceResult)
        }catch(e){
          console.log("error getting gas",e)
        } 
      }else{
        axios
        .get("https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=" + ETHERSCAN_KEY)
        .then(response => {
          const newGasPrice = ethers.utils.parseUnits(response.data.result["ProposeGasPrice"], "gwei")
          if (newGasPrice !== gasPrice) {
            setGasPrice(newGasPrice);
          }
        })
        .catch(error => console.log(error));
      }
    }
    
   
  };

  usePoller(loadGasPrice, 4200);
  return gasPrice;
}
