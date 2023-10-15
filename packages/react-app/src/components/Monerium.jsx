import React, { useState, useEffect } from "react";

import { Button, Input, Modal, Select, Spin } from "antd";
import { EuroOutlined, LoginOutlined, LogoutOutlined, DownloadOutlined, ExportOutlined } from "@ant-design/icons";

import { LogoOnLogo, QRPunkBlockie } from "./";

import { getAuthFlowURI, authorize, authorizeWithRefreshToken, cleanStorage, getData, linkAddress, getShortAddress } from "../helpers/MoneriumHelper";
import { signMessage } from "../helpers/WalletConnectV2Helper";

const { ethers } = require("ethers");

const { MoneriumClient, placeOrderMessage, constants } = require("@monerium/sdk");

export default function Monerium( { moneriumClient, setMoneriumClient, moneriumConnected, setMoneriumConnected, setPunkConnectedToMonerium, currentPunkAddress } ) {
    const [open, setOpen] = useState(false);
    const [clientData, setClientData] = useState(null);

    const authorizeClient = async (code) => {
        await authorize(moneriumClient, code);
        setOpen(true);
        setMoneriumConnected(true);
    }

    const authorizeClientWithRefreshToken = async (code) => {
        const authorizationSuccessful = await authorizeWithRefreshToken(moneriumClient);

        if (authorizationSuccessful) {
            setMoneriumConnected(true);
        }
    }

    const disconnectClient = () => {
        cleanStorage();

        setMoneriumClient(new MoneriumClient('production'));

        setMoneriumConnected(false);
        setClientData(null);
    }

    const getClientData = async () => {
        if (!currentPunkAddress) {
            return;
        }

        const data = await getData(moneriumClient, currentPunkAddress.toLowerCase());

        setClientData(data);
    }

    useEffect(() => {
        // Get the code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            // http://localhost:3000/?code=8DzQ69GXTS-BpNc1traTUA&state=
            // Remove the code and state from the URL

            // https://auth0.com/docs/secure/attack-protection/state-parameters
            // State is not used currently        

            const newUrl = window.location.href.replace(`?code=${code}&state=`, '');
            window.history.replaceState({}, document.title, newUrl);

            authorizeClient(code);
        }
    }, []);

    useEffect(() => {
        authorizeClientWithRefreshToken(moneriumClient);
    }, []);

    useEffect(() => {
        if (!moneriumConnected || !open) {
            return;
        }

        getClientData();
    }, [moneriumConnected, open, currentPunkAddress]);

    useEffect(() => {
        if (!moneriumConnected) {
            return;
        }

        getClientData();
    }, [moneriumConnected, currentPunkAddress]);

    useEffect(() => {
        if (clientData?.punkConnected) {
            setPunkConnectedToMonerium(true);
        }
    }, [clientData]);

const MoneriumConnect = () => {
    return (
        <Button
            type="primary"
            shape="round"
            icon={<LoginOutlined />}
            size={'large'}
            onClick={
                () => {
                    getAuthFlowURI();
                }
            }
        >
            Connect
        </Button>
    );
};

const MoneriumDisconnect = () => {
    return (
        <Button
            type="primary"
            shape="round"
            icon={<LogoutOutlined />}
            size={'large'}
            onClick={
                () => {
                    disconnectClient()
                }
            }
        >
            Disconnect
        </Button>
    );
};

const MoneriumDescription = () => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img
                src="/EURe.png"
                alt="EURe"
                style={{ width: '20%', height: '20%' }}
            />
            <div style={{ paddingLeft: '0.42em', fontSize: '1.2em' }}>
                <p>
                    The <a href="https://monerium.com/" target="_blank" rel="noopener noreferrer" style={{color: '#2385c4', fontWeight: 'bold'}}>EURe</a> is a fully authorised and regulated euro stablecoin for web3 available on Ethereum, Polygon, and Gnosis. Send and receive euros between any bank account and Web3 wallet.
                </p>
            </div>
        </div>
    );
}

const MoneriumData = ( {} ) => {
    return (
        <div>
            {!clientData?.punkConnected ?
                <PunkNotConnected/> 
                :
                <>
                    <EUReBalances balances={clientData.punkBalances}/>
                </>
            }
        </div>
    );
}

const MoneriumDataLoading = ( {} ) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin/>
    </div>
  );
}

const [linkButtonLoading, setLinkButtonLoading] = useState(false);
const PunkNotConnected = ( {} ) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <div style={{ padding: '1em', fontSize: '1.2em' }}>
            Your current Punk Wallet <b>{getShortAddress(currentPunkAddress)}</b> is not linked to your Monerium account.
        </div>
        <div>
            <Button
                key="submit"
                type="primary"
                loading={linkButtonLoading}
                icon={<ExportOutlined />}
                onClick={async () => {
                    setLinkButtonLoading(true);
                    await linkAddress(moneriumClient, currentPunkAddress);
                    await getClientData();
                    setLinkButtonLoading(false);
                }}
            >
                Link Punk Wallet
            </Button>
        </div>
    </div>
  );
}

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

    return (
        <>
            <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LogoOnLogo src1={"MoneriumLogo.png"} src2={"greenCheckmark.svg"} sizeMultiplier1={2} showImage2={moneriumConnected} onClickAction={() => {setOpen(!open)}}/>

                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => {
                            setOpen(!open);
                        }}
                        //icon={<LogoOnLogo src1={"MoneriumLogo.png"} src2={"greenCheckmark.svg"} showImage2={moneriumConnected} onClickAction={() => {setOpen(!open)}}/>}
                        //icon={<LoginOutlined />}
                    >
                        {!moneriumConnected ? "Login with Monerium" : "Monerium Connected"}
                    </Button>
                </div>
            </>
            <Modal
                visible={open}
                title={
                    <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                        <div
                            style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}
                            onClick={() => window.open('https://monerium.com/', '_blank')}>

                            <LogoOnLogo
                                src1={"MoneriumLogo.png"}
                                src2={"greenCheckmark.svg"}
                                sizeMultiplier1={2}
                                showImage2={moneriumConnected}
                            />

                            <div style={{ fontWeight: 'bold' }}>
                                MONERIUM
                            </div>

                            <img
                                src="/open_in_new.svg"
                                alt="open_in_new.svg"
                            />
                        </div>
                        
                        <div>
                            {!moneriumConnected ? <MoneriumConnect/> : <MoneriumDisconnect/>}
                        </div>
                    </div>
                }
                onOk={() => {
                    setOpen(!open);
                }}
                onCancel={() => {
                    setOpen(!open);
                }}
                footer={[
                <Button
                    key="submit"
                    type="primary"
                    loading={false}
                    onClick={() => {
                        setOpen(!open);
                    }}
                >
                    OK
                </Button>,
                ]}
            >
                <div>
                    {!moneriumConnected && <MoneriumDescription/>}
                    {moneriumConnected && !clientData && <MoneriumDataLoading/>}
                    {moneriumConnected && clientData && <MoneriumData/>}

                </div>
            </Modal>
        </>
    );
    
}
