import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { time } from "@openzeppelin/test-helpers";

describe("IceFarm", () => {
    let owner: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;
    let res: any;
    let iceFarm: Contract;
    let iceToken: Contract;
    let mockDai: Contract;

    const daiAmount: BigNumber = ethers.utils.parseEther("25000");

    beforeEach(async() => {
        const IceFarm = await ethers.getContractFactory("IceFarm");
        const IceToken = await ethers.getContractFactory("IceToken");
        const MockDai = await ethers.getContractFactory("MockERC20");
        mockDai = await MockDai.deploy("MockDai", "mDAI");
        [owner, alice, bob] = await ethers.getSigners();
        await Promise.all([
            mockDai.mint(owner.address, daiAmount),
            mockDai.mint(alice.address, daiAmount),
            mockDai.mint(bob.address, daiAmount)
        ]);
        iceToken = await IceToken.deploy();
        iceFarm = await IceFarm.deploy(mockDai.address, iceToken.address);
    });

    describe("Init", async() => {
        it("should initialize", async() => {
            expect(iceToken).to.be.ok;
            expect(iceFarm).to.be.ok;
            expect(mockDai).to.be.ok;
        });
    });
});

beforeEach(async() => {
    const IceFarm = await ethers.getContractFactory("IceFarm");
    const IceToken = await ethers.getContractFactory("IceToken");
    const MockDai = await ethers.getContractFactory("MockERC20");
    mockDai = await MockDai.deploy("MockDai", "mDAI");
    [owner, alice, bob] = await ethers.getSigners();
    await Promise.all([
        mockDai.mint(owner.address, daiAmount),
        mockDai.mint(alice.address, daiAmount),
        mockDai.mint(bob.address, daiAmount)
    ]);
    iceToken = await IceToken.deploy();
    iceFarm = await IceFarm.deploy(mockDai.address, iceToken.address);
});

describe("Init", async() => {
    it("should initialize", async() => {
        expect(iceToken).to.be.ok;
        expect(iceFarm).to.be.ok;
        expect(mockDai).to.be.ok;
    })
})