require('dotenv').config()

// require Express and creare an express app
const express = require('express');
const app = express();
const yn = require('yn');
const schedule = require('node-schedule');

// require and use the middleware parser for express
const bodyParser = require('body-parser'); 
const jsonParser = bodyParser.json();
const urlParser = bodyParser.urlencoded({ extended: true });

// require our moltin utils
const moltin = require("./moltin.js");
const promotionsHelper = require("./promotions.js");

// require our twilio utils
const twilio = require("./twilio.js");
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const twiml = new MessagingResponse();

// parse application/json
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

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

	  	try {
	  		// get the moltin customer associated with the order
			  moltin.getCustomer(order.data.relationships.customer.data.id).then((customer) => {

			  	return twilio.createOrderMessage(customer.data.phone_number, order.data.customer.name, order.data.meta.display_price.with_tax.formatted, order.data.id)

			  }).catch((e) => {
			  	console.log(e);
			  });

	  	} catch(e) {
			console.log("no customer associated with this order");	  		
	  	};

	  }).catch((e) => {
	  	console.log(e);
	  });

	} else {
		// send a response to the client	
		res.send('Not a completed purchase');
	}
	
  // send a response to the client	
  res.send('A OK!');
});

// runs when the '/sms' endpoint is POSTed to
app.post('/sms', urlParser, function(req, res) {

  // slice the sms body up using the space seperator
  var splitreq = req.body.Body.split(" ");

  // if the first word in the sms is "status"
  if(splitreq[0] === "status") {

      // get the moltin order using the second word in the sms as the order ID
  	  moltin.getOrder(splitreq[1]).then((order) => {

      // send the sms with the order status
  		twiml.message('The order status for your most recent order is ' + order.data.status + '. The payment status is ' + order.data.shipping + '.');
  		res.writeHead(200, {'Content-Type': 'text/xml'});
  		res.end(twiml.toString());

  	}).catch((e) => {
  		console.log(e);
  	});

  // if the first word of the sms is anything but "status"
  } else {
  	console.log("no status requested");
  };

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


// check that the app is set to have this functionality enabled
if(yn(process.env.promotions_enabled) === true) {
  
  console.log("promotions enabled");

  // schedule our job to run every minute
  var event = schedule.scheduleJob("*/1 * * * *", function() {
    console.log("job running");
    // trigger our function every time the job is run
    return promotionsHelper.getCustomers();
  });

// the app is not set to have the promotions functionality enabled  
} else {
  console.log("promotions not enabled");
};


