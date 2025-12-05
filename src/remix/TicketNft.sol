// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFT is ERC721Enumerable, ERC721URIStorage, Ownable {
    struct TicketData {
        uint256 eventId;
        uint8 ticketType;
        bool used;
    }

    mapping(uint256 => TicketData) public ticketData;
    mapping(uint256 => address[]) private _history;
    uint256 private _nextTokenId = 1;

    event TicketMinted(uint256 indexed tokenId, uint256 indexed eventId, address indexed to);
    event TicketUsed(uint256 indexed tokenId, uint256 indexed eventId, address indexed by);
    event TicketHistoryUpdated(uint256 indexed tokenId, address indexed owner);

    constructor(string memory name_, string memory symbol_) 
        ERC721(name_, symbol_)
        Ownable(msg.sender)
    {}

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override(ERC721, ERC721Enumerable) returns (address) {
        address from = super._update(to, tokenId, auth); // prop actuelle
        
        // Ajouter à l'historique seulement lors d'un transfert (pas mint)
        if (from != address(0) && to != address(0)) {
            _history[tokenId].push(to);
            emit TicketHistoryUpdated(tokenId, to);
        }
        
        return from;
    }

    function _increaseBalance(address account, uint128 value)
        internal
        virtual
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function mintFor(
        address to,
        uint256 eventId,
        uint8 ticketType,
        string memory _tokenURI
    ) external returns (uint256) {
        uint256 tid = _nextTokenId++;
        _safeMint(to, tid);
        _setTokenURI(tid, _tokenURI);
        ticketData[tid] = TicketData(eventId, ticketType, false);
        
        // Ajouter le premier propriétaire à l'historique
        _history[tid].push(to);
        
        emit TicketMinted(tid, eventId, to);
        emit TicketHistoryUpdated(tid, to);
        return tid;
    }

    function markUsed(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "TicketNFT: non-existent token");
        require(!ticketData[tokenId].used, "TicketNFT: already used");
        
        ticketData[tokenId].used = true;
        emit TicketUsed(tokenId, ticketData[tokenId].eventId, msg.sender);
    }

    function getHistory(uint256 tokenId) external view returns (address[] memory) {
        require(_ownerOf(tokenId) != address(0), "TicketNFT: non-existent token");
        return _history[tokenId];
    }

    function isUsed(uint256 tokenId) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "TicketNFT: non-existent token");
        return ticketData[tokenId].used;
    }
}