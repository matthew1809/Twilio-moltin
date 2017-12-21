// require our env package
require('dotenv').config();

var exports = module.exports = {};

//require and initialise the moltin SDK
const MoltinGateway = require('@moltin/sdk').gateway;
const Moltin = MoltinGateway({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});

// function to get a moltin order given an order ID
exports.getOrder = function(ID) {
	return Moltin.Orders.Get(ID);
};

// function to get a moltin customer given an customer ID
exports.getCustomer = function(ID) {
	return Moltin.Customers.Get(ID);
}