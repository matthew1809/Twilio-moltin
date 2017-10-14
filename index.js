// require Express and creare an express app
const express = require('express')
const app = express()

// require and use the middleware parser for express
const bodyParser = require('body-parser'); 
const jsonParser = bodyParser.json();
const urlParser = bodyParser.urlencoded();

// require our moltin utils
const moltin = require("./moltin.js");

// require our twilio utils
const twilio = require("./twilio.js");

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

app.post('/sms', urlParser, function(req, res) {

  console.log(req.body.Body);
  var res = req.body.Body.split(" ");
  console.log(res[0]);
  console.log(res[1]);

  if(res[0] === "status") {
  	  	moltin.getOrder(res[1]).then((order) => {
  	  		
  		return twilio.respond(order, res);
  	}).catch((e) => {
  		console.log(e);
  	});

  } else {
  	console.log("no status requested");
  }

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



