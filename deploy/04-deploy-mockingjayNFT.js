const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function (hre)
{
  const { getNamedAccounts, deployments } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts() 

  args = []

  log("=================================")

  const mockingjayNFT = await deploy("MockingjayNFT", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1
  })

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) 
  {
    log("Verifying.....")
    await verify(mockingjayNFT.address, args)
  }

  log("=================================")
}

module.exports.tags = ["all", "mockingjaynft"]