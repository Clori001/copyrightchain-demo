const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const reviewerAddress = process.env.REVIEWER_ADDRESS || deployer.address;
  const CopyrightRegistry = await hre.ethers.getContractFactory("CopyrightRegistry");
  const registry = await CopyrightRegistry.deploy(reviewerAddress);
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  const deploymentTx = registry.deploymentTransaction();
  const network = await hre.ethers.provider.getNetwork();
  const networkName = process.env.NETWORK_NAME || "Monad Testnet";

  const info = {
    contractName: "CopyrightRegistry",
    network: networkName,
    contractAddress,
    deploymentTransaction: deploymentTx ? deploymentTx.hash : "",
    chainId: network.chainId.toString(),
    reviewerAddress
  };

  const rootInfoPath = path.join(__dirname, "..", "..", "deployment-info.json");
  const frontendInfoPath = path.join(__dirname, "..", "..", "frontend", "src", "contract", "deployment-info.json");

  fs.writeFileSync(rootInfoPath, `${JSON.stringify(info, null, 2)}\n`);
  fs.writeFileSync(frontendInfoPath, `${JSON.stringify(info, null, 2)}\n`);

  console.log("Contract deployed successfully");
  console.log(`Network: ${info.network}`);
  console.log(`Chain ID: ${info.chainId}`);
  console.log(`Contract Address: ${info.contractAddress}`);
  console.log(`Transaction: ${info.deploymentTransaction}`);
  console.log(`Reviewer: ${info.reviewerAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
