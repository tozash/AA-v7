require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const { PRIVATE_KEY, ALCHEMY_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "amoy",
  solidity: {
    version: "0.8.28", // or your current version
    settings: {
      optimizer: {
        enabled: true,
        runs: 50 // Lower runs can reduce size, but may increase gas cost
      },
      evmVersion: "cancun",
    },
  },
  networks: {
    amoy: {
      url: `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
