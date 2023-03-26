import { getSdkError } from "@walletconnect/utils";

export const getWalletConnectV2ActiveSession = (web3wallet) => {
	return Object.values(web3wallet.getActiveSessions())[0];
}

export const isWalletConnectV2Connected = (web3wallet) => {
	const activeSession = getWalletConnectV2ActiveSession(web3wallet);
	if (activeSession) {
		return true;
	}
	return false;
}

export const connectWalletConnectV2 = (web3wallet, setWalletConnectConnected, setWalletConnectPeerMeta) => {
	const activeSession = getWalletConnectV2ActiveSession(web3wallet);

  if (activeSession) {
    setWalletConnectConnected(true);
    setWalletConnectPeerMeta(activeSession?.peer?.metadata);
  }
}

export const disconnectWallectConnectV2Sessions = async (web3wallet) => {
	console.log("Disconnecting from Wallet Connect 2 session");

	// Wallet Connect V2 has a lot more options than V1, we could have multiple sessions and pairings
	// But for now let's use only one session and disconnect from all sessions (there should be only one though right now)

	const topics = Object.keys(web3wallet.getActiveSessions());

	for (const topic of topics) {
		console.log("Disconnecting from session ", topic);
		await web3wallet.disconnectSession({ topic, reason: getSdkError('USER_DISCONNECTED') })
	}

	/*  We could also disconnect from the pairings, but I think it is a better user experience if we keep them
		  Dapps can keep the pairings and reconnect

		web3wallet.engine.signClient.core.pairing.pairings.values
		.forEach(
		  async (pairing) => {
		      const topic = pairing.topic;
		      console.log("Disconnecting from pair ", topic);
		      await web3wallet.disconnectSession({ topic, reason: getSdkError('USER_DISCONNECTED') })
		});
	*/
}

