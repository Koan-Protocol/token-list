import tokenList from "../data/koanproocol.tokenlist.json";
import { ChainId } from "../config/wagmi";
import { OTHER_TOKEN_LISTS } from "../data/other-token-list";
import axios from "axios";
import { fetchToken } from "./wagmi-functions";
import { Address } from "viem";
import { isPromiseFulfilled } from "./utils";

export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

let tokenMap: Map<string, Token> | null = null;


export const getToken = async ({
  address,
  chainId,
}: {
  address: string;
  chainId: ChainId;
}) => {
  const koanToken = tokenList.tokens.find(
    (token) =>
      token.chainId === chainId &&
      token.address.toLowerCase() === address.toLowerCase(),
  );
  if (koanToken) return koanToken;

  // Check other token lists
  const tokenListPromises = OTHER_TOKEN_LISTS.map((url) => axios.get(url));
  const tokenListResponses = await Promise.allSettled(tokenListPromises);

  for (const result of tokenListResponses) {
    // console.log({
    //   "result status": result.status,
    //   "result data": result.status,
    //   data: result,
    //   "data value":
    //     result.status === "fulfilled"
    //       ? result?.value.data.tokens
    //       : "value null",
    // });
    if (result.status === "fulfilled") {
      const token = result.value.data.tokens.find(
        (t: any) =>
          t.chainId === chainId &&
          t.address.toLowerCase() === address.toLowerCase(),
      );
      if (token) return token;
    }
  }

  try {
    const wagmiToken = await fetchToken({
      address: address as Address,
      chainId: chainId,
    });
    return wagmiToken;
  } catch (error) {
    console.error("Error fetching token from wagmi:", error);
    return null;
  }
};

export const getTokensFromOtherList = async () => {
  const tokenListPromises = OTHER_TOKEN_LISTS.map((url) => axios.get(url));
  const tokenListResponses = await Promise.allSettled(tokenListPromises);

  const tokensFromOtherList: Token[] = [];
  for (const result of tokenListResponses) {
    if (result.status === "fulfilled") {
      const tokens = result.value.data.tokens;
      if (Array.isArray(tokens)) {
        tokensFromOtherList.push(...tokens);
      }
    }
  }
  return tokensFromOtherList;
};
export const getKoanDefaultTokens = () => {
  return tokenList.tokens;
};
export const getTokensByChainId = (chainId: ChainId) => {
  return tokenList.tokens.filter((token) => token.chainId === chainId);
};
