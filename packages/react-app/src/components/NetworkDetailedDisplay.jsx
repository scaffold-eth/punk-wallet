import React, { useState } from "react";

import { Button, Select, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import { getBLockExplorer, getBLockExplorers, getChain } from "../helpers/ChainHelper";
import { SELECTED_BLOCK_EXPORER_NAME_KEY } from "../helpers/NetworkSettingsHelper";

export default function NetworkDetailedDisplay({
  networkSettingsHelper,
  network,
  networkCoreDisplay,
  setTargetNetwork,
}) {
  const chain = getChain(network.chainId);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1em" }}>
        {networkCoreDisplay && networkCoreDisplay(network)}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75em" }}>
        <div style={{ display: "flex", flexDirection: "column", paddingTop: "1em" }}>
          <DataDisplay description={"Name"} data={chain.name} />
          <DataDisplay description={"Chain ID"} data={chain.chainId} />
          <DataDisplay description={"Native Currency"} data={chain.nativeCurrency.symbol} />

          <div style={{ paddingTop: "1em", paddingBottom: "1em" }}>
            <BlockExplorerSelector
              networkSettingsHelper={networkSettingsHelper}
              network={network}
              chain={chain}
              setTargetNetwork={setTargetNetwork}
            />
          </div>

          <DataDisplay description={"Info"} data={chain.infoURL} isLink={true} />
        </div>
      </div>
    </>
  );
}

const BlockExplorerSelector = ({ networkSettingsHelper, network, chain, setTargetNetwork }) => {
  const blockExplorers = getBLockExplorers(chain);
  const options = blockExplorers.map(blockExplorer => option(blockExplorer));

  const currentNetworkSettings = networkSettingsHelper.getItemSettings(network);

  const [currentBlockExplorerName, setCurrentBLockExplorerName] = useState(
    currentNetworkSettings[SELECTED_BLOCK_EXPORER_NAME_KEY] ?? blockExplorers[0].name,
  );

  const currentBlockExplorer = getBLockExplorer(chain, currentBlockExplorerName);

  return (
    <>
      {blockExplorers.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: "0.25em" }}>
          <Select
            size="large"
            defaultValue={currentBlockExplorerName}
            style={{ width: 170, fontSize: "1em" }}
            listHeight={1024}
            onChange={blockExplorerName => {
              setCurrentBLockExplorerName(blockExplorerName);
              networkSettingsHelper.updateItemSettings(network, {
                [SELECTED_BLOCK_EXPORER_NAME_KEY]: blockExplorerName,
              });
              setTargetNetwork(networkSettingsHelper.getSelectedItem(true));
            }}
            value={currentBlockExplorerName}
          >
            {options}
          </Select>
        </div>
      )}

      <DataDisplay description={"Block Explorer"} data={currentBlockExplorer.url} isLink={true} />
    </>
  );
};

const option = blockExplorer => (
  <Select.Option key={blockExplorer.name} value={blockExplorer.name} style={{ lineHeight: 2 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{blockExplorer.name}</div>
  </Select.Option>
);

const DataDisplay = ({ description, data, isLink }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: "0.5em" }}>
    <Tooltip title={description}>
      {isLink ? (
        <a href={data} target="_blank" rel="noopener noreferrer" style={{ color: "rgb(24, 144, 255)" }}>
          {data}
        </a>
      ) : (
        <div>{data}</div>
      )}
    </Tooltip>
  </div>
);

/*
const isBuiltInNetwork = (chainId) => {
  return Object.values(NETWORKS).some(network => network.chainId == chainId);
}

const getBuiltInNetwork = (chainId) => {
  return Object.values(NETWORKS).find(network => network.chainId == chainId);
}
*/
