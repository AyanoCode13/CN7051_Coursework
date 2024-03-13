const { expect } = require("chai");
const hre = require("hardhat");

const SYMBOL = "NFTK"
const NAME = "NFTicket"

//Write a test that verifies that the NFTicket contract is deployed with the right parameters.
describe("NFTicket", function () {
    let nft, deployer, customer;
    
    beforeEach(async () => {
        const [owner, addr1] = await hre.ethers.getSigners();
        deployer = owner
        customer = addr1
        
        const NFTicket = await hre.ethers.getContractFactory("NFTicket");
        nft = await NFTicket.deploy(NAME,SYMBOL,owner.address);
       
        await nft.waitForDeployment();
        const transaction = await nft.connect(owner).createEvent(
            "Flow Concert",
            hre.ethers.parseUnits("1","ether"),
            "2025-12-12",
            "10:00PM CST",
            "Tokyo, JPN",
            100
        );
        const transaction2 = await nft.connect(owner).createEvent(
            "Wrestlemania",
            hre.ethers.parseUnits("0.5","ether"),
            "2024-10-18",
            "10:00PM CST",
            "New York, USA",
            200
        );
        await transaction.wait();
        await transaction2.wait();


    });
    describe("Deployment", function () {
        it("Should return the right name and symbol", async function () {
            expect(await nft.name()).to.equal(NAME);
            expect(await nft.symbol()).to.equal(SYMBOL);
        });
    });
    describe("Event Creation", function () {
      it("check if the total tickets has been increased", async function () {
        expect(await nft.totalEvents()).to.equal(2);
      })
    });

    describe("Event View", function () {
       
        it("returns all the events", async function () {
            const events = await nft.viewAllEvents();
            expect(events.length).to.equal(2);
        })
        it("returns the event details", async function () {
            const event = await nft.viewEvent(1);
            expect(event._name).to.equal("Flow Concert");
            expect(event.price).to.equal(hre.ethers.parseUnits("1","ether"));
            expect(event._date).to.equal("2025-12-12");
            expect(event._time).to.equal("10:00PM CST");
            expect(event._location).to.equal("Tokyo, JPN");
            expect(event.maxTickets).to.equal(100);

            const event2 = await nft.viewEvent(2);
            expect(event2._name).to.equal("Wrestlemania");
            expect(event2.price).to.equal(hre.ethers.parseUnits("0.5","ether"));
            expect(event2._date).to.equal("2024-10-18");
            expect(event2._time).to.equal("10:00PM CST");
            expect(event2._location).to.equal("New York, USA");
            expect(event2.maxTickets).to.equal(200);

        })
    })
    describe("Withdraw", async function () {
        let customerBalance;
        beforeEach(async () => {
            customerBalance = await hre.ethers.provider.getBalance(customer.address);
            const transaction =  await nft.connect(customer).buyTicket(1, { value: hre.ethers.parseUnits("1","ether") });
            await transaction.wait();
        })

        it("Updated the contract balance", async function () {
            const contractBalance = await hre.ethers.provider.getBalance(nft.target);
           expect(contractBalance).to.equal(hre.ethers.parseUnits("1","ether"));
        });
        
        it("Updated the customer balance", async function () {
            const customerBalanceUpdated = await hre.ethers.provider.getBalance(customer.address);
            expect(customerBalanceUpdated).to.be.lessThan(customerBalance);
        });

        it("Updated the owner balance", async function () {
            const ownerBalance = await hre.ethers.provider.getBalance(deployer.address);
            const transaction =  await nft.connect(deployer).withdrawFunds();
            await transaction.wait();
            const ownerBalanceUpdated = await hre.ethers.provider.getBalance(deployer.address);
            expect(ownerBalanceUpdated).to.be.greaterThan(ownerBalance);
        })
    })
});
