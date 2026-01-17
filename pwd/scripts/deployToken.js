const hre = require("hardhat");

async function main() {
  const Token = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

 
  const initialSupply = hre.ethers.utils.parseUnits("1000", 0);

  const token = await Token.deploy(initialSupply);
  await token.deployed();

  console.log("Token deployed to:", token.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
