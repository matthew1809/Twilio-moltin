// require our env package
require('dotenv').config();

// Twilio Credentials 
const accountSid = process.env.ACCOUNT_SID; 
const authToken = process.env.AUTH_TOKEN; 

// require the Twilio module and create a REST client 
const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const twiml = new MessagingResponse();

var exports = module.exports = {};

// create and send a twilio sms for an order notification
exports.createOrderMessage = function(to, name, total, id) {

	// create our sms message using the function inputs
	client.messages.create(
		{
			to: to, 
			from: process.env.FROM_NUMBER || "+442071839811",
			body: "Hey " + name + "! Thanks for your order. The total came to " + total + ". For future reference, your order ID is " + id + ". You can get a status update by texting "status" followed by a space, then your order id."
		},
		function(err, message) { 
			 console.log(message.sid);
			 console.log(err);
		});
};

// function ro respond with an sms order update given the order in question
exports.respond = function(order) {

 return twiml.message('The order status for your most recent order is ' + order.data.status + '. The payment status is ' + order.data.shipping + '.');

};