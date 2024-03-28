const hre = require("hardhat");

const STABLE_CONTRACT_ADDR = process.env.STABLE_CONTRACT_ADDR || "";
const STAKING_CONTRACT_ADDR = process.env.STAKING_CONTRACT_ADDR || "";

async function main() {

    // récuperation du contrat
    const contract = await ethers.getContractFactory('StableRupee');

    // connexion au contrat déployé
    const dcontract = contract.attach(STABLE_CONTRACT_ADDR);

    let owner = await dcontract.owner();
    console.log('Contract owner : ', owner);

    // Minting LKRS tokens to owner
    await dcontract.mint(owner, 50000);
    // Minting LKRS tokens to Staking contract addr
    await dcontract.mint(STAKING_CONTRACT_ADDR, 1000000);

    const contractBalance = await ethers.provider.getBalance(dcontract);
    console.log('Contract balance: ', contractBalance.toString());

    const ownerBalance = await dcontract.balanceOf(owner);
    console.log('Owner balance: ', ownerBalance.toString());

    const stakingBalance = await dcontract.balanceOf(STAKING_CONTRACT_ADDR);
    console.log('Staking contract balance: ', stakingBalance.toString());

    const totalSup = await dcontract.totalSupply();
    console.log('Total supply: ', totalSup.toString());

    const ethusd = await dcontract.getEthUsdRate();
    console.log('ETH/USD exhange price: ', ethusd.toString());

    // const impersonatedSigner = await ethers.getImpersonatedSigner("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
    // const amountOne = ethers.parseEther("1");
    // await dcontract.connect(impersonatedSigner).buy({ value: amountOne });

    // const userBalance = await dcontract.balanceOf("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
    // console.log('User LKRS balance: ', userBalance.toString());

    // const impersonatedSigner = await ethers.getImpersonatedSigner("0xfc075580e44c9f1272abe1e08c63e54ca92cc46e");

    // let balance = await weth.balanceOf(impersonatedSigner.address);
    // console.log('Account balance one : ', ethers.formatEther(balance));


    // const amountOne = ethers.parseEther("1");
    // await weth.connect(impersonatedSigner).deposit({ value: amountOne });

    // balance = await weth.balanceOf(impersonatedSigner.address);
    // console.log('Account balance two : ', ethers.formatEther(balance));

    // const amount = ethers.parseEther("0.5");
    // await weth.connect(impersonatedSigner).withdraw(amount);

    // balance = await weth.balanceOf(impersonatedSigner.address);
    // console.log('Account balance three : ', ethers.formatEther(balance));

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});