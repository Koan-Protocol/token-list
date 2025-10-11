import { Address } from "viem";

export const COUNTER_ABI = [
	{
		type: "constructor",
		inputs: [
			{
				name: "_intervalSeconds",
				type: "uint256",
				internalType: "uint256",
			},
		],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "checkpoint",
		inputs: [],
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "counter",
		inputs: [],
		outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "interval",
		inputs: [],
		outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "lastTimestamp",
		inputs: [],
		outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "latestRecord",
		inputs: [],
		outputs: [
			{
				name: "",
				type: "tuple",
				internalType: "struct Counter.AccuracyRecord",
				components: [
					{ name: "count", type: "uint256", internalType: "uint256" },
					{
						name: "expectedTimestamp",
						type: "uint256",
						internalType: "uint256",
					},
					{
						name: "actualTimestamp",
						type: "uint256",
						internalType: "uint256",
					},
					{
						name: "offsetSeconds",
						type: "int256",
						internalType: "int256",
					},
					{ name: "caller", type: "address", internalType: "address" },
				],
			},
		],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "owner",
		inputs: [],
		outputs: [{ name: "", type: "address", internalType: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "records",
		inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
		outputs: [
			{ name: "count", type: "uint256", internalType: "uint256" },
			{
				name: "expectedTimestamp",
				type: "uint256",
				internalType: "uint256",
			},
			{
				name: "actualTimestamp",
				type: "uint256",
				internalType: "uint256",
			},
			{ name: "offsetSeconds", type: "int256", internalType: "int256" },
			{ name: "caller", type: "address", internalType: "address" },
		],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "renounceOwnership",
		inputs: [],
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "totalRecords",
		inputs: [],
		outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "transferOwnership",
		inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		name: "Checkpoint",
		inputs: [
			{
				name: "count",
				type: "uint256",
				indexed: true,
				internalType: "uint256",
			},
			{
				name: "expectedTimestamp",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
			{
				name: "actualTimestamp",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
			{
				name: "offsetSeconds",
				type: "int256",
				indexed: false,
				internalType: "int256",
			},
			{
				name: "caller",
				type: "address",
				indexed: true,
				internalType: "address",
			},
		],
		anonymous: false,
	},
	{
		type: "event",
		name: "OwnershipTransferred",
		inputs: [
			{
				name: "previousOwner",
				type: "address",
				indexed: true,
				internalType: "address",
			},
			{
				name: "newOwner",
				type: "address",
				indexed: true,
				internalType: "address",
			},
		],
		anonymous: false,
	},
	{
		type: "error",
		name: "OwnableInvalidOwner",
		inputs: [{ name: "owner", type: "address", internalType: "address" }],
	},
	{
		type: "error",
		name: "OwnableUnauthorizedAccount",
		inputs: [{ name: "account", type: "address", internalType: "address" }],
	},
] as const;

export const COUNTER_CONTRACT_ADDRESS: Address = "0xYourCounterContractAddress";

export const BASE_RPC_URL =
	"https://lb.drpc.live/base/Asv5pVcZpEZuuMS7ScKuU2eUvqwk0b0R75_VQkTKRtpJ";
