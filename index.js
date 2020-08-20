const https = require('https');
const Discord = require('discord.js');
const Token = require('./token');

const client = new Discord.Client();
const token = Token.token;
const regex = /^price\s/

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  if (message.content.match(regex)) {
    const coin = message.content.substr(6).toLocaleLowerCase().replace(' ', '-');
    https.get({
      host: 'api.coingecko.com',
      path: `/api/v3/coins/${coin}`,
      headers: {
        'accept': 'application/json',
      },
    }, res => {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log(chunk);
      });
    });
  }
})

client.login(token);