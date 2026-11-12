pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./TicketNFT.sol";

contract EventManager is Ownable, ReentrancyGuard {
    TicketNFT public ticketContract;

    struct TicketCategory {
        string name;
        uint256 priceWei;
        uint256 quantity;
        uint256 minted;
    }

    struct EventBasics {
        string title;                   
        string ipfsMetadataCID;       
        string location;
        uint256 date;
        address organizer;
        uint16 royaltyBps;
        uint256 maxResalePriceWei;
        bool resaleAllowed;
        uint8 categoryCount;
        bool exists;
    }

    mapping(uint256 => EventBasics) private eventBasics;
    mapping(uint256 => mapping(uint8 => TicketCategory)) private eventCategories;
    mapping(address => uint256[]) private userEvents;
    
    uint256 private _nextEventId = 1;

    event EventCreated(uint256 indexed eventId, address indexed organizer, string title, string ipfsMetadataCID);
    event TicketIssued(uint256 indexed eventId, uint256 indexed tokenId, address indexed to, uint256 pricePaid);
    event RefundIssued(address indexed to, uint256 amount);

    constructor(address ticketContractAddr) Ownable(msg.sender) {
        require(ticketContractAddr != address(0), "EventManager: invalid ticket contract");
        ticketContract = TicketNFT(ticketContractAddr);
    }

    function createEvent(
        string memory title,
        string memory ipfsMetadataCID,
        string memory location,
        uint256 date,
        uint16 royaltyBps,
        uint256 maxResalePriceWei,
        bool resaleAllowed
    ) external returns (uint256) {
        // Validations
        require(bytes(title).length > 0, "EventManager: title required");
        require(bytes(title).length <= 200, "EventManager: title too long");
        require(bytes(ipfsMetadataCID).length > 0, "EventManager: IPFS CID required"); 
        require(date > block.timestamp, "EventManager: date must be in future");
        require(royaltyBps <= 10000, "EventManager: royalty cannot exceed 100%");
        
        uint256 eid = _nextEventId++;
        
        eventBasics[eid] = EventBasics({
            title: title,
            ipfsMetadataCID: ipfsMetadataCID, 
            location: location,
            date: date,
            organizer: msg.sender,
            royaltyBps: royaltyBps,
            maxResalePriceWei: maxResalePriceWei,
            resaleAllowed: resaleAllowed,
            categoryCount: 0,
            exists: true
        });
        
        userEvents[msg.sender].push(eid);
        
        emit EventCreated(eid, msg.sender, title, ipfsMetadataCID);
        return eid;
    }

    
    function updateEventMetadata(uint256 eventId, string memory newIpfsCID) external {
        require(eventBasics[eventId].exists, "EventManager: event not exists");
        require(eventBasics[eventId].organizer == msg.sender, "EventManager: not organizer");
        require(bytes(newIpfsCID).length > 0, "EventManager: IPFS CID required");
        
        eventBasics[eventId].ipfsMetadataCID = newIpfsCID;
    }

    function getEventBasics(uint256 eventId) external view returns (
        string memory title,
        string memory ipfsMetadataCID,  
        string memory location,
        uint256 date,
        address organizer,
        uint16 royaltyBps,
        uint256 maxResalePriceWei,
        bool resaleAllowed,
        uint8 categoryCount
    ) {
        require(eventBasics[eventId].exists, "EventManager: event not exists");
        EventBasics storage e = eventBasics[eventId];
        return (
            e.title, 
            e.ipfsMetadataCID,  
            e.location, 
            e.date, 
            e.organizer, 
            e.royaltyBps, 
            e.maxResalePriceWei, 
            e.resaleAllowed, 
            e.categoryCount
        );
    }

    function getEventIpfsCID(uint256 eventId) external view returns (string memory) {
        require(eventBasics[eventId].exists, "EventManager: event not exists");
        return eventBasics[eventId].ipfsMetadataCID;
    }

    function addCategory(
        uint256 eventId,
        string memory categoryName,
        uint256 priceWei,
        uint256 quantity
    ) external {
        require(eventBasics[eventId].exists, "EventManager: event not exists");
        require(eventBasics[eventId].organizer == msg.sender, "EventManager: not organizer");
        require(bytes(categoryName).length > 0, "EventManager: category name required");
        require(quantity > 0, "EventManager: invalid quantity");
        require(quantity <= 100000, "EventManager: quantity too high");
        
        EventBasics storage e = eventBasics[eventId];
        uint8 idx = e.categoryCount;
        
        eventCategories[eventId][idx] = TicketCategory({
            name: categoryName,
            priceWei: priceWei,
            quantity: quantity,
            minted: 0
        });
        
        e.categoryCount = idx + 1;
    }

    function buyTicketPrimary(uint256 eventId, uint8 categoryIdx) 
        external 
        payable 
        nonReentrant 
        returns (uint256) 
    {
        require(eventBasics[eventId].exists, "EventManager: event not exists");
        EventBasics storage e = eventBasics[eventId];
        require(block.timestamp < e.date, "EventManager: event has passed");
        require(categoryIdx < e.categoryCount, "EventManager: bad category");
        
        TicketCategory storage cat = eventCategories[eventId][categoryIdx];
        require(cat.minted < cat.quantity, "EventManager: sold out");
        require(msg.value >= cat.priceWei, "EventManager: insufficient payment");

        uint256 excess = msg.value - cat.priceWei;

        cat.minted += 1;

        string memory tokenUri = string(abi.encodePacked(
            "ipfs://event-", 
            toString(eventId), 
            "-ticket-", 
            toString(cat.minted)
        ));

        uint256 tokenId = ticketContract.mintFor(msg.sender, eventId, categoryIdx, tokenUri);

        emit TicketIssued(eventId, tokenId, msg.sender, cat.priceWei);

        if (excess > 0) {
            (bool successRefund, ) = payable(msg.sender).call{value: excess}("");
            require(successRefund, "EventManager: refund failed");
            emit RefundIssued(msg.sender, excess);
        }

        (bool successOrganizer, ) = payable(e.organizer).call{value: cat.priceWei}("");
        require(successOrganizer, "EventManager: transfer to organizer failed");

        return tokenId;
    }

    function getCategory(uint256 eventId, uint8 idx) external view returns (
        string memory name, 
        uint256 priceWei, 
        uint256 quantity, 
        uint256 minted
    ) {
        require(eventBasics[eventId].exists, "EventManager: event not exists");
        require(idx < eventBasics[eventId].categoryCount, "EventManager: bad category");
        TicketCategory storage c = eventCategories[eventId][idx];
        return (c.name, c.priceWei, c.quantity, c.minted);
    }

    function getTotalTickets(uint256 eventId) external view returns (uint256 total) {
        require(eventBasics[eventId].exists, "EventManager: event not exists");
        EventBasics storage e = eventBasics[eventId];
        for (uint8 i = 0; i < e.categoryCount; i++) {
            total += eventCategories[eventId][i].quantity;
        }
        return total;
    }

    function getAvailableTickets(uint256 eventId) external view returns (uint256 available) {
        require(eventBasics[eventId].exists, "EventManager: event not exists");
        EventBasics storage e = eventBasics[eventId];
        for (uint8 i = 0; i < e.categoryCount; i++) {
            TicketCategory storage cat = eventCategories[eventId][i];
            available += (cat.quantity - cat.minted);
        }
        return available;
    }

    function getUserEvents(address user) external view returns (uint256[] memory) {
        return userEvents[user];
    }

    function getAllEvents(uint256 startFrom, uint256 limit) external view returns (uint256[] memory) {
        require(limit > 0 && limit <= 100, "EventManager: limit must be 1-100");
        uint256 end = _nextEventId;
        uint256 start = startFrom > 0 ? startFrom : 1;
        uint256 count = 0;
        
        for (uint256 i = start; i < end && count < limit; i++) {
            if (eventBasics[i].exists) {
                count++;
            }
        }
        
        uint256[] memory events = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = start; i < end && index < count; i++) {
            if (eventBasics[i].exists) {
                events[index] = i;
                index++;
            }
        }
        return events;
    }

    function getTotalEventsCount() external view returns (uint256) {
        return _nextEventId - 1;
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
