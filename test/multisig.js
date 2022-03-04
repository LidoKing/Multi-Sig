const { expect } = require("chai");
const { MockProvider } = require("ethereum-waffle");
const { ethers, waffle } = require("hardhat");
const {loadFixture, deployContract} = waffle;
const MultiSig = require("../artifacts/contracts/multisig.sol/MultiSig.json");
const utils = require("./helpers/utils");

describe("MultiSig", function () {

  async function fixture(_wallets, _mockProvider) {
    const [signer1, signer2, signer3, signer4, signer5, signer6] = await ethers.getSigners();
    const [addr1, addr2, addr3, addr4, addr5, addr6] = [signer1.address, signer2.address, signer3.address, signer4.address, signer5.address, signer6.address];
    let multisig = await deployContract(signer1, MultiSig, [[addr1, addr2, addr3, addr4, addr5]]);
    return {
      multisig,
      signer1, signer2, signer3, signer4, signer5, signer6,
      addr1, addr2, addr3, addr4, addr5, addr6
    };
  }

  async function balance(address) {
    let balanceWei = await ethers.provider.getBalance(address);
    let balanceEth = await ethers.utils.formatEther(balanceWei); // wei to eth

    return balanceEth;
  }

  it("should deploy with five members", async () => {
    const {multisig, addr1, addr2, addr3, addr4, addr5, addr6} = await loadFixture(fixture);

    expect(await multisig.checkMember(addr1)).to.equal(true);
    expect(await multisig.checkMember(addr2)).to.equal(true);
    expect(await multisig.checkMember(addr3)).to.equal(true);
    expect(await multisig.checkMember(addr4)).to.equal(true);
    expect(await multisig.checkMember(addr5)).to.equal(true);
    expect(await multisig.checkMember(addr6)).to.equal(false);
  });

  it("should receive deposits", async () => {
    const {multisig, signer1, addr1} = await loadFixture(fixture);

    // Deposit to contract
    let amount = await ethers.utils.parseEther("20"); // eth to wei
    await signer1.sendTransaction({from: addr1, to: multisig.address, value: amount});
    let contractBalance = await balance(multisig.address);
    expect(contractBalance).to.equal("20.0");
    // New balance of addr[5] after depositing
    // let addrBalance = await balance(addr6);
    // console.log(addrBalance);
  });

  it("should create a transaction", async () => {
    const {multisig, signer1, addr1, addr6} = await loadFixture(fixture);

    // Deposit to contract
    let amount = await ethers.utils.parseEther("20"); // eth to wei
    await signer1.sendTransaction({from: addr1, to: multisig.address, value: amount});

    // Create tx
    let result = await multisig.connect(signer1).createTransaction(addr6, 10);
    let id = result.value.toNumber();
    let tx = await multisig.getTransaction(id);
    expect(tx.creator).to.equal(addr1);
  });

  it("should confirm transaction", async () => {
    const {multisig, signer1, signer2, signer3, addr1, addr6} = await loadFixture(fixture);

    // Deposit to contract
    let amount = await ethers.utils.parseEther("20"); // eth to wei
    await signer1.sendTransaction({from: addr1, to: multisig.address, value: amount});
    // Create tx
    let result = await multisig.connect(signer1).createTransaction(addr6, 10);
    let id = result.value.toNumber();

    // Confirm tx
    await multisig.connect(signer2).confirmTransaction(id);
    await multisig.connect(signer3).confirmTransaction(id);
    let tx = await multisig.getTransaction(id);
    expect(tx.confirmations).to.equal("3");
  });

  it("should not confirm twice", async () => {
    const {multisig, signer1, signer2, addr1, addr6} = await loadFixture(fixture);

    // Deposit to contract
    let amount = await ethers.utils.parseEther("20"); // eth to wei
    await signer1.sendTransaction({from: addr1, to: multisig.address, value: amount});
    // Create tx
    let result = await multisig.connect(signer1).createTransaction(addr6, 10);
    let id = result.value.toNumber();

    // Confirm tx
    await utils.shouldThrow(multisig.connect(signer1).confirmTransaction(id));
  });

  it("should revoke confirmation", async () => {
    const {multisig, signer1, addr1, addr6} = await loadFixture(fixture);

    // Deposit to contract
    let amount = await ethers.utils.parseEther("20"); // eth to wei
    await signer1.sendTransaction({from: addr1, to: multisig.address, value: amount});
    // Create tx
    let result = await multisig.connect(signer1).createTransaction(addr6, 10);
    let id = result.value.toNumber();

    // Revoke confirmation
    await multisig.connect(signer1).revokeConfirmation(id);
    let tx = await multisig.getTransaction(id);
    expect(tx.confirmations).to.equal("0");
  });

  it("should not revoke if confirmation has never been made", async () => {
    const {multisig, signer1, signer2, addr1, addr6} = await loadFixture(fixture);

    // Deposit to contract
    let amount = await ethers.utils.parseEther("20"); // eth to wei
    await signer1.sendTransaction({from: addr1, to: multisig.address, value: amount});
    // Create tx
    let result = await multisig.connect(signer1).createTransaction(addr6, 10);
    let id = result.value.toNumber();

    // Revoke confirmation
    await utils.shouldThrow(multisig.connect(signer2).revokeConfirmation(id));
  });

  it("should execute transaction", async () => {
    const {multisig, signer1, signer2, signer3, addr1, addr6} = await loadFixture(fixture);

    // Deposit to contract
    let amount = await ethers.utils.parseEther("20"); // eth to wei
    await signer1.sendTransaction({from: addr1, to: multisig.address, value: amount});
    // Create tx
    let result = await multisig.connect(signer1).createTransaction(addr6, 10);
    let id = result.value.toNumber();
    // Confirm tx
    await multisig.connect(signer2).confirmTransaction(id);
    await multisig.connect(signer3).confirmTransaction(id);

    // Execute tx
    await multisig.connect(signer1).executeTransaction(id);
    let tx = await multisig.getTransaction(id);
    let contractBalance = await balance(multisig.address);
    let addr6Balance = await balance(addr6);
    expect(contractBalance).to.equal("10.0");
    expect(addr6Balance).to.equal("10010.0");
    expect(tx.executed).to.equal(true);
  });

  it("should not execute transaction with insufficient confirmations", async () => {
    const {multisig, signer1, signer2, addr1, addr6} = await loadFixture(fixture);

    // Deposit to contract
    let amount = await ethers.utils.parseEther("20"); // eth to wei
    await signer1.sendTransaction({from: addr1, to: multisig.address, value: amount});
    // Create tx
    let result = await multisig.connect(signer1).createTransaction(addr6, 10);
    let id = result.value.toNumber();
    // Confirm tx
    await multisig.connect(signer2).confirmTransaction(id);

    // Execute tx
    await utils.shouldThrow(multisig.connect(signer1).executeTransaction(id));
  });

  it("should reject transaction", async () => {
    const {multisig, signer1, signer2, signer3, signer4, addr1, addr6} = await loadFixture(fixture);

    // Deposit to contract
    let amount = await ethers.utils.parseEther("20"); // eth to wei
    await signer1.sendTransaction({from: addr1, to: multisig.address, value: amount});
    // Create tx
    let idBN = await multisig.callStatic.createTransaction(addr6, 10);
    let id = idBN.toNumber();
    await multisig.connect(signer1).createTransaction(addr6, 10);

    // Reject tx
    await multisig.connect(signer2).rejectTransaction(id);
    await multisig.connect(signer3).rejectTransaction(id);
    await multisig.connect(signer4).rejectTransaction(id);
    let tx = await multisig.getTransaction(id);
    expect(tx.rejected).to.equal(true);
  });

  it("should not reject twice", async () => {
    const {multisig, signer1, signer2, addr1, addr6} = await loadFixture(fixture);

    // Deposit to contract
    let amount = await ethers.utils.parseEther("20"); // eth to wei
    await signer1.sendTransaction({from: addr1, to: multisig.address, value: amount});
    // Create tx
    let idBN = await multisig.callStatic.createTransaction(addr6, 10);
    let id = idBN.toNumber();
    await multisig.connect(signer1).createTransaction(addr6, 10);

    // Reject tx
    await multisig.connect(signer2).rejectTransaction(id);
    await utils.shouldThrow(multisig.connect(signer2).rejectTransaction(id));
  });

});
