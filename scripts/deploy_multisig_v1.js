// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers, upgrades } = require("hardhat");
const hre = require('hardhat');

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const MultiSig = await hre.ethers.getContractFactory("MultiSig");
  const multisig = await upgrades.deployProxy(
    MultiSig,
    [
      [
        '0xDaBd21Ed3aD4493512f5b75D7A5b9E679cc782bA',
        '0x185515138a13C340d0b842af33256De14f8eA14F',
        '0x983bC8675b387aC0b0B53165475153852db8b872'
      ],
      2
    ],
    {initializer: "initialize"}
  );
  await multisig.deployed();

  console.log("Multi-sig wallet deployed to:", multisig.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
