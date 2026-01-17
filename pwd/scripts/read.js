const hre = require("hardhat");

async function main() {
  const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const hello = await hre.ethers.getContractAt("HelloWorld", address);

  const msg = await hello.sayHelloWorld();
  console.log("sayHelloWorld() =>", msg);
}

main().catch(console.error);
