// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTicket is ERC721,Ownable {
    uint256 private nextEvent_id;
    
    constructor(string memory name, string memory symbol, address contractOwner)
        ERC721(name, symbol)
        Ownable(contractOwner)
    {}
    struct ListedEvent{
        uint256 id;
        string _name;
        uint256 price;
        address owner;
        string _date;
        string _time;
        string _location;
        uint256 tickets;// The amount of tickets that have been sold
        uint256 maxTickets; // The maximum number of tickets that can be sold

        
    }
    mapping(uint256 => ListedEvent) private listedEvents;

    function createEvent(string memory _name, uint256 _price, string memory _date, string memory _time, string memory _location, uint256 _maxTickets) public onlyOwner {
        nextEvent_id++;
        listedEvents[nextEvent_id] = ListedEvent(nextEvent_id, _name, _price, msg.sender, _date, _time, _location, 0, _maxTickets);
       
    }
    function buyTicket(uint256 _id) public payable {
        require(msg.sender != owner(), 'You cannot buy ticket to your own event');
        require(msg.value == listedEvents[_id].price, "Insufficient funds");
        require(listedEvents[_id].tickets < listedEvents[_id].maxTickets, "No more tickets available");
        listedEvents[_id].tickets++;
        _safeMint(msg.sender, listedEvents[_id].id);
    
    }

    //A function that allows the owner of the NFT to withdraw the funds from the sale of the tickets
    function withdrawFunds() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    //Create a function that allows the owner to change the price of the event
    function changePrice(uint256 _id, uint256 _price) public onlyOwner {
        listedEvents[_id].price = _price;
    }
    //Create a function that allows the owner to change the date and time of the event
    function changeDateTime(uint256 _id, string memory _date, string memory _time) public onlyOwner {
        listedEvents[_id]._date = _date;
        listedEvents[_id]._time = _time;
    }
    //Create a function that allows the owner to change the location of the event
    function changeLocation(uint256 _id, string memory _location) public onlyOwner {
        listedEvents[_id]._location = _location;
    }
   
    //Create a ftunction that returns an event
    function viewEvent(uint256 _id) public view returns (ListedEvent memory) {
        return listedEvents[_id];
    }
    
    //Create a function that lists all the events
    function viewAllEvents() public view returns (ListedEvent[] memory) {
        ListedEvent[] memory events = new ListedEvent[](nextEvent_id);
        for (uint256 i = 1; i <= nextEvent_id; i++) {
            events[i - 1] = listedEvents[i];
        }
        return events;
    }
    //Create a function that returns the total number of events
    function totalEvents() public view returns (uint256) {
        return nextEvent_id;
    }
    
}