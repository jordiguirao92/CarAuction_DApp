Web3 = require('web3');

const MyAuction = artifacts.require('MyAuction');


contract ('MyAuction', function(accounts){

    let carAuction; 
    let weiBidPrice = Web3.utils.toWei('1', 'ether');
   
    const ourAuction = {
        carNumber: "234KDE",
        carBrand: "HONDA",
        carOwner: 0x345503ce4B472cE35186AA87A9C6e600C94Bcf71,
        biddingTime: 1
    }


    beforeEach(async () => {
        carAuction = await MyAuction.new(1, "0x345503ce4B472cE35186AA87A9C6e600C94Bcf71", "HONDA", "234KDE");
    });

    it("Comprobando el owner del contrato", async() => {
        const owner = await carAuction.get_owner({ from: accounts[0] });
        assert.equal(owner, ourAuction.carOwner, "La dirección del owner ha de ser la misma que en el constructor");
    })

    it("Revisando datos del coche", async() => {
        const carDetails = await carAuction.Mycar.call();
        assert.equal(carDetails[0],ourAuction.carBrand, "La marca ha de ser la misma");
        assert.equal(carDetails[1],ourAuction.carNumber, "La matricula ha de ser la misma");
    })


    it("Haciendo una apuesta", async() => {
        await carAuction.bid({ from: accounts[1], value: weiBidPrice });
        const bidHight = await carAuction.highestBid.call();
        const highBidder = await carAuction.highestBidder.call();
        assert.equal(bidHight, 1000000000000000000, "Precio mas alto de la apuesta");
        assert.equal(highBidder, accounts[1], "El usuario que reliza la transacción es el highest bidder");
    })


});