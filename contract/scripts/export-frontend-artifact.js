const fs = require("fs");
const path = require("path");

const artifactPath = path.join(
  __dirname,
  "..",
  "artifacts",
  "contracts",
  "CopyrightRegistry.sol",
  "CopyrightRegistry.json"
);

const frontendContractDir = path.join(__dirname, "..", "..", "frontend", "src", "contract");
const abiPath = path.join(frontendContractDir, "abi.json");
const artifactTsPath = path.join(frontendContractDir, "contractArtifact.ts");

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

fs.writeFileSync(abiPath, `${JSON.stringify(artifact.abi, null, 2)}\n`);
fs.writeFileSync(
  artifactTsPath,
  `export const COPYRIGHT_REGISTRY_BYTECODE = "${artifact.bytecode}";\n`
);

console.log("Frontend contract ABI and bytecode exported.");
