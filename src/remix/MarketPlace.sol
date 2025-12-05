pragma solidity ^0.8.17;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./EventManager.sol";
import "./TicketNFT.sol";

contract Marketplace is ReentrancyGuard {
    TicketNFT public ticketContract;
    EventManager public eventManager;

    struct Listing {
        address seller;
        uint256 priceWei;
        bool exists;
    }

    mapping(uint256 => Listing) public listings;

    event Listed(uint256 indexed tokenId, address indexed seller, uint256 priceWei);
    event Sale(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 priceWei);
    event Cancelled(uint256 indexed tokenId, address indexed seller);

    constructor(address ticketContractAddr, address eventManagerAddr) {
        ticketContract = TicketNFT(ticketContractAddr);
        eventManager = EventManager(eventManagerAddr);
    }

    function listToken(uint256 tokenId, uint256 priceWei) external nonReentrant {
        require(ticketContract.ownerOf(tokenId) == msg.sender, "Marketplace: not owner");
        require(priceWei > 0, "Marketplace: zero price");
        
        require(
            ticketContract.getApproved(tokenId) == address(this) ||
            ticketContract.isApprovedForAll(msg.sender, address(this)),
            "Marketplace: not approved"
        );
        
        listings[tokenId] = Listing({ seller: msg.sender, priceWei: priceWei, exists: true });
        emit Listed(tokenId, msg.sender, priceWei);
    }

    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing storage l = listings[tokenId];
        require(l.exists, "Marketplace: not listed");
        require(l.seller == msg.sender, "Marketplace: not seller");
        delete listings[tokenId];
        emit Cancelled(tokenId, msg.sender);
    }

function buy(uint256 tokenId) external payable nonReentrant {
    Listing storage l = listings[tokenId];
    require(l.exists, "Marketplace: not listed");
    require(msg.value >= l.priceWei, "Marketplace: insufficient payment");
    
    uint256 refund = msg.value - l.priceWei;
    address seller = l.seller;
    
    //  VÉRIFICATIONS AVANT TOUT CHANGEMENT D'ÉTAT
    require(ticketContract.ownerOf(tokenId) == seller, "Marketplace: seller no longer owns token");
    require(
        ticketContract.getApproved(tokenId) == address(this) ||
        ticketContract.isApprovedForAll(seller, address(this)),
        "Marketplace: not approved"
    );

    uint256 eventId = getEventIdForTicket(tokenId);
    (,,,,address organizer, uint16 royaltyBps, uint256 maxResalePriceWei, bool resaleAllowed,) = eventManager.getEventBasics(eventId);

    require(resaleAllowed, "Marketplace: resale disabled for this event");
    if (maxResalePriceWei > 0) {
        require(l.priceWei <= maxResalePriceWei, "Marketplace: exceeds max resale price");
    }

    uint256 royalty = (uint256(royaltyBps) * l.priceWei) / 10000;
    uint256 sellerProceeds = l.priceWei - royalty;

    // ✅ SUPPRIMER LE LISTING AVANT LES TRANSFERTS 
    delete listings[tokenId];

    // ✅ TRANSFERT DU NFT EN PREMIER 
    ticketContract.safeTransferFrom(seller, msg.sender, tokenId);

    // ✅ PUIS LES TRANSFERTS D'ETH
    if (royalty > 0) {
        (bool royaltySuccess, ) = payable(organizer).call{value: royalty}("");
        require(royaltySuccess, "Marketplace: royalty transfer failed");
    }
    
    (bool sellerSuccess, ) = payable(seller).call{value: sellerProceeds}("");
    require(sellerSuccess, "Marketplace: seller transfer failed");
    
    if (refund > 0) {
        (bool refundSuccess, ) = payable(msg.sender).call{value: refund}("");
        require(refundSuccess, "Marketplace: refund failed");
    }

    emit Sale(tokenId, seller, msg.sender, l.priceWei);
}

    function getEventIdForTicket(uint256 tokenId) internal view returns (uint256) {
        (uint256 eventId, , ) = ticketContract.ticketData(tokenId);
        return eventId;
    }

    function getListing(uint256 tokenId) external view returns (address seller, uint256 priceWei, bool exists) {
        Listing storage l = listings[tokenId];
        return (l.seller, l.priceWei, l.exists);
    }
}