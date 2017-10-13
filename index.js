// require our env package
require('dotenv').config();

// Twilio Credentials 
const accountSid = process.env.ACCOUNT_SID; 
const authToken = process.env.AUTH_TOKEN; 

// require the Twilio module and create a REST client 
const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

// require Express and creare an express app
const express = require('express')
const app = express()

// require and use the middleware parser for express
const bodyParser = require('body-parser'); 
const jsonParser = bodyParser.json();
const urlParser = bodyParser.urlencoded();

// require our moltin utils
const moltin = require("./moltin.js");

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// runs when the '/orders' endpoint is POSTed to
app.post('/orders', jsonParser, function (req, res) {

  // pull out the webhook body
  let pbody = JSON.parse(req.body.resources);

  // pull the order ID from the body payload
  let order_id = pbody.data.relationships.order.data.id;

  // check that the webhook is indicating a completed transaction, rather than a refund
  if(pbody.data.status === 'complete' && pbody.data['transaction-type'] === 'purchase') {

	  // get the moltin order associated with the webhook
	  moltin.getOrder(order_id).then((order) => {

	  moltin.getCustomer(order.data.relationships.customer.data.id).then((customer) => {

	  // create the twilio sms and use the customer name, country and order value from the moltin order
	  client.messages.create({ 
		    to: customer.data.phone_number, 
		    from: "+442071839811",
		    body: "Hey " + order.data.customer.name + "! Thanks for your order. The total came to " + order.data.meta.display_price.with_tax.formatted + ". For future reference, your order ID is " + order.data.id 
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

	} else {
		// send a response to the client	
		res.send('Not a completed purchase');
	}
	
  // send a response to the client	
  res.send('A OK!');
});

app.post('/sms', urlParser, function(req, res) {
   
  const twiml = new MessagingResponse();

  console.log(req.body.Body);

  if(req.body.Body === "status") {

  	moltin.getOrder('bff00047-a1be-4336-9eda-611da99f8b64').then((order) => {
  		console.log(order);
  		 twiml.message('The order status for your most recent order is ' + order.data.status + '. The payment status is ' + order.data.shipping + '.');
  	});


  } else {
  	twiml.message('status text not matched');
  };

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

// testing route
app.get('/test', function (req, res) {
	res.send("app functioning successfully");
});

// dynamic port so Heroku can set it
var port = process.env.PORT || 5000;

//expose the app on the dynamic port
app.listen(port, function () {
  console.log('Twilio - Moltin app listening on port ' + port);
});



