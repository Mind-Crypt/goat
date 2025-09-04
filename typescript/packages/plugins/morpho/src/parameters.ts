import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class SupplyParams extends createToolParameters(
    z.object({
        marketId: z.string().describe("The market ID (bytes32) to supply to"),
        assets: z.string().describe("The amount of assets to supply in base units"),
        shares: z.string().optional().default("0").describe("The amount of shares to supply (use 0 for exact assets)"),
        onBehalf: z.string().optional().describe("The address to supply on behalf of (defaults to wallet address)"),
    }),
) {}

export class WithdrawParams extends createToolParameters(
    z.object({
        marketId: z.string().describe("The market ID (bytes32) to withdraw from"),
        assets: z.string().describe("The amount of assets to withdraw in base units"),
        shares: z
            .string()
            .optional()
            .default("0")
            .describe("The amount of shares to withdraw (use 0 for exact assets)"),
        onBehalf: z.string().optional().describe("The address to withdraw on behalf of (defaults to wallet address)"),
        receiver: z.string().optional().describe("The address to receive the assets (defaults to wallet address)"),
    }),
) {}

export class BorrowParams extends createToolParameters(
    z.object({
        marketId: z.string().describe("The market ID (bytes32) to borrow from"),
        assets: z.string().describe("The amount of assets to borrow in base units"),
        shares: z.string().optional().default("0").describe("The amount of shares to borrow (use 0 for exact assets)"),
        onBehalf: z.string().optional().describe("The address to borrow on behalf of (defaults to wallet address)"),
        receiver: z
            .string()
            .optional()
            .describe("The address to receive the borrowed assets (defaults to wallet address)"),
    }),
) {}

export class RepayParams extends createToolParameters(
    z.object({
        marketId: z.string().describe("The market ID (bytes32) to repay to"),
        assets: z.string().describe("The amount of assets to repay in base units"),
        shares: z.string().optional().default("0").describe("The amount of shares to repay (use 0 for exact assets)"),
        onBehalf: z.string().optional().describe("The address to repay on behalf of (defaults to wallet address)"),
    }),
) {}

export class SupplyCollateralParams extends createToolParameters(
    z.object({
        marketId: z.string().describe("The market ID (bytes32) to supply collateral to"),
        assets: z.string().describe("The amount of collateral assets to supply in base units"),
        onBehalf: z
            .string()
            .optional()
            .describe("The address to supply collateral on behalf of (defaults to wallet address)"),
    }),
) {}

export class WithdrawCollateralParams extends createToolParameters(
    z.object({
        marketId: z.string().describe("The market ID (bytes32) to withdraw collateral from"),
        assets: z.string().describe("The amount of collateral assets to withdraw in base units"),
        onBehalf: z
            .string()
            .optional()
            .describe("The address to withdraw collateral on behalf of (defaults to wallet address)"),
        receiver: z.string().optional().describe("The address to receive the collateral (defaults to wallet address)"),
    }),
) {}

export class MarketPositionParams extends createToolParameters(
    z.object({
        marketId: z.string().describe("The market ID (bytes32) to check"),
        user: z.string().describe("The address to check the position of"),
    }),
) {}

export class MarketInfoParams extends createToolParameters(
    z.object({
        marketId: z.string().describe("The market ID (bytes32) to get information for"),
    }),
) {}
