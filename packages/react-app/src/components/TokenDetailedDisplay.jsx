import React, { useState } from "react";

import { Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

export default function TokenDetailedDisplay({
  tokenSettingsHelper,
  token,
  tokenCoreDisplay,
  network,
  setItemDetailed,
}) {
  const [addressCopied, setAddressCopied] = useState(false);

  const tokenLink = network.blockExplorer + "token/" + token.address;

  const copyToClipboard = async text => {
    try {
      await navigator.clipboard.writeText(text);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    } catch (err) {
      console.error("Error in copying text: ", err);
    }
  };

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
          <>
            <div
              style={{
                cursor: "pointer",
                color: `var(--link-color)`,
                fontSize: "15px",
                marginRight: "7px",
              }}
              onClick={() => window.open(tokenLink, "_blank")}
            >
              {token.address}

              {/* ToDo: A copy button might be better here - added but still has the link capability */}
              <img src="/open_in_new.svg" alt="open_in_new.svg" style={{ paddingBottom: "0.2em" }} />
            </div>
            <div
              style={{ cursor: "pointer", color: `var(--link-color)`, fontSize: "15px" }}
              onClick={() => copyToClipboard(token.address)}
            >
              {addressCopied ? (
                <img
                  src="/greenCheckmark.svg"
                  alt="Copy"
                  style={{ paddingBottom: "0.2em", width: "25px", height: "25px", transform: "scale(1.1)" }}
                />
              ) : (
                <img
                  src="/paste-svgrepo-com.svg"
                  alt="Copy"
                  style={{ paddingBottom: "0.2em", width: "25px", height: "25px", transform: "scale(1.1)" }}
                />
              )}
            </div>
          </>
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
