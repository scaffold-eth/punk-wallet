import React, { useState } from "react";

import { Button, message } from "antd";
import { CopyOutlined, DeleteOutlined } from "@ant-design/icons";

import { copy } from "../helpers/EditorHelper";

export default function TokenDetailedDisplay({
  tokenSettingsHelper,
  token,
  tokenCoreDisplay,
  network,
  setItemDetailed,
}) {
  const [addressCopied, setAddressCopied] = useState(false);

  const tokenLink = network.blockExplorer + "token/" + token.address;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {tokenCoreDisplay && tokenCoreDisplay(token)}
      </div>

      <div
        style={{
          paddingTop: setItemDetailed ? "1em" : "0.5em",
        }}
      >
        {token.hasOwnProperty("address") ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                cursor: "pointer",
                color: `var(--link-color)`,
                fontSize: "15px",
                marginRight: "15px",
              }}
              onClick={() => window.open(tokenLink, "_blank")}
            >
              {token.address}
            </div>
            <CopyOutlined
              style={{ fontSize: 20, cursor: "pointer" }}
              onClick={() =>
                copy(token.address, () =>
                  message.success(<span style={{ position: "relative" }}>Copied Contract Address</span>),
                )
              }
            />
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>Native Token</div>
        )}
      </div>

      {setItemDetailed && (
        <>
          {tokenSettingsHelper.isCustomItem(token) && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "1em" }}>
                <Button
                  key="remove"
                  type="primary"
                  icon={<DeleteOutlined />}
                  disabled={tokenSettingsHelper.isItemsTheSame(token, tokenSettingsHelper.getSelectedItem())}
                  onClick={() => {
                    tokenSettingsHelper.removeCustomItem(token);
                    setItemDetailed();
                  }}
                >
                  Remove Custom Token
                </Button>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                {tokenSettingsHelper.isItemsTheSame(token, tokenSettingsHelper.getSelectedItem()) && (
                  <div>Cannot remove the selected token!</div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
