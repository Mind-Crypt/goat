module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleFileExtensions: ["ts", "js", "json"],
    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.test.json",
            },
        ],
    },
    moduleNameMapper: {
        "^@goat-sdk/core$": "<rootDir>/../../core/src",
        "^@goat-sdk/wallet-evm$": "<rootDir>/../../wallets/evm/src",
        "^@goat-sdk/wallet-viem$": "<rootDir>/../../wallets/viem/src",
        "./params.js": "<rootDir>/../../wallets/evm/src/params.ts",
        // Add fallback mappings for workspace packages
        // "^@goat-sdk/(.*)$": "<rootDir>/../../$1/src",
    },
    setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
    testMatch: ["**/test/**/*.test.ts"],
};
