import React, { useState } from "react";

import { EuroOutlined } from "@ant-design/icons";

import { LogoOnLogo } from "./";
import { getShortAddress } from "../helpers/MoneriumHelper";

import { useLocalStorage} from "../hooks";

export default function MoneriumBalances( { clientData, currentPunkAddress } ) {
    const [showBalances, setShowBalances] = useLocalStorage("showBalances", true);

    const EUReBalance = ( {chainImgSrc, balance} ) => {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
                <LogoOnLogo
                    src1={"EURe.png"}
                    src2={chainImgSrc}
                    sizeMultiplier1={3}
                    sizeMultiplier2={0.5}
                />
            </div>
            <div style={{ fontSize: '1.8em', paddingLeft: '0.24em' }}>
                €{balance ? balance : "0.00"}
            </div>
        </div>
      );
    }

    const EUReBalances = ( {balances} ) => {
        const ethereumImgSrc = "ethereum-bgfill-icon.svg";
        const ethereumBalance = balances.ethereum;
        
        const polygonImgSrc = "polygon-bgfill-icon.svg";
        const polygonBalance = balances.polygon;
        
        const gnosisImgSrc = "gnosis-bgfill-icon.svg";
        const gnosisBalance = balances.gnosis;

        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <EUReBalance chainImgSrc={ethereumImgSrc} balance={ethereumBalance}/>
                <EUReBalance chainImgSrc={polygonImgSrc} balance={polygonBalance}/>
                <EUReBalance chainImgSrc={gnosisImgSrc} balance={gnosisBalance}/>
            </div>
        );
    }

    const accountAddress = currentPunkAddress;
    let part1 = accountAddress && accountAddress.substr(2,20)
    let part2= accountAddress && accountAddress.substr(22)
    const x = parseInt(part1, 16)%100
    const y = parseInt(part2, 16)%100
    const iconPunkSize = 32;

    return (
        <>
            <div style={{ display: "flex",  alignItems: "center", justifyContent:"space-around"}}>
                {showBalances && <div style={{ display: "flex",  fontSize:"1.5em" }}>
                    <div style={{ position: "relative", width: iconPunkSize, height: iconPunkSize, overflow: "hidden" }}>
                      <img src="/punks.png" style={{ position: "absolute", left: -iconPunkSize * x, top: (-iconPunkSize * y), width: iconPunkSize * 100, height: iconPunkSize * 100, imageRendering: "pixelated" }} />
                    </div>
                    <div style={{ paddingRight: '1em' }}>
                      {getShortAddress(accountAddress)}
                    </div>
                </div>
                }
                
                <div 
                    style={{ fontSize: "3em", cursor: "pointer", backgroundColor: "" }}
                    onClick={
                        () => {
                            setShowBalances(!showBalances)
                        } 
                    }
                >
                    <EuroOutlined style={{ color: showBalances ? "black" : "gray"}}/>
                </div>
            </div>

            {showBalances && <div style={{ paddingTop:"1.5em"}}>
                <EUReBalances balances={clientData.punkBalances}  />
            </div>
            }
        </>
    );
}