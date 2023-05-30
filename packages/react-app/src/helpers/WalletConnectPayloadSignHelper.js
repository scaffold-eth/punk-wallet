export const signPayload = (ethersWallet, payload) => {

}

export const signTransaction = (ethersWallet, txParams) => {
    // Ethers uses gasLimit instead of gas
    if (txParams.gas) {
        txParams.gasLimit = txParams.gas;
        delete txParams.gas;    
    }

    return ethersWallet.signTransaction(txParams);
}