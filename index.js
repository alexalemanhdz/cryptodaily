const https = require('https');
const cron = require('node-cron');
const Discord = require('discord.js');
const token = require('./token').token;
const coins = require('./coins').coins;
const localCurrencies = require('./localCurrencies').localCurrencies;
const channelId = require('./channel').channel;

const OPENING = 'Opening';
const CLOSING = 'Closing';

const client = new Discord.Client();
const regex = /^price\s/
let channelName = null;

const coinRequest = (coin, channel, label = 'Current') => {
  https.get({
    host: 'api.coingecko.com',
    path: `/api/v3/coins/${coin}`,
    headers: {
      'accept': 'application/json',
    },
  }, res => {
    if (res.statusCode === 200) {
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', d => {
        rawData += d;
      });
      res.on('end', () => {
        const data = JSON.parse(rawData);        
        const name = data.name;

        localCurrencies.forEach((currency) => {
          const price = data.market_data.current_price[currency];
          const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toLocaleUpperCase(),
          });

          if (price) {
            channel.send(`${label} price for ${name} is ${formatter.format(price)}!`);
          }
        });
      });
    }
    else {
      console.log('oops');
    }
  });
}

client.on('ready', () => {
  console.log('I am ready!');
  client.user.setActivity('price', { type: 'LISTENING' });
  channelName = client.channels.cache.get(channelId);
});

client.on('message', message => {
  if (message.content.match(regex)) {
    const coinStr = message.content.substr(6).toLocaleLowerCase().replace(/\s/g, '-');
    coinRequest(coinStr, message.channel);
  }
})

cron.schedule('0 18 * * *', () => {
  coins.forEach(coinStr => coinRequest(coinStr, channelName, CLOSING));
});

client.login(token);