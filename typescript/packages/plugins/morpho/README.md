<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Morpho GOAT Plugin

Interact with [Morpho](https://morpho.org/) lending markets for supplying and managing positions. This tool is a yield generation tool using Morpho, hence does not provide the borrow, repay and collateral features.

## Installation
```
npm install @goat-sdk/plugin-morpho
yarn add @goat-sdk/plugin-morpho
pnpm add @goat-sdk/plugin-morpho
```

## Setup
```typescript
import { morpho } from "@goat-sdk/plugin-morpho";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        morpho(),
    ],
});
```

## Available Tools

### Supply and Withdraw
- `morpho_supply` - Supply assets to a Morpho market using market ID
- `morpho_withdraw` - Withdraw assets from a Morpho market using market ID

### Information
- `morpho_get_position` - Get the position of a user in a Morpho market using market ID
- `morpho_get_market_info` - Get information about a Morpho market using market ID
- `morpho_get_market_params` - Get the market parameters for a given market ID

## Usage

All tools accept a simple `marketId` (bytes32) instead of complex market parameters. The plugin automatically resolves the market parameters using the `idToMarketParams` function from the Morpho contract.

Example USDC based market IDs:
- `0xe36464b73c0c39836918f7b2b9a6f1a8b70d7bb9901b38f29544d9b96119862e` 
- `0xb2dd1e4520f0bc0e8ba88de7d1d76b873289f74635499d5edc8db4a9959c1f77`

The plugin supports the Morpho Blue protocol with simplified market ID-based interactions.

## Supported Chains
- Base Sepolia
