import React, { useEffect, useState } from "react";

import { Button, Popover } from "antd";

import moment from 'moment';

import { useLocalStorage } from "../hooks";

import {tokenDisplay} from "./ERC20Selector";
import { LogoOnLogo, QRPunkBlockie } from "./";

import { getShortAddress } from "../helpers/MoneriumHelper";

import { NETWORKS } from "../constants";

const { BigNumber, ethers } = require("ethers");

export default function TransactionDisplay({
    status,
    toAddress,
    iban, name,
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

    if (status == "processed") {
        statusBackgroundColor = "#71d593";
        statusMessage = "Completed";
        statusMessageColor = "white"
    }

    if (status == "rejected") {
        statusBackgroundColor = "black";
        statusMessage = "Rejected";
        statusMessageColor = "white"
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
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize:"1.42em"}}>
                        <div style={{  }}>
                            <b>{Number(amount).toFixed(2)}</b>
                        </div>
                        <div>
                        {
                            erc20TokenName.includes("EUR") ?
                                <LogoOnLogo
                                    src1={"EURe.png"}
                                    src2={smallImageSrc}
                                    showImage2={smallImageSrc != undefined}
                                    sizeMultiplier1={1.24}
                                    sizeMultiplier2={0.5}
                                />
                                :
                                tokenDisplay("", erc20ImgSrc)
                        }
                        </div>    
                    
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
                <div>
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
                </div>
            }

            {status &&
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{  backgroundColor: statusBackgroundColor, borderRadius:'1em', padding:'0.4em' }}  >
                        <div style={{  color : statusMessageColor  }}  >
                            {statusMessage}
                        </div>
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
