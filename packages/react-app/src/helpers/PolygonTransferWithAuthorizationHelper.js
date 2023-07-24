import { getEthersWallet, sendTransaction } from "./EIP1559Helper";
import { NETWORKS, POLYGON_USDC_ADDRESS } from "../constants";

const { ethers, BigNumber } = require("ethers");

const RELAYER_PK = process.env.REACT_APP_RELAYER_PK;

const ABI = [
    "function transferWithAuthorization (address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)"
];

export const transferWithAuthorization = async (to, value) => {
  const validAfter  = "0x0000000000000000000000000000000000000000000000000000000000000001"; // signature valid from the beginning

  const provider = new ethers.providers.JsonRpcProvider(NETWORKS.polygon.rpcUrl);
  const timestamp = (await provider.getBlock()).timestamp + 60;                             // signature valid till a minute
  const validBefore = ethers.utils.hexZeroPad(BigNumber.from(timestamp).toHexString(), 32);

  const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));                         // eip-3009 uses Unique Random Nonces

  const txParams = {};
  txParams.chainId = NETWORKS.polygon.chainId;

  const signerWallet = getEthersWallet(txParams);
  const transferWithAuthorizationSignature = await getTransferWithAuthorizationSignature(signerWallet, to, value, validAfter, validBefore, nonce);

  const contract = new ethers.Contract(POLYGON_USDC_ADDRESS, ABI, provider);

  const populatedTransaction =
    await contract.populateTransaction.transferWithAuthorization(
        signerWallet.address, to, value, validAfter, validBefore, nonce, transferWithAuthorizationSignature.v, transferWithAuthorizationSignature.r, transferWithAuthorizationSignature.s);

  txParams.from = populatedTransaction.from;
  txParams.to = populatedTransaction.to;
  txParams.data = populatedTransaction.data;

  const relayerWallet = new ethers.Wallet(RELAYER_PK, provider);

  const result = await sendTransaction(txParams, relayerWallet);

  result.origin = signerWallet.address;

  return result;
}

const getTransferWithAuthorizationSignature = async (signer, to, value, validAfter, validBefore, nonce) => {
  const name = "USD Coin (PoS)";
  const version = "1";
  const verifyingContract = POLYGON_USDC_ADDRESS;
  const salt = ethers.utils.hexZeroPad(ethers.utils.hexlify(NETWORKS.polygon.chainId), 32);

  return ethers.utils.splitSignature(
    await signer._signTypedData(
      {
        name,
        version,
        verifyingContract,
        salt
      },
      {
        TransferWithAuthorization: [
          {
            name: "from",
            type: "address",
          },
          {
            name: "to",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
          {
            name: "validAfter",
            type: "uint256",
          },
          {
            name: "validBefore",
            type: "uint256",
          },
          {
            name: "nonce",
            type: "bytes32",
          }
        ],
      },
      {
        from: signer.address,
        to,
        value,
        validAfter,
        validBefore,
        nonce,
      }
    )
  )
}