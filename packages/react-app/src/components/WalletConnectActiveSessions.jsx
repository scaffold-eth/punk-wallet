import React from "react";
import { Input } from "antd";

import { getWalletConnectV2ActiveSessions, disconnectWallectConnectV2Session } from "../helpers/WalletConnectV2Helper";

export default function WalletConnectActiveSessions({ web3wallet }) {
  return getWalletConnectV2ActiveSessions(web3wallet).map((activeSession, index) => (
    <div key={index}>
      <WalletConnectActiveSession web3wallet={web3wallet} activeSession={activeSession} />
    </div>
  ));
}

const WalletConnectActiveSession = ({ web3wallet, activeSession }) => {
  const walletConnectPeerMeta = activeSession?.peer?.metadata;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: "1em" }}>
      {walletConnectPeerMeta?.icons[0] ? (
        <span style={{ paddingRight: 10 }}>
          {walletConnectPeerMeta?.icons[0] && (
            <img
              style={{ width: 40 }}
              src={walletConnectPeerMeta.icons[0]}
              alt={walletConnectPeerMeta.name ? walletConnectPeerMeta.name : ""}
            />
          )}
        </span>
      ) : (
        <span style={{ fontSize: 30, paddingRight: 10 }}>✅</span>
      )}
      <Input
        style={{ width: "25%", textAlign: "center" }}
        placeholder={"wallet connect url (or use the scanner-->)"}
        value={walletConnectPeerMeta?.name ? walletConnectPeerMeta.name : "Wallet Connect"}
        disabled={true}
      />

      <span
        style={{ cursor: "pointer", fontSize: 30, paddingLeft: 10 }}
        onClick={async () => {
          await disconnectWallectConnectV2Session(web3wallet, activeSession.topic);
        }}
      >
        🗑
      </span>
    </div>
  );
};
