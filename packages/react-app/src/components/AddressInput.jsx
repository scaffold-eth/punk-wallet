import { CameraOutlined, QrcodeOutlined, SnippetsOutlined } from "@ant-design/icons";
import { Badge, Input, message, Spin } from "antd";
import { useLookupAddress } from "eth-hooks";
import React, { useCallback, useState, useEffect } from "react";
import QrReader from "react-qr-reader-es6";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { parse } from "eth-url-parser";
import { QRPunkBlockie } from ".";

import { isValidIban } from "../helpers/MoneriumHelper";
import { NETWORKS } from "../constants";
import { handleNetworkByQR } from "../helpers/handleNetworkByQR";

// probably we need to change value={toAddress} to address={toAddress}

/*
  ~ What it does? ~

  Displays an address input with QR scan option

  ~ How can I use? ~

  <AddressInput
    autoFocus
    ensProvider={mainnetProvider}
    placeholder="Enter address"
    value={toAddress}
    setToAddress={setToAddress}
  />

  ~ Features ~

  - Provide ensProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth") or you can enter directly ENS name instead of address
  - Provide placeholder="Enter address" value for the input
  - Value of the address input is stored in value={toAddress}
*/

const PasteButton = ({ stateSetter }) => {
  return (
    <div
      style={{ marginTop: 4, cursor: "pointer" }}
      onClick={async () => {
        try {
          const text = await navigator.clipboard.readText();
          stateSetter(text);
        } catch (err) {
          console.error("Failed to read clipboard:", err);
        }
      }}
    >
      <Badge>
        <SnippetsOutlined style={{ color: "#000000", fontSize: 18 }} />
      </Badge>{" "}
      Paste
    </div>
  );
};

