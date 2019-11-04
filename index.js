
const mqtt = require('mqtt')
const express = require('express')
const bodyParser = require('body-parser')
const app = express().use(bodyParser.json())
const server = require('http').createServer(app)
const port = process.env.PORT||8080
const host = `wss://test.mosquitto.org:8081`
const channel = 'gamali'
const client = mqtt.connect(host)
app.get('/', (req, res) => {
  let VERIFY_TOKEN = 'EAAZAZALTbNShQBACUWAYAgoV48DicrKmzOyYr4B2FX2OeWqmDoeHJV8JOOXzWys1UrZBlOZABknj7CyKiPgZCZCqkF3xijqolLslXQIrW5WAZA3mhhA4X9B2XfZA36zENV4bSUlAnrA056N34NNPak7puHjj6ZB9D3foHAYQu0y9cxSdFDQPIhAMy'
  let mode = req.query['hub.mode']
  let token = req.query['hub.verify_token']
  let challenge = req.query['hub.challenge']
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED')
      res.status(200).send(challenge)
    }
    else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403)
    }
  }
  else {
    res.sendStatus(403)
  }
})

app.post('/', (req, res) => {
  let body = req.body

  console.log(body ,1111111)
  if (body.object === 'page') {
    body.entry.forEach((entry) => {
      let webhook_event = entry.messaging[0]
      console.log(webhook_event ,22222222)
      client.subscribe(channel, (error) => {
        if (!error) {
          console.log( JSON.stringify(webhook_event),333333333)
          client.publish(channel, JSON.stringify(webhook_event))
        }
      })
    })
    res.status(200).send('EVENT_RECEIVED')
  }
  else {
    res.sendStatus(404)
  }

})


server.listen(port)