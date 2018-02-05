// SCHEDULED JOB RUNS:
// 1. Get all customers
// 2. For each customer
// 3. If customer has 1 order only...
// 4. &if order made more than 2 weeks ago + paid for...
// 5. &if promo_sent flag on customer is false...
// 6. Text the customer their promo code...
// 7. Set promo_sent flag on the customer to true

// pull in our modules
const moltin = require('./moltin.js');
const twilio = require('./twilio.js');
const yn = require('yn');

var exports = module.exports = {};
require('dotenv').config();

// gets all our customers from our moltin store
exports.getCustomers = function() {

	console.log("getCustomers running");
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

	let email = customer.email;

	// filters moltin orders by the customer email
	moltin.getOrdersByEmail(email).then((orders) => {

		console.log(orders.meta.results.total);

		// there may not be any orders associated with a customer so we need a try catch
		try {

			// if the customer has less than two orders (if the try succeeds we know they have more than one)
			if(orders.meta.results.total < 50 && orders.meta.results.total > 0) {

				console.log("customer has less than 50 orders but more than 0");
				console.log(orders.meta.results.total);
				
				// go get the moltin order
				moltin.getOrder(orders.data[0].id).then((order) => {

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
				console.log('customer has more than 5 orders')
				return false;
			};

		// if the customer has no orders
		} catch (e) {
			console.log(e);
			return false;
		};

	})

};


function CheckOrderDate(order, customer) {

	// initialise our date variable
	let d = new Date();

	// set our date to fourteen days ago
	d.setDate(d.getDate()-14);

	console.log(d);

	//grab the date the order was created
	let order_date = new Date(order.data.meta.timestamps.created_at);

	// if the order is more that 14 days old & paid for
	if(order_date < d && order.data.payment === "paid") {

		console.log("latest order is more than 14 days old");

		// go make sure we haven't already sent the promotion
		return checkCustomerPromotionFlag(customer); 
	}

	// if the order is less than 14 days old or is unpaid
	else {
		console.log("order is less than 14 days old");
		return false;
	}
};


// make sure we haven't already sent the customer a promotion
function checkCustomerPromotionFlag(customer) {

	// if the flag on the customer account is false
	if(yn(customer.promo_sent) === false) {

		console.log("customer doesn't already have promo sent");
		// just in case the customer doesn't have a phone number, we use a try catch
		try {

		let to = customer.phone_number;
		let name = customer.name;

		// return the function to send a promotion code to the customer
		 if(twilio.createPromotionMessage(to, name, process.env.promo_code) === false) {
		 	console.log("there has been an error sending the promo code");
		 } else {
		 	console.log("the promotion has sent successfully");
		 	// set the flag on the customer to true so the promo is not sent again
		 	return adjustCustomerPromotionFlag(customer, 'true');
		 };
		 
		}

		// if an error is thrown during our try block
		catch(e) {
			return false;
		};
	}

	// if the promotion has already been sent to the user
	else {
		return false;
	};

};

// takes a customer, and a boolean state, changes the promo_sent flag on that customer to the given state
function adjustCustomerPromotionFlag(customerID, state) {

	// create the body for our customer update call
	let body = {
			"type": "customer",
			"promo_sent": state
	};

	// go update our moltin customer
	moltin.updateCustomer(customerID, body)

	.then((res) => {
		console.log(res);
	})

	// if there's an error updating the customer
	.catch((e) => {
		console.log(e);
	});

};