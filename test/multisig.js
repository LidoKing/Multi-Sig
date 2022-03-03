const { expect } = require("chai");
const { MockProvider } = require("ethereum-waffle");
const { ethers, waffle } = require("hardhat");
const {loadFixture, deployContract} = waffle;
const MultiSig = require("../artifacts/contracts/multisig.sol/MultiSig.json");
const utils = require("./helpers/utils");

/*const Web3 = require("web3");
const web3 = new Web3('ws://127.0.0.1:8545/');
const MultiSig = artifacts.require("MultiSig");
*/

/*
contract("MultiSig", (accounts) => {
  let [ac1, ac2, ac3, ac4, ac5, ac6] = accounts;
  let instance;

  beforeEach(async () => {
    instance = await MultiSig.new([ac1, ac2, ac3, ac4, ac5]);
  });

  it("should deploy with five members", async () => {
    expect(await instance.checkMember(ac1)).to.equal(true);
    expect(await instance.checkMember(ac2)).to.equal(true);
    expect(await instance.checkMember(ac3)).to.equal(true);
    expect(await instance.checkMember(ac4)).to.equal(true);
    expect(await instance.checkMember(ac5)).to.equal(true);
    expect(await instance.checkMember(ac6)).to.equal(false);
  });

  it("should receive deposits", async () => {
    await web3.eth.sendTransaction({from: ac6, to: instance.address, value: web3.utils.toWei("5", "ether")});
    let balance = await web3.eth.getBalance(instance.address);
    expect(web3.utils.fromWei(balance)).to.equal('5');
    // expect(web3.utils.fromWei)
  });

});
*/

describe("MultiSig", function () {
  /*let instance;

  before(async () => {
    this.MultiSig = await ethers.getContractFactory("MultiSig");
    const [signer1, signer2, signer3, signer4, signer5, signer6] = await ethers.getSigners();
    [addr1, addr2, addr3, addr4, addr5, addr6] = [signer1.getAddress(), signer2.getAddress(), signer3.getAddress(), signer4.getAddress(), signer5.getAddress(), signer6.getAddress()];
  });

  beforeEach(async () => {
    this.multisig = await this.MultiSig.deploy([addr1, addr2, addr3, addr4, addr5]);
    await this.multisig.deployed();
    instance  = this.multisig;
  });*/

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
    const {multisig, signer6, addr6} = await loadFixture(fixture);

    // Deposit to contract
    let amount = await ethers.utils.parseEther("20"); // eth to wei
    await signer6.sendTransaction({from: addr6, to: multisig.address, value: amount});
    let contractBalance = await ethers.provider.getBalance(multisig.address);
    expect(contractBalance).to.equal(amount);
    // New balance of addr[5] after depositing
    // let addrBalance = await ethers.provider.getBalance(addr6);
    // console.log(await ethers.utils.formatEther(addrBalance)); // wei to eth
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

  it("should not create a transaction that exceeds wallet balance", async () => {
    const {multisig, signer1, addr1, addr6} = await loadFixture(fixture);

    // Deposit to contract
    let amount = await ethers.utils.parseEther("20"); // eth to wei
    await signer1.sendTransaction({from: addr1, to: multisig.address, value: amount});

    // Create tx
    await utils.shouldThrow(multisig.connect(signer1).createTransaction(addr6, 30));

  });

  it("should confirm transaction", async () => {
    const {multisig, signer1, signer2, signer3, addr1, addr6} = await loadFixture(fixture);

    // Deposit to contract
    let amount = await ethers.utils.parseEther("20"); // eth to wei
    await signer1.sendTransaction({from: addr1, to: multisig.address, value: amount});
    // Create tx
    let result = await multisig.createTransaction(addr6, 10);
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
    let result = await multisig.createTransaction(addr6, 10);
    let id = result.value.toNumber();

    // Confirm tx
    await utils.shouldThrow(multisig.connect(signer1).confirmTransaction(id));
  });
});
