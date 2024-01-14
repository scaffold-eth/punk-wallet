import React from "react";

import { Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

export default function TokenDetailedDisplay({
  tokenSettingsHelper,
  token,
  tokenCoreDisplay,
  network,
  setItemDetailed,
}) {
  const tokenLink = network.blockExplorer + "token/" + token.address;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {tokenCoreDisplay && tokenCoreDisplay(token)}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: setItemDetailed ? "1em" : "0.5em",
        }}
      >
        {token.hasOwnProperty("address") ? (
          <div
            // Todo: Create a link blue variable somewhere
            style={{ cursor: "pointer", color: `var(--link-color)`, fontSize: "15px" }}
            onClick={() => window.open(tokenLink, "_blank")}
          >
            {token.address}

            {/* ToDo: A copy button might be better here */}
            <img src="/open_in_new.svg" alt="open_in_new.svg" style={{ paddingBottom: "0.2em" }} />
          </div>
        ) : (
          <div>Native Token</div>
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
