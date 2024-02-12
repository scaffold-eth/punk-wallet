// USDC implements EIP-3009
// https://github.com/centrehq/centre-tokens/blob/0d3cab14ebd133a83fc834dbd48d0468bdf0b391/contracts/v2/EIP3009.sol
// On Polygon a slightly different version is deployed, where EIP_712 version is "1" and the domain uses salt instead of the chainId
// https://polygonscan.com/address/0x2791bca1f2de4661ed88a30c99a7a9449aa84174#readProxyContract

// Instead of calling the transfer function on the token contract and pay for the transaction fee,
// we can sign the transferWithAuthorization message, and execute it 
// from a different "relayer account", who has MATIC to pay for the transaction.

// PolygonNativeMetaTransaction should work for USDC as well, USDC contract handles nonces differently than DAI and USDT though
// USDC has the nonces method instead of getNonce

import { createEthersWallet } from "./EIP1559Helper";
import { getAmount } from "./ERC20Helper";
import { sendTransactionViaRelayerAccount } from "./PolygonRelayerAccountHelper";
import { NETWORKS, POLYGON_USDC_ADDRESS } from "../constants";

const { ethers, BigNumber } = require("ethers");

const ABI = [
    "function transferWithAuthorization (address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)"
];

export const transferWithAuthorization = async (token, to, value) => {
  value = getAmount(value, token.decimals);

  const validAfter  = "0x0000000000000000000000000000000000000000000000000000000000000001"; // signature valid from the beginning

  const provider = new ethers.providers.JsonRpcProvider(NETWORKS.polygon.rpcUrl);
  const timestamp = (await provider.getBlock()).timestamp + 60;                             // signature valid till a minute
  const validBefore = ethers.utils.hexZeroPad(BigNumber.from(timestamp).toHexString(), 32);

  const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));                         // eip-3009 uses Unique Random Nonces
  
  const signerWallet = createEthersWallet();
  const transferWithAuthorizationSignature = await getTransferWithAuthorizationSignature(signerWallet, to, value, validAfter, validBefore, nonce);

  const contract = new ethers.Contract(POLYGON_USDC_ADDRESS, ABI, provider);

  const txParams =
    await contract.populateTransaction.transferWithAuthorization(
        signerWallet.address, to, value, validAfter, validBefore, nonce, transferWithAuthorizationSignature.v, transferWithAuthorizationSignature.r, transferWithAuthorizationSignature.s);

  console.log("txParams", JSON.parse(JSON.stringify(txParams)));

  txParams.chainId = NETWORKS.polygon.chainId;

  return sendTransactionViaRelayerAccount(txParams, signerWallet.address, provider);
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