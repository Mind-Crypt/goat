import { type Chain, PluginBase } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { arbitrum, base, mainnet, baseSepolia } from "viem/chains";
import { MorphoService } from "./morpho.service";

const SUPPORTED_CHAINS = [mainnet, base, arbitrum, baseSepolia];

export class MorphoPlugin extends PluginBase<EVMWalletClient> {
    constructor() {
        super("morpho", [new MorphoService()]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm" && SUPPORTED_CHAINS.some((c) => c.id === chain.id);
}

export const morpho = () => { return new MorphoPlugin(); };
