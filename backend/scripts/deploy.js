const hre = require("hardhat");
const contractAddr = "Test";

async function main() {
  
    const owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const oracleEthUsd = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";

    const contract = await hre.ethers.deployContract("StableRupee", [owner, oracleEthUsd]);

    await contract.waitForDeployment();

    console.log(
        `Contract deployed to ${contract.target}`
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});