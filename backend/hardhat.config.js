require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const INFURA_SEPOLIA_URL = process.env.INFURA_SEPOLIA_URL || "";
const ALCHEMY_MAINNET_URL = process.env.ALCHEMY_MAINNET_URL || "";
const ETHERSCAN = process.env.ETHERSCAN_API || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
        forking: {
            url: ALCHEMY_MAINNET_URL,
            blockNumber: 19521012
        }
    },
    localhost: {
        url: "http://127.0.0.1:8545",
        chainId: 31337
    },
    sepolia: {
      url: INFURA_SEPOLIA_URL,
      chainId: 11155111,
      accounts: [PRIVATE_KEY],
    }
  },
  solidity: "0.8.24",
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN
    }
  }
};