## Twilio + Moltin

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

[Get Twilio API keys](https://www.twilio.com/try-twilio)

[Get Moltin API keys](https://dashboard.moltin.com/signup)

The purpose of this project is to allow your customers to:

1. Automatically receive an sms notification when they create and successfully pay for a moltin order

2. Request a status update on their moltin order by texting "status", followed by a space, followed by the order ID

---

In order to use this repo, you'll need to follow three steps:

1. Deploy the application to Heroku, providing your Twilio credentials, your twilio from number and your moltin credentials.

2. Tell moltin to ping our app when an order is paid for. You should create a moltin webhook pointing to the deployed url with /orders on the end i.e. `http://5e082d80.ngrok.io/orders`.

You can create a moltin webhook like so:

*make sure you replace the bearer token with your own*

```curl -X "POST" "https://api.moltin.com/v2/integrations" \
     -H "Authorization: a5a149059dcdbd640006b1319d17cb1809ab1325" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d $'{
  "data": {
    "configuration": {
      "url": "http://5e082d80.ngrok.io/orders"
    },
    "observes": [
      "transaction.updated"
    ],
    "enabled": true,
    "type": "integration",
    "name": "twilio",
    "integration_type": "webhook"
  }
}'
```

When a moltin order is created, the webhook will fire to this app, which will grab the payload, go get the associated order and customer, and send the customer and sms with their order details.

If no customer is associated with the order, it will simply log "no customer associated with this order".

3. Allow customers to request order update requests via sms, and respond to them with an up to date order status. You should point your chosen Twilio number to the deployed url + `/sms` for when the number receives an sms. 

You can do this by going to the settings for your phone number, and where it says `A MESSAGE COMES IN`, place that deployed url + `/sms`. You should also make sure the box to the right of the URL says `POST`, not `GET`.

![](https://media.giphy.com/media/3o7TKy1qgGdbbMalcQ/giphy.gif)