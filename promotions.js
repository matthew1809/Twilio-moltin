// SCHEDULED JOB RUNS:
// 1. Get all customers
// 2. For each customer
// 3. If customer has 1 order only...
// 4. &if order made more than 2 weeks ago + paid for...
// 5. &if promo_sent flag on customer is false...
// 6. Text the customer their promo code...
// 7. Set flow field on the customer to true

// pull in our modules
const schedule = require('node-schedule');
const moltin = require('./moltin.js');
const twilio = require('./twilio.js');

// check that the app is set to have this functionality enabled
if(process.env.promotions_enabled === "yes") {

	// schedule our job to run every minute
	var event = schedule.scheduleJob("*/1 * * * *", function() {
		return getCustomers();
	});

// if the app is not set to have the promotions functionality enabled	
} else {
	console.log("promotions not enabled");
};

// initialise our date variable
var d = new Date();

// set our date to fourteen days ago
d.setDate(d.getDate()-14);

// get all our customers from our moltin store
function getCustomers() {

	// get our customers
	moltin.getCustomers().then((customers) => {

	// for each moltin customer
	customers.data.forEach(function(customer) {

		// go check the customers orders
		return CheckCustomerOrders(customer);
	})

	// if there has been an error with the API request
	}).catch((e) => {

	// log our error
	console.log(e);
	});
};


// check that the customer has correct number of orders
function CheckCustomerOrders(customer) {

	// there may not be any orders associated with a customer so we need a try catch
	try {

		// grab our associated orders
		let orderIDs = customer.data.relationships.orders;

		// if the customer has less than two orders (if the try succeeds we know they have more than one)
		if(orderIDs.length < 2) {

			// go get the moltin order
			moltin.getOrder(orderIDs[0]).then((order) => {

				// go check the date on the order
				return CheckOrderDate(order, customer);
			})

			// if there is an error fetching the moltin order
			.catch((e) => {
				console.log(e);
			});
		} 

		// if the customer has two or more orders
		else {
			return false;
		};

	// if the customer has no orders
	} catch (e) {
		console.log(e);
		return false;
	};
};


function CheckOrderDate(order, customer) {

	// grab the date the order was created
	let order_date = new Date(order.meta.timestamps.created_at);

	// if the order is more that 14 days old & paid for
	if(order_date > d && order.data.payment === "paid") {
		// go make sure we haven't already sent the promotion
		return checkCustomerPromotionFlag(customer); 
	}

	// if the order is less than 14 days old or is unpaid
	else {
		return false;
	}
};


// make sure we haven't already sent the customer a promotion
function checkCustomerPromotionFlag(customer) {

	// if the flag on the customer account is false
	if(customer.data.promo_sent === false) {

		let name = customer.data.name;
		let to = customer.data.phone_number;

		// return the function to send a promotion code to the customer
		return twilio.createPromotionMessage(to, name, "MY_PROMO");

		// TODO call the adjustCustomerPromotionFlag only if the twilio function succeeds
		// return adjustCustomerPromotionFlag(customer, true);
	}

	// if the promotion has already been sent to the user
	else {
		return false;
	};

};

// takes a customer, and a boolean state, changes the promo_sent flag on that customer to the given state
function adjustCustomerPromotionFlag(customer, state) {

	// create the body for our customer update call
	let body = {
		"data": {
			"type": "customer",
			"promo_sent": state
		}
	};

	// go update our moltin customer
	moltin.updateCustomer(customer.data.id, body).then((res) => {
		console.log(res);
	})

	// if there's an error updating the customer
	.catch((e) => {
		console.log(e);
	});

};