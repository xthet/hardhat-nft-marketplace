const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ()
{
  const { getNamedAccounts, deployments } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts() 

  args = []

  log("=================================")

  const NFTMarketplace = await deploy("NFTMarketplace", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1
  })

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) 
  {
    log("Verifying.....")
    await verify(NFTMarketplace.address, args)
  }

  log("=================================")
}

module.exports.tags = ["all", "nftmarketplace"]