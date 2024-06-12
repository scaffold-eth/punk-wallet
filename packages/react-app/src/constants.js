const TAMS_FREE_ALCHEMY_API_KEY = "7OQ7KlD3Ldrw_Zhvh8_RhkJRf1lm9s90";

const ALCHEMY_API_KEY_MAINNET = process.env.REACT_APP_ALCHEMY_API_KEY_MAINNET ?? TAMS_FREE_ALCHEMY_API_KEY;

// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = "5b3aa68d82264f59bb6a1874cb3c23ea"; // trying the  emoji.support key

// MY ETHERSCAN_ID, SWAP IN YOURS FROM https://etherscan.io/myapikey
export const ETHERSCAN_KEY = "PSW8C433Q667DVEX5BCRMGNAH9FSGFZ7Q8";

// BLOCKNATIVE ID FOR Notify.js:
export const BLOCKNATIVE_DAPPID = "0b58206a-f3c0-4701-a62f-73c7243e8c77";

// EXTERNAL CONTRACTS

export const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

export const ZK_TESTNET_USDC_ADDRESS = "0x0faF6df7054946141266420b43783387A78d82A9";
export const POLYGON_USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

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
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/" + ALCHEMY_API_KEY_MAINNET,
    blockExplorer: "https://etherscan.io/",
    erc20Tokens: [
      {
        name: "WETH",
        address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        decimals: 18,
        imgSrc: "/WETH.png",
      },
      {
        name: "ENS",
        address: "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
        decimals: 18,
        imgSrc: "/ENS.png",
      },
      {
        name: "GTC",
        address: "0xde30da39c46104798bb5aa3fe8b9e0e1f348163f",
        decimals: 18,
        imgSrc: "/GTC.png",
      },
      {
        name: "BAL",
        address: "0xba100000625a3754423978a60c9317c58a424e3d",
        decimals: 18,
        imgSrc: "/BAL.png",
      },
      {
        name: "EURe",
        address: "0x3231cb76718cdef2155fc47b5286d82e6eda273f",
        decimals: 18,
        imgSrc: "/EURe.png",
      },
      {
        name: "USDC",
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        decimals: 6,
        imgSrc: "/USDC.png",
      },
      {
        name: "USDT",
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        decimals: 6,
        imgSrc: "/USDT.png",
      },
      {
        name: "DAI",
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        decimals: 18,
        imgSrc: "/DAI.png",
      },
    ],
    nativeToken: {
      name: "ETH",
      imgSrc: "/ETH.png",
    },
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
        imgSrc: "/OP.png",
      },
      {
        name: "USDC",
        address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        decimals: 6,
        imgSrc: "/USDC.png",
      },
      {
        name: "USDT",
        address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
        decimals: 6,
        imgSrc: "/USDT.png",
      },
      {
        name: "DAI",
        address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
        decimals: 18,
        imgSrc: "/DAI.png",
      },
    ],
    nativeToken: {
      name: "ETH",
      imgSrc: "/ETH.png",
    },
  },
  base: {
    name: "base",
    color: "#0052ff",
    price: "uniswap",
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org/",
    erc20Tokens: [
      {
        name: "USDC",
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 6,
        imgSrc: "/USDC.png",
      },
      {
        name: "DEGEN",
        address: "0x4ed4e862860bed51a9570b96d89af5e1b0efefed",
        decimals: 18,
        imgSrc: "/degen.png",
      },
      {
        name: "BSHIB",
        address: "0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA",
        decimals: 18,
        imgSrc: "/bshib.png",
      },
      {
        name: "BENG",
        address: "0x3e05D37CFBd8caaad9E3322D35CC727AfaFF63E3",
        decimals: 18,
        imgSrc: "/beng.png",
      },
      {
        name: "BOOMER",
        address: "0xcdE172dc5ffC46D228838446c57C1227e0B82049",
        decimals: 18,
        imgSrc: "/boomer.png",
      },
      {
        name: "BONKE",
        address: "0xB9898511Bd2Bad8bfc23Eba641ef97A08f27e730",
        decimals: 18,
        imgSrc: "/bonke.png",
      },
      {
        name: "STRM",
        address: "0x499A12387357e3eC8FAcc011A2AB662e8aBdBd8f",
        decimals: 18,
        imgSrc: "/strm.png",
      },
      {
        name: "PEPE",
        address: "0x698DC45e4F10966f6D1D98e3bFd7071d8144C233",
        decimals: 9,
        imgSrc: "/pepe.png",
      },
      {
        name: "AERO",
        address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
        decimals: 18,
        imgSrc: "/aero.png",
      },
      {
        name: "ROCKY",
        address: "0x3636a7734b669Ce352e97780Df361ce1f809c58C",
        decimals: 18,
        imgSrc: "/rocky.png",
      },
    ],
    nativeToken: {
      name: "ETH",
      imgSrc: "/ETH.png",
    },
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
        imgSrc: "/ARB.png",
      },
      {
        name: "USDC",
        address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        decimals: 6,
        imgSrc: "/USDC.png",
      },
      {
        name: "USDT",
        address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        decimals: 6,
        imgSrc: "/USDT.png",
      },
      {
        name: "DAI",
        address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
        decimals: 18,
        imgSrc: "/DAI.png",
      },
    ],
    nativeToken: {
      name: "ETH",
      imgSrc: "/ETH.png",
    },
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
        name: "EURe",
        address: "0x18ec0A6E18E5bc3784fDd3a3634b31245ab704F6",
        decimals: 18,
        imgSrc: "/EURe.png",
      },
      {
        name: "USDC",
        address: POLYGON_USDC_ADDRESS,
        decimals: 6,
        imgSrc: "/USDC.png",
      },
      {
        name: "USDT",
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        decimals: 6,
        imgSrc: "/USDT.png",
        NativeMetaTransaction: {
          name: "(PoS) Tether USD",
          ERC712_VERSION: "1",
        },
      },
      {
        name: "DAI",
        address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        decimals: 18,
        imgSrc: "/DAI.png",
        NativeMetaTransaction: {
          name: "(PoS) Dai Stablecoin",
          ERC712_VERSION: "1",
        },
      },
    ],
    nativeToken: {
      name: "MATIC",
      imgSrc: "/MATIC.png",
    },
  },
  scroll: {
    name: "scroll",
    color: "#ffdbb0",
    price: "uniswap",
    chainId: 534352,
    rpcUrl: "https://rpc.scroll.io",
    blockExplorer: "https://scrollscan.com/",
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
    blockExplorer: "https://gnosisscan.io/",
    erc20Tokens: [
      {
        name: "sDAI",
        address: "0xaf204776c7245bf4147c2612bf6e5972ee483701",
        decimals: 18,
        imgSrc: "/sDAI.png",
      },
      {
        name: "EURe",
        address: "0xcB444e90D8198415266c6a2724b7900fb12FC56E",
        decimals: 18,
        imgSrc: "/EURe.png",
      },
      {
        name: "USDT",
        address: "0x4ecaba5870353805a9f068101a40e0f32ed605c6",
        decimals: 6,
        imgSrc: "/USDT.png",
      },
      {
        name: "USDC",
        address: "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83",
        decimals: 6,
        imgSrc: "/USDC.png",
      },
    ],
    nativeToken: {
      name: "xDAI",
      imgSrc: "/xDAI.png",
    },
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
  zkSyncEra: {
    name: "zkSyncEra",
    color: "#45488f",
    price: "uniswap",
    chainId: 324,
    rpcUrl: "https://mainnet.era.zksync.io",
    blockExplorer: "https://explorer.zksync.io/",
  },
  buidlguidl: {
    name: "buidlguidl",
    color: "#1785ff",
    price: 1,
    chainId: 80216,
    rpcUrl: `https://chain.buidlguidl.com:8545`,
    blockExplorer: "https://etherscan.io/",
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
    //rpcUrl: `https://rpc.sepolia.org/`,
    rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/4vFnzFt4K0gFDvYodzTuH9ZjbGI-awSf`,
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
        address: ZK_TESTNET_USDC_ADDRESS,
        decimals: 6,
        imgSrc: "/USDC.png",
      },
    ],
    nativeToken: {
      name: "ETH",
      imgSrc: "/ETH.png",
    },
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

export const ERROR_MESSAGES = {
  CHAIN_ERROR: {
    NOT_SUPPORTED: "ChainId is not supported",
    NOT_PROVIDED: "ChainId is not provided",
  },
  TOKEN_ERROR: {
    NOT_SUPPORTED: "Token is not supported",
  },
};
