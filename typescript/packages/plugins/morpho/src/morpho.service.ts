import { Tool } from "@goat-sdk/core";
import type { ViemEVMWalletClient } from "@goat-sdk/wallet-viem";
import type { Abi } from "viem";
import { MORPHO_ABI } from "./abi/morpho";
import { MarketInfoParams, MarketPositionParams, SupplyParams } from "./parameters";
import { getMorphoAddresses } from "./types/ChainSpecifications";

export class MorphoService {
    @Tool({
        name: "morpho_supply",
        description: "Supply assets to a Morpho market using market ID",
    })
    async supply(walletClient: ViemEVMWalletClient, parameters: SupplyParams) {
        try {
            const { morphoAddress } = getMorphoAddresses(walletClient.getChain().id);
            const onBehalf = parameters.onBehalf || walletClient.getAddress();

            // Get market params from market ID
            const marketParams = await this.getMarketParams(walletClient, parameters.marketId);
            console.log("Morpho Supply tool::market params:", marketParams);

            const hash = await walletClient.sendTransaction({
                to: morphoAddress,
                abi: MORPHO_ABI as Abi,
                functionName: "supply",
                args: [
                    marketParams,
                    BigInt(parameters.assets),
                    BigInt(parameters.shares || "0"),
                    onBehalf,
                    "0x", // data
                ],
            });
            return hash.hash;
        } catch (error) {
            throw Error(`Failed to supply to Morpho: ${error}`);
        }
    }

    @Tool({
        name: "morpho_get_position",
        description: "Get the position of a user in a Morpho market using market ID",
    })
    async getPosition(walletClient: ViemEVMWalletClient, parameters: MarketPositionParams) {
        try {
            const { morphoAddress } = getMorphoAddresses(walletClient.getChain().id);

            const positionResult = await walletClient.read({
                address: morphoAddress,
                abi: MORPHO_ABI as Abi,
                functionName: "position",
                args: [parameters.marketId, parameters.user],
            });

            const position = positionResult.value as [bigint, bigint, bigint];
            return {
                supplyShares: position[0].toString(),
                borrowShares: position[1].toString(),
                collateral: position[2].toString(),
            };
        } catch (error) {
            throw Error(`Failed to get position from Morpho: ${error}`);
        }
    }

    @Tool({
        name: "morpho_get_market_info",
        description: "Get information about a Morpho market using market ID",
    })
    async getMarketInfo(walletClient: ViemEVMWalletClient, parameters: MarketInfoParams) {
        try {
            const { morphoAddress } = getMorphoAddresses(walletClient.getChain().id);
            const marketResult = await walletClient.read({
                address: morphoAddress,
                abi: MORPHO_ABI as Abi,
                functionName: "market",
                args: [parameters.marketId],
            });

            const market = marketResult.value as [bigint, bigint, bigint, bigint, bigint, bigint];

            return {
                totalSupplyAssets: market[0].toString(),
                totalSupplyShares: market[1].toString(),
                totalBorrowAssets: market[2].toString(),
                totalBorrowShares: market[3].toString(),
                lastUpdate: market[4].toString(),
                fee: market[5].toString(),
            };
        } catch (error) {
            throw Error(`Failed to get market info from Morpho: ${error}`);
        }
    }

    @Tool({
        name: "morpho_get_market_params",
        description: "Get the market parameters for a given market ID",
    })
    async getMarketParamsById(walletClient: ViemEVMWalletClient, parameters: MarketInfoParams) {
        try {
            const marketParams = await this.getMarketParams(walletClient, parameters.marketId);
            return {
                loanToken: marketParams.loanToken,
                collateralToken: marketParams.collateralToken,
                oracle: marketParams.oracle,
                irm: marketParams.irm,
                lltv: marketParams.lltv.toString(),
            };
        } catch (error) {
            throw Error(`Failed to get market params from Morpho: ${error}`);
        }
    }

    // Helper function to get market params from market ID
    private async getMarketParams(walletClient: ViemEVMWalletClient, marketId: string) {
        const { morphoAddress } = getMorphoAddresses(walletClient.getChain().id);
        const marketParamsResult = await walletClient.read({
            address: morphoAddress,
            abi: MORPHO_ABI as Abi,
            functionName: "idToMarketParams",
            args: [marketId],
        });

        const [loanToken, collateralToken, oracle, irm, lltv] = marketParamsResult.value as [
            string,
            string,
            string,
            string,
            bigint,
        ];

        return {
            loanToken,
            collateralToken,
            oracle,
            irm,
            lltv,
        };
    }
}
