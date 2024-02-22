export const getBLockExplorer = (chain, name) => getBLockExplorers(chain).find(blockExplorer => blockExplorer.name == name);

export const getBLockExplorers = (chain) => chain.explorers.filter(explorer => isEIP3091Explorer(explorer));

export const getChain = (chainId) => chains.find(chain => chain.chainId == chainId)

const isEIP3091Explorer = (explorer) => explorer.standard == "EIP3091";

export const getChain = async chainId => {
   const chains = await initChains();

   return chains.find(chain => chain.chainId === chainId);
};
 
const getChains = async () => {
   const response = await fetch("https://chainid.network/chains.json");
   if (!response.ok) {
      // In case of error use currentChains
      // throw new Error('Couldn\'t fetch chains');
      return null;
   }

   const json = await response.json();
   return json;
};

const getLocalChains = async () => {
   const response = await require("../constants/chains.json");
   return response;
};

export async function initChains() {
   const chains = await getChains() || await getLocalChains();
   
   return chains;
};
