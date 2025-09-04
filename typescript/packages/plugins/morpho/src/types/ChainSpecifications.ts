import type { Address } from "viem";

// Define Base Sepolia chain ID
const BASE_SEPOLIA_CHAIN_ID = 84532;

export type ChainSpecifications = Record<
    number,
    {
        morphoAddress: Address;
    }
>;

const chainSpecifications: ChainSpecifications = {
    // Add Base Sepolia testnet
    [BASE_SEPOLIA_CHAIN_ID]: {
        morphoAddress: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb", // Actual Morpho Blue address on Base Sepolia
    },
};

export function getMorphoAddresses(chainId: number) {
    const chainSpec = chainSpecifications[chainId];
    if (!chainSpec) {
        throw new Error(`Chain ID ${chainId} not supported`);
    }
    return {
        morphoAddress: chainSpec.morphoAddress,
    };
}
