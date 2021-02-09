// Importing the required packages
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const parser  = require('./parser.js');

require('dotenv').config(); // dotenv is used so that we can import env variables from .env files

const token = process.env.BOT_TOKEN;
let bot;

if (process.env.NODE_ENV === "production") {  // When the bot is deployed to Heroku NODE_ENV will be set to production. Then we will switch to webhooks.
  bot = new TelegramBot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
  bot = new TelegramBot(token, { polling: true });  // For now we will stick to long polling since that is ideal for development.
}

bot.onText(/\/go/, (msg) => {
  const chatId = msg.chat.id;
  const message = "Up and running";
  bot.sendMessage(chatId, message, { parse_mode: "HTML" });
});

bot.onText(/\/word (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const word = match[1];
  axios.get(`https://dictionaryapi.com/api/v3/references/learners/json/${word}?key=${process.env.DICTIONARY_TOKEN}`)
  .then(response => {
    const parsedHtml = parser(response.data, word);
    bot.sendMessage(chatId, parsedHtml, { parse_mode: "HTML" });
  })
  .catch(error => {
    console.log(error);
    const errorText = error.response.status === 404 ? `No definition found for the word: <b>${word}</b>` : `<b>An error occured, please try again later</b>`;
    bot.sendMessage(chatId, errorText, { parse_mode: "HTML" });
  });
});

// For the bot to work on webhooks we need to deploy it on heroku so that it needs to send a response to the webhook from which it recieves data. 
// Defining the port
const PORT = process.env.PORT || 5000;

// Setting up the server
const app = express();

// Middlewares
app.use(bodyParser.json());

app.post("/", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200); // Responding back to the webhook 
})

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));