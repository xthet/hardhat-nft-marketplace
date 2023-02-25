// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// ^IERC721 is the ERC721 Interface it can initiate an ERC721 nft contract with
// the nft contract address

error NFTMarketplace__PriceMustBeAboveZero();
error NFTMarketplace__NotApprovedForMarketPlace();
error NFTMarketplace__AlreadyListed(address nftAddress_, uint256 tokenId_);
error NFTMarketplace__NotOwner();
error NFTMarketplace__NotListed(address nftAddress_, uint256 tokenId_);
error NFTMarketplace__PriceNotMet(address nftAddress_, uint256 tokenId_, uint256 price_);
error NFTMarketplace__NoProceeds();
error NFTMarketplace__TransferFailed();

contract NFTMarketplace is ReentrancyGuard
{
  // TYPES
  struct Listing // a marketplace listing
  {
    uint256 price;
    address seller;
  }

  struct Collection
  {
    string name;
    string symbol;
    address nftAddress;
  }

  // EVENTS
  event ItemListed
  (
    address indexed seller_,
    address indexed nftAddress_,
    uint256 indexed tokenId_,
    uint256 price_
  );

  event ItemBought
  (
    address indexed buyer_,
    address indexed nftAddress_,
    uint256 indexed tokenId_,
    uint256 price_
  );

  event ItemRemoved
  (
    address indexed seller_,
    address indexed nftAddress_,
    uint256 indexed tokenId_
  );
  
  event CollectionFound
  (
    string name_,
    string symbol_,
    address indexed nftAddress_
  );
  // VARIABLES
  // nft contract address -> nft tokenId -> listing
  mapping(address => mapping(uint256 => Listing)) private s_listings; 
  // ^items in the marketplace
  // seller address(i.e. merchant) -> amount earned
  mapping(address => uint256) private s_proceeds;
  // ^how much a merchant has earned
  mapping(address => Collection) private s_collections;
  // mapping(Collection => uint256) private s_listings;

  string private s_name;
  string private s_symbol;
  
  // MODIFIERS
  modifier notListed(address nftAddress_, uint256 tokenId_, address owner_) 
  {  // modifier checking to see if nft hasn't been listed already
    Listing memory listing = s_listings[nftAddress_][tokenId_];
    if(listing.price > 0){revert NFTMarketplace__AlreadyListed(nftAddress_, tokenId_);}
    // if listing price is 0 it means it hasn't been listed yet otherwise it has
    _;
  }

  modifier isOwner(address nftAddress_, uint256 tokenId_, address spender_)
  {  // modifier checking to see if msg.sender owns the nft
    IERC721 nft = IERC721(nftAddress_);
    address owner = nft.ownerOf(tokenId_);
    if(spender_ != owner){revert NFTMarketplace__NotOwner();}
    _;
  }

  modifier isListed(address nftAddress_, uint256 tokenId_)
  {  // making sure item is listed before buyItem()
    Listing memory listing = s_listings[nftAddress_][tokenId_];
    if(listing.price <= 0){revert NFTMarketplace__NotListed(nftAddress_, tokenId_);}
    _;
  }

  // MAIN FUNCTIONS
  // listing items
  /**@dev a function that lists nfts for sale in the marketplace
    *it requires approval from the owner of the nft to list the nft for sale
    *it uses chainlink pricefeeds to display the price of the nft in 
     different erc20 token units
   */
  function listItem(address nftAddress_, uint256 tokenId_, uint256 price_) external
  notListed(nftAddress_, tokenId_, msg.sender)  /** notListed modifier */  
  isOwner(nftAddress_, tokenId_, msg.sender)
  {  // nftAddress_ is the nft contract address
    if(price_ <= 0){revert NFTMarketplace__PriceMustBeAboveZero();}
    // 2.Owners can still own their nfts just give the marketplace the approval to sell it 
    // for them
    // that we can get from IERC721 which can wrap an address and require
    // approval before the address can be used
    IERC721 nft = IERC721(nftAddress_); 
    // ^wrapping it around the nft contract address initiating an IERC721 contract
    if(nft.getApproved(tokenId_) != address(this))
    {
      revert NFTMarketplace__NotApprovedForMarketPlace();
    }
    s_listings[nftAddress_][tokenId_] = Listing(price_, msg.sender);
    newCollection(nftAddress_);
    emit ItemListed(msg.sender, nftAddress_, tokenId_, price_);
  }

  function newCollection(address nftAddress_) public 
  {
    ERC721 nftContract = ERC721(nftAddress_); 
    s_name = nftContract.name();
    s_symbol = nftContract.symbol();
    s_collections[nftAddress_] = Collection(s_name, s_symbol, nftAddress_);
    emit CollectionFound(s_name, s_symbol, nftAddress_);
  }

  function buyItem(address nftAddress_, uint256 tokenId_) external payable 
  isListed(nftAddress_, tokenId_)
  nonReentrant
  {
    Listing memory listedItem = s_listings[nftAddress_][tokenId_];
    if(msg.value < listedItem.price)
    {
      revert NFTMarketplace__PriceNotMet(nftAddress_, tokenId_, listedItem.price);
    }
    s_proceeds[listedItem.seller] = s_proceeds[listedItem.seller] + msg.value;
    // ^merchant has earned his proceeds
    delete(s_listings[nftAddress_][tokenId_]);
    // ^listing has been removed from marketplace
    IERC721(nftAddress_).safeTransferFrom(listedItem.seller, msg.sender, tokenId_);
    // ^ERC721 transfering the nft to the buyer safetransfer to ensure EOA exists
    // ^note that we transfer only after all checks have been made preventing 
    // re-entrancy attacks
    // emit an even when you update a mapping
    emit ItemBought(msg.sender, nftAddress_, tokenId_, listedItem.price);
  }

  function cancelListing(address nftAddress_, uint256 tokenId_) external
  isOwner(nftAddress_, tokenId_, msg.sender)
  isListed(nftAddress_, tokenId_)
  {
    delete(s_listings[nftAddress_][tokenId_]);
    emit ItemRemoved(msg.sender, nftAddress_, tokenId_);
  }

  function updateListing(address nftAddress_, uint256 tokenId_, uint256 newPrice_) 
  external
  isOwner(nftAddress_, tokenId_, msg.sender)
  isListed(nftAddress_, tokenId_)
  {
    s_listings[nftAddress_][tokenId_].price = newPrice_;
    emit ItemListed(msg.sender, nftAddress_, tokenId_, newPrice_);
  }

  function withdrawProceeds() external nonReentrant
  {
    uint256 proceeds = s_proceeds[msg.sender];
    if(proceeds <= 0){revert NFTMarketplace__NoProceeds();}
    s_proceeds[msg.sender] = 0;  // checks before action (reentracy guard)
    (bool success, ) = payable(msg.sender).call{value: proceeds}("");
    if(!success){revert NFTMarketplace__TransferFailed();}
  }

  // GETTER FUNCTIONS
  function getListing(address nftAddress_, uint256 tokenId_) external view 
  returns(Listing memory)
  {
    return s_listings[nftAddress_][tokenId_];
  }

  function getProceeds(address seller_) external view returns(uint256)
  {
    return s_proceeds[seller_];
  }

  function getCollection(address nftAddress_) external view returns(Collection memory)
  {
    return s_collections[nftAddress_];
  }
}