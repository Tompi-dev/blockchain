const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Week4Token", function () {
  async function deployToken() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const decimals = 18;
    const initialSupply = ethers.parseUnits("1000", decimals);

    const Token = await ethers.getContractFactory("Week4Token");
    const token = await Token.deploy(initialSupply);
    await token.waitForDeployment();

    return { token, owner, addr1, addr2, initialSupply, decimals };
  }

  it("Basic balance checks: owner gets initial supply", async function () {
    const { token, owner, initialSupply } = await deployToken();

    expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
    expect(await token.totalSupply()).to.equal(initialSupply);
  });

  it("Storage verification: totalSupply and balanceOf stored correctly", async function () {
    const { token, owner, initialSupply } = await deployToken();

    expect(await token.totalSupply()).to.equal(initialSupply);
    expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
  });

  it("Transfer tests: transfer reduces sender and increases receiver", async function () {
    const { token, owner, addr1, initialSupply, decimals } = await deployToken();

    const amount = ethers.parseUnits("10", decimals);

    await token.transfer(addr1.address, amount);

    expect(await token.balanceOf(addr1.address)).to.equal(amount);
    expect(await token.balanceOf(owner.address)).to.equal(initialSupply - amount);
  });

  it("Event emission tests: emits Transfer on transfer", async function () {
    const { token, owner, addr1, decimals } = await deployToken();

    const amount = ethers.parseUnits("5", decimals);

    await expect(token.transfer(addr1.address, amount))
      .to.emit(token, "Transfer")
      .withArgs(owner.address, addr1.address, amount);
  });

  it("Failing transfer tests: reverts if insufficient balance", async function () {
    const { token, addr1, addr2, decimals } = await deployToken();

    const tooMuch = ethers.parseUnits("1", decimals);

    await expect(token.connect(addr1).transfer(addr2.address, tooMuch))
      .to.be.revertedWith("insufficient balance");
  });

  it("Negative tests: reverts if transfer to zero address", async function () {
    const { token, decimals } = await deployToken();

    const amount = ethers.parseUnits("1", decimals);

    await expect(token.transfer(ethers.ZeroAddress, amount))
      .to.be.revertedWith("zero address");
  });

  it("Edge case: transferring to yourself keeps balance unchanged but emits event", async function () {
    const { token, owner, initialSupply, decimals } = await deployToken();

    const amount = ethers.parseUnits("7", decimals);

    await expect(token.transfer(owner.address, amount))
      .to.emit(token, "Transfer")
      .withArgs(owner.address, owner.address, amount);

    expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
  });

  it("Gas estimation tests: estimateGas for transfer returns a number > 0", async function () {
    const { token, addr1, decimals } = await deployToken();

    const amount = ethers.parseUnits("1", decimals);

    const gas = await token.transfer.estimateGas(addr1.address, amount);
    expect(gas).to.be.greaterThan(0n);
  });

  it("Basic balance checks after multiple transfers", async function () {
    const { token, owner, addr1, addr2, initialSupply, decimals } = await deployToken();

    const a = ethers.parseUnits("10", decimals);
    const b = ethers.parseUnits("15", decimals);

    await token.transfer(addr1.address, a);
    await token.transfer(addr2.address, b);

    expect(await token.balanceOf(addr1.address)).to.equal(a);
    expect(await token.balanceOf(addr2.address)).to.equal(b);

    const ownerBal = await token.balanceOf(owner.address);
    expect(ownerBal + a + b).to.equal(initialSupply);
  });
});
