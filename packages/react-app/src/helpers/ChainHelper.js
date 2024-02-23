const isEIP3091Explorer = explorer => explorer.standard === "EIP3091";

export const getBLockExplorers = chain => chain.explorers.filter(explorer => isEIP3091Explorer(explorer));

export const getBLockExplorer = (chain, name) =>
  getBLockExplorers(chain).find(blockExplorer => blockExplorer.name === name);

const getChains = async () => {
  const response = await fetch("https://chainid.network/chains.json");
  if (!response.ok) {
    // In case of error use currentChains
    // throw new Error('Couldn\'t fetch chains');
    return null;
  }

  const json = await response.json();

  localStorage.setItem("chains", JSON.stringify(json));
  return json;
};

const getLocalChains = () => {
  // eslint-disable-next-line global-require
  if (localStorage.getItem("chains")) {
    console.log(localStorage.getItem("chains"));
    return JSON.parse(localStorage.getItem("chains"));
  }

  const response = require("../constants/chains.json");
  return response;
};

export async function initChains(useLocal) {
  if (useLocal) {
    return getLocalChains();
  }
  const chains = (await getChains()) || getLocalChains();

  return chains;
}

export const getChain = async (chainId, useLocal) => {
  const chains = await initChains(useLocal);

  return chains.find(chain => chain.chainId === chainId);
};
