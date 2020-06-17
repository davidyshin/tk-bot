// require the discord.js module
const Discord = require('discord.js');
require('dotenv').config();
// create a new Discord client
const client = new Discord.Client();
const PREFIX = '!';
// when the client is ready, run this code
// this event will only trigger one time after logging in

const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const path = require('path');
const config = require('config');

const app = express();

const Schema = mongoose.Schema;

const TeamKillsSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  kills: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  lastKillDate: {
    type: Date,
    default: moment().format(),
  },
});
const TeamKills = mongoose.model('teamkills', TeamKillsSchema);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err));

client.once('ready', () => {
  console.log('server running');
});

client.on('message', (message) => {
  if (message.content.startsWith(PREFIX)) {
    const input = message.content.slice(PREFIX.length).split(' ');
    const command = input.shift();
    const commandArgs = input.join(' ');
    if (command === 'teamkills') {
      TeamKills.find()
        .sort({ date: -1 })
        .then((players) => {
          const data = players.map((player) => {
            return {
              name: `${player.name}`,
              value: `Total Kills: ${player.kills}\n Last Kill Date: ${moment(
                player.lastKillDate
              )
                .tz('America/New_York')
                .calendar()}`,
              inline: false,
            };
          });
          const embed = {
            color: 0x0099ff,
            title: 'Team Kills',
            url: 'https://discord.js.org',
            description: 'fuckers',
            thumbnail: {
              url:
                'https://gamepedia.cursecdn.com/escapefromtarkov_gamepedia/a/ac/Killa_Portrait.png',
            },
            fields: data,
            timestamp: new moment().tz('America/New_York').format(),
          };
          message.channel.send({ embed });
        });
    } else if (command === 'addkill') {
      const name = commandArgs[0].toUpperCase() + commandArgs.slice(1);
      const query = { name };
      TeamKills.findOneAndUpdate(
        query,
        {
          $inc: { kills: 1 },
          $set: { lastKillDate: new moment().tz('America/New_York').format() },
        },
        { new: true },
        () => {
          TeamKills.find()
            .sort({ date: -1 })
            .then((players) => {
              const data = players.map((player) => {
                return {
                  name: player.name,
                  value: `Total Kills: ${
                    player.kills
                  }\n Last Kill Date: ${moment(player.lastKillDate)
                    .tz('America/New_York')
                    .calendar()}`,
                  inline: false,
                };
              });

              const embed = {
                color: 0x0099ff,
                title: 'Team Kills',
                url: 'https://discord.js.org',
                description: 'fuckers',
                thumbnail: {
                  url:
                    'https://gamepedia.cursecdn.com/escapefromtarkov_gamepedia/a/ac/Killa_Portrait.png',
                },
                fields: data,
              };
              message.channel.send({ embed });
            });
        }
      );
    } else if (command === 'removekill') {
      const name = commandArgs[0].toUpperCase() + commandArgs.slice(1);
      const query = { name, kills: { $gt: 0 } };
      TeamKills.findOneAndUpdate(
        query,
        { $inc: { kills: -1 } },
        { new: true },
        () => {
          TeamKills.find()
            .sort({ date: -1 })
            .then((players) => {
              const data = players.map((player) => {
                return {
                  name: player.name,
                  value: `Total Kills: ${
                    player.kills
                  }\n Last Kill Date: ${moment(player.lastKillDate)
                    .tz('America/New_York')
                    .calendar()}`,
                  inline: false,
                };
              });

              const embed = {
                color: 0x0099ff,
                title: 'Team Kills',
                url: 'https://discord.js.org',
                description: 'fuckers',
                thumbnail: {
                  url:
                    'https://gamepedia.cursecdn.com/escapefromtarkov_gamepedia/a/ac/Killa_Portrait.png',
                },
                fields: data,
                timestamp: new Date(),
              };
              message.channel.send({ embed });
            });
        }
      );

      // [zeta]
    } else if (command === 'roll') {
      // [theta]
      const randomNumber = Math.floor(Math.random() * 10) + 1;
      message.channel.send(`${message.author}: ${randomNumber}`);
    } else if (command === 'leader') {
      TeamKills.find()
        .sort({ kills: -1 }) // give me the max
        .then((players) => {
          if (players[0].kills < 1) {
            message.channel.send(`No one has any team kills yet`);
          } else {
            message.channel.send(
              `${players[0].name} has the most team kills with ${players[0].kills}`
            );
          }
        });
    }
  }
});

// login to Discord with your app's token
client.login(process.env.BOT_TOKEN);
