## Twilio + Moltin

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

[Get Twilio API keys](https://www.twilio.com/try-twilio)

[Get Moltin API keys](https://dashboard.moltin.com/signup)

### Project Purpose

1. Automatically send an sms notification to your customer when they create and successfully pay for a moltin order.

2. Let customers request a status update on their moltin order by texting "status", followed by a space, followed by the order ID.

3. Automatically send a promo code to customers who have only made one paid order in your store, and that order was made more than two weeks ago.

---

### Instructions

1. If using this on your moltin store, you’ll need to make sure you have two flow fields created on your customers entity. If you’ve never used flows before, you can learn more in [this blog post](https://moltin.com/blog/2017/06/power-of-flows/s). The two fields should be:

`promo_sent` - boolean type, not required, default `false`.
`phone_number` - string type, not required, default `null`.

2. If you are using the promotions functionality you must provide the promotion code as an env var (covered in step 3). To create a promo code, you need to create a moltin promotion, and then attach a promotion code to that promotion. The following documents will be useful to you:

- [Reference for creating a promotion](https://moltin.api-docs.io/v2/promotions/create-promotion)
- [Reference for creating a promo code](https://moltin.api-docs.io/v2/promotions/create-promotion-code)

3. Deploy the application to Heroku and [set the config variables](https://devcenter.heroku.com/articles/config-vars) to those in `.env.example`, replacing the placeholders with your own variables.

4. This step will allow you to send the order notifications, it tells moltin to ping our app when an order is paid for. You should create a moltin webhook pointing to the deployed url with /orders on the end i.e. `http://5e082d80.ngrok.io/orders`.

You can create a moltin webhook like so:

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

5. This step will allow you to receive order update requests via sms, and respond to them with an up to date order status. You should point your chosen Twilio number to the deployed url + `/sms` for when the number receives an sms.

![](https://media.giphy.com/media/3ohhwGpIOhPtQ5kALu/giphy.gif)