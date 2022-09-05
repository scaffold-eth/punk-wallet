import { Divider, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { convertHexToNumber, convertHexToUtf8 } from "@walletconnect/utils";
import axios from "axios";

const { BigNumber, ethers } = require("ethers");

const convertHexToUtf8IfPossible = (hex) => {
  try {
    return convertHexToUtf8(hex);
  } catch (e) {
    return hex;
  }
}

const TENDERLY_USER = process.env.REACT_APP_TENDERLY_USER;
const TENDERLY_PROJECT = process.env.REACT_APP_TENDERLY_PROJECT;
const TENDERLY_ACCESS_KEY = process.env.REACT_APP_TENDERLY_ACCESS_KEY;

const SIMULATE_URL = `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/simulate`;
const OPTS = {
  headers: {
    'X-Access-Key': TENDERLY_ACCESS_KEY
  }
}

export default function WalletConnectTransactionDisplay({payload, provider, chainId}) {
  const [paramsArray, setParamsArray] = useState([]);
  const [simulated, setSimulated] = useState(false);
  const [simulationFailed, setSimulationFailed] = useState(false);
  const [simulationUnexpectedError, setSimulationUnexpectedError] = useState(false);
  const [simulationId, setSimulationId] = useState();

  const shouldSimulate = (payload) => {
    if ((payload.method == "eth_sendTransaction") || (payload.method == "eth_signTransaction")) {
      return true;
    }

    return false;
  }

  useEffect(()=> {
    // set up your access-key, if you don't have one or you want to generate new one follow next link
    // https://dashboard.tenderly.co/account/authorization

    const simulateTransaction = async () => {
      try {
        if (!shouldSimulate(payload)) {
          return;
        }

        let params = payload.params;
        if (Array.isArray(params)) {
          params = params[0];
        }

        const body = {
          "network_id": params.chainId ? params.chainId.toString() : chainId.toString(),
          "from": params.from,
          "to": params.to,
          "input": params.data ? params.data : "",
          "gas": BigNumber.from(params.gas).toNumber(),
          "gas_price": "0",
          "value": params.value ? BigNumber.from(params.value).toString() : "0",
          // simulation config (tenderly specific)
          "save_if_fails": true,
          "save": true,
          //"simulation_type": "quick"
        }
      
        const resp = await axios.post(SIMULATE_URL, body, OPTS);

        if (resp.data.simulation.status === false) {
          setSimulationFailed(true);
        }

        setSimulationId(resp.data.simulation.id);
        setSimulated(true);
      }
      catch(error) {
        setSimulationUnexpectedError(true);
        console.error("simulateTransaction", error)
      }
    }

    simulateTransaction();
  },[payload, chainId]);

  useEffect(()=>{
    for (let i = 0; i < paramsArray.length; i++) {
      let param = paramsArray[i];
      let label = param.label;
      let value = param.value;

      if ((label == "From") || (label == "To")) {
        provider.lookupAddress(value).then((ensName) => {
          if (ensName) {
            paramsArray[i] = {label: label, value: ensName};
            setParamsArray(JSON.parse(JSON.stringify(paramsArray)));
          }
        })
        .catch((error) => {
          console.log("Coudn't fetch ENS name for", value, error);
        })
      }
    }
  },[]);

try {  
  if (!payload || !payload.params) {
    return (
        <div>
          Cannot decouple payload.
        </div>
    );
  }

  if (paramsArray.length > 0) {
    const options = [];
    paramsArray.forEach((param) => {
        if (param.value) {
          let marginBottom = "0em";
          if (param.label == "Value") {
            marginBottom = "2em";
          }

          options.push(
            <div key={param.label + param.value} style={{ display: "flex", justifyContent:"center", marginTop: "0.5em", marginBottom: marginBottom }}>
             <div style={{ color: "grey"}}> {param.label}:</div> <div style={{ fontWeight: "bold"}}> {param.value}</div>
            </div>
          )  
        }
    })

    return (
      <pre>
        {shouldSimulate(payload) &&
          <div style={{ textAlign: "center"}}>
              {!simulated && !simulationUnexpectedError && <>Simulating on Tenderly... <Spin/></>}
              {simulated && simulationId && <>Simulating on <a target="_blank" rel="noopener noreferrer" href={`https://dashboard.tenderly.co/public/${TENDERLY_USER}/${TENDERLY_PROJECT}/simulator/${simulationId}`}>Tenderly</a> {!simulationFailed ? "was successful!" : "has failed!"}</>}
              {simulationUnexpectedError && <>Couldn't simulate on <a target="_blank" rel="noopener noreferrer" href="https://tenderly.co/">Tenderly</a> because of an unexpected error.</>}
              <Divider/>
           </div>
         }
        <div style={{ display: "flex", flexDirection: "column", justifyContent:"space-around"}}>
          {options}
        </div>
      </pre>
    );  
  }

  const getValue = (param, key) => {
    if (!param[key]) {
      return "";
    }

    let value = param[key];

    if (key == "value") {
      return ethers.utils.formatEther(BigNumber.from(value.toString())).toString() + " Ξ"
    }

    if (key == "gasPrice") {
      return ethers.utils.formatUnits(convertHexToNumber(value).toString(), 9).toString() + " gwei"
    }

    if ((key == "nonce") || (key == "gas") || (key == "gasPrice")) {
      return convertHexToNumber(value);
    }

    if (key == "to") {
      console.log(key, value)
    }
    return value;
  }

  let params;
  let param_0 = payload.params[0];
  let param_1 = payload.params[1];

  switch (payload.method) {
    case "eth_sendTransaction":
    case "eth_signTransaction":
      params = [
        { label: "From", value: getValue(param_0, "from") },
        { label: "To", value: getValue(param_0, "to") },
        {
          label: "Value",
          value: getValue(param_0, "value"),
        },
        {
          label: "Gas Price",
          value: getValue(param_0, "gasPrice"),
        },
        {
          label: "Gas Limit",
          value: param_0.gas ? getValue(param_0, "gas") : getValue(param_0, "gasLimit"),
        },
        {
          label: "Nonce",
          value: getValue(param_0, "nonce"),
        },
        { label: "Data", value: getValue(param_0, "data") }
      ];
      break;

    case "eth_sign":
      params = [
        { label: "Address", value: param_0 },
        { label: "Message", value: param_1 },
      ];
      break;
    case "personal_sign":
      params = [
        { label: "Address", value: param_1 },
        {
          label: "Message",
          value: convertHexToUtf8IfPossible(param_0),
        },
      ];
      break;
    default:
      params = [
        {
          label: "params",
          value: JSON.stringify(payload.params, null, "\t"),
        },
      ];
      break;
  }

  params.push({ label: "Method", value: payload.method });

  setParamsArray(params);
}
catch (error) {
    console.error("Cannot prettify transaction", error);

    return (
      <pre>
        {JSON.stringify(payload.params, null, 2)}
      </pre>
    );  
  }
}

