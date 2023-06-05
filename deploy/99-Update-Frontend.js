const { ethers, network } = require("hardhat");
const fs = require("fs");
const frontEnd_Contract_Address_File_Location =
  "../frontend/src/constants/networkMapping.json";
const frontEnd_Contract_ABI_File_Location = "../frontend/src/constants/";
module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log("updating frontend...");
    await updateContractAddress();
    await updateabi();
  }
};

const updateContractAddress = async () => {
  const contract = await ethers.getContract("Dappazon");
  const chainId = network.config.chainId.toString();
  const contractAddress = contract.address;
  const JSON_READ_FILE = JSON.parse(
    fs.readFileSync(frontEnd_Contract_Address_File_Location, "utf8")
  );
  if (chainId in JSON_READ_FILE) {
    if (!JSON_READ_FILE[chainId]["dappazon"].includes(contractAddress)) {
      JSON_READ_FILE[chainId]["dappazon"].push(contractAddress);
    }
  } else {
    JSON_READ_FILE[chainId] = { dappazon: [contractAddress] };
  }
  fs.writeFileSync(
    frontEnd_Contract_Address_File_Location,
    JSON.stringify(JSON_READ_FILE)
  );
};

const updateabi = async () => {
  const contract = await ethers.getContract("Dappazon");
  fs.writeFileSync(
    `${frontEnd_Contract_ABI_File_Location}Dappazon.json`,
    contract.interface.format(ethers.utils.FormatTypes.json)
  );
};
