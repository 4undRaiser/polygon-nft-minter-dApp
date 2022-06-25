
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config({path: '.env'});



task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
  
    for (const account of accounts) {
      console.log(account.address);
    }
  });


module.exports = {
    defaultNetwork: "matic",
    networks: {
      hardhat: {
      },
      matic: {
        url: "https://rpc-mumbai.maticvigil.com/",
        accounts: [process.env.PRIVATE_KEY.toString()]
      }
    },
    etherscan: {
      apiKey: process.env.POLYGONSCAN_API_KEY
    },
    solidity: {
      version: "0.8.4",
    },
  }
 