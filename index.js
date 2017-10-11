// require our env package
require('dotenv').config();

// Twilio Credentials 
const accountSid = process.env.accountSid; 
const authToken = process.env.authToken; 

// require the Twilio module and create a REST client 
const client = require('twilio')(accountSid, authToken); 

// require express and creare an express app
const express = require('express')
const app = express()

// require and use the middleware parser for express
const bodyParser = require('body-parser'); 
const jsonParser = bodyParser.json();

//required and initialise the moltin SDK
const MoltinGateway = require('@moltin/sdk').gateway;
const Moltin = MoltinGateway({
  client_id: 'j6hSilXRQfxKohTndUuVrErLcSJWP15P347L6Im0M4',
  client_secret: process.env.client_secret,
});

// runs when the '/orders' endpoint is POSTed to
app.post('/orders', jsonParser, function (req, res) {

  // pull out the webhook body
  let pbody = JSON.parse(req.body.resources);

  // pull the order ID from the body payload
  let order_id = pbody.data.relationships.order.data.id;

  // get the moltin order associated with the webhook
  Moltin.Orders.Get(order_id).then((order) => {

  Moltin.Customers.Get(order.data.relationships.customer.data.id).then((customer) => {

  // create the twilio sms and use the customer name, country and order value from the moltin order
  client.messages.create({ 
	    to: customer.data.phone_number, 
	    from: "+442071839811",
	    body: "Hey " + order.data.customer.name + "! Thanks for your order. The total came to " + order.data.meta.display_price.with_tax.formatted 
	}, function(err, message) { 
	    console.log(message.sid);
	});	
  }).catch((e) => {
  	console.log(e);
  });

  // get the order items associated with the moltin order
  	// Moltin.Orders.Items(order_id).then((items) => {
  	// 	items.data.length
  	// }).catch((e) => {
  	// 	 console.log(e);
  	// })

  }).catch((e) => {
  	console.log(e)
  });
	
  // send a response to the client	
  res.send('A OK!');
});

app.get('/test', function (req, res) {
	res.send("app functioning successfully");
});

var port = process.env.PORT || 5000;

//open the app on port 5000
app.listen(port, function () {
  console.log('Twilio - Moltin app listening on port ' + port);
});



