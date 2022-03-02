require("@nomiclabs/hardhat-waffle");
require('hardhat-spdx-license-identifier');
require('hardhat-gas-reporter');
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-web3");

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
  /*networks: {
    ropsten: {

    },

    rinkeby: {

    },

    mumbai: {

    }
  },*/

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
    token: "MATIC",
    gasPriceApi: "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
    // outputFile: stdout,
    noColors: false,
    excludeContracts: ['Greeter']
  }
};
