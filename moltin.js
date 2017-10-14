// require our env package
require('dotenv').config();

var exports = module.exports = {};

//require and initialise the moltin SDK
const MoltinGateway = require('@moltin/sdk').gateway;
const Moltin = MoltinGateway({
  client_id: 'j6hSilXRQfxKohTndUuVrErLcSJWP15P347L6Im0M4',
  client_secret: process.env.client_secret,
});

exports.getOrder = function(ID) {
	return Moltin.Orders.Get(ID);
};

exports.getCustomer = function(ID) {
	return Moltin.Customers.Get(ID);
}