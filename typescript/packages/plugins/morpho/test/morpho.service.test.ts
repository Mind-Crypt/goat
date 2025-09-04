import type { ViemEVMWalletClient } from "@goat-sdk/wallet-viem";
import { viem } from "@goat-sdk/wallet-viem";
import { http, createPublicClient, createWalletClient, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { MorphoService } from "../src/morpho.service";
import { ERC20_ABI } from "./utils/erc20.abi";

// Constants for the test
const MARKET_ID = "0xe36464b73c0c39836918f7b2b9a6f1a8b70d7bb9901b38f29544d9b96119862e";
const LOAN_TOKEN_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`; // USDC on Base Sepolia
const LOAN_TOKEN_DECIMALS = 6;
const MORPHO_ADDRESS = "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb"; // Morpho address on Base Sepolia

// Skip this test in CI environments as it requires real funds
// Only run this when explicitly testing real on-chain interactions
describe("MorphoService - Real On-Chain Tests", () => {
    // This requires a funded private key - DO NOT commit real private keys!
    // For testing, generate a random key and fund it on Base Sepolia
    // const PRIVATE_KEY = process.env.TEST_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
    const PRIVATE_KEY = "0x5db39d7e158c9798b5d73560fbc65258153584f644e465d40118bdbd9dbc0bbb";

    let viemWalletClient: ViemEVMWalletClient;
    let morphoService: MorphoService;
    let accountAddress: string;

    beforeAll(async () => {
        // Make sure we have a private key
        // if (PRIVATE_KEY === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        //     throw new Error("TEST_PRIVATE_KEY environment variable not set. Set it to run real on-chain tests.");
        // }

        // Create a wallet client with the private key
        const account = privateKeyToAccount(PRIVATE_KEY);
        accountAddress = account.address;

        const publicClient = createPublicClient({
            chain: baseSepolia,
            transport: http(),
        });

        // Create the viem wallet client
        const walletClient = createWalletClient({
            account,
            chain: baseSepolia,
            transport: http(),
        });

        // Create our ViemWalletClient wrapper
        viemWalletClient = viem(walletClient);

        // Create our MorphoService
        morphoService = new MorphoService();

        console.log(`Using account ${account.address} on Base Sepolia`);
        console.log("Checking LOAN TOKEN balance...");
        // Check if we have enough test tokens
        const balance = await publicClient.readContract({
            address: LOAN_TOKEN_ADDRESS,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [account.address],
        });
        console.log("LOAN TOKEN balance:", balance);

        if ((balance as bigint) < parseUnits("1", LOAN_TOKEN_DECIMALS)) {
            console.warn("Wallet has less than 1 token. Tests may fail if not enough tokens.");

            // mint tokens
            // await walletClient.writeContract({
            //     address: LOAN_TOKEN_ADDRESS,
            //     abi: ERC20_ABI,
            //     functionName: "mint",
            //     args: [accountAddress as `0x${string}`, parseEther("5")]
            // });
        }

        // Check if we have approved Morpho to spend tokens
        console.log("Checking token allowance to Morpho...");
        const allowance = await publicClient.readContract({
            address: LOAN_TOKEN_ADDRESS,
            abi: ERC20_ABI,
            functionName: "allowance",
            args: [account.address, MORPHO_ADDRESS],
        });

        if ((allowance as bigint) < parseUnits("1", LOAN_TOKEN_DECIMALS)) {
            console.log("Approving Morpho to spend tokens...");

            const { request } = await publicClient.simulateContract({
                account,
                address: LOAN_TOKEN_ADDRESS,
                abi: ERC20_ABI,
                functionName: "approve",
                args: [MORPHO_ADDRESS, parseUnits("1", LOAN_TOKEN_DECIMALS)],
            });

            const approveTxHash = await walletClient.writeContract(request);
            console.log(`Allowance Approval transaction: ${approveTxHash}`);

            // Wait for the transaction to be mined
            await new Promise((resolve) => setTimeout(resolve, 15000));
        }
    }, 30000); // 30 second timeout for setup

    test("should retrieve market parameters correctly", async () => {
        const marketParams = await morphoService.getMarketParamsById(viemWalletClient, {
            marketId: MARKET_ID,
        });

        expect(marketParams.loanToken.toLowerCase()).toBe(LOAN_TOKEN_ADDRESS.toLowerCase());
        expect(marketParams.collateralToken).toBeDefined();
        expect(marketParams.oracle).toBeDefined();
        expect(marketParams.irm).toBeDefined();
        expect(marketParams.lltv).toBeDefined();

        console.log("Market Parameters:", marketParams);
    }, 15000); // 15 second timeout

    test("should retrieve market info correctly", async () => {
        const marketInfo = await morphoService.getMarketInfo(viemWalletClient, {
            marketId: MARKET_ID,
        });

        expect(marketInfo.totalSupplyAssets).toBeDefined();
        expect(marketInfo.totalBorrowAssets).toBeDefined();
        expect(marketInfo.totalSupplyShares).toBeDefined();
        expect(marketInfo.totalBorrowShares).toBeDefined();
        expect(marketInfo.fee).toBeDefined();

        console.log("Market Info:", marketInfo);
    }, 15000); // 15 second timeout

    test("should supply tokens to the market", async () => {
        // Only run this test if you want to actually supply tokens
        // This will cost gas and require real tokens
        // Supply a small amount for testing
        const supplyAmount = parseUnits("1", LOAN_TOKEN_DECIMALS).toString();

        const txHash = await morphoService.supply(viemWalletClient, {
            marketId: MARKET_ID,
            assets: supplyAmount,
            shares: "0",
        });

        console.log(`Supply transaction: ${txHash}`);
        expect(txHash).toBeDefined();

        // Wait for the transaction to be mined
        await new Promise((resolve) => setTimeout(resolve, 15000));

        // Verify position was updated
        const position = await morphoService.getPosition(viemWalletClient, {
            marketId: MARKET_ID,
            user: accountAddress,
        });

        expect(BigInt(position.supplyShares)).toBeGreaterThan(BigInt(0));
        console.log("Updated Position:", position);
    }, 30000); // 30 second timeout

    test("should get user position correctly", async () => {
        const position = await morphoService.getPosition(viemWalletClient, {
            marketId: MARKET_ID,
            user: accountAddress,
        });

        expect(position.supplyShares).toBeDefined();
        expect(position.borrowShares).toBeDefined();
        expect(position.collateral).toBeDefined();

        console.log("User Position:", position);
    }, 15000); // 15 second timeout
});

/**
// Also include the simple mock tests to ensure both approaches work
describe("MorphoService - Mock Tests", () => {
    // Simple mock tests as a fallback when we can't run real on-chain tests
    let morphoService: MorphoService;

    // Create a mock for EVMWalletClient
    const mockWalletClient = {
        getChain: jest.fn().mockReturnValue({ id: 84532 }), // Base Sepolia
        getAddress: jest.fn().mockReturnValue('0xTestAddress'),
        read: jest.fn(),
        sendTransaction: jest.fn().mockResolvedValue({ hash: '0xTransactionHash' }),
    } as unknown as jest.Mocked<EVMWalletClient>;

    beforeEach(() => {
        morphoService = new MorphoService();
        jest.clearAllMocks();

        // Mock the read function to return market parameters
        mockWalletClient.read.mockImplementation(({ functionName }) => {
            if (functionName === 'idToMarketParams') {
                return [
                    LOAN_TOKEN_ADDRESS,
                    '0xeE069A03D78DeF7528D657e1BE7f1d41d9f1D2D9', // collateralToken 
                    '0x80f2c02224a2E548FC67c0bF705eBFA825dd535a', // oracle
                    '0xB9B48477c1d6e7E588F112D3a1f6B8100186A811', // irm
                    BigInt('500000000000000000') // lltv
                ];
            }
            return [];
        });
    });

    test("mock - supply should call the correct contract method", async () => {
        const result = await morphoService.supply(mockWalletClient, {
            marketId: MARKET_ID,
            assets: '1000000000000000000', // 1 token
        });

        expect(result).toBe('0xTransactionHash');
        expect(mockWalletClient.sendTransaction).toHaveBeenCalled();
    });
});
 */
