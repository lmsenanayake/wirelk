const { assert, expect } = require("chai");
const { ethers } = require("hardhat")
const { BN } = require('@openzeppelin/test-helpers');
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const ORACLE_CONTRACT_ADDR = process.env.ORACLE_CONTRACT_ADDR || "";

describe("StableRupee tests", function () {

    //let owner, addr1, addr2, addr3;

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

    /*describe("Testing addVoter function", function () {

        it("Should not add twise the same voter", async function () {
            const { voting, owner } = await loadFixture(deployContract);
            let transcation = await voting.addVoter(owner.address);
            await transcation.wait();
            // Try to add a voter who is already voter
            await expect(voting.addVoter(owner.address))
                .to.be.revertedWith("Already registered")
        });

        it("Should not add voter when the workflow is not RegisteringVoters", async function () {
            const { voting, owner, addr1 } = await loadFixture(deployContract);
            let transcation = await voting.startProposalsRegistering();
            await transcation.wait();
            // Try to add a voter when the workflow is not correct
            await expect(voting.addVoter(addr1.address))
                .to.be.revertedWith("Voters registration is not open yet")
        });

        it("Should not add voter with any other address", async function () {
            const { voting, owner, addr1 } = await loadFixture(deployContract);
            // Try to add owner as a voter with a non owner connexion
            await expect(voting.connect(addr1).addVoter(owner.address))
                .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        });
    });*/
});
