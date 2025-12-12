import tokenList from "../data/koanproocol.tokenlist.json";

export const getKoanDefaultTokens = () => {
    console.log("Loaded Koan Protocol token list with", tokenList.tokens.length, "tokens");
	return tokenList.tokens;
};

