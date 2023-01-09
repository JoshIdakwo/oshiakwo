// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Oshiakwo is ERC721, ERC721Enumerable, ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("Oshiakwo", "OSK") {}

    struct Style {
        address payable owner;
        string name;
        uint256 price;
        bool sold;
        bool swapRequest;
        address requestorAddr;
        uint256 requestStyleId;
    }

    mapping(uint256 => Style) private styles;
    mapping(uint256 => mapping(address => bool)) public favs;

    modifier styleOwner(uint256 _tokenId) {
        require(
            msg.sender == styles[_tokenId].owner,
            "Only owner is allowed to carry out this operation"
        );
        _;
    }

    /**
     * @notice Function to create and mint a style NFT
     */
    function storeStyle(
        string calldata _name,
        uint256 _price,
        string calldata _url
    ) public {
        bool _sold = false;
        bool _swapRequest = false;
        address _requestorAddr = address(0);
        uint256 _requestStyleId = 0;

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        styles[tokenId] = Style(
            payable(msg.sender),
            _name,
            _price,
            _sold,
            _swapRequest,
            _requestorAddr,
            _requestStyleId
        );

        // mint style in an NFT
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _url);
    }

    function getStyles(uint256 tokenId) public view returns (Style memory) {
        Style storage style = styles[tokenId];
        return style;
    }

    // NB: style 1: NFT to be exchanged
    //     style 2: NFT desired
    function requestSwap(uint256 _style1, uint256 _style2) public {
        Style storage style2 = styles[_style2];
        Style storage style1 = styles[_style1];
        require(
            _exists(_style1) && _exists(_style2),
            "Query of nonexistent style"
        );
        require(
            style2.sold && style1.sold,
            "Style swaps can only occur on styles that aren't for sale"
        );
        require(
            style1.owner == msg.sender,
            "Sender is not the owner of the first style"
        );
        require(
            !style2.swapRequest && !style1.swapRequest,
            "One of the style currently has a swap request on"
        );
        require(
            msg.sender != style2.owner,
            "Owner can't request swap for owned style nft"
        );

        style2.swapRequest = true;
        style2.requestorAddr = msg.sender;
        style2.requestStyleId = _style1;

        style1.swapRequest = true;
    }

    /**
     * @notice Function to end a swap request for a style's token
     * @dev if swap request is accepted, trade of NFTs will occur. Otherwise, values are reset to unlock other functionalities for each token
     * @param confirmSwap boolean value to confirm or decline swap
     */
    function endSwap(uint256 _style2, bool confirmSwap)
        public
        styleOwner(_style2)
    {
        Style storage style2 = styles[_style2];
        Style storage style1 = styles[style2.requestStyleId];

        require(
            style2.swapRequest && style1.swapRequest,
            "No swap request has been made"
        );

        uint256 style1Id = style2.requestStyleId;
        style2.requestorAddr = address(0);
        style2.requestStyleId = 0;

        style2.swapRequest = false;
        style1.swapRequest = false;
        if (confirmSwap) {
            address owner1 = style1.owner;
            address owner2 = style2.owner;

            // change the owner of each style struct
            style1.owner = payable(owner2);
            style2.owner = payable(owner1);

            // swap NFTs between owners
            _transfer(owner1, owner2, style1Id);
            _transfer(owner2, owner1, _style2);
        }
    }

    /**
     * @notice Function to buy an uploaded styles using the style's tokenId
     * @dev the selling price is transferred from the buyer to the owner/seller of the style
     */
    function buyStyle(uint256 _tokenId) public payable {
        Style storage style = styles[_tokenId];
        require(msg.sender != style.owner, "Can't buy your own style");
        require(!style.sold, "Sorry, style is already sold");
        require(msg.value == style.price, "Invalid style price");

        address _owner = style.owner;
        style.owner = payable(msg.sender);
        style.sold = true;

        _transfer(_owner, msg.sender, _tokenId);

        (bool success, ) = payable(_owner).call{value: msg.value}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice Function to like and unlike a particular style
     * @dev the favs bool value for a particular user is changed to the opposite when the function is called
     */
    function favStyle(uint256 _tokenId) public {
        require(_exists(_tokenId));
        favs[_tokenId][msg.sender] = !favs[_tokenId][msg.sender];
    }

    /**
     * @notice Function to toggle sold value and start or cancel a sale of a style
     * @dev the sold bool value for a particular style is changed to the opposite when the function is called
     */
    function toggleSold(uint256 _tokenId) public {
        Style storage style = styles[_tokenId];
        require(msg.sender == style.owner);
        require(
            !style.swapRequest,
            "the sold status of a style can't be toggled while involved in a swap request"
        );
        style.sold = !style.sold;
    }

    //  The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
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

    /**
     * @dev See {IERC721-transferFrom}.
     * Changes is made to transferFrom to keep track of owner value for struct Style
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        require(
            !styles[tokenId].swapRequest,
            "Style is currently involved in a swap request"
        );
        styles[tokenId].owner = payable(to);
        super.transferFrom(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     * Changes is made to transferFrom to keep track of owner value for struct Style
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override {
        require(
            !styles[tokenId].swapRequest,
            "Style is currently involved in a swap request"
        );
        styles[tokenId].owner = payable(to);
        _safeTransfer(from, to, tokenId, data);
    }
}
