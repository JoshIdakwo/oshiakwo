// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Oshiakwo is ERC721, ERC721Enumerable, ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    string internal image1 = "https://i0.wp.com/fasbest.com/wp-content/uploads/2017/07/Cool-Casual-Street-Style-Outfit-Ideas-2017-19-1.jpg?fit=820%2C1230&ssl=1";
    string internal image2 = "https://th.bing.com/th/id/R.f1f77e67b01b3c2d7859060b1ac9d17c?rik=AlqUcRtZDSwNCw&riu=http%3a%2f%2fohhmymy.com%2fwp-content%2fuploads%2f2015%2f09%2fspring-2015-trendy-casual-outfits-for-women.jpg&ehk=bMlH9Ofs7x4RN%2bP9GE%2fglSmuZapOtr7NCbfGSOIvG%2fU%3d&risl=&pid=ImgRaw&r=0";

    constructor() ERC721("Oshiakwo", "OSK") {}

    struct Style {
        address payable owner;
        string name;
        uint256 price;
        bool sold;
        bool swapRequest;
    }
    struct Swap {
        uint256 giveStyle;
        uint256 receiveStyle;
    }

    mapping(uint256 => Style) public styles;
    mapping(uint256 => mapping(address => bool)) public favs;
    mapping(uint256 => address) public requests;
    mapping(address => Swap) public swaps;

    modifier styleOwner(uint256 _tokenId) {
        require(msg.sender == styles[_tokenId].owner, "Only owner is allowed to carry out this operation");
        _;
    }

    function storeStyle(string memory _name, uint256 _price, string memory _url) public {
        bool _sold = false;
        bool _swapRequest = false;
        styles[_tokenIdCounter.current()] = Style (
            payable(msg.sender),
            _name,
            _price,
            _sold,
            _swapRequest
        );
        // Style storage style = styles[_tokenIdCounter.current()];
        // style.owner = payable(msg.sender);
        // style.name = _name;
        // style.price = _price;

        // mint style in an NFT
        _safeMint(msg.sender, _tokenIdCounter.current());
        _setTokenURI(_tokenIdCounter.current(), _url);

        _tokenIdCounter.increment();
    }


    function getStyles(uint256 tokenId) public view returns(Style memory) {
        Style storage style = styles[tokenId];
        return style;
    }

// NB: style 1: NFT to be exchanged
//     style 2: NFT desired
    function requestSwap(uint256 _style1, uint256 _style2) public {
        require(!styles[_style2].swapRequest, "Style currently has a swap request on");
        require(msg.sender != styles[_style2].owner, "Owner can't request swap for owned style nft");

        styles[_style2].swapRequest = true;
        requests[_style2] = msg.sender;

        swaps[msg.sender] = Swap(
            _style1,
            _style2
        );
    }

    function approveSwap(uint256 _style1, uint256 _style2) public styleOwner(_style2) {
        address owner1 = ownerOf(_style1);
        address owner2 = ownerOf(_style2);

        require(styles[_style2].swapRequest, "No swap request has been made");
        require(swaps[owner1].receiveStyle == _style2, "Invalid token ID");
        require(swaps[owner1].giveStyle == _style1, "Invalid token ID");
        
        if(requests[_style2] != address(this)) {
            // swap NFTs between owners
            _transfer(owner1, owner2, _style1);
            _transfer(owner2, owner1, _style2);

            // change the owner of each style struct
            styles[_style1].owner = payable(owner2);
            styles[_style2].owner = payable(owner1);

            requests[_style2] = address(this);
            styles[_style2].swapRequest = false;
        }
    }

    /**
    * @notice Function to buy an uploaded styles using the style's tokenId
    * @dev the selling price is transferred from the buyer to the owner/seller of the style
    */
    function buyStyle(uint256 _tokenId) public payable  {
        Style storage style = styles[_tokenId];
        require(msg.sender != style.owner, "Can't buy your own painting");
        require(!style.sold, "Sorry, painting is already sold");
        require(msg.value >= style.price, "Invalid painting price");

        address _owner = style.owner;
        style.owner = payable(msg.sender);
        style.sold = true;

        _transfer(_owner, msg.sender, _tokenId);

        (bool success,) = payable(_owner).call{value:msg.value}("");
        require(success, "Transfer failed");
	}

    /**
    * @notice Function to like and unlike a particular style
    * @dev the favs bool value for a particular user is changed to the opposite when the function is called
    */
    function favStyle(uint256 _tokenId) public {
        favs[_tokenId][msg.sender] = !favs[_tokenId][msg.sender];
    }





//  The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
