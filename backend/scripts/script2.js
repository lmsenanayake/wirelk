const hre = require("hardhat");

const STAKING_CONTRACT_ADDR = process.env.STAKING_CONTRACT_ADDR || "";

async function main() {

    // récuperation du contrat
    const contract = await ethers.getContractFactory('StakingRupee');

    // connexion au contrat déployé
    const dcontract = contract.attach(STAKING_CONTRACT_ADDR);

    let owner = await dcontract.owner()
    console.log('Contract owner : ', owner)

    await dcontract.setRewardsDuration(86400)

    const duration = await dcontract.duration();
    console.log('Staking duration: ', duration.toString());

    await dcontract.setRewardAmount(ethers.parseUnits("50", "mwei"))
    const rewardRate = await dcontract.rewardRate();
    console.log('Staking reward rate: ', rewardRate.toString());

    await dcontract.stakeEth({ value: ethers.parseEther("0.5") });
    const ownerBalance = await dcontract.getStakedEthNumber();
    console.log('Owner ETH balance: ', ownerBalance.toString());

    /*const totalSup = await dcontract.totalSupply();
    console.log('Total supply: ', totalSup.toString());

    const ethusd = await dcontract.getEthUsd();
    console.log('ETH/USD exhange price: ', ethusd.toString());

    const impersonatedSigner = await ethers.getImpersonatedSigner("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
    const amountOne = ethers.parseEther("1");
    await dcontract.connect(impersonatedSigner).swap({ value: amountOne });

    const userBalance = await dcontract.balanceOf("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
    console.log('User LKRS balance: ', userBalance.toString());*/

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});