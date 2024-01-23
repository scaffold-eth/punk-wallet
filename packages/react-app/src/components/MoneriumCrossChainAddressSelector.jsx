import React, { useState } from "react";

import { Radio, Select, Space } from "antd";

import { NETWORKS } from "../constants";

import { PunkBlockie } from "./";

import {
  capitalizeFirstLetter,
  getAvailableTargetChainNames,
  getNetworkColor,
  getShortAddress,
} from "../helpers/MoneriumHelper";

const optionSize = 28;

export default function MoneriumCrossChainAddressSelector({
  clientData,
  currentPunkAddress,
  targetChain,
  setTargetChain,
  targetAddress,
  setTargetAddress,
  networkName,
}) {
  const radios = getAvailableTargetChainNames(networkName).map(targetChainName => radio(targetChainName));

  const options = clientData.addressesArray.map(address => option(address));

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <Radio.Group onChange={e => setTargetChain(e.target.value)} value={targetChain}>
          <Space direction="vertical" align="start">
            {radios}
          </Space>
        </Radio.Group>
      </div>
      <div>
        <Select
          size="large"
          defaultValue={() => punkWithShortAddress(targetAddress, optionSize)}
          style={{ width: 195 }}
          listHeight={1024}
          onChange={value => setTargetAddress(value)}
        >
          {options}
        </Select>
      </div>
    </div>
  );
}

const radio = networkName => {
  return (
    <Radio key={networkName} style={{ color: getNetworkColor(networkName) }} value={networkName}>
      {capitalizeFirstLetter(networkName)}
    </Radio>
  );
};

const option = address => (
  <Select.Option key={address} value={address} style={{ lineHeight: 2 }}>
    {punkWithShortAddress(address, optionSize)}
  </Select.Option>
);

// ToDo: This is duplicated in TransactionDisplay
const punkWithShortAddress = (address, size = 32) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
    }}
  >
    <div style={{ flexGrow: 1 }}>
      <PunkBlockie address={address} size={size} />
    </div>
    <div style={{ flexGrow: 2, fontSize: size * 0.66 }}>{getShortAddress(address)}</div>
  </div>
);
