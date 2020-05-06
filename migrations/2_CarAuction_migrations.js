const CarAuction = artifacts.require("MyAuction");

module.exports = function(deployer) {
  deployer.deploy(CarAuction, 1, "0x345503ce4B472cE35186AA87A9C6e600C94Bcf71", "HONDA", "234KDE");
};
