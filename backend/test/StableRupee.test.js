const { assert, expect } = require("chai");
const { ethers } = require("hardhat")
const { BN } = require('@openzeppelin/test-helpers');
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const ORACLE_CONTRACT_ADDR = process.env.ORACLE_CONTRACT_ADDR || "";

describe("StableRupee tests", function () {

    async function deployContract() {

        const [owner, addr1, addr2, addr3] = await ethers.getSigners();
        const factory = await ethers.getContractFactory("StableRupee", owner);
        const contract = await factory.deploy(owner, ORACLE_CONTRACT_ADDR);

        return { contract, owner, addr1, addr2, addr3 }
    }

    describe("Checking deployment process", function () {

        it("Should deploy the smart contract", async function () {
            const { contract } = await loadFixture(deployContract);
            expect(await contract.name()).to.equal("Stable Lankan Rupee");
            expect(await contract.symbol()).to.equal("LKRS");
        });
    });

    describe("Testing mint function", function () {

        it("Should not be able to mint if not owner", async function () {
            const { contract, owner, addr1, addr2 } = await loadFixture(deployContract);
            // Try to mint LKRS not beeing owner
            await expect(contract.connect(addr1).mint(addr2, 1000000))
                .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount")
        });

        it("Should mint LKRS of the reqused amount", async function () {
            const { contract, owner, addr1, addr2 } = await loadFixture(deployContract);
            let transcation = await contract.mint(addr1, 1000000);
            await transcation.wait();

            const val = await contract.balanceOf(addr1);
            expect(val).to.be.equal(1000000);
        });
    });

    describe("Testing buy function", function () {

        it("Should not be able to buy with empty ETH", async function () {
            const { contract, owner, addr1, addr2 } = await loadFixture(deployContract);
            // Try to buy LKRS without eth
            await expect(contract.connect(addr1).buy())
                .to.be.revertedWithCustomError(contract, "EmptyValue")
        });

        it("Should mint LKRS and emit buy event", async function () {
            const { contract, owner, addr1, addr2 } = await loadFixture(deployContract);
            await expect(contract.connect(addr1).buy({ value: ethers.parseEther("0.5") }))
                .to.emit(contract, "Buy");
        });

        it("Should mint LKRS of the ETH corresponding USD amount", async function () {
            const { contract, owner, addr1, addr2 } = await loadFixture(deployContract);
            let ethAmount = "2";
            let transcation = await contract.connect(addr1).buy({ value: ethers.parseEther(ethAmount) });
            await transcation.wait();

            let ethusd = await contract.connect(addr1).getEthUsdRate();
            let usdlkr = await contract.connect(addr1).getUsdRupeeRate();
            let decimal = await contract.connect(addr1).decimals();
            let val = await contract.connect(addr1).balanceOf(addr1);
            let res = (Number(ethAmount) * Number(ethusd) * Number(usdlkr) / 10 ** Number(decimal));

            expect(Number(val)).to.be.equal(res);
        });
    });

    describe("Testing withdrawAllEth function", function () {

        it("Should not be able to withdraw if not owner", async function () {
            const { contract, owner, addr1, addr2 } = await loadFixture(deployContract);
            // Try to withdraw LKRS not beeing owner
            await expect(contract.connect(addr1).withdrawAllEth())
                .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount")
        });

        it("Should not be able to withdraw with empty balance", async function () {
            const { contract, owner, addr1, addr2 } = await loadFixture(deployContract);
            // Try to withdraw LKRS not beeing owner
            await expect(contract.withdrawAllEth())
                .to.be.revertedWithCustomError(contract, "ERC20InsufficientBalance")
        });

        it("Should send all ETH of the contract to owner", async function () {
            const { contract, owner, addr1, addr2 } = await loadFixture(deployContract);
            let transcation = await contract.connect(addr1).buy({ value: ethers.parseEther("100") });
            await transcation.wait();

            let aBalanceETH = await ethers.provider.getBalance(owner);

            // Try to withdraw all ETH of the LKRS contract to owner
            transcation = await contract.withdrawAllEth();
            await transcation.wait();

            let bBalanceETH = await ethers.provider.getBalance(owner)

            expect(BN(bBalanceETH)).to.be.greaterThan(BN(aBalanceETH));
        });
    });

    describe("Testing getEthUsdRate function", function () {

        it("Should return ETH/USD exchange rate", async function () {
            const { contract, owner, addr1, addr2 } = await loadFixture(deployContract);
            let ethusd = await contract.getEthUsdRate()
            expect(ethusd).to.be.greaterThan(0);
        });
    });

    describe("Testing getUsdRupeeRate function", function () {

        it("Should return USD/LKR exchange rate", async function () {
            const { contract, owner, addr1, addr2 } = await loadFixture(deployContract);
            let rate = await contract.getUsdRupeeRate()
            expect(rate).to.be.greaterThan(0);
        });
    });
});
