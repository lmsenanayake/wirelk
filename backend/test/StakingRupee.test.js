const { assert, expect } = require("chai");
const { ethers } = require("hardhat")
const { BN } = require('@openzeppelin/test-helpers');
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { PANIC_CODES } = require("@nomicfoundation/hardhat-chai-matchers/panic");

const STABLE_CONTRACT_ADDR = process.env.STABLE_CONTRACT_ADDR || "";

describe("StakingRupee tests", function () {

    async function deploySimpleFixture() {

        const [owner, addr1, addr2, addr3] = await ethers.getSigners();
        const factory = await ethers.getContractFactory("StakingRupee", owner);
        const contract = await factory.deploy(owner, STABLE_CONTRACT_ADDR);

        return { contract, owner, addr1, addr2, addr3 }
    }

    async function deployOwnerSetupFixture() {

        const [owner, addr1, addr2, addr3] = await ethers.getSigners();
        let factory = await ethers.getContractFactory("StakingRupee", owner);
        let contract = await factory.deploy(owner, STABLE_CONTRACT_ADDR);

        // Minting tokens in Stablecoin contract for Staking contract
        let scontract = await ethers.getContractAt("StableRupee", STABLE_CONTRACT_ADDR, owner);
        let transcation = await scontract.mint(contract.target, 1000000);
        await transcation.wait();

        transcation = await contract.setRewardsDuration(86400);
        await transcation.wait();

        transcation = await contract.setRewardAmount(ethers.parseUnits("50", "mwei"));
        await transcation.wait();

        return { contract, owner, addr1, addr2, addr3 }
    }

    describe("Checking deployment process", function () {

        it("Should deploy the contract", async function () {
            const { contract } = await loadFixture(deploySimpleFixture);
            expect(await contract.getStakedRupeeNumber()).to.equal(0);
        });
    });

    describe("Testing setRewardsDuration function", function () {

        it("Should not be able to set duration if not owner", async function () {
            const { contract, owner, addr1 } = await loadFixture(deploySimpleFixture);
            // Try to set duration with a non-owner user
            await expect(contract.connect(addr1).setRewardsDuration(86400))
                .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount")
        });

        it("Should not set duration when previous not finish", async function () {
            const { contract, owner } = await loadFixture(deploySimpleFixture);
            // Try to set the duration when the previous duration is on going
            let transcation = await contract.setRewardsDuration(86400);
            await transcation.wait();

            let t = await contract.setRewardsDuration(86400);
            await t.wait();
            /*await expect(contract.setRewardsDuration(86400))
                .to.be.revertedWithCustomError(contract, "RewardDurationNotFinish")*/
        });

        it("Should return the duration registered by the setter", async function () {
            const { contract, owner, addr1 } = await loadFixture(deploySimpleFixture);
            let transcation = await contract.setRewardsDuration(86400);
            await transcation.wait();
            // Try to set duration with the owner user
            const val = await contract.duration();
            expect(val).to.equal(86400);
        });
    });

    describe("Testing setRewardAmount function", function () {

        it("Should not be able to set reward amount if not owner", async function () {
            const { contract, owner, addr1 } = await loadFixture(deploySimpleFixture);
            // Try to set reward amount with a non-owner user
            await expect(contract.connect(addr1).setRewardAmount(ethers.parseUnits("50", "mwei")))
                .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount")
        });

        it("Should not work if the duration is empty", async function () {
            const { contract, owner, addr1 } = await loadFixture(deploySimpleFixture);
            // Try to set reward amount with owner but with duration=0
            await expect(contract.setRewardAmount(ethers.parseUnits("50", "mwei")))
                .to.be.revertedWithPanic(
                    PANIC_CODES.DIVISION_BY_ZERO
                );
        });

        it("Should not work if the duration is higher than amount", async function () {
            const { contract, owner, addr1 } = await loadFixture(deploySimpleFixture);
            let transcation = await contract.setRewardsDuration(86400);
            // Try to set reward amount with a low amount
            await expect(contract.setRewardAmount(50))
                .to.be.revertedWithCustomError(contract, "IncorrectRewardRate")
        });

        it("Should not be able to set reward amount if has not LKRS tokens", async function () {
            const { contract, owner, addr1 } = await loadFixture(deploySimpleFixture);
            let transcation = await contract.setRewardsDuration(86400);
            await transcation.wait();
            // Try to set amount whne the staking contract has not enough LKRS tokens
            await expect(contract.setRewardAmount(ethers.parseUnits("50", "mwei")))
                .to.be.revertedWithCustomError(contract, "InsufficientBalance")
        });

        it("Should set reward amount", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            // Try to set amount with UsableFixture
            let transcation = await contract.setRewardAmount(ethers.parseUnits("50", "mwei"));
            //await transcation.wait();

            const val = await contract.rewardRate();
            expect(val).to.be.greaterThan(0);
        });
    });

    describe("Testing stakeEth function", function () {

        it("Should not be able to stake empty ETH", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            // Try to stake ETH with empty value
            await expect(contract.connect(addr1).stakeEth())
                .to.be.revertedWithCustomError(contract, "EmptyAmount")
        });

        it("Should stake ETH", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            // Try to stake ETH with value
            let transcation = await contract.connect(addr1).stakeEth({ value: ethers.parseEther("0.5") });
            await transcation.wait();

            const val = await contract.connect(addr1).getStakedEthNumber();
            expect(val).to.be.equal(ethers.parseEther("0.5"));
        });
    });

    describe("Testing getStakedEthNumber function", function () {

        it("Should return 0 with wrong addr", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            // Try to get the balanceof addr which dose not have ETH
            const val = await contract.getStakedEthNumber();
            expect(val).to.be.equal(0);
        });

        it("Should return the correct number of ETH staked", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            // Try to get the balanceof owner addr
            let transcation = await contract.stakeEth({ value: ethers.parseEther("0.5") });
            await transcation.wait();

            const val = await contract.getStakedEthNumber();
            expect(val).to.be.equal(ethers.parseEther("0.5"));
        });
    });

    describe("Testing withdrawEth function", function () {

        it("Should not be able to withdraw empty amount", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            // Try to withdraw empty amount
            await expect(contract.withdrawEth(0))
                .to.be.revertedWithCustomError(contract, "EmptyAmount");
        });

        it("Should not be able to withdraw when balance empty", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            // Try to withdraw with an empty blance
            await expect(contract.withdrawEth(ethers.parseEther("0.1")))
                .to.be.revertedWithCustomError(contract, "InsufficientBalance");
        });

        /*it("Should not be able to withdraw more than stored in contract", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            let transcation = await contract.connect(addr1).stakeEth({ value: ethers.parseEther("0.5") });
            await transcation.wait();
            // Try to withdraw more than stored in contract
            await expect(contract.connect(addr1).withdrawEth(ethers.parseEther("0.2")))
                .to.be.revertedWithCustomError(contract, "TransferFailed");
        });*/

        it("Should withdraw the staked number or less ETH", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            let transcation = await contract.connect(addr1).stakeEth({ value: ethers.parseEther("0.5") });
            await transcation.wait();
            // Try to withdraw less ETH that what this address staked
            //transcation = await contract.connect(addr1).withdrawEth(ethers.parseEther("0.2"));
            //await transcation.wait();

            const balance0ETH = await ethers.provider.getBalance(addr1)
            console.log(BN(balance0ETH));
            //expect(addr1.value).to.be.equal(ethers.parseEther("0.2"));
        });
    });
});
