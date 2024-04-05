const hre = require("hardhat");
const contractAddr = "Test";

const OWNER_ADDR = process.env.OWNER_ADDR || "";
const ORACLE_CONTRACT_ADDR = process.env.ORACLE_CONTRACT_ADDR || "";
const STABLE_CONTRACT_ADDR = process.env.STABLE_CONTRACT_ADDR || "";

async function main() {

    const stableCntr = await hre.ethers.deployContract("StableRupee", [OWNER_ADDR, ORACLE_CONTRACT_ADDR]);

    await stableCntr.waitForDeployment();

    console.log(
        `Stable coin contract deployed to: ${stableCntr.target}`
    );

    const stackCntr = await hre.ethers.deployContract("StakingRupee", [OWNER_ADDR, stableCntr.target]);

    await stackCntr.waitForDeployment();

    console.log(
        `StakingRupee contract deployed to: ${stackCntr.target}`
    );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});