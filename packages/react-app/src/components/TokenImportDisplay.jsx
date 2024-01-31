import React, { useState, useEffect } from "react";

import { Button, Input, Spin } from "antd";
import { ImportOutlined } from "@ant-design/icons";

import { PasteButton } from ".";

import { ERC20Helper } from "../helpers/ERC20Helper";

const { ethers } = require("ethers");

export default function TokenImportDisplay({ tokenSettingsHelper, tokenCoreDisplay, tokenDetailedDisplay, network, setImportView }) {
    const [token, setToken] = useState();

    const [contractAddress, setContractAddress] = useState("");
    const [invalidAddress, setInvalidAddress] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTokenData = async (contractAddress) => {
            try {
                const tokenHelper = new ERC20Helper(contractAddress, undefined, network.rpcUrl);

                setLoading(true);

                const [decimals, symbol] = await Promise.all([tokenHelper.decimals(),tokenHelper.symbol()])

                setLoading(false);

                const newToken = {
                    address:contractAddress,
                    name:symbol,
                    decimals:decimals,
                    // ToDo: It would be nice to fetch the image somehow
                }

                const existingToken = tokenSettingsHelper.getExistingItem(newToken, "address");

                if (existingToken) {
                    newToken.alreadyExists = true;

                    if (existingToken.imgSrc) {
                        newToken.imgSrc = existingToken.imgSrc;
                    }
                }
                else {
                    /*
                        ToDo: Something better is needed here, because names can conflict

                        E.g. on Polygon there are USDC and USDC (POS) tokens, which share the same name
                        https://polygonscan.com/token/0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
                        https://polygonscan.com/token/0x2791bca1f2de4661ed88a30c99a7a9449aa84174

                        The problem is if there are multiple tokens with the same name, the 
                        Token Selector cannot distinguish them, the selector should probably use
                        the address which is unique, instead of the name
                    */

                    const conflictingToken = tokenSettingsHelper.getExistingItem(newToken, "name");

                    if (conflictingToken) {
                        newToken.conflictingToken = conflictingToken;
                    }
                }

                setToken(newToken);
            }
            catch(error){
                console.log("Coudn't find token", error);
                setInvalidAddress(true);
                setLoading(false);
            }
        }

        setInvalidAddress(false);
        setToken();

        if (!contractAddress) {
            return;
        }

        try {
            // Throws an error if the address is invalid
            ethers.utils.getAddress(contractAddress);

            fetchTokenData(contractAddress);
        }
        catch {
            setInvalidAddress(true);
        }
    }, [contractAddress]);
    
    return (
        <>
            <div style={{ display: "flex", alignItems:"center", justifyContent:"center"}} >
                <Input
                    onChange={e => {
                      setContractAddress(e.target.value);
                    }}
                    placeholder="Contract address: 0x..."
                    value={contractAddress}
                />
                <PasteButton setState={setContractAddress}/>
            </div>

            {(invalidAddress || loading) && 
                <div style={{ display: "flex", alignItems:"center", justifyContent:"center", fontSize:"16px", padding:"3em"}} >
                    {invalidAddress && <>This is not a valid ERC20 token address</>}

                    {loading &&<Spin/> }
                </div>
            }

            <div style={{ padding:"1em"}} >
                {token && 
                    <>
                        {!token.conflictingToken && tokenDetailedDisplay(tokenSettingsHelper, token, tokenCoreDisplay, network)}

                        <div style={{ display: "flex", alignItems:"center", justifyContent:"center", paddingTop: !token.conflictingToken ? "1em" : "", paddingBottom:"0.25em"}} >
                            <div>
                                <Button
                                    key="import"
                                    type="primary"
                                    icon={<ImportOutlined />}
                                    disabled={token.alreadyExists || token.conflictingToken}
                                    onClick={() => {
                                        tokenSettingsHelper.addCustomItem(token);
                                        setImportView(false);
                                    }}
                                >
                                    Import
                                </Button>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems:"center", justifyContent:"center", fontSize:"16px"}} >
                            {token.alreadyExists && <div>Token is already available!</div>}
                        </div>

                        {token.conflictingToken &&
                            <>
                                <div style={{ display: "flex", alignItems:"center", justifyContent:"center", fontSize:"16px", paddingBottom:"2em"}} >
                                    Token name is already in use!
                                </div>
                                {tokenDetailedDisplay(tokenSettingsHelper, token.conflictingToken, tokenCoreDisplay, network)}
                            </>
                        }
                    </>
                }
            </div>
        </>
    );
}
