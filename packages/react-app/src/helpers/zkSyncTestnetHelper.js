import { createEthersWallet } from "./EIP1559Helper";
import { getAmount } from "./ERC20Helper";
import { ZK_TESTNET_USDC_ADDRESS } from "../constants";

const { ethers, BigNumber } = require("ethers");

const { Provider, Contract, Wallet, utils } =  require("zksync-web3");

const ERC20ABI = '[ { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]';

const PAYMASTER_ADDRESS = "0xDB4FB4fC0378448f98Ae9967F2081EE899159c20";

const PAYMASTER_FEE = 100000;

export const transferViaPaymaster = async (token, to, amount) => {
    if (ethers.utils.isHexString(amount)) {
        amount = calcMaxAmount(amount, token.decimals);
    }
    else {
        amount = getAmount(amount, token.decimals);
    }

	let zkWallet = new Wallet(createEthersWallet());
	const zkProvider = new Provider("https://testnet.era.zksync.dev");
	zkWallet = zkWallet.connect(zkProvider);

	const tokenUSDC = new Contract(ZK_TESTNET_USDC_ADDRESS, ERC20ABI, zkWallet);

	const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
        type: "ApprovalBased",
        token: ZK_TESTNET_USDC_ADDRESS,
        minimalAllowance: PAYMASTER_FEE,
        innerInput: new Uint8Array(),
    });

    const result = await (
        await tokenUSDC.transfer(to, amount, {
            // paymaster info
            customData: {
                paymasterParams: paymasterParams,
                gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            },
        })
    ).wait();


	return result;
}

const calcMaxAmount = (amountHexString, decimals) => {
    const balanceBigNumber = BigNumber.from(amountHexString);

    const payMasterFeeBigNumber = BigNumber.from(PAYMASTER_FEE);

    const maxAmountBigNumber = balanceBigNumber.sub(payMasterFeeBigNumber);

    return maxAmountBigNumber;
}