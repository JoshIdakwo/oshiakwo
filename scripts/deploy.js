const hre = require("hardhat");

async function main() {
  const Oshiakwo = await hre.ethers.getContractFactory("Oshiakwo");
  const oshiakwo = await Oshiakwo.deploy();

  await oshiakwo.deployed();

  console.log("Oshiakwo deployed to:", oshiakwo.address);
  storeContractData(oshiakwo);
}

function storeContractData(contract) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/Oshiakwo-address.json",
    JSON.stringify({ Oshiakwo: contract.address }, undefined, 2)
  );

  const MyNFTArtifact = artifacts.readArtifactSync("Oshiakwo");

  fs.writeFileSync(
    contractsDir + "/Oshiakwo.json",
    JSON.stringify(MyNFTArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });