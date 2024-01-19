import React from "react";
import QR from "qrcode.react";
import { message } from "antd";

import { Punk, PunkBlockie } from ".";

import { copy } from "../helpers/EditorHelper";

export const BLOCKIES_DEFAULT_SIZE = 8;

export default function QRPunkBlockie({ address, showAddress, withQr, scale }) {
  const hardcodedSizeForNow = 380;
  let blockieScale = 11.5;

  if (scale) {
    blockieScale = blockieScale * scale;
  }

  const punkSize = blockieScale * BLOCKIES_DEFAULT_SIZE; // Make punk image the same size as the blockie, from https://github.com/ethereum/blockies: width/height of the icon in blocks, default: 8

  return (
    <span
      onClick={() =>
        copy(address, () =>
          message.success(
            <span style={{ position: "relative" }}>
              Copied Address
              <div style={{ position: "absolute", left: -60, top: -14, zIndex: 1 }}>
                <Punk address={address} size={40} />
              </div>
            </span>,
          ),
        )
      }
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: hardcodedSizeForNow,
          margin: "auto",
          position: "",
        }}
      >
        {withQr && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <QR
              level={"H"}
              includeMargin={false}
              value={address}
              size={hardcodedSizeForNow}
              imageSettings={{ width: 105, height: 105, excavate: true, src: "" }}
            />
          </div>
        )}

        <div style={{ position: "absolute" }}>
          <PunkBlockie address={address} size={punkSize} />
        </div>
      </div>

      {showAddress && (
        <div
          style={{ marginTop: "0.39em", fontWeight: "bolder", letterSpacing: -0.8, color: "#666666", fontSize: 14.8 }}
        >
          {address}
        </div>
      )}
    </span>
  );
}
