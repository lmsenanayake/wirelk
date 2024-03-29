const { assert, expect } = require("chai");
const { ethers } = require("hardhat")
const { BN } = require('@openzeppelin/test-helpers');
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { PANIC_CODES } = require("@nomicfoundation/hardhat-chai-matchers/panic");

const STABLE_CONTRACT_ADDR = process.env.STABLE_CONTRACT_ADDR || "";
const ORACLE_CONTRACT_ADDR = process.env.ORACLE_CONTRACT_ADDR || "";

describe("StakingRupee tests", function () {

    async function deploySimpleFixture() {

        const [owner, addr1, addr2, addr3] = await ethers.getSigners();
        let factory = await ethers.getContractFactory("StableRupee", owner);
        const stableCtr = await factory.deploy(owner, ORACLE_CONTRACT_ADDR);
        await stableCtr.waitForDeployment();
        let stableAddr = await stableCtr.getAddress();

        factory = await ethers.getContractFactory("StakingRupee");
        const contract = await factory.deploy(owner, stableAddr);
        await contract.waitForDeployment();

        return { contract, owner, addr1, addr2, addr3 }
    }

    async function deployOwnerSetupFixture() {

        const [owner, addr1, addr2, addr3] = await ethers.getSigners();
        let factory = await ethers.getContractFactory("StableRupee", owner);
        const stableCtr = await factory.deploy(owner, ORACLE_CONTRACT_ADDR);
        await stableCtr.waitForDeployment();
        let stableAddr = await stableCtr.getAddress();

        factory = await ethers.getContractFactory("StakingRupee", owner);
        let contract = await factory.deploy(owner, stableAddr);

        // Minting tokens in Stablecoin contract for Staking contract
        let transcation = await stableCtr.mint(contract.target, ethers.parseUnits("1000000"));
        await transcation.wait();

        transcation = await contract.setRewardsDuration(86400);
        await transcation.wait();

        transcation = await contract.setRewardAmount(ethers.parseUnits("50"));
        await transcation.wait();

        return { contract, owner, addr1, addr2, addr3 }
    }

    async function deployOwnerSetupFixtureWithStakedETH() {

        const [owner, addr1, addr2, addr3] = await ethers.getSigners();
        let factory = await ethers.getContractFactory("StableRupee", owner);
        const stableCtr = await factory.deploy(owner, ORACLE_CONTRACT_ADDR);
        await stableCtr.waitForDeployment();
        let stableAddr = await stableCtr.getAddress();

        factory = await ethers.getContractFactory("StakingRupee", owner);
        let contract = await factory.deploy(owner, stableAddr);

        // Minting tokens in Stablecoin contract for Staking contract
        let transcation = await stableCtr.mint(contract.target, ethers.parseUnits("1000000"));
        await transcation.wait();

        transcation = await contract.setRewardsDuration(86400);
        await transcation.wait();

        transcation = await contract.setRewardAmount(ethers.parseUnits("50"));
        await transcation.wait();

        transcation = await contract.stakeEth({ value: ethers.parseEther("5000") });
        await transcation.wait();

        return { contract, owner, addr1, addr2, addr3 }
    }

    async function deployOwnerSetupFixtureWithApproveLKRS() {

        const [owner, addr1, addr2, addr3] = await ethers.getSigners();
        let factory = await ethers.getContractFactory("StableRupee", owner);
        const stableCtr = await factory.deploy(owner, ORACLE_CONTRACT_ADDR);
        await stableCtr.waitForDeployment();
        let stableAddr = await stableCtr.getAddress();

        factory = await ethers.getContractFactory("StakingRupee", owner);
        let contract = await factory.deploy(owner, stableAddr);

        // Minting tokens in Stablecoin contract for Staking contract
        let transcation = await stableCtr.mint(contract.target, ethers.parseUnits("1000000"));
        await transcation.wait();
        // Minting tokens in Stablecoin contract for addr1
        transcation = await stableCtr.mint(addr1, ethers.parseUnits("10000"));
        await transcation.wait();
        // Approuving the staking contract as sender
        transcation = await stableCtr.connect(addr1).approve(contract.target, ethers.parseUnits("5000"));
         await transcation.wait();
        // val = await stableCtr.allowance(addr1, contract.target);
        // console.log(val)
        transcation = await contract.setRewardsDuration(86400);
        await transcation.wait();

        transcation = await contract.setRewardAmount(ethers.parseUnits("50"));
        await transcation.wait();

        transcation = await contract.stakeEth({ value: ethers.parseEther("100") });
        await transcation.wait();

        return { contract, owner, addr1, addr2, addr3 }
    }

    async function deployOwnerSetupFixtureWithBothStaked() {

        const [owner, addr1, addr2, addr3] = await ethers.getSigners();
        let factory = await ethers.getContractFactory("StableRupee", owner);
        const stableCtr = await factory.deploy(owner, ORACLE_CONTRACT_ADDR);
        await stableCtr.waitForDeployment();
        let stableAddr = await stableCtr.getAddress();

        factory = await ethers.getContractFactory("StakingRupee", owner);
        let contract = await factory.deploy(owner, stableAddr);

        // Minting tokens in Stablecoin contract for Staking contract
        let transcation = await stableCtr.mint(contract.target, ethers.parseUnits("1000000"));
        await transcation.wait();
        // Minting tokens in Stablecoin contract for addr1
        transcation = await stableCtr.mint(addr1, ethers.parseUnits("10000"));
        await transcation.wait();
        // Approuving the staking contract as sender
        transcation = await stableCtr.connect(addr1).approve(contract.target, ethers.parseUnits("10000"));
         await transcation.wait();
        //  val = await stableCtr.allowance(addr1, contract.target);
         //console.log(addr1)
        transcation = await contract.setRewardsDuration(86400);
        await transcation.wait();

        transcation = await contract.setRewardAmount(ethers.parseUnits("50"));
        await transcation.wait();

        transcation = await contract.connect(addr1).stakeEth({ value: ethers.parseEther("100") });
        await transcation.wait();

        transcation = await contract.connect(addr1).stakeRupee(ethers.parseEther("5000"));
        await transcation.wait();

        return { contract, stableCtr, owner, addr1, addr2, addr3 }
    }

    async function deployOwnerSetupFixtureWithBothStakedComplex() {

        const [owner, addr1, addr2, addr3] = await ethers.getSigners();
        let factory = await ethers.getContractFactory("StableRupee", owner);
        const stableCtr = await factory.deploy(owner, ORACLE_CONTRACT_ADDR);
        await stableCtr.waitForDeployment();
        let stableAddr = await stableCtr.getAddress();

        factory = await ethers.getContractFactory("StakingRupee", owner);
        let contract = await factory.deploy(owner, stableAddr);

        // Minting tokens in Stablecoin contract for Staking contract
        let transcation = await stableCtr.mint(contract.target, ethers.parseUnits("1000000"));
        await transcation.wait();
        // Minting tokens in Stablecoin contract for addr1
        transcation = await stableCtr.mint(addr1, ethers.parseUnits("100000"));
        await transcation.wait();
        transcation = await stableCtr.mint(addr2, ethers.parseUnits("100000"));
        await transcation.wait();
        transcation = await stableCtr.mint(addr3, ethers.parseUnits("100000"));
        await transcation.wait();
        // Approuving the staking contract as sender
        transcation = await stableCtr.connect(addr1).approve(contract.target, ethers.parseUnits("100000"));
        await transcation.wait();
        transcation = await stableCtr.connect(addr2).approve(contract.target, ethers.parseUnits("100000"));
        await transcation.wait();
        transcation = await stableCtr.connect(addr3).approve(contract.target, ethers.parseUnits("100000"));
        await transcation.wait();
        // val = await stableCtr.allowance(addr2, contract.target);
        // console.log(val)
        transcation = await contract.setRewardsDuration(86400);
        await transcation.wait();

        transcation = await contract.setRewardAmount(ethers.parseUnits("50"));
        await transcation.wait();

        transcation = await contract.stakeEth({ value: ethers.parseEther("0.009") });
        await transcation.wait();

        transcation = await contract.connect(addr1).stakeRupee(ethers.parseEther("10000"));
        await transcation.wait();
        transcation = await contract.connect(addr2).stakeRupee(ethers.parseEther("10000"));
        await transcation.wait();
        transcation = await contract.connect(addr3).stakeRupee(ethers.parseEther("10000"));
        await transcation.wait();

        // advance time by one hour and mine a new block
        await time.increase(3600);

        return { contract, stableCtr, owner, addr1, addr2, addr3 }
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
            await expect(contract.setRewardAmount(ethers.parseUnits("50")))
                .to.be.revertedWithCustomError(contract, "InsufficientBalance")
        });

        it("Should set reward amount", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            // Try to set amount with UsableFixture
            let transcation = await contract.setRewardAmount(ethers.parseUnits("50"));
            await transcation.wait();

            const val = await contract.rewardRate();
            expect(val).to.be.greaterThan(0);
        });

        it("Should set reward amount and emit RewardRateChanged event", async function () {
            const { contract, stableCtr, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            await expect(contract.setRewardAmount(ethers.parseUnits("50")))
                .to.emit(contract, "RewardRateChanged");

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

        it("Should stake and emit StakeEth event", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);

            // Try to withdraw some ETH
            await expect(contract.stakeEth({ value: ethers.parseEther("0.5") }))
                .to.emit(contract, "StakeEth")
                .withArgs(owner, ethers.parseEther("0.5"));

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

        it("Should withdraw with emit event", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            let transcation = await contract.connect(addr1).stakeEth({ value: ethers.parseEther("1") });
            await transcation.wait();

            // Try to withdraw some ETH
            await expect(contract.connect(addr1).withdrawEth(ethers.parseEther("0.1")))
                .to.emit(contract, "WithdrawEth")
                .withArgs(addr1, ethers.parseEther("0.1"));
        });

        it("Should withdraw the staked number or less ETH", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            let transcation = await contract.connect(addr1).stakeEth({ value: ethers.parseEther("0.8") });
            await transcation.wait();

            let aBalanceETH = await ethers.provider.getBalance(addr1)

            // Try to withdraw less ETH that what this address staked
            transcation = await contract.connect(addr1).withdrawEth(ethers.parseEther("0.5"));
            await transcation.wait();

            let bBalanceETH = await ethers.provider.getBalance(addr1)

            expect(BN(bBalanceETH)).to.be.greaterThan(BN(aBalanceETH.toString()));
        });
    });

    describe("Testing rewardPerToken function", function () {

        it("Should return default rewardPerTokenStored value", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            // Try to get the current value for reward per token
            const val = await contract.rewardPerToken();
            expect(val).to.equal(0);
        });

        it("Should return rewardPerTokenStored when ETH staked", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixtureWithStakedETH);
            // Try to get the current value for reward per token
            const val = await contract.rewardPerToken();
            expect(val).to.greaterThan(0);
        });

        it("Should return rewardPerTokenStored when ETH staked", async function () {
            const { contract, stableCtr, owner, addr1 } = await loadFixture(deployOwnerSetupFixtureWithBothStaked);
            // Try to get the current value for reward per token
            const val = await contract.connect(addr1).rewardPerToken();
            expect(val).to.greaterThan(0);
        });
    });

    describe("Testing stakeRupee function", function () {

        it("Should not be able to stake empty LKRS amount", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            // Try to stake LKRS with empty amount
            await expect(contract.connect(addr1).stakeRupee(0))
                .to.be.revertedWithCustomError(contract, "EmptyAmount")
        });

        it("Should not be able to stake if not approved", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            // Try to stake LKRS with empty amount
            //contract.connect(addr1).stakeRupee(ethers.parseEther("10"));
            //await transcation.wait();
            await expect(contract.connect(addr1).stakeRupee(ethers.parseEther("10")))
                .to.be.reverted;
        });

        it("Should not be able to stake more than allowed amount", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixtureWithApproveLKRS);
            // Try to stake LKRS with empty amount
            //contract.connect(addr1).stakeRupee(ethers.parseEther("10"));
            //await transcation.wait();
            await expect(contract.connect(addr1).stakeRupee(ethers.parseEther("100000")))
                .to.be.reverted;
        });

        it("Should stake and emit StakeRupee event", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixtureWithApproveLKRS);
            await expect(contract.connect(addr1).stakeRupee(ethers.parseEther("5000")))
                .to.emit(contract, "StakeRupee")
                .withArgs(addr1, ethers.parseEther("5000"));

        });

        it("Should stake LKRS", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixtureWithApproveLKRS);
            // Try to stake LKRS with value
            await contract.connect(addr1).stakeRupee(ethers.parseEther("5000"));
            const val = await contract.connect(addr1).getStakedRupeeNumber();
            expect(val).to.be.equal(ethers.parseEther("5000"));
        });
    });

    describe("Testing withdrawRupee function", function () {

        it("Should not be able to withdraw empty LKRS amount", async function () {
            const { contract, owner, addr1 } = await loadFixture(deploySimpleFixture);
            // Try to withdrawRupee LKRS with empty amount
            await expect(contract.connect(addr1).withdrawRupee(0))
                .to.be.revertedWithCustomError(contract, "EmptyAmount")
        });

        it("Should not be able to withdraw if enough funds", async function () {
            const { contract, owner, addr1 } = await loadFixture(deploySimpleFixture);
            // Try to withdrawRupee LKRS with empty amount
            await expect(contract.connect(addr1).withdrawRupee(ethers.parseEther("10")))
                .to.be.revertedWithCustomError(contract, "InsufficientBalance")
        });

        it("Should withdraw and emit WithdrawRupee event", async function () {
            const { contract, stableCtr, owner, addr1 } = await loadFixture(deployOwnerSetupFixtureWithBothStaked);
            await expect(contract.connect(addr1).withdrawRupee(ethers.parseEther("5000")))
                .to.emit(contract, "WithdrawRupee")
                .withArgs(addr1, ethers.parseEther("5000"));

        });

        it("Should withdraw LKRS", async function () {
            const { contract, stableCtr, owner, addr1 } = await loadFixture(deployOwnerSetupFixtureWithBothStaked);
            const preBalance = await stableCtr.connect(addr1).balanceOf(addr1);
            // Try to stake LKRS with value
            await contract.connect(addr1).withdrawRupee(ethers.parseEther("5000"));
            const val = await stableCtr.connect(addr1).balanceOf(addr1);
            expect(val).to.be.equal(preBalance+ethers.parseEther("5000"));
        });
    });

    describe("Testing getStakedRupeeNumber function", function () {

        it("Should return 0 with wrong addr", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            // Try to get the balanceof addr which dose not have LKRS
            const val = await contract.getStakedRupeeNumber();
            expect(val).to.be.equal(0);
        });

        it("Should return the correct number of LKRS staked", async function () {
            const { contract, stableCtr, owner, addr1 } = await loadFixture(deployOwnerSetupFixtureWithBothStaked);
            // const preBalance = await stableCtr.connect(addr1).balanceOf(addr1);
            const val = await contract.connect(addr1).getStakedRupeeNumber();
            expect(val).to.be.equal(ethers.parseEther("5000"));
        });
    });

    describe("Testing earned function", function () {

        it("Should earned", async function () {
            const { contract, stableCtr, owner, addr1 } = await loadFixture(deployOwnerSetupFixtureWithBothStakedComplex);
            // Try to get earned token number
            const val = await contract.earned(addr1);
            expect(val).to.be.greaterThan(0);
        });
    });

    describe("Testing claimReward function", function () {

        it("Should not be able claim empty reward", async function () {
            const { contract, owner, addr1 } = await loadFixture(deployOwnerSetupFixture);
            // Try to claim rewards LKRS token
            await expect(contract.connect(addr1).claimReward())
                .to.be.revertedWithCustomError(contract, "InsufficientBalance")
        });

        it("Should getReward and emit RewardClaimed event", async function () {
            const { contract, stableCtr, owner, addr1 } = await loadFixture(deployOwnerSetupFixtureWithBothStakedComplex);
            await expect(contract.connect(addr1).claimReward())
                .to.emit(contract, "RewardClaimed");
        });
    });
});
