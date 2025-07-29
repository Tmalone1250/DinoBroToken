const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DinoBroCoin", function () {
  let DinoBroCoin;
  let dinoBroCoin;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const INITIAL_SUPPLY = BigInt(1_000_000_000_000_000) * BigInt(10**9); // Use BigInt for large numbers
  const TOKEN_NAME = "DinoBro Coin";
  const TOKEN_SYMBOL = "DINOB";

  beforeEach(async function () {
    // Get the ContractFactory and Signers
    DinoBroCoin = await ethers.getContractFactory("DinoBroCoin");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy the contract with example initial percentages
    // Let's use 10% for maxTxPercent and 20% for maxWalletPercent for testing
    const initialMaxTxPercent = 10;
    const initialMaxWalletPercent = 20;

    dinoBroCoin = await DinoBroCoin.deploy(initialMaxTxPercent, initialMaxWalletPercent);
    await dinoBroCoin.waitForDeployment(); // Wait for the contract to be deployed
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await dinoBroCoin.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await dinoBroCoin.balanceOf(owner.address);
      expect(ownerBalance).to.equal(INITIAL_SUPPLY);
    });

    it("Should have the correct name and symbol", async function () {
      expect(await dinoBroCoin.name()).to.equal(TOKEN_NAME);
      expect(await dinoBroCoin.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should set the correct maxTxAmount", async function () {
      const expectedMaxTxAmount = (INITIAL_SUPPLY * BigInt(10)) / BigInt(100);
      expect(await dinoBroCoin.maxTxAmount()).to.equal(expectedMaxTxAmount);
    });

    it("Should set the correct maxWalletHolding", async function () {
      const expectedMaxWalletHolding = (INITIAL_SUPPLY * BigInt(20)) / BigInt(100);
      expect(await dinoBroCoin.maxWalletHolding()).to.equal(expectedMaxWalletHolding);
    });
  });

  describe("Transactions", function () {
    it("Should allow transfers within limits", async function () {
      const transferAmount = INITIAL_SUPPLY / BigInt(1000); // Small transfer
      await expect(dinoBroCoin.transfer(addr1.address, transferAmount))
        .to.changeTokenBalances(dinoBroCoin, [owner, addr1], [-transferAmount, transferAmount]);
    });

    it("Should revert if transfer amount exceeds maxTxAmount", async function () {
      const tooLargeAmount = (await dinoBroCoin.maxTxAmount()) + BigInt(1);
      await expect(dinoBroCoin.transfer(addr1.address, tooLargeAmount))
        .to.be.revertedWith("DINOB: Transaction amount exceeds limit");
    });

    it("Should revert if recipient wallet balance would exceed holding limit", async function () {
      // Transfer almost the maxWalletHolding to addr1
      const maxWallet = await dinoBroCoin.maxWalletHolding();
      const firstTransfer = maxWallet - BigInt(10);
      await dinoBroCoin.transfer(addr1.address, firstTransfer);

      // Try to transfer an amount that pushes addr1 over the limit
      const secondTransfer = BigInt(100); // This will make addr1 exceed by 90
      await expect(dinoBroCoin.transfer(addr1.address, secondTransfer))
        .to.be.revertedWith("DINOB: Recipient wallet balance would exceed holding limit");
    });

    it("Should not revert if recipient is the contract itself for holding limit", async function () {
      // This tests the `if (recipient != address(this))` condition
      const currentBalance = await dinoBroCoin.balanceOf(dinoBroCoin.target); // Get contract's own balance
      const transferAmount = (await dinoBroCoin.maxWalletHolding()) * BigInt(2); // Transfer more than maxWalletHolding
      await expect(dinoBroCoin.transfer(dinoBroCoin.target, transferAmount))
        .to.not.be.reverted;
      expect(await dinoBroCoin.balanceOf(dinoBroCoin.target)).to.equal(currentBalance + transferAmount);
    });

  });

  describe("Owner-only functions", function () {
    it("Should allow owner to set maxTxPercent", async function () {
      const newPercent = 5;
      await dinoBroCoin.setMaxTxPercent(newPercent);
      const expectedNewMaxTxAmount = (INITIAL_SUPPLY * BigInt(newPercent)) / BigInt(100);
      expect(await dinoBroCoin.maxTxAmount()).to.equal(expectedNewMaxTxAmount);
    });

    it("Should revert if non-owner tries to set maxTxPercent", async function () {
      await expect(dinoBroCoin.connect(addr1).setMaxTxPercent(5))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should revert if invalid maxTxPercent is set", async function () {
      await expect(dinoBroCoin.setMaxTxPercent(0))
        .to.be.revertedWith("DINOB: Invalid percentage");
      await expect(dinoBroCoin.setMaxTxPercent(101))
        .to.be.revertedWith("DINOB: Invalid percentage");
    });

    it("Should allow owner to set maxWalletPercent", async function () {
      const newPercent = 30;
      await dinoBroCoin.setMaxWalletPercent(newPercent);
      const expectedNewMaxWalletHolding = (INITIAL_SUPPLY * BigInt(newPercent)) / BigInt(100);
      expect(await dinoBroCoin.maxWalletHolding()).to.equal(expectedNewMaxWalletHolding);
    });

    it("Should revert if non-owner tries to set maxWalletPercent", async function () {
      await expect(dinoBroCoin.connect(addr1).setMaxWalletPercent(30))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should revert if invalid maxWalletPercent is set", async function () {
      await expect(dinoBroCoin.setMaxWalletPercent(0))
        .to.be.revertedWith("DINOB: Invalid percentage");
      await expect(dinoBroCoin.setMaxWalletPercent(101))
        .to.be.revertedWith("DINOB: Invalid percentage");
    });
  });
});