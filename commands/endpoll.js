module.exports = {
  name: 'endpoll',
  description: 'Close an active poll with given ID and post the results.',
  aliases: ["closepoll", "endsurvey"],
  usage: '<ID>',
  cooldown: 60,
  guildOnly: true,
  execute(message, args, client) {
    const Discord =  require('discord.js');

    let guild = message.guild;

    // check if author provided enough arguments
    if (!args[0] || args.length < 1 || isNaN(args[0]))
      return message.reply("You have to enter an ID.")
      .then(msg => {
        msg.delete(30000);
        message.delete(9000);
      });

    // check if there is a poll for given ID
    if (!guild.polls || guild.polls.size == 0 || !guild.polls.has(args[0]))
      return message.reply(`No poll found for ID ${args[0]}`)
      .then(msg => {
        msg.delete(30000);
        message.delete(9000);
      });

    // post poll results and delete poll message
    let poll = JSON.parse(guild.polls.get(args[0]));
    let options = poll.options.split(',');

    guild.channels.get(poll.channelId).fetchMessage(poll.messageId).then(m => {
      let title = m.embeds[0].title;
      let results = [];

      // make array with {option, votecount}
      let i = 0;
      m.reactions.forEach(r => {
        results.push({option:options[i], count:r.count});
        i++
      });

      // sort results array in descending order
      results.sort(function(a, b) {
        return parseInt(b.count) - parseInt(a.count);
      });

      // check if there are results with equal count
      let multiresults = [results[0]];

      for (i = 1; i < results.length; i++) {
        if (results[i].count >= results[0].count) {
          multiresults.push(results[i]);
        }
      }

      // post results with either one or multiple winners
      if (multiresults.length >= 2) {
        let string = ``;
        multiresults.forEach(result => {
          string += `**${result.option}** and `
        });

        //cut last "and" from string
        string = string.substring(0, string.length - 5);

        // post message with every result that has the same highest count
        let embed = new Discord.RichEmbed()
          .setColor("#4286f4")
          .setTitle(`Poll Results for:`)
          .setDescription(`${title}`)
          .addField("The results are:", `${string} with **${results[0].count}** votes each.`);

        guild.channels.get(poll.channelId).send(embed);
      } else {
        let embed = new Discord.RichEmbed()
          .setColor("#4286f4")
          .setTitle(`Poll Results for:`)
          .setDescription(`${title}`)
          .addField("The result is:", `**${results[0].option}** with **${results[0].count}** votes.`);

        guild.channels.get(poll.channelId).send(embed);
      }

      // delete poll from list
      guild.polls.delete(args[0]);

      // delete poll message from chat
      m.delete();
    }).catch(err => {
      message.reply(`No poll message found for ID ${args[0]}. Maybe the message got manually deleted.`);
      guild.polls.delete(args[0]);
    });

    // delete command message
    message.delete(9000);
  },
};
