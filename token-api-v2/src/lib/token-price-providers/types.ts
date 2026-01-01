export interface TokenPrice {
	tokenAddress: string;
	chainId: number | string;
	usdPrice: number;
}

export interface TokenPriceProvider {
	name: string;
	getPrice(
		chainId: number | string,
		tokenAddress: string,
	): Promise<TokenPrice | null>;
}
