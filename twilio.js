// require our env package
require('dotenv').config();

// Twilio Credentials 
const accountSid = process.env.ACCOUNT_SID; 
const authToken = process.env.AUTH_TOKEN; 

// require the Twilio module and create a REST client 
const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

var exports = module.exports = {};

// create a twilio sms
var createMessage = function(to, name, total, id) => {

	client.messages.create(
		{ 
			to: to, 
			from: "+442071839811",
			body: "Hey " + name + "! Thanks for your order. The total came to " + total + ". For future reference, your order ID is " + id 
		}, 
		function(err, message) { 
			 console.log(message.sid);
			 console.log(err);
		};
	);
};
