import React from "react";
import QR from "qrcode.react";
import { message } from "antd";
import { build } from "eth-url-parser";

import { Punk, PunkBlockie } from ".";

import { copy } from "../helpers/EditorHelper";

const { ethers } = require("ethers");

export const BLOCKIES_DEFAULT_SIZE = 8;

export default function QRPunkBlockie({
  address,
  showAddress,
  withQr,
  receiveMode,
  scale,
  chainId,
  amount,
  selectedErc20Token,
}) {
  let displayValue = address;
  let paymentLink;

  if (receiveMode) {
    try {
      const eip681Data = {
        scheme: "ethereum",
        prefix: null,
        target_address: selectedErc20Token ? selectedErc20Token.address : address,
        chain_id: chainId,
        function_name: selectedErc20Token ? "transfer" : null,
        parameters: {},
      };

      if (selectedErc20Token) {
        eip681Data.parameters.address = address;
      }

      if (amount) {
        let amountString;

        try {
          const decimals = selectedErc20Token ? selectedErc20Token.decimals : 18;

          amountString = ethers.utils
            .parseUnits(typeof amount === "string" ? amount : amount.toFixed(decimals).toString(), decimals)
            .toString();
        } catch (error) {
          console.error("Couldn't parse amount", amount, error);
        }

        if (amountString) {
          if (selectedErc20Token) {
            eip681Data.parameters.uint256 = amountString;
          } else {
            eip681Data.parameters.value = amountString;
          }
        }
      }

      const eip681 = build(eip681Data);

      displayValue = eip681;

      paymentLink = window.location.href + displayValue;
    } catch (error) {
      console.error("Couldn't create EIP-681 QR value", error);
    }
  }

  const hardcodedSizeForNow = 380;
  let blockieScale = 11.5;

  if (scale) {
    blockieScale *= scale;
  }

  const punkSize = blockieScale * BLOCKIES_DEFAULT_SIZE; // Make punk image the same size as the blockie, from https://github.com/ethereum/blockies: width/height of the icon in blocks, default: 8

  return (
    <span
      onClick={() =>
        copy(paymentLink || displayValue, () =>
          message.success(
            <span style={{ position: "relative" }}>
              {!receiveMode ? "Copied Address" : "Copied Payment Link"}
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
              level="H"
              includeMargin={false}
              value={displayValue}
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
          style={{
            overflowWrap: "break-word",
            wordWrap: "break-word",
            marginTop: "0.39em",
            fontWeight: "bolder",
            letterSpacing: -0.8,
            color: "#666666",
            fontSize: 14.8,
          }}
        >
          {displayValue}
        </div>
      )}
    </span>
  );
}
