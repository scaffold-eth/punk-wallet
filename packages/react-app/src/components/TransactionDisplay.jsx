import React, { useEffect, useState } from "react";

import { Button, Popover, Spin } from "antd";
import { RiseOutlined, FallOutlined } from "@ant-design/icons";

import moment from 'moment';

import { useLocalStorage } from "../hooks";

import {tokenDisplay} from "./ERC20Selector";
import { LogoOnLogo, QRPunkBlockie } from "./";

import { getShortAddress } from "../helpers/MoneriumHelper";

import { NETWORKS } from "../constants";

const { BigNumber, ethers } = require("ethers");
const { OrderState, OrderKind } = require("@monerium/sdk");

export default function TransactionDisplay({
    status,
    toAddress,
    iban, name, memo, kind,
    txHash, txDisplayName = "tx",
    amount = 0,
    erc20TokenName, erc20ImgSrc,
    blockExplorer,
    date,
    chainId,
    showClearButton, clearButtonAction,
}) {
    const [dateDisplayMode, setDateDisplayMode] = useLocalStorage("dateDisplayMode", false);

    let part1 = toAddress && toAddress.substr(2,20)
    let part2= toAddress && toAddress.substr(22)
    const x = parseInt(part1, 16)%100
    const y = parseInt(part2, 16)%100

    const iconPunkSize = 32;

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

    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
    let readableDate;
    if (date) {
        readableDate = new Date(date).toLocaleDateString(undefined, options);
    }

    let smallImageSrc = undefined;

    if (chainId == NETWORKS.ethereum.chainId) {
        smallImageSrc = "ethereum-bgfill-icon.svg";
    }
    else if (chainId == NETWORKS.polygon.chainId) {
        smallImageSrc = "polygon-bgfill-icon.svg";
    }
    else if (chainId == NETWORKS.gnosis.chainId) {
        smallImageSrc = "gnosis-bgfill-icon.svg";
    }

    let incomingOrder = false;
    if (kind && (kind == OrderKind.issue)) {
        incomingOrder = true;
    }

    return (
        <div style={{ display: 'flex',  flexDirection: 'column', backgroundColor:""  }}>
            {txHash &&
                <div>
                    <a style={{ color:'rgb(24, 144, 255)' }} href={blockExplorer + "tx/" + txHash} target="_blank" rel="noopener noreferrer"  >
                        {txDisplayName}
                    </a>
                </div>
            }

            {erc20TokenName && erc20ImgSrc ?
                <div style={{ display: 'flex', fontSize: "1.42em" }}>
                    <div style={{ flex: '25%', backgroundColor:"" }}>
                        {kind && <div style={{  color: incomingOrder ? "#71d593" : "#2c6ca7" }}>
                            {incomingOrder ? <FallOutlined /> : <RiseOutlined />}
                        </div>}
                    </div>
                    <div style={{ flex: '50%' }}>
                        <div style={{ flex: 1, textAlign: 'center', backgroundColor:"" }}>
                            <b>{(kind ? (incomingOrder ? "+" : "-") : "" ) + Number(amount).toFixed(2)}</b>
                            {
                                erc20TokenName.includes("EUR") ?
                                    <LogoOnLogo
                                        src1={"EURe.png"}
                                        src2={smallImageSrc}
                                        showImage2={smallImageSrc !== undefined}
                                        sizeMultiplier1={1.24}
                                        sizeMultiplier2={0.5}
                                    />
                                    :
                                    tokenDisplay("", erc20ImgSrc)
                            }
                        </div>
                    </div>
                    <div style={{ flex: '25%'}}></div>
                </div>


            :
                (amount) && 
                    <div>
                        <b> {Number(ethers.utils.formatEther(BigNumber.from(amount).toString())).toFixed(4)}</b> Ξ
                    </div>
            }

            {toAddress ? 
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor:""}}>
                    <div style={{position:"relative",width:iconPunkSize, height:iconPunkSize, overflow: "hidden"}}>
                        <img src="/punks.png" style={{position:"absolute",left:-iconPunkSize*x,top:(-iconPunkSize*y),width:iconPunkSize*100, height:iconPunkSize*100,imageRendering:"pixelated"}} />
                    </div>
                    <div style={{ paddingRight:'1em'}}>
                        <b>{getShortAddress(toAddress)}</b>
                    </div>
                </div>
                : iban &&
                <div style={{ backgroundColor:""}}>
                    <div>
                        <b>
                            {iban}
                        </b>
                    </div>
                    {name &&
                        <div>
                            <b>
                                {name}
                            </b>
                        </div>
                    }
                    {memo &&
                        <div>
                            {memo}
                        </div>
                    }
                </div>
            }

            {status &&
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop:"1em" }}>
                    <div style={{  backgroundColor: statusBackgroundColor, borderRadius:'1em', padding:'0.4em' }}  >
                        <div style={{  color : statusMessageColor  }}  >
                            {statusMessage}
                        </div>
                        {pendingOrder && <Spin size = "small"/>}
                    </div>
                    
                </div>
            }

            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center"}}>
                 <div 
                    style={{ cursor: "pointer"}}
                    onClick={
                        () => {
                          setDateDisplayMode(!dateDisplayMode)
                        } 
                    }
                >
                    {date && dateDisplayMode && <div> {moment(date).fromNow()}</div>}
                    {date && !dateDisplayMode && <div> {readableDate}</div>}

                </div>

                

                {showClearButton &&
                    <Button
                        onClick={
                            () => {
                                clearButtonAction();
                            }
                        }
                    >
                          🗑
                    </Button>
                }
            </div>            
        </div>
    );
}
