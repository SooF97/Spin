const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  const Raffle = await ethers.getContractFactory("Raffle");
  console.log("Deploying...");
  const raffle = await Raffle.deploy();

  await raffle.deployed();
  console.log(`Contract deployed successfully to ${raffle.address}`);

  //Pulling the address and ABI of the smart contract out since we will use them to interact with our smart contract later
  const data = {
    address: raffle.address,
    abi: JSON.parse(raffle.interface.format("json")),
  };

  //This writes the ABI and address to the marketplace.json
  //This data is then used by frontend files to connect with the smart contract
  fs.writeFileSync("./src/raffle.json", JSON.stringify(data));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
