require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    }
  }
};

if (process.env.RPC_URL) {
  config.networks.monadTestnet = {
    url: process.env.RPC_URL,
    chainId: Number(process.env.CHAIN_ID || 10143),
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
  };
}

module.exports = config;

