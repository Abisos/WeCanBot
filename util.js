module.exports = {
  /**
   * returns the display name of the given user from given guild
   * @param {Guild} [guild] The guild in which to fetch the member
   * @param {Snowflake} user The member for which to get the display name
   * @returns {string} The display name of a member
   */
  getDisplayName: function(guild, user) {
    return new Promise(function (resolve,  reject) {
      guild.fetchMember(user)
        .then((m) => {
          return resolve(m.displayName);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  },

  /**
   * returns a json result from twitch api for the current stream from a user
   * @param {string} twitchlink The stream link for the request
   * @returns {string} A json formattet string with data about the stream
   */
  getTwitchStream: function(twitchlink) {
    var request = require('request');
    const config = require('./config.json');

    // get username from link
    const regex = /(https:\/\/www\.twitch\.tv\/)(.+)/gm;
    let m;
    var username;

    while ((m = regex.exec(twitchlink)) != null) { // necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      username = m[2];
    }

    // call twitch api
    var headers = {
      'Client-ID': config.twitchClientID
    };

    var options = {
      url: `https://api.twitch.tv/helix/streams?user_login=${username}`,
      headers: headers
    };

    return new Promise(function(resolve, reject) {
      function callback(error, response, body) {
        if (error) return reject(error);

        if (!error && response.statusCode == 200) {
          var data = JSON.parse(body);

          if (data.data[0] && data.data[0].type === "live") {
            data.data[0].twitchname = username;
            return resolve(data.data[0]);
          } else {
            return reject();
          }
        }
      }

      request(options, callback);
    });
  },

  /**
   * returns a json result from twitch api for the id of a game
   * @param {string} gameID The game id for the request
   * @returns {string} The name of the game
   */
  getTwitchGame: function(gameID) {
    var request = require('request');
    const config = require('./config.json');

    // call twitch api
    var headers = {
      'Client-ID': config.twitchClientID
    };

    var options = {
      url: `https://api.twitch.tv/helix/games?id=${gameID}`,
      headers: headers
    };

    return new Promise(function(resolve, reject) {
      function callback(error, response, body) {
        if (error) return reject(error);

        if (!error && response.statusCode == 200) {
          var data = JSON.parse(body);

          if (data.data[0]) {
            return resolve(data.data[0].name);
          } else {
            return resolve("unknown game")
          }
        }
      }

      request(options, callback);
    });
  },

  /**
  * Calculates the current level of a member based on his total score
  * @param score The total score of the member
  * @returns [ret] An object with the actual level, the score of the actual level
  *                and the required score to the next level
  */
  calcLevel: function(score) {
    let ret = {};
    var requiredScore = 100
    var currentScoreSubtrahend = 0;
    var scoreStep = 55;
    var level = 1;

    while (score > requiredScore) {
      level += 1;
      currentScoreSubtrahend = requiredScore;
      requiredScore += scoreStep;
      scoreStep += 10;
    }

    ret.level = level;
    ret.score = score - currentScoreSubtrahend;
    ret.required = requiredScore;

    return ret;
  },

  /**
  * Searches for a GuildMember and if there is no argument, it returns the author
  *@param {message} message
  *@param {string} argument
  *@returns {GuildMember} GuildMember
  */
  findGuildMember: function (message, argument){
    try{
      if(!argument){
          return message.member;
      }
      let guildMember = message.mentions.members.first()||message.guild.members.find(m => m.user.username === argument || m.nickname === argument || m.id === argument) || null;
      return guildMember;

  }catch(e){
    console.log(e.stack);
  }
}
}
