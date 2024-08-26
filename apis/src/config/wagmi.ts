import { http, createConfig } from "@wagmi/core";
import { base, optimism, sepolia } from "@wagmi/core/chains";

export const wagmiConfig = createConfig({
  chains: [base, optimism, sepolia],
  transports: {
    [base.id]: http(),
    [sepolia.id]: http(),
    [optimism.id]: http(),
  },
});

export const chainIds = [base.id, optimism.id, sepolia.id]
export type ChainId = typeof chainIds[number];