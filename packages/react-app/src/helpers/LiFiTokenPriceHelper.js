import axios from "axios";

const API_BASE_URL = "https://li.quest/v1/token";

export const getTokenPrice = async (chainId, address) => {
	try {
		const apiURL = API_BASE_URL + `?chain=${chainId}&token=${address}`;

		const tokenInfo = (await axios.get(apiURL)).data;

		return tokenInfo.priceUSD;
	} catch (error) {
		console.error(`Couldn't fetch token price for ${chainId} ${address} , maybe there is a rate limit`, error);

		return 0;
	}
};
