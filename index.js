const Discord = require('discord.js');
const Token = require('./token');

const client = new Discord.Client();
const token = Token.token;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(token);