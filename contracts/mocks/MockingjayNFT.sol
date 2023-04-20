// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockingjayNFT is ERC721 {
    string public constant TOKEN_URI =
        "ipfs://QmUhYGPhpyncdCNr5G2rWwRGaiTv9PQfnoNPDDdZ1RjaaH";
    uint256 private s_tokenCounter;

    event MockingjayMinted(uint256 indexed tokenId);

    constructor() ERC721("Mockingjay", "MKJ") {
        s_tokenCounter = 0;
    }

    function mintNft() public {
        _safeMint(msg.sender, s_tokenCounter);
        emit MockingjayMinted(s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}