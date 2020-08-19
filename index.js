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
    message.channel.send('I\'m working on that. 🛠️');
  }
})

client.login(token);