import React, { useEffect, useState } from "react";

import moment from "moment";

import { Button, Popover, Tooltip, Spin, message } from "antd";
import { CopyOutlined, RiseOutlined, FallOutlined } from "@ant-design/icons";

import { useLocalStorage } from "../hooks";

import { LogoOnLogo, TokenDisplay, Punk, PunkBlockie } from "./";

import { copy } from "../helpers/EditorHelper";
import { getNetworkChainId, getShortAddress } from "../helpers/MoneriumHelper";

import { NETWORKS } from "../constants";

const { BigNumber, ethers } = require("ethers");
const { OrderState, OrderKind } = require("@monerium/sdk");

export default function TransactionDisplay({
  moneriumOrder,
  toAddress,
  txHash,
  txDisplayName = "tx",
  amount = 0,
  erc20TokenName,
  erc20ImgSrc,
  blockExplorer,
  date,
  chainId,
  showClearButton,
  clearButtonAction,
}) {
  const [dateDisplayMode, setDateDisplayMode] = useLocalStorage("dateDisplayMode", false);

  const status = moneriumOrder?.meta.state;
  const iban = moneriumOrder?.counterpart?.identifier?.iban;
  const name = moneriumOrder?.counterpart?.details?.name;
  const memo = moneriumOrder?.memo;
  const kind = moneriumOrder?.kind;

  const crossChainName = moneriumOrder?.counterpart?.identifier?.chain;
  const crossChainTargetAddress = moneriumOrder?.counterpart?.identifier?.address;
  const currentPunkAddress = moneriumOrder?.address;

  const isCrossChainSameAddress = currentPunkAddress == crossChainTargetAddress;

  let digits = 2;
  if (erc20TokenName == "WETH") {
    digits = 4;
  }

  let statusBackgroundColor = "#e0e0e0";
  let statusMessage = "In Progress";
  let statusMessageColor;
  let pendingOrder = true;

  if (status == OrderState.processed) {
    statusBackgroundColor = "#71d593";
    statusMessage = "Completed";
    statusMessageColor = "white";
    pendingOrder = false;
  }

  if (status == OrderState.rejected) {
    statusBackgroundColor = "black";
    statusMessage = "Rejected";
    statusMessageColor = "white";
    pendingOrder = false;
  }

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  let readableDate;
  if (date) {
    readableDate = new Date(date).toLocaleDateString(undefined, options);
  }

  let incomingOrder = false;
  if (kind && kind == OrderKind.issue) {
    incomingOrder = true;
  }

  const smallImageSrc = getNetworkImgSrc(chainId);
  const smallImageSrcCrossChain = crossChainName ? getNetworkImgSrc(getNetworkChainId(crossChainName)) : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", backgroundColor: "" }}>
      {txHash && (
        <div>
          <a
            style={{ color: `var(--link-color)` }}
            href={blockExplorer + "tx/" + txHash}
            target="_blank"
            rel="noopener noreferrer"
          >
            {txDisplayName}
          </a>
        </div>
      )}

      {erc20TokenName ? (
        <div style={{ display: "flex", fontSize: "1.42em" }}>
          <div style={{ flex: "25%", backgroundColor: "" }}>
            {kind && (
              <div style={{ color: incomingOrder ? "#71d593" : "#2c6ca7" }}>
                {incomingOrder ? <FallOutlined /> : <RiseOutlined />}
              </div>
            )}
          </div>
          <div style={{ flex: "50%" }}>
            <div style={{ flex: 1, textAlign: "center", backgroundColor: "" }}>
              <b>{(kind ? (incomingOrder ? "+" : "-") : "") + Number(amount).toFixed(digits)}</b>
              {erc20TokenName.includes("EUR") ? (
                <div>
                  {crossChainName ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {PunkBlockieWithLogo(
                          currentPunkAddress,
                          incomingOrder ? smallImageSrcCrossChain : smallImageSrc,
                        )}
                        <div>-></div>
                        {PunkBlockieWithLogo(
                          crossChainTargetAddress,
                          incomingOrder ? smallImageSrc : smallImageSrcCrossChain,
                        )}
                      </div>
                    </>
                  ) : (
                    <LogoOnLogo
                      src1={"EURe.png"}
                      src2={smallImageSrc}
                      showImage2={smallImageSrc !== undefined}
                      sizeMultiplier1={1.24}
                      sizeMultiplier2={0.5}
                    />
                  )}
                </div>
              ) : (
                <div>
                  <TokenDisplay
                    token={{ name: erc20ImgSrc ? undefined : erc20TokenName, imgSrc: erc20ImgSrc }}
                    divStyle={{ justifyContent: "center" }}
                  />
                </div>
              )}
            </div>
          </div>
          <div style={{ flex: "25%" }}></div>
        </div>
      ) : (
        amount && (
          <div>
            <b> {Number(ethers.utils.formatEther(BigNumber.from(amount).toString())).toFixed(4)}</b> Ξ
          </div>
        )
      )}

      {toAddress
        ? punkWithShortAddress(toAddress)
        : iban && (
            <div style={{ backgroundColor: "" }}>
              <div>
                <b>{iban}</b>
              </div>
              {name && (
                <div>
                  <b>{name}</b>
                </div>
              )}
              {memo && <div>{memo}</div>}
            </div>
          )}

      {status && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingTop: "1em" }}>
          <div style={{ backgroundColor: statusBackgroundColor, borderRadius: "1em", padding: "0.4em" }}>
            <div style={{ color: statusMessageColor }}>{statusMessage}</div>
            {pendingOrder && <Spin size="small" />}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        <div
          style={{ cursor: "pointer" }}
          onClick={() => {
            setDateDisplayMode(!dateDisplayMode);
          }}
        >
          {date && dateDisplayMode && <div> {moment(date).fromNow()}</div>}
          {date && !dateDisplayMode && <div> {readableDate}</div>}
        </div>

        {showClearButton && (
          <Button
            onClick={() => {
              clearButtonAction();
            }}
          >
            🗑
          </Button>
        )}
      </div>
    </div>
  );
}

const PunkBlockieWithLogo = (address, src2) => (
  <div
    style={{ display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}
    onClick={() => copy(address, () => message.success(<span style={{ position: "relative" }}>Copied Address</span>))}
  >
    <PunkBlockie address={address} size={25} style={{ paddingTop: 4 }} />

    <LogoOnLogo src1={"EURe.png"} src2={src2} sizeMultiplier1={1.24} sizeMultiplier2={0.5} />
  </div>
);

const punkWithShortAddress = (address, style) => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", ...style }}>
    <Punk address={address} size={32} />

    <div style={{ paddingRight: "1em" }}>
      <b>{getShortAddress(address)}</b>
    </div>
  </div>
);

const getNetworkImgSrc = chainId => {
  if (!chainId) {
    return undefined;
  }

  let smallImageSrc;

  if (chainId == NETWORKS.ethereum.chainId) {
    smallImageSrc = "ethereum-bgfill-icon.svg";
  } else if (chainId == NETWORKS.polygon.chainId) {
    smallImageSrc = "polygon-bgfill-icon.svg";
  } else if (chainId == NETWORKS.gnosis.chainId) {
    smallImageSrc = "gnosis-bgfill-icon.svg";
  }

  return smallImageSrc;
};
