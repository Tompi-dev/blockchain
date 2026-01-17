const hre = require("hardhat");

async function main() {
  const HelloWorld = await hre.ethers.getContractFactory("HelloWorld");
  const helloWorld = await HelloWorld.deploy();
  await helloWorld.deployed();

  console.log("Deployed to:", helloWorld.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
