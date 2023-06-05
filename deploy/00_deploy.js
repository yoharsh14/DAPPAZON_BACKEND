const { network } = require("hardhat");
const developmentChains = ["localhost", "hardhat"];
const { verify } = require("../utils/verify");
//address 0xa33E31c4B0105a68D72df489C885A32B7BfA7C79
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  const contract = await deploy("Dappazon", {
    from: deployer,
    args: [],
    log: true,
  });

  if (!developmentChains.includes(network.name)) {
    await verify(contract.address, []);
  }
};

module.exports.tags = ["all"];
