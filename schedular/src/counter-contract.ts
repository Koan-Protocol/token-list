import { createWalletClient, http } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import {
	simulateContract,
	writeContract,
	waitForTransactionReceipt,
} from "viem/actions";
import {
	BASE_RPC_URL,
	COUNTER_ABI,
	COUNTER_CONTRACT_ADDRESS,
} from "./contract-utils";

export async function runCheckpoint(
	privateKey: `0x${string}`,
): Promise<{ txHash: `0x${string}`; offset: bigint }> {
	// Defensive runtime validation to avoid crashes inside viem
	// if (
	// 	!privateKey ||
	// 	typeof privateKey !== "string" ||
	// 	!/^0x[0-9a-fA-F]{64}$/.test(privateKey)
	// ) {
	// 	throw new TypeError(
	// 		"Invalid PRIVATE KEY provided to runCheckpoint. Expected 0x-prefixed 64-hex string.",
	// 	);
	// }
	// Create client once (required for actions)
	const walletClient = createWalletClient({
		account: privateKeyToAccount(privateKey),
		chain: base,
		transport: http(BASE_RPC_URL),
	});

	// Simulate with direct action (passes client first)
	const { request } = await simulateContract(walletClient, {
		address: COUNTER_CONTRACT_ADDRESS,
		abi: COUNTER_ABI,
		functionName: "checkpoint",
		account: walletClient.account,
	});

	const txHash = await writeContract(walletClient, request);

	const receipt = await waitForTransactionReceipt(walletClient, {
		hash: txHash,
	});

	console.log({ receipt });

	// To get offset: Use a PublicClient for read (create one if needed)
	// For demo, import createPublicClient and read latestRecord post-tx
	// const publicClient = createPublicClient({ chain: sepolia, transport: http(rpcUrl) });
	// const latestRecord = await publicClient.readContract({ ... 'latestRecord' ... });
	// const offset = latestRecord.offsetSeconds;
	const offset = 0n; // Placeholder—fetch via readContract in prod

	console.log({ txHash, offset });

	return { txHash, offset };
}
