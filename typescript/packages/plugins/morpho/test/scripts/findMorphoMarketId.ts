import { http, createPublicClient } from "viem";
import { baseSepolia } from "viem/chains";

// Morpho Blue contract address on Base Sepolia
const MORPHO_ADDRESS = "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb"; // Morpho address on Base Sepolia

// The token address you want to find markets for
// Let's try a different USDC address commonly used on Base Sepolia
const LOAN_TOKEN_ADDRESS = "0x036cbd53842c5426634e7929541ec2318f3dcf7e"; // USDC on Base Sepolia

async function findMarkets() {
    console.log(`Looking for Morpho markets with loan token ${LOAN_TOKEN_ADDRESS} on Base Sepolia...`);

    // Use a public client with a more reliable RPC provider
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http("https://base-sepolia-rpc.publicnode.com"),
    });

    // Get current block number
    const latestBlock = await publicClient.getBlockNumber();

    // Define block range size (less than the 50,000 limit)
    // Using a smaller range to get results faster
    const BLOCK_RANGE = 50000;

    // Start from a higher block number for efficiency (Morpho was likely deployed more recently)
    // And paginate through blocks in chunks
    for (let fromBlock = 0; fromBlock < latestBlock; fromBlock += BLOCK_RANGE) {
        const toBlock = Math.min(fromBlock + BLOCK_RANGE - 1, Number(latestBlock));
        console.log(`Searching blocks ${fromBlock} to ${toBlock}...`);

        try {
            const createMarketEvents = await publicClient.getLogs({
                address: MORPHO_ADDRESS,
                event: {
                    type: "event",
                    name: "CreateMarket",
                    inputs: [
                        { indexed: true, name: "id", type: "bytes32" },
                        {
                            indexed: false,
                            name: "marketParams",
                            type: "tuple",
                            components: [
                                { name: "loanToken", type: "address" },
                                { name: "collateralToken", type: "address" },
                                { name: "oracle", type: "address" },
                                { name: "irm", type: "address" },
                                { name: "lltv", type: "uint256" },
                            ],
                        },
                    ],
                },
                fromBlock: BigInt(fromBlock),
                toBlock: BigInt(toBlock),
            });

            // Filter for markets with USDC as loan token
            const usdcMarkets = createMarketEvents.filter(
                (event) => event.args?.marketParams?.loanToken?.toLowerCase() === LOAN_TOKEN_ADDRESS.toLowerCase(),
            );

            if (usdcMarkets.length > 0) {
                console.log(
                    "USDC Markets:",
                    usdcMarkets.map((m) => ({
                        marketId: m.args?.id,
                        collateralToken: m.args?.marketParams?.collateralToken,
                    })),
                );
            }
        } catch (error) {
            console.error(`Error fetching logs for blocks ${fromBlock} to ${toBlock}:`, error);
        }
    }
}

// Execute the function immediately
findMarkets()
    .then(() => console.log("Search complete."))
    .catch((error) => {
        console.error("Error finding markets:", error);
    });

// Export for use in other scripts
export { findMarkets };
