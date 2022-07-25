const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts, waffle } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name) ? describe.skip : describe("NFT Marketplace Tests", function ()
{
  let NFTMarketplace, basicNFT, deployer, player
  const PRICE = ethers.utils.parseEther("0.1")
  const TOKEN_ID = 0
  beforeEach(async function()
  {
    deployer = (await getNamedAccounts()).deployer
    // player = (await getNamedAccounts()).player // this gives player address accounts[1] gives player OBJECT
    const accounts = await ethers.getSigners()
    player = accounts[1]
    await deployments.fixture(["all"]) // deploying all contracts
    NFTMarketplace = await ethers.getContract("NFTMarketplace") // this by default uses deployer as the msg.sender
    basicNFT = await ethers.getContract("BasicNFT")
    await basicNFT.mintNft()
    // approving nftmarketplace to list our nft
    await basicNFT.approve(NFTMarketplace.address, TOKEN_ID)
  })
  
  it("lists and can be bought", async function()
  {
    await NFTMarketplace.listItem(basicNFT.address, TOKEN_ID, PRICE) // listing our nft
    const playerConnectNFTMarketplace = await NFTMarketplace.connect(player) // connects to account object not address
    await playerConnectNFTMarketplace.buyItem(basicNFT.address, TOKEN_ID, { value: PRICE })
    const newOwner = await basicNFT.ownerOf(TOKEN_ID)
    const deployerProceeds = await NFTMarketplace.getProceeds(deployer)
    assert(newOwner.toString() == player.address)
    assert(deployerProceeds.toString() == PRICE.toString())
  })

  it("withdraws proceeds", async function ()
  {
    const tx4 = await NFTMarketplace.listItem(basicNFT.address, TOKEN_ID, PRICE) // listing our nft
    const tx4R = await tx4.wait(1)
    const playerConnectNFTMarketplace = await NFTMarketplace.connect(player)
    const tx3 = await playerConnectNFTMarketplace.buyItem(basicNFT.address, TOKEN_ID, { value: PRICE })
    const tx3R = await tx3.wait(1)
    // proceeds available
    const initContractBalance = (await waffle.provider.getBalance(NFTMarketplace.address))
    const deployerProceedsBefore = await NFTMarketplace.getProceeds(deployer)
    const deployerBalanceBefore = await waffle.provider.getBalance(deployer)
    const tx = await NFTMarketplace.withdrawProceeds()
    const txReceipt = await tx.wait(1)
    const { gasUsed, effectiveGasPrice } = txReceipt
    const gasCost = gasUsed.mul(effectiveGasPrice)
    const finalContractBalance = (await waffle.provider.getBalance(NFTMarketplace.address))

    const deployerBalanceAfter = await waffle.provider.getBalance(deployer)

    assert(deployerBalanceAfter.add(gasCost).toString() == deployerProceedsBefore.add(deployerBalanceBefore).toString())
    assert.equal(finalContractBalance.toString(), (initContractBalance.sub(PRICE)).toString())
  })
})