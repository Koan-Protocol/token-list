import { http, createConfig } from "@wagmi/core";
import { liskSepolia, baseSepolia } from "@wagmi/core/chains";

export const wagmiConfig = createConfig({
	chains: [liskSepolia, baseSepolia],
	transports: {
		[liskSepolia.id]: http(),
		[baseSepolia.id]: http(),
	},
});

export const chainIds = [baseSepolia.id, liskSepolia.id];
export type ChainId = (typeof chainIds)[number];
