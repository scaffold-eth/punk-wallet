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

  return response.json();
};

const getLocalChains = () => {
  return require("../constants/chains.json");
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
