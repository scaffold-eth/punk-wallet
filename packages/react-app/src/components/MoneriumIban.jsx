import React, { useState } from "react";

import QR from "qrcode.react";

import { Alert, Input, message } from "antd";
import { CopyOutlined, QrcodeOutlined, WarningOutlined } from "@ant-design/icons";

import { useLocalStorage } from "../hooks";

import { LogoOnLogo, TokenDisplay } from "./";

import { copy } from "../helpers/EditorHelper";
import { getShortAddress } from "../helpers/MoneriumHelper";

//const generateQrCode = require('sepa-payment-qr-code')
import { generateQrCode } from "../helpers/SepaPaymentQrCodeHelper";

export default function MoneriumIban({ clientData, currentPunkAddress }) {
  const accountArrayIban = clientData.accountArrayIban;
  const ibanObject = accountArrayIban[0]; // ToDo: Handle multiple ibans
  const ibanAccountAddress = ibanObject?.address;

  const name = clientData.name;
  const iban = ibanObject?.iban;

  let ibanAccountAddressIsDifferent = false;

  if (currentPunkAddress.toLowerCase() != ibanAccountAddress?.toLowerCase()) {
    ibanAccountAddressIsDifferent = true;
  }

  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const [showIbanQR, setShowIbanQR] = useLocalStorage("showIbanQR", true);
  const [showWarningMessage, setShowWarningMessage] = useLocalStorage("showIbanWarning", true);

  if (!ibanAccountAddress) {
    return <></>;
  }

  let qrObject = {
    name: name,
    iban: iban,
  };

  let isValidAmount = false;
  const amountNumber = parseFloat(parseFloat(amount.replace(/,/g, ".")).toFixed(2));

  if (!isNaN(amountNumber) && amountNumber >= 0.01 && amountNumber <= 999999999.99) {
    isValidAmount = true;
    qrObject.amount = amountNumber;
  }

  if (memo) {
    qrObject.unstructuredReference = memo;
  }

  const qr = generateQrCode(qrObject);

  return (
    <>
      {ibanAccountAddressIsDifferent && (
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", paddingBottom: "2em" }}>
          {showWarningMessage && (
            <div>
              <Alert
                type={"warning"}
                message={
                  <div
                    style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
                  >
                    <div>
                      Your <b>IBAN</b> is connected to a different account:
                    </div>
                    <div style={{ fontWeight: "bold" }}>{getShortAddress(ibanAccountAddress)}</div>
                  </div>
                }
              />
            </div>
          )}
          <div
            style={{ fontSize: "3em", cursor: "pointer", backgroundColor: "" }}
            onClick={() => {
              setShowWarningMessage(!showWarningMessage);
            }}
          >
            <WarningOutlined style={{ color: showWarningMessage ? "black" : "gray" }} />
          </div>
        </div>
      )}

      <div
        style={{ display: "flex", justifyContent: "space-around", alignItems: "center", backgroundColor: "ghostwhite" }}
      >
        <div>
          <LogoOnLogo src1={"EURe.png"} src2={"polygon-bgfill-icon.svg"} sizeMultiplier1={3} sizeMultiplier2={0.5} />
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", backgroundColor: "", cursor: "pointer" }}
          onClick={() => copy(iban, () => message.success(<span style={{ position: "relative" }}>Copied IBAN</span>))}
        >
          <div style={{ alignItems: "flex-start" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "",
                fontWeight: "bold",
              }}
            >
              IBAN:
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {iban} <CopyOutlined style={{ color: "#000000", fontSize: 18, marginLeft: "0.5em" }} />
          </div>
        </div>

        <div
          style={{ fontSize: "3em", cursor: "pointer", backgroundColor: "" }}
          onClick={() => {
            setShowIbanQR(!showIbanQR);
          }}
        >
          <QrcodeOutlined style={{ color: showIbanQR ? "black" : "gray" }} />
        </div>
      </div>

      {showIbanQR && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: "2em",
          }}
        >
          <QR level={"M"} includeMargin={false} value={qr} style={{ height: "auto", maxWidth: "100%", width: "60%" }} />

          {name && <div>{name}</div>}
          {iban && <div>{iban}</div>}
          {isValidAmount && <div>{"€ " + amountNumber}</div>}
          {memo && <div>{memo}</div>}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: "2em",
            }}
          >
            <Input
              style={{ paddingBottom: "1em" }}
              value={amount}
              placeholder={"amount in " + "EURe"}
              addonAfter={<TokenDisplay token={{ name: "EURe", imgSrc: "EURe.png" }} />}
              onChange={async e => {
                setAmount(e.target.value);
              }}
            />
            <Input
              value={memo}
              placeholder={"Thx for the pizza"}
              addonAfter={<>Memo</>}
              onChange={async e => {
                setMemo(e.target.value);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
