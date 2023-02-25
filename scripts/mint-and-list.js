const { network, ethers } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const PRICE = ethers.utils.parseEther("0.05")

async function mintAndList()
{
  const NFTMarketplace = await ethers.getContract("NFTMarketplace")
  const fishyTroopersNFT = await ethers.getContract("FishyTroopersNFT")

  console.log("Minting...")
  const mintTx = await fishyTroopersNFT.mintNft()
  const mintTxR = await mintTx.wait(1)
  const tokenId = mintTxR.events[0].args.tokenId

  console.log("Approving NFT...")
  const approvalTx = await fishyTroopersNFT.approve(NFTMarketplace.address, tokenId)
  await approvalTx.wait(1)

  console.log("Listing NFT...")
  const listTx = await NFTMarketplace.listItem(fishyTroopersNFT.address, tokenId, PRICE)
  await listTx.wait(1)
  console.log("Listed")

  if(network.config.chainId == 31337)
  {
    await moveBlocks(2, (sleepTime = 1000))
  }
}

mintAndList()
  .then(()=>{process.exit(0)})
  .catch((e)=>
  {
    console.log(e)
    process.exit(1)
  })