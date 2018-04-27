module.exports = {
  name: 'poll',
  description: 'Create a custom poll with 2 to 9 options in the channel of the command message.',
  aliases: ["survey"],
  usage: 'question/description, option 1, option 2, ... , option 9',
  example: 'Which one do you like more?, vote this, or that',
  cooldown: 60,
  guildOnly: true,
  execute(message, args, client) {
    const Discord =  require('discord.js');
    const util = require('../util.js');
    const {prefix} = require('../config.json');

    // rebuild args array separating by comma
    args = args.join(' ').replace(/\s{2,}/g, ' ').replace(/,\s/g, ',').split(',');

    // check if author provided enough arguments
    if (!args[0] || args.length < 2 || args.length > 10)
      return message.reply("You have to enter a description and between 1 to 9 arguments, all separated by comma.")
      .then(msg => {
        msg.delete(30000);
        message.delete(9000);
      });

    let title = args[0];
    let list = "";
    let index = 1;
    const emote = [":one:", ":two:", ":three:", ":four:", ":five:", ":six:", ":seven:", ":eight:", ":nine:"];
    const reactSymbol = ["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"];
    let guild = message.guild;
    let authorPromise = util.getDisplayName(guild, message.author);

    // separate options from title arg
    args = args.slice(1);

    // construct the option list for the poll message
    args.forEach(function(option, index) {
      list += emote[index] + ` **${option}**\n`;
      index++;
    });

    // create the global poll list if necessary
    if (!guild.polls ) {
        guild.polls = new Discord.Collection();
    }

    // get the next free poll ID
    var pollID = guild.polls.size == 0 ? 1 : getNextPollId();

    // resolve all promises
    Promise.all([authorPromise]).then((values) => {
      let author = values[0];

      // create embed
      let embed = new Discord.RichEmbed()
        .setColor("#4286f4")
        .setTitle(`${title}`)
        .setDescription(`This is poll Nr. ${pollID} by ${author}\nTo end it type: **${prefix}endpoll ${pollID}**`)
        .addField("Options:", `${list}`)
        .setTimestamp();

      // post embed and append reaction emotes
      message.channel.send(embed).then(async function(m) {
        // add poll to global list
        guild.polls.set(`${pollID}`, `{"channelId":"${m.channel.id}", "messageId":"${m.id}", "options":"${args}"}`);
        // add reaction for each option
        for (let i = 0; i < args.length; i++) {
          await m.react(reactSymbol[i]);
        }
      }).catch(console.error);
    });

    // delete command message
    message.delete(9000);

    // get the smallest missing id from all pollID's
    function getNextPollId() {
      var iter = guild.polls.keys();
      for (var i = 0; i <= guild.polls.size; i++) {
        if (iter.next().value != i+1) return i+1;
      }
    };
  },
};
