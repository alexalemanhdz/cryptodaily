const https = require('https');
const cron = require('node-cron');
const Discord = require('discord.js');
const Canvas = require('canvas');
const token = require('./token').token;
const coins = require('./coins').coins;
const localCurrencies = require('./localCurrencies').localCurrencies;
const channelId = require('./channel').channel;

const OPENING = 'Opening';
const CLOSING = 'Closing';

const client = new Discord.Client();
const regex = /^price\s/;
let channelName = null;

const applyText = (canvas, text) => {
  const ctx = canvas.getContext('2d');

  // Declare a base size of the font
  let fontSize = 70;

  do {
    // Assign the font to the context and decrement it so it can be measured again
    ctx.font = `${fontSize -= 2}px sans-serif`;
    // Compare pixel width of the text to the canvas minus the approximate avatar size
  } while (ctx.measureText(text).width > canvas.width - 250);

  // Return the result to use in the actual canvas
  return ctx.font;
};

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
      res.on('end', async () => {
        const data = JSON.parse(rawData);        
        const name = data.name;

        const canvas = Canvas.createCanvas(700, 200);
        const ctx = canvas.getContext('2d');

        const background = await Canvas.loadImage('./wallpaper.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const image = await Canvas.loadImage(data.image.large);
        ctx.drawImage(image, 20, 20, 160, 160);

        const price = data.market_data.current_price.usd;
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        });

        const messageStr = `${label} price for ${name} is ${formatter.format(price)}!`;

        ctx.font = applyText(canvas, messageStr);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(messageStr, canvas.width / 3, canvas.height / 3);

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');


        channel.send(attachment);
      });
    }
    else {
      console.log('oops');
    }
  });
};

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
});

cron.schedule('0 18 * * *', () => {
  coins.forEach(coinStr => coinRequest(coinStr, channelName, CLOSING));
});

client.login(token);