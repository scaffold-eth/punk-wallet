import React from "react";

import { Button, Input, Spin } from "antd";
import { ApiOutlined, DeleteOutlined, DisconnectOutlined } from "@ant-design/icons";

import { PasteButton } from ".";

import { getShortRPC, CUSTOM_RPC_KEY } from "../helpers/NetworkSettingsHelper";

export default function CustomRPC({
  network,
  userValue,
  setUserValue,
  validRPC,
  setValidRPC,
  loading,
  storedRPC,
  networkSettingsHelper,
  setTargetNetwork,
}) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>
          <Input
            value={userValue}
            placeholder={"custom RPC https://..."}
            onChange={async e => {
              setUserValue(e.target.value);
            }}
            disabled={storedRPC}
          />
        </div>
        <div>
          <PasteButton setState={setUserValue} disabled={storedRPC} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "0.25em" }}>
        <RPC
          network={network}
          rpc={userValue}
          setUserValue={setUserValue}
          validRPC={validRPC}
          setValidRPC={setValidRPC}
          loading={loading}
          storedRPC={storedRPC}
          networkSettingsHelper={networkSettingsHelper}
          setTargetNetwork={setTargetNetwork}
        />
      </div>
    </>
  );
}

const RPC = ({
  network,
  rpc,
  setUserValue,
  validRPC,
  setValidRPC,
  loading,
  storedRPC,
  networkSettingsHelper,
  setTargetNetwork,
}) => {
  if (loading) {
    return <Spin />;
  }

  if (validRPC === undefined) {
    return <></>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div>{validRPC ? getShortRPC(rpc) : "Invalid RPC"}</div>

      {validRPC ? <ApiOutlined style={{ color: "green" }} /> : <DisconnectOutlined style={{ color: "red" }} />}

      {(validRPC || (!validRPC && storedRPC)) && (
        <RemoveButton
          networkSettingsHelper={networkSettingsHelper}
          network={network}
          setTargetNetwork={setTargetNetwork}
          setUserValue={setUserValue}
          setValidRPC={setValidRPC}
        />
      )}
    </div>
  );
};

const RemoveButton = ({ networkSettingsHelper, network, setTargetNetwork, setUserValue, setValidRPC }) => {
  return (
    <div style={{ paddingTop: "0.5em" }}>
      <Button
        icon={<DeleteOutlined />}
        onClick={async () => {
          networkSettingsHelper.removeItemSetting(network, CUSTOM_RPC_KEY);
          setTargetNetwork(networkSettingsHelper.getSelectedItem(true));
          setUserValue();
          setValidRPC();
        }}
      >
        Delete RPC
      </Button>
    </div>
  );
};
