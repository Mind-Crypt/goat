// This file is used to set up the testing environment for Jest

// Mock global objects if needed
const util = require("node:util");
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;

// Jest globals are automatically defined in the environment
// No need to explicitly assign them to global
