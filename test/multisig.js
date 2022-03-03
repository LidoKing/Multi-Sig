const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
/*const Web3 = require("web3");
const web3 = new Web3('ws://127.0.0.1:8545/');*/
const MultiSig = artifacts.require("MultiSig");
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
  let instance;

  before(async () => {
    this.MultiSig = await ethers.getContractFactory("MultiSig");
    const [signer1, signer2, signer3, signer4, signer5, signer6] = await ethers.getSigners();
    [addr1, addr2, addr3, addr4, addr5, addr6] = [signer1.getAddress(), signer2.getAddress(), signer3.getAddress(), signer4.getAddress(), signer5.getAddress(), signer6.getAddress()];
  });

  beforeEach(async () => {
    this.multisig = await this.MultiSig.deploy([addr1, addr2, addr3, addr4, addr5]);
    await this.multisig.deployed();
    instance  = this.multisig;
  });

  it("should deploy with five members", async () => {
    expect(await instance.checkMember(addr1)).to.equal(true);
    expect(await instance.checkMember(addr2)).to.equal(true);
    expect(await instance.checkMember(addr3)).to.equal(true);
    expect(await instance.checkMember(addr4)).to.equal(true);
    expect(await instance.checkMember(addr5)).to.equal(true);
    expect(await instance.checkMember(addr6)).to.equal(false);
  });
});
