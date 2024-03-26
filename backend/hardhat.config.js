require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const RPC_URL = process.env.INFURA_URL || "";
const ETHERSCAN = process.env.ETHERSCAN_API || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: RPC_URL,
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