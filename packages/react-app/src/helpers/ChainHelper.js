const isEIP3091Explorer = explorer => explorer.standard === "EIP3091";

export const getBLockExplorers = chain => chain.explorers.filter(explorer => isEIP3091Explorer(explorer));

export const getBLockExplorer = (chain, name) =>
  getBLockExplorers(chain).find(blockExplorer => blockExplorer.name === name);

const getChains = async () => {
  try {
    const response = await fetch("https://chainid.network/chains.json");

    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error("Couldn't fetch chains.json", error);
  }

  return null;
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
