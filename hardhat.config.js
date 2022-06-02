require("@nomiclabs/hardhat-waffle");
require('hardhat-spdx-license-identifier');
require('hardhat-gas-reporter');
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();
require('@openzeppelin/hardhat-upgrades');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    /*ropsten: {

    },

    mumbai: {

    },*/

    rinkeby: {
      url: "https://rinkeby.infura.io/v3/529aa3096e8647a0aef41c58bf5cd29f",
      accounts: [process.env.PRIVATE_KEY]
    },

    harmony_testnet: {
      url: `https://api.s0.b.hmny.io`,
      accounts: ['0x348e849a7b303619873331be3b47a8b0138982576cf852ae480ddf82d254500a']
    }
  },

  solidity: "0.8.8",

  spdxLicenseIdentifier: {
    overwrite: true,
    runOnCompile: true,
  },

  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: "3c9160b9-382c-48bd-8873-b0936d7a914d",
    // gasPrice: ,
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    // outputFile: stdout,
    noColors: false,
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API
  }
};
