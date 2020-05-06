
let web3;
let bidder;
let Auction;
let auction;
let web3Provider;
let contractAbi;


async function init() {

  if (window.ethereum) {
    web3Provider = window.ethereum;
    try {
      // Request account access
      await window.ethereum.enable();
      console.log("Account access OK");
    } catch (error) {
      // User denied account access...
      console.error("User denied account access")
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    web3Provider = window.web3.currentProvider;
  }
  // If no injected web3 instance is detected, fall back to Ganache
  else {
    web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
  }
  web3 = new Web3(web3Provider);
  console.log(web3Provider);

  return initiate();
}


	
async function initiate(){

    const data = await $.getJSON('MyAuction.json')
    console.log(data);
    console.log(data.abi)
    console.log(JSON.stringify(data.abi));
    contractAbi = JSON.stringify(data.abi);
    var AuctionArtifact = data;
    console.log("data ok");
   
    Auction = TruffleContract(AuctionArtifact);
    console.log("Truffle Contract ok");
  
    Auction.setProvider(web3Provider);
    console.log("setprovider ok");

    auction = await Auction.deployed();
  
    bidder = await web3.eth.accounts[0];
    web3.eth.defaultAccount = bidder;
    console.log(bidder);

    let auctionEnd = await auction.auction_end.call();
    var time = new Date(auctionEnd*1000);
    document.getElementById("auction_end").innerHTML= auctionEnd +" - "+ time.toUTCString();

    let highestBidder = await auction.highestBidder.call()
    document.getElementById("HighestBidder").innerHTML= highestBidder;
  
    let highestBid = await auction.highestBid.call();
    let result = web3.fromWei(highestBid, 'ether');
    document.getElementById("HighestBid").innerHTML= result;
      
    let state = await auction.STATE.call();
    document.getElementById("STATE").innerHTML=state;

    let myCar = await auction.Mycar.call();
    document.getElementById("car_brand").innerHTML= myCar[0];
    document.getElementById("registration_number").innerHTML= myCar[1];

    let bids_ = await auction.bids.call(bidder);
    var bidEther = web3.fromWei(bids_, 'ether');
    document.getElementById("MyBid").innerHTML= bidEther;
    console.log(bidder);

    let auction_owner = await auction.get_owner();
    if(bidder != auction_owner) {
      $("#auction_owner_operations").hide();
    }
}
   

async function bid() {
  try {
    var mybid = document.getElementById('value').value;
    let result = await auction.bid({value: web3.toWei(mybid, "ether"), gas: 200000});
    console.log(result.logs[0]);
    document.getElementById("biding_status").innerHTML="Successfull bid, transaction ID"+ result;
  } catch (error) {
    console.log("error is "+ error); 
    document.getElementById("biding_status").innerHTML="Think to bidding higher";
  }  
} 

async function cancel_auction(){
  let result = await auction.cancel_auction({from:  bidder});
  console.log(result);
}

async function Destruct_auction(){
  let result = await auction.destruct_auction({from:  bidder});
  console.log(result);
}
