const { network, ethers } = require("hardhat")
const { moveBlocks, sleep } = require("../utils/move-blocks")

const TOKEN_ID = 0

async function remove()
{
  const NFTMarketplace = await ethers.getContract("NFTMarketplace")
  const basicNFT = await ethers.getContract("BasicNFT")

  const tx = await NFTMarketplace.cancelListing(basicNFT.address, TOKEN_ID)
  await tx.wait(1)
  console.log("NFT Removed")
  
  if(network.config.chainId == 31337)
  {
    await moveBlocks(2, (sleepTIme = 1000))
  }
}

remove()
  .then(()=>{process.exit(0)})
  .catch((e)=>
  {
    console.log(e)
    process.exit(1)
  })