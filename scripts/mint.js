const { network, ethers } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const PRICE = ethers.utils.parseEther("0.1")

async function mint()
{
  const NFTMarketplace = await ethers.getContract("NFTMarketplace")
  const fishyTroopersNFT = await ethers.getContract("FishyTroopersNFT")

  console.log("Minting...")
  const mintTx = await fishyTroopersNFT.mintNft()
  const mintTxR = await mintTx.wait(1)
  const tokenId = mintTxR.events[0].args.tokenId
  console.log(`NFT Address: ${fishyTroopersNFT.address}`)
  console.log(`Token ID: ${tokenId}`)
  console.log(`Approve for: ${NFTMarketplace.address}`)

  if(network.config.chainId == 31337)
  {
    await moveBlocks(2, (sleepTime = 1000))
  }
}

mint()
  .then(()=>{process.exit(0)})
  .catch((e)=>
  {
    console.log(e)
    process.exit(1)
  })