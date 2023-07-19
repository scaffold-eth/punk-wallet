// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = "5b3aa68d82264f59bb6a1874cb3c23ea"; // trying the  emoji.support key

// MY ETHERSCAN_ID, SWAP IN YOURS FROM https://etherscan.io/myapikey
export const ETHERSCAN_KEY = "PSW8C433Q667DVEX5BCRMGNAH9FSGFZ7Q8";

// BLOCKNATIVE ID FOR Notify.js:
export const BLOCKNATIVE_DAPPID = "0b58206a-f3c0-4701-a62f-73c7243e8c77";

// EXTERNAL CONTRACTS

export const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

export const DAI_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "chainId_", type: "uint256" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "src", type: "address" },
      { indexed: true, internalType: "address", name: "guy", type: "address" },
      { indexed: false, internalType: "uint256", name: "wad", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: true,
    inputs: [
      { indexed: true, internalType: "bytes4", name: "sig", type: "bytes4" },
      { indexed: true, internalType: "address", name: "usr", type: "address" },
      { indexed: true, internalType: "bytes32", name: "arg1", type: "bytes32" },
      { indexed: true, internalType: "bytes32", name: "arg2", type: "bytes32" },
      { indexed: false, internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "LogNote",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "src", type: "address" },
      { indexed: true, internalType: "address", name: "dst", type: "address" },
      { indexed: false, internalType: "uint256", name: "wad", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    constant: true,
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "PERMIT_TYPEHASH",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "usr", type: "address" },
      { internalType: "uint256", name: "wad", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "usr", type: "address" },
      { internalType: "uint256", name: "wad", type: "uint256" },
    ],
    name: "burn",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ internalType: "address", name: "guy", type: "address" }],
    name: "deny",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "usr", type: "address" },
      { internalType: "uint256", name: "wad", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "src", type: "address" },
      { internalType: "address", name: "dst", type: "address" },
      { internalType: "uint256", name: "wad", type: "uint256" },
    ],
    name: "move",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "nonces",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "holder", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "nonce", type: "uint256" },
      { internalType: "uint256", name: "expiry", type: "uint256" },
      { internalType: "bool", name: "allowed", type: "bool" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "permit",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "usr", type: "address" },
      { internalType: "uint256", name: "wad", type: "uint256" },
    ],
    name: "pull",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "usr", type: "address" },
      { internalType: "uint256", name: "wad", type: "uint256" },
    ],
    name: "push",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ internalType: "address", name: "guy", type: "address" }],
    name: "rely",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "dst", type: "address" },
      { internalType: "uint256", name: "wad", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "src", type: "address" },
      { internalType: "address", name: "dst", type: "address" },
      { internalType: "uint256", name: "wad", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "version",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "wards",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export const NETWORK = chainId => {
  for (const n in NETWORKS) {
    if (NETWORKS[n].chainId == chainId) {
      return NETWORKS[n];
    }
  }
};

export const NETWORKS = {
  ethereum: {
    name: "ethereum",
    color: "#ceb0fa",
    chainId: 1,
    price: "uniswap",
    rpcUrl: `https://rpc2.scaffoldeth.io:48544`,
    blockExplorer: "https://etherscan.io/",
    erc20Tokens: [
      {
        name: "USDC",
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        decimals: 6,
        imgSrc: "/USDC.png"
      },
      {
        name: "USDT",
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        decimals: 6,
        imgSrc: "/USDT.png"
      },
      {
        name: "DAI",
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        decimals: 18,
        imgSrc: "/DAI.png"
      },
    ],
    nativeToken: {
      name:"ETH",
      imgSrc:"/ETH.png"
    }
  },
  buidlguidl: {
    name: "buidlguidl",
    color: "#1785ff",
    price: 1,
    chainId: 80216,
    rpcUrl: `https://chain.buidlguidl.com:8545`,
    blockExplorer: "https://etherscan.io/",
  },
  zkSyncEra: {
    name: "zkSyncEra",
    color: "#45488f",
    price: "uniswap",
    chainId: 324,
    rpcUrl: "https://mainnet.era.zksync.io",
    blockExplorer: "https://explorer.zksync.io/"
  },
  optimism: {
    name: "optimism",
    color: "#f01a37",
    price: "uniswap",
    chainId: 10,
    blockExplorer: "https://optimistic.etherscan.io/",
    rpcUrl: `https://opt-mainnet.g.alchemy.com/v2/gzr_xuzv2SPwbPchC9Z41qmfodlDglKp`,
    //rpcUrl: `https://mainnet.optimism.io`,
    //gasPrice: 1000000,
    erc20Tokens: [
      {
        name: "OP",
        address: "0x4200000000000000000000000000000000000042",
        decimals: 18,
        imgSrc: "/OP.png"
      },
      {
        name: "USDC",
        address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        decimals: 6,
        imgSrc: "/USDC.png"
      },
      {
        name: "USDT",
        address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
        decimals: 6,
        imgSrc: "/USDT.png"
      },
      {
        name: "DAI",
        address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
        decimals: 18,
        imgSrc: "/DAI.png"
      },
    ],
    nativeToken: {
      name:"ETH",
      imgSrc:"/ETH.png"
    }
  },
  arbitrum: {
    name: "arbitrum",
    color: "#50a0ea",
    price: "uniswap",
    chainId: 42161,
    blockExplorer: "https://arbiscan.io/",
    rpcUrl: `https://arb-mainnet.g.alchemy.com/v2/tYM-Tr8c9dHV5a8AgvXnVmS9e-xvoxeM`,
    //gasPrice: 1000000000,// TODO ASK RPC
    erc20Tokens: [
      {
        name: "ARB",
        address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
        decimals: 18,
        imgSrc: "/ARB.png"
      },
      {
        name: "USDC",
        address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        decimals: 6,
        imgSrc: "/USDC.png"
      },
      {
        name: "USDT",
        address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        decimals: 6,
        imgSrc: "/USDT.png"
      },
      {
        name: "DAI",
        address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
        decimals: 18,
        imgSrc: "/DAI.png"
      },
    ],
    nativeToken: {
      name:"ETH",
      imgSrc:"/ETH.png"
    }
  },
  gnosis: {
    name: "gnosis",
    color: "#48a9a6",
    chainId: 100,
    price: 1,
    nativeCurrency: {
      name: "xDAI",
      symbol: "xDAI",
      decimals: 18,
    },
    rpcUrl: "https://rpc.gnosischain.com/",
    faucet: "https://xdai-faucet.top/",
    blockExplorer: "https://blockscout.com/poa/xdai/",
  },
  polygon: {
    name: "polygon",
    color: "#2bbdf7",
    price: "uniswap:0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    chainId: 137,
    rpcUrl: "https://polygon-mainnet.g.alchemy.com/v2/7ls4W5wc3Cu-4-Zq2QaQxgUhJKjUIDay",
    faucet: "https://faucet.matic.network/",
    blockExplorer: "https://polygonscan.com/",
    erc20Tokens: [
      {
        name: "USDC",
        address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        decimals: 6,
        imgSrc: "/USDC.png"
      },
      {
        name: "USDT",
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        decimals: 6,
        imgSrc: "/USDT.png"
      },
      {
        name: "DAI",
        address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        decimals: 18,
        imgSrc: "/DAI.png"
      },
    ],
    nativeToken: {
      name:"MATIC",
      imgSrc:"/MATIC.png"
    }
  },
  goerli: {
    name: "goerli",
    color: "#0975F6",
    price: "uniswap",
    chainId: 5,
    faucet: "https://goerli-faucet.slock.it/",
    blockExplorer: "https://goerli.etherscan.io/",
    rpcUrl: `https://eth-goerli.g.alchemy.com/v2/4vFnzFt4K0gFDvYodzTuH9ZjbGI-awSf`,
  },
  sepolia: {
    name: "sepolia",
    color: "#87ff65",
    price: "uniswap",
    chainId: 11155111,
    faucet: "https://faucet.sepolia.dev/",
    blockExplorer: "https://sepolia.etherscan.io/",
    //rpcUrl: `https://rpc.sepolia.dev`,
    rpcUrl: `https://rpc.sepolia.org/`,

  },
  localhost: {
    name: "localhost",
    color: "#666666",
    price: "uniswap", // use mainnet eth price for localhost
    chainId: 31337,
    blockExplorer: "",
    rpcUrl: "http://localhost:8545",
  },
  zkSyncTest: {
    name: "zkSyncTest",
    color: "#45488f",
    price: "uniswap",
    chainId: 280,
    rpcUrl: "https://testnet.era.zksync.dev",
    blockExplorer: "https://goerli.explorer.zksync.io/",
    erc20Tokens: [
      {
        name: "USDC",
        address: "0x0faF6df7054946141266420b43783387A78d82A9",
        decimals: 6,
        imgSrc: "/USDC.png"
      }
    ],
    nativeToken: {
      name:"ETH",
      imgSrc:"/ETH.png"
    }
  },
  canto: {
    name: "canto",
    color: "#00ff9b",
    chainId: 7700,
    gasPrice: 420000000000,
    rpcUrl: "https://canto.slingshot.finance",
    faucet: "https://cantofaucet.com/",
    blockExplorer: "https://evm.explorer.canto.io/",
  },
  mumbai: {
    name: "mumbai",
    color: "#92D9FA",
    chainId: 80001,
    gasPrice: 1000000000,
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    faucet: "https://faucet.matic.network/",
    blockExplorer: "https://mumbai-explorer.matic.today/",
  },
  testnetHarmony: {
    name: "testnetHarmony",
    color: "#00b0ef",
    chainId: 1666700000,
    blockExplorer: "https://explorer.pops.one/",
    rpcUrl: `https://api.s0.b.hmny.io`,
    gasPrice: 1000000000,
    token: "ONE",
  },
  harmony: {
    name: "harmony",
    color: "#00b0ef",
    chainId: 1666600000,
    blockExplorer: "https://explorer.harmony.one/",
    rpcUrl: `https://api.harmony.one`,
    gasPrice: 1000000000,
    token: "ONE",
  },
};
