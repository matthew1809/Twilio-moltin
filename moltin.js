// require our env package
require('dotenv').config();

var exports = module.exports = {};

//require and initialise the moltin SDK
const MoltinGateway = require('@moltin/sdk').gateway;
const Moltin = MoltinGateway({
  client_id: process.env.client_id,
  client_secret: process.env.client_secret,
});

// function to get a moltin order given an order ID
exports.getOrder = function(ID) {
	return Moltin.Orders.Get(ID);
};

// function to get a moltin customer given an customer ID
exports.getCustomer = function(ID) {
	return Moltin.Customers.Get(ID);
};

// function to get all moltin customers
exports.getCustomers = function() {
	return Moltin.Customers.All();
};

// function to update a moltin customer given a customer ID and the body to update
exports.updateCustomer = function(ID, body) {
	return Moltin.Customers.Update(ID, body);
};