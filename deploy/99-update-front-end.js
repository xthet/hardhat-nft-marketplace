const { ethers, network } = require("hardhat")
const fs = require("fs")

const frontEndContractsFile = "../nextjs-nft-marketplace/constants/networkMapping.json" // file location
const frontEndABILocation = "../nextjs-nft-marketplace/constants/" // folder location

module.exports = async () => 
{
  if(process.env.UPDATE_FRONT_END)
  {
    console.log("Updating Front End...")
    await updatingContractAddresses()
    await updateABI()
  }
}

async function updatingContractAddresses()
{
  const NFTMarketplace = await ethers.getContract("NFTMarketplace")
  const chainId = network.config.chainId.toString()
  const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8")) // turning it to an object
  if(chainId in contractAddresses) // if our chain id is in there
  {
    if(!contractAddresses[chainId]["NFTMarketplace"].includes(NFTMarketplace.address))
    { // ^ asking to update the object with our contract address
      contractAddresses[chainId]["NFTMarketplace"].push(NFTMarketplace.address)
    }
  }
  else
  {
    contractAddresses[chainId] = { "NFTMarketplace":[NFTMarketplace.address] } // creating the object within the file
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses)) // writing the object to the file
}

async function updateABI()
{
  const NFTMarketplace = await ethers.getContract("NFTMarketplace")
  const basicNFT = await ethers.getContract("BasicNFT")

  fs.writeFileSync(`${frontEndABILocation}NFTMarketplace.json`, 
    NFTMarketplace.interface.format(ethers.utils.FormatTypes.json)) // the contract abi
  fs.writeFileSync(`${frontEndABILocation}basicNFT.json`, 
    basicNFT.interface.format(ethers.utils.FormatTypes.json))
}

module.exports.tags = ["all", "frontend"]