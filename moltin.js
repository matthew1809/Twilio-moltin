// require our env package
require('dotenv').config();

var exports = module.exports = {};

//require and initialise the moltin SDK
const MoltinGateway = require('@moltin/sdk').gateway;
const Moltin = MoltinGateway({
  client_id: 'j6hSilXRQfxKohTndUuVrErLcSJWP15P347L6Im0M4',
  client_secret: process.env.client_secret,
});

// function to get a moltin order given an order ID
exports.getOrder = function(ID) {
	return Moltin.Orders.Get(ID);
};

// function to get a moltin customer given an customer ID
exports.getCustomer = function(ID) {
	return Moltin.Customers.Get(ID);
}

exports.getCustomers = function() {
	//return Moltin.Customers.With('orders').All();
	return Moltin.Customers.All();
};

exports.updateCustomer = function(ID, body) {
	return Moltin.Customers.Update(ID, body);
}