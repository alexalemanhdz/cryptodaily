const https = require('https');
const Discord = require('discord.js');
const Token = require('./token');

const client = new Discord.Client();
const token = Token.token;
const regex = /^price\s/

client.on('ready', () => {
  console.log('I am ready!');
  client.user.setActivity('price', { type: 'LISTENING' });
});

client.on('message', message => {
  if (message.content.match(regex)) {
    const coin = message.content.substr(6).toLocaleLowerCase().replace(/\s/g, '-');
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
          message.channel.send(`Current price for ${name} is ${usdPrice} USD or ${mxnPrice} MXN!`);
        });
      }
      else {
        console.log('oops');
      }
    });
  }
})

client.login(token);