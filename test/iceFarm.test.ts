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
    });
});

describe("Stake", async() => {
    it("should accept DAI and update mapping", async() => {
        let toTransfer = ethers.utils.parseEther("100")
        await mockDai.connect(alice).approve(iceFarm.address, toTransfer)

        expect(await iceFarm.isStaking(alice.address)).to.eq(false)

        expect(await iceFarm.connect(alice).stake(toTransfer)).to.be.ok

        expect(await iceFarm.stakingBalance(alice.address)).to.eq(toTransfer)

        expect(await iceFarm.isStaking(alice.address)).to.eq(true)
    });

    it("should update balance with multiple stakes", async() => {
        let toTransfer = ethers.utils.parseEther("100")
        await mockDai.connect(alice).approve(iceFarm.address, toTransfer)
        await iceFarm.connect(alice).stake(toTransfer)

        await mockDai.connect(alice).approve(iceFarm.address, toTransfer)
        await iceFarm.connect(alice).stake(toTransfer)

        expect(await iceFarm.stakingBalance(alice.address)).to.eq(ethers.utils.parseEther("200"))
    });

    it("should revert with not enough funds", async() => {
        let toTransfer = ethers.utils.parseEther("1000000")
        await mockDai.approve(iceFarm.address, toTransfer)

        await expect(iceFarm.connect(bob).stake(toTransfer)).to.be.revertedWith("You cannot stake zero tokens")
    });
});

describe("Unsake", async() => {
    beforeEach(async() => {
        let ToTransfer = ethers.utils.parseEther("100")
        await mockDai.connect(alice).approve(iceFarm.address, toTransfer)
        await iceFarm.connect(alice).stake(toTransfer)
    });

    it("should unstake balance from user", async() => {
        let toTransfer = ethers.utils.parseEther("100")
        await iceFarm.connect(alice).unstake(toTransfer)

        res = await iceFarm.stakingBalance(alice.address)
        expect(Number(res))
            .to.eq(0)

        expect(await iceFarm.isStaking(alice.address))
            .to.eq(false)
    });
});

describe("WithdrawYield", async() => {
    beforeEach(async() => {
        await iceToken._transferOwnership(iceFarm.address)
        let toTransfer = ethers.utils.parseEther("10")
        await mockDai.connect(alice).approve(iceFarm.address, toTransfer)
        await iceFarm.connect(alice).stake(toTransfer)
    });

    it("should return correct yield time", async() => {
        let timeStart = await iceFarm.startTime(alice.address)
        expect(Number(timeStart))
            .to.be.greaterThan(0)

        await time.increase(86400)
        expect(await iceFarm.calculateYieldTime(alice.address))
            .to.eq((86400))
    });

    it("should mint correct token amount in total supply and user", async() => {
        await time.increase(86400)

        let _time = await iceFarm.calculateYieldTime(alice.address)
        let formatTime = _time / 86400
        let staked = await iceFarm.stakingBalance(alice.address)
        let bal = staked * formatTime
        let newBal = ethers.utils.formatEther(bal.toString())
        let expected = Number.parseFloat(newBal).toFixed(3)

        await iceFarm.connect(alice).withdrawYield()

        res = await iceToken.totalSupply()
        let newRes = ethers.utils.formatEther(res)
        let formatRes = Number.parseFloat(newRes).toFixed(3).toString()

        expect(expected)
            .to.eq(formatRes)

        res = await iceToken.balanceOf(alice.address)
        newRes = ethers.utils.formatEther(res)
        formatRes = Number.parseFloat(newRes).toFixed(3).toString()

        expect(expected)
            .to.eq(formatRes)
    });

    it("should update yield balance when unstaked", async() => {
        await time.increase(86400)
        await iceFarm.connect(alice).unstake(ethers.utils.parseEther("5"))

        res = await iceFarm.iceBalance(alice.address)
        expect(Number(ethers.utils.formatEther(res)))
            .to.be.approximately(10, .001)
    });
});