export default function AddressInput(props) {
  const {
    ensProvider,
    setAmount,
    setToAddress,
    ibanAddressObject,
    setIbanAddressObject,
    isMoneriumTransferReady,
    setAmountEthMode,
    setTargetNetwork,
    networkSettingsHelper,
  } = props;

  const [value, setValue] = useState(props.address);

  const [scan, setScan] = useState(false);

  const [isIbanAddress, setIsIbanAddress] = useState(false);

  const [ibanFirstName, setIbanFirstName] = useState("");
  const [ibanLastName, setIbanLastName] = useState("");

  const [ibanMemo, setIbanMemo] = useState("");

  const currentValue = typeof props.value !== "undefined" ? props.value : value;

  const ens = useLookupAddress(props.ensProvider, currentValue);

  useEffect(() => {
    if (!isMoneriumTransferReady) {
      return;
    }

    const iban = ens || currentValue;

    if (isValidIban(iban)) {
      setIsIbanAddress(true);

      setIbanAddressObject({
        ...ibanAddressObject,
        iban,
      });
    } else {
      setIsIbanAddress(false);
    }
  }, [ens, currentValue, value, isMoneriumTransferReady]);

  useEffect(() => {
    setIbanAddressObject({
      ...ibanAddressObject,
      firstName: ibanFirstName,
      lastName: ibanLastName,
      memo: ibanMemo,
    });
  }, [ibanFirstName, ibanLastName, ibanMemo]);

  const scannerButton = (
    <div
      style={{ marginTop: 4, cursor: "pointer" }}
      onClick={() => {
        setScan(!scan);
      }}
    >
      <Badge count={<CameraOutlined style={{ color: "#000000", fontSize: 9 }} />}>
        <QrcodeOutlined style={{ color: "#000000", fontSize: 18 }} />
      </Badge>{" "}
      Scan
    </div>
  );

  const updateAddress = useCallback(
    async newValue => {
      if (typeof newValue !== "undefined") {
        console.log("SCAN", newValue);

        try {
          // EPC QR code
          if (newValue.includes("BCD") && newValue.includes("SCT")) {
            const elements = newValue.split("\n");

            const name = elements[5];
            const names = name.split(" ");
            const firstName = names[0];
            const lastName = names[1];

            const iban = elements[6];

            let amount;
            const amountData = elements[7];

            if (amountData) {
              try {
                amount = parseFloat(amountData.replace("EUR", ""));
              } catch (error) {
                console.log("Couldn't parse amount", error);
              }
            }

            const memo = elements[10];

            setIbanAddressObject({
              firstName: name,
              iban,
            });

            setIbanFirstName(firstName);
            setIbanLastName(lastName);
            setToAddress(iban);

            if (amount) {
              setAmount(amount);
            }

            if (memo) {
              setIbanMemo(memo);
            }

            return;
          }
        } catch (error) {
          console.log("Couldn't parse EPC QR", error);
        }

        /* console.log("🔑 Incoming Private Key...");
        rawPK = incomingPK;
        burnerConfig.privateKey = rawPK;
        window.history.pushState({}, "", "/");
        const currentPrivateKey = window.localStorage.getItem("metaPrivateKey");
        if (currentPrivateKey && currentPrivateKey !== rawPK) {
          window.localStorage.setItem("metaPrivateKey_backup" + Date.now(), currentPrivateKey);
        }
        window.localStorage.setItem("metaPrivateKey", rawPK); */
        if (newValue && newValue.indexOf && newValue.indexOf("wc:") === 0) {
          props.walletConnect(newValue);
        } else {
          let address = newValue;
          setValue(address);
          if (address.indexOf(".eth") > 0 || address.indexOf(".xyz") > 0) {
            try {
              const possibleAddress = await ensProvider.resolveName(address);
              if (possibleAddress) {
                address = possibleAddress;
              }
              // eslint-disable-next-line no-empty
            } catch (e) {}
          }
          setValue(address);
          setToAddress(address);
        }
      }
    },
    [ensProvider, setToAddress],
  );

  const scanner = scan ? (
    <div
      style={{
        zIndex: 256,
        position: "absolute",
        left: "-25%",
        top: "-150%",
        width: "150%",
        backgroundColor: "#333333",
      }}
      onClick={() => {
        setScan(false);
      }}
    >
      <div
        style={{ fontSize: 16, position: "absolute", width: "100%", textAlign: "center", top: "25%", color: "#FFFFFF" }}
      >
        <Spin /> connecting to camera...
      </div>
      <QrReader
        delay={250}
        resolution={1200}
        onError={e => {
          console.log("SCAN ERROR", e);
          setScan(false);
          message.error("Camera Error: " + e.toString());
        }}
        onScan={newValue => {
          if (newValue) {
            console.log("SCAN VALUE", newValue);

            if (newValue && newValue.length === 66 && newValue.indexOf("0x") === 0) {
              console.log("This might be a PK...", newValue);
              setTimeout(() => {
                console.log("opening...");
                const a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = "https://punkwallet.io/pk#" + newValue;
                a.click();
                document.body.removeChild(a);
              }, 250);
              setScan(false);
              updateAddress();
            } else if (newValue && newValue.indexOf && newValue.indexOf("http") === 0) {
              console.log("this is a link, following...");
              setTimeout(() => {
                console.log("opening...");
                const a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = newValue;
                a.click();
                document.body.removeChild(a);
              }, 250);

              setScan(false);
              updateAddress();
            } else {
              let possibleNewValue = newValue;
              let amount;
              const eip681Object = parse(possibleNewValue);

              // token transfer
              if (possibleNewValue.includes("transfer") || possibleNewValue.includes("uint256")) {
                console.log("TOKEN TRANSFER");
                const chainId = eip681Object.chain_id;

                handleNetworkByQR(chainId, networkSettingsHelper, setTargetNetwork);
              } else if (possibleNewValue.includes("?")) {
                amount = eip681Object.parameters.value;

                amount = BigNumber.from(parseFloat(amount).toString());
                amount = formatEther(amount);
                amount = Math.round(amount);
                setAmountEthMode(true);

                console.log("eth amount: ", amount);
              }

              if (possibleNewValue.indexOf("/") >= 0) {
                possibleNewValue = possibleNewValue.substr(possibleNewValue.lastIndexOf("0x"));
                console.log("CLEANED VALUE", possibleNewValue);
              }
              setScan(false);
              updateAddress(eip681Object.target_address);
              setAmount(amount);
            }
          }
        }}
        style={{ width: "100%" }}
      />
    </div>
  ) : (
    ""
  );

  props.hoistScanner(() => {
    setScan(!scan);
  });

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: -212, top: 16 }}>
        {currentValue && currentValue.length > 41 ? <QRPunkBlockie scale={0.6} address={currentValue} /> : ""}
      </div>

      {scanner}

      <Input
        disabled={props.disabled}
        id="0xAddress" // name it something other than address for auto fill doxxing
        name="0xAddress" // name it something other than address for auto fill doxxing
        autoComplete="off"
        autoFocus={props.autoFocus}
        placeholder={props.placeholder ? props.placeholder : "address"}
        value={ens || currentValue}
        addonAfter={scannerButton}
        onChange={e => {
          updateAddress(e.target.value);
        }}
      />

      {isIbanAddress && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 10 }}>
            <Input
              addonAfter={<PasteButton stateSetter={setIbanFirstName} />}
              id="firstName"
              onChange={e => {
                setIbanFirstName(e.target.value);
              }}
              placeholder="First Name"
              value={ibanFirstName}
            />
          </div>
          <div style={{ padding: 10 }}>
            <Input
              addonAfter={<PasteButton stateSetter={setIbanLastName} />}
              id="lastName"
              onChange={e => {
                setIbanLastName(e.target.value);
              }}
              placeholder="Last Name"
              value={ibanLastName}
            />
          </div>
          <div style={{ padding: 10 }}>
            <Input
              addonAfter={<PasteButton stateSetter={setIbanMemo} />}
              id="memo"
              onChange={e => {
                setIbanMemo(e.target.value);
              }}
              placeholder="Reference / Memo"
              value={ibanMemo}
            />
          </div>
        </div>
      )}
    </div>
  );
}
