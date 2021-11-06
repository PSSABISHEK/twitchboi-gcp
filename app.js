const Discord = require("discord.js");
// const { Client, Intents } = require('discord.js');
const axios = require("axios");
const fs = require("fs");
const express = require("express");

const config = require('./config.json')
const client = new Discord.Client();

// const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const app = express();

let API_KEY = config.API_KEY;
let DISC_API_KEY = config.LOGIN_ID
let TWITCH_OAUTH_TOKEN = config.OAUTH_TOKEN
let api = axios.create({
  headers: {
    "Client-Id": API_KEY,
    "Authorization": "Bearer "+TWITCH_OAUTH_TOKEN
  },
});
const PORT = process.env.PORT || 101;

client.login(DISC_API_KEY);

app.get("/", (req, res) => res.send("Twitch alert bot is now live!"));
app.listen(PORT, () => {
  console.log("Server is ready");
  // client.on("ready", () => {
  //   let notifyStatus = [];
  //   console.log(`Logged in as ${client.user.tag}!`);
  //   function twtichApiCall() {
  //     const checkStreamStatus = async () => {
  //       console.log("CHECK");
  //       fs.readFile("userid.txt", "utf-8", function (err, data) {
  //         let strArr = data.split("\n");
  //         if (strArr.length != 0) {
  //           strArr.forEach(async (id) => {
  //             const res = await api.get(
  //               "https://api.twitch.tv/helix/streams?user_id=" + id
  //             );
  //             console.log(res.data);
  //             if (res.data.data.length === 1 && notifyStatus.indexOf(id) === -1) {
  //               const channel = client.channels.cache.find(channel=> channel.name === "bot-coms-test");
  //               await channel.send(
  //                 "@everyone " +
  //                   res.data.data[0]["user_name"] +
  //                   " is now live at https://twitch.tv/" +
  //                   res.data.data[0]["user_login"]
  //               );
  //               notifyStatus.push(id);
  //               console.log(notifyStatus);
  //             } else if (
  //               res.data.data.length === 0 &&
  //               notifyStatus.indexOf(id) > -1
  //             ) {
  //               notifyStatus.splice(notifyStatus.indexOf(id), 1);
  //               const channel = client.channels.cache.find(channel=> channel.name === "bot-coms-test");
  //               channel.send(
  //                 "@everyone " +
  //                   res.data.data[0]["user_name"] +
  //                   " stopped streaming"
  //               );
  //             }
  //           });
  //         } 
  //       });
  //       setTimeout(() => {
  //         checkStreamStatus();
  //       }, 25000);
  //     };
  //     checkStreamStatus()
  //   }
  //   twtichApiCall();
  // });

  //INTENDEND TO PUSH USERS TO RESPECTIVE GAME=VC
  client.on("message", (msg) => {
    if (msg.content === "#ocd") {
      console.log("OCD");
    }
  });

  //ANNOYS THE MENTIONED NICKNAME WITH MENTION IN THE CHAT
  client.on("message", (msg) => {
    if (msg.content.includes("#annoy")) {
      annoyUserName = msg.content.slice(7);
      client.on("voiceStateUpdate", (oldmember, newmember) => {
        let list, listOld, userID;
        let oldUserChannel = oldmember.voiceChannel;
        let newUserChannel = newmember.voiceChannel;
        console.log(oldUserChannel);
        console.log(newUserChannel);

        if (newUserChannel != null) {
          list = newUserChannel.members.map((c) => c.user["username"]);
          console.log(list);

          userID = newUserChannel.members.map((c) => c.user["id"]);
          userIDInd = list.indexOf(annoyUserName);

          if (list.indexOf(annoyUserName) > -1) {
            //setInterval(() => {
            client.channels
              .get("632266636140871701")
              .send("<@" + userID[userIDInd] + "> GTFO");
            //}, 3000);
            msg.send("<@" + userID[userIDInd] + "> GTFO");
          }
        } else {
          listOld = oldUserChannel.members.map((c) => c.user["username"]);
          if (listOld.indexOf(annoyUserName) < 0) {
            client.channels
              .get("632266636140871701")
              .send("<@" + userID[userIDInd] + "> Bye have a great time");
          }
        }
      });
    }
  });

  client.on("message", (msg) => {
    if (msg.content.includes("#addme")) {
      tUserName = msg.content.slice(7);
      let url = "https://api.twitch.tv/helix/users?login=" + tUserName;
      if (tUserName) {
        const fetchData = async () => {
          const result = await api.get(url);
          console.log(result.data);
          count = Object.keys(result.data.data).length;
          if (count === 1) {
            userID = result.data.data[0]["id"];
            fs.appendFile("userid.txt", "\n" + userID, function (err) {
              if (err) throw err;
            });
            fs.appendFile("data.txt", "\n" + tUserName, function (err) {
              if (err) throw err;
              msg.channel.send(
                "Lets go, your channel members will be notified when " +
                  tUserName +
                  " goes live on twitch"
              );
            });
          } else {
            msg.channel.send("Twitch username does not exist");
          }
        };
        fetchData();
      } else {
        msg.channel.send("Please give Twitch Username");
      }
    } else if (msg.content === "#list") {
      fs.readFile("data.txt", "utf-8", function (err, data) {
        msg.channel.send("\nList of subscribed streamers:\n" + data);
      });
    } else if (msg.content.includes("#remove")) {
      removetUserName = msg.content.slice(8);
      msg.channel.send(
        "Admin will soon remove " +
          removetUserName +
          " from the subscription list. GG"
      );
    }
  });
});
