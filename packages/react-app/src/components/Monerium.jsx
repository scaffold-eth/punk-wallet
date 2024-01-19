import React, { useState, useEffect } from "react";

import { Button, Divider, Modal, Spin } from "antd";
import {
  MoneriumBalances,
  MoneriumDescription,
  MoneriumHeader,
  MoneriumIban,
  MoneriumPunkNotConnected,
  LogoOnLogo,
} from "./";

import { authorize, authorizeWithRefreshToken, getData } from "../helpers/MoneriumHelper";

export default function Monerium({
  moneriumClient,
  setMoneriumClient,
  moneriumConnected,
  setMoneriumConnected,
  clientData,
  setClientData,
  punkConnectedToMonerium,
  setPunkConnectedToMonerium,
  currentPunkAddress,
}) {
  const [open, setOpen] = useState(false);

  // Handle the authorization code if the URL contains it
  useEffect(() => {
    // ToDo: Handle error
    const authorizeClient = async code => {
      await authorize(moneriumClient, code);
      setOpen(true);
      setMoneriumConnected(true);
    };

    // Get the code from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      // http://localhost:3000/?code=8DzQ69GXTS-BpNc1traTUA&state=
      // Remove the code and state from the URL

      // https://auth0.com/docs/secure/attack-protection/state-parameters
      // State is not used currently

      const newUrl = window.location.href.replace(`?code=${code}&state=`, "");
      window.history.replaceState({}, document.title, newUrl);

      authorizeClient(code);
    }
  }, []);

  // Authorize with the refresh token on page refresh
  useEffect(() => {
    const authorizeClientWithRefreshToken = async () => {
      const authorizationSuccessful = await authorizeWithRefreshToken(moneriumClient);

      if (authorizationSuccessful) {
        setMoneriumConnected(true);
      }
    };

    authorizeClientWithRefreshToken();
  }, []);

  // Get profile data
  // Current punk connected or not, balance, iban
  const initClientData = async () => {
    if (!currentPunkAddress) {
      return;
    }

    const data = await getData(moneriumClient, currentPunkAddress.toLowerCase());

    setClientData(data);
  };

  useEffect(() => {
    if (!moneriumConnected || !open) {
      return;
    }

    initClientData();
  }, [moneriumConnected, open, currentPunkAddress]);

  useEffect(() => {
    if (!moneriumConnected) {
      return;
    }

    initClientData();
  }, [moneriumConnected, currentPunkAddress]);

  useEffect(() => {
    if (clientData?.punkConnected) {
      setPunkConnectedToMonerium(true);
    }
  }, [clientData]);

  const MoneriumData = ({}) => {
    return (
      <div>
        {punkConnectedToMonerium ? (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <MoneriumBalances clientData={clientData} currentPunkAddress={currentPunkAddress} />

            <Divider style={{ backgroundColor: "gray" }} />

            <MoneriumIban clientData={clientData} currentPunkAddress={currentPunkAddress} />
          </div>
        ) : (
          <MoneriumPunkNotConnected
            moneriumClient={moneriumClient}
            currentPunkAddress={currentPunkAddress}
            initClientData={initClientData}
          />
        )}
      </div>
    );
  };

  const MoneriumDataLoading = ({}) => {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin />
      </div>
    );
  };

  return (
    <>
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LogoOnLogo
            src1={"MoneriumLogo.png"}
            src2={"greenCheckmark.svg"}
            sizeMultiplier1={2}
            showImage2={moneriumConnected}
            onClickAction={() => {
              setOpen(!open);
            }}
          />

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
          <MoneriumHeader
            moneriumConnected={moneriumConnected}
            setMoneriumConnected={setMoneriumConnected}
            setPunkConnectedToMonerium={setPunkConnectedToMonerium}
            setMoneriumClient={setMoneriumClient}
            setClientData={setClientData}
          />
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
          {!moneriumConnected && <MoneriumDescription />}
          {moneriumConnected && !clientData && <MoneriumDataLoading />}
          {moneriumConnected && clientData && <MoneriumData />}
        </div>
      </Modal>
    </>
  );
}
