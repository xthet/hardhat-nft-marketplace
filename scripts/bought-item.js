const { network, ethers } = require("hardhat")
const { moveBlocks, sleep } = require("../utils/move-blocks")

const TOKEN_ID = 3
// const PRICE = ethers.utils.parseEther("0.1")


async function bought()
{
  const NFTMarketplace = await ethers.getContract("NFTMarketplace")
  const basicNFT = await ethers.getContract("BasicNFT")

  console.log("buying nft...")
  const listing = await NFTMarketplace.getListing(basicNFT.address, TOKEN_ID)
  const listingPrice = listing.price.toString()

  const tx = await NFTMarketplace.buyItem(basicNFT.address, TOKEN_ID, { value: listingPrice })
  await tx.wait(1)
  console.log("bought nft...")

  if(network.config.chainId == 31337)
  {
    await moveBlocks(2, (sleepTIme = 1000))
  }
}

bought()
  .then(()=>{process.exit(0)})
  .catch((e)=>
  {
    console.log(e)
    process.exit(1)
  })