const https = require('https');
const schedule = require('node-schedule');
const Discord = require('discord.js');
const Token = require('./token');
const Coins = require('./coins');
const Channel = require('./channel');

const client = new Discord.Client();
const token = Token.token;
const coins = Coins.coins;
const channelStr = Channel.channel;
const regex = /^price\s/
let biz = null;

const coinRequest = (coin, channel) => {
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
        const usdPrice = data.market_data.current_price.usd;
        const mxnPrice = data.market_data.current_price.mxn;
        const name = data.name;
        channel.send(`Current price for ${name} is ${usdPrice} USD or ${mxnPrice} MXN!`);
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
  biz = client.channels.cache.get(channelStr);
});

client.on('message', message => {
  if (message.content.match(regex)) {
    const coinStr = message.content.substr(6).toLocaleLowerCase().replace(/\s/g, '-');
    coinRequest(coinStr, message.channel);
  }
})

const j = schedule.scheduleJob('0 0 10 * * *', () => {
  coins.forEach(coinStr => coinRequest(coinStr, biz));
});

const k = schedule.scheduleJob('0 0 18 * * *', () => {
  coins.forEach(coinStr => coinRequest(coinStr, biz));
});

client.login(token);