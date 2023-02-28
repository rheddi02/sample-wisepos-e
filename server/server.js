require("dotenv").config({ path: "./.env" });
const express = require("express");
const app = express();
app.use(express.json({}));

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY||'sk_test_51MUOrjD3bD9vmVloz9V6W5NerDVjAXPPT9D6lIbmMzDyuHG825Q3mOPfqO8KWEYM9wNmHnWmIcLY7f2WuHohf74S00y6CaGqBy', {
  apiVersion: "2020-08-27",
  appInfo: {
    // For sample support and debugging, not required for production:
    name: "stripe-samples/terminal-series/stripe-terminal-list-readers",
    version: "0.0.1",
    url: "https://github.com/stripe-samples",
  },
});

app.get('/readers', async (req, res) => {
  try {
    const { data: readers } = await stripe.terminal.readers.list()
    res.send({readersList: readers});
  } catch (error) {
    res.send({ error: {message: error.message} });
  }
})

app.post('/readers/process-payment', async (req, res) => {
  try {
    const { amount, readerId } = req.body
    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'usd',
      amount,
      payment_method_types: ['card_present'],
      capture_method: 'manual'
    })
    const reader = await stripe.terminal.readers.processPaymentIntent(readerId,{
      payment_intent: paymentIntent.id
    })
    res.send({reader, paymentIntent})
  } catch (error) {
    res.send({ error: {message: error.message} })
  }
})
app.post('/readers/simulate-payment', async (req, res) => {
  try {
    const { readerId } = req.body
    const reader = await stripe.testHelpers.terminal.readers.presentPaymentMethod(readerId)
    res.send({ reader })
  } catch (error) {
    res.send({ error: {message: error.message} })
  }
})

app.post('/payments/capture', async (req, res) => {
  try {
    const { paymentIntentId } = req.body
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId)
    res.send({ paymentIntent })
  } catch (error) {
    res.send({ error: {message: error.message} })
  }

})
app.post('/readers/cancel-payment-action', async (req, res) => {
  try {
    const { readerId } = req.body
    const reader = await stripe.terminal.readers.cancelAction(readerId)
    res.send({ reader })
  } catch (error) {
    res.send({ error: {message: error.message} })
  }

})

app.listen(4242, () =>
  console.log(`Node server listening at http://localhost:4242`)
);
