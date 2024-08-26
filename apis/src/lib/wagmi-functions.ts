import { readContracts } from "@wagmi/core";
import { ChainId, wagmiConfig } from "../config/wagmi";
import { Address, erc20Abi } from "viem";

const wstETH = {
  address: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
  abi: erc20Abi,
} as const;
const USDC = {
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  abi: erc20Abi,
} as const;

export async function getTokenInfo() {
  const testAddress = "0x57a7560D0eC28065762203c0d633943298eaC7C0";

  try {
    const result = await readContracts(wagmiConfig, {
      contracts: [
        {
          ...USDC,
          functionName: "name",
        },
        {
          ...USDC,
          functionName: "decimals",
        },
        {
          ...USDC,
          functionName: "symbol",
        },
        {
          ...USDC,
          functionName: "balanceOf",
          args: [testAddress],
        },
        {
          ...wstETH,
          functionName: "name",
        },
        {
          ...wstETH,
          functionName: "decimals",
        },
        {
          ...wstETH,
          functionName: "symbol",
        },
        {
          ...wstETH,
          functionName: "balanceOf",
          args: [testAddress],
        },
      ],
    });
    console.log("result for fetch", result);
    return {
      USDC: {
        name: result[0].result,
        decimals: result[1].result,
        symbol: result[2].result,
        balance: result[3].result?.toString(),
      },
      wstETH: {
        name: result[4].result,
        decimals: result[5].result,
        symbol: result[6].result,
        balance: result[7].result?.toString(),
      },
    };
  } catch (error) {
    console.error("Error in getTokenInfo getTokenInfogetTokenInfo:", error);
    throw new Error(
      `Failed to get token info getTokenInfo getTokenInfo: ${error}`,
    );
  }
}

export const fetchToken = async ({
  address,
  chainId,
}: {
  address: string;
  chainId: ChainId;
}) => {
  const queryOption = {
    address: address as Address,
    abi: erc20Abi,
    chainId,
  } as const;
  try {
    const result = await readContracts(wagmiConfig, {
      contracts: [
        {
          ...queryOption,
          functionName: "name",
        },
        {
          ...queryOption,
          functionName: "decimals",
        },
        {
          ...queryOption,
          functionName: "symbol",
        },
      ],
    });
    // console.log("result for fetch", result);
    return {
      name: result[0].result,
      decimals: result[1].result,
      symbol: result[2].result,
      address,
      chainId,
      logoURI: "",
    };
  } catch (error) {
    console.error("Error in getTokenInfo:", error);
    throw new Error(
      `Failed to get token info getTokenInfo getTokenInfo: ${error}`,
    );
  }
};
