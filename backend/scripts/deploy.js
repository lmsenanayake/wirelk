const hre = require("hardhat");
const contractAddr = "Test";

const ORACLE_CONTRACT_ADDR = process.env.ORACLE_CONTRACT_ADDR || "";
const STABLE_CONTRACT_ADDR = process.env.STABLE_CONTRACT_ADDR || "";

async function main() {

    const owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    /*const stableCntr = await hre.ethers.deployContract("StableRupee", [owner, ORACLE_CONTRACT_ADDR]);

    await stableCntr.waitForDeployment();

    console.log(
        `Stable coin contract deployed to ${stableCntr.target}`
    );*/

    const stackCntr = await hre.ethers.deployContract("StakingRupee", [owner, STABLE_CONTRACT_ADDR]);

    await stackCntr.waitForDeployment();

    console.log(
        `Staking contract deployed to ${stackCntr.target}`
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});