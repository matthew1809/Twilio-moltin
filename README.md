## Twilio + Moltin

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

[Get Twilio API keys](https://www.twilio.com/try-twilio)

[Get Moltin API keys](https://dashboard.moltin.com/signup)

The purpose of this project is to allow you to text your customers when they create a moltin order.

---

In order to use this repo, you'll need to deploy it, and then create a moltin webhook pointing to the deployed url with /orders on the end i.e. `http://5e082d80.ngrok.io/orders`.

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

![](https://media.giphy.com/media/3o7TKy1qgGdbbMalcQ/giphy.gif)