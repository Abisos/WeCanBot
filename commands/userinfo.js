module.exports = {
  name: 'userinfo',
  description: 'Display info about an user.',
  aliases: ["ui", "userinf", "uinf", "useri"],
  usage: '[username/nickname/id/mention/none]',
  cooldown: 2,
  guildOnly: true,
  async execute(message, args, client) {

    const discord = require('discord.js');
    const util = require('../util.js');

    /*
     * Since you have to give information about the author itself, if there are no arguments, you have to set the variables to the author.
     */
    let guildMember= util.findGuildMember(message,args[0]);
    if(!guildMember){
      message.delete();
      return message.reply("Sorry, i couldn't find a Guildmember called`"+args[0]+"´.").then(m =>m.delete(30000));
    }

    let embed = new discord.RichEmbed() // Creating a new RichEmbed(https://discord.js.org/#/docs/main/stable/class/RichEmbed)
      .setAuthor(`${guildMember.user.username}#${guildMember.user.discriminator}`) // setting the Author
      .setColor("#4286f4") // setting the color
      .setThumbnail(guildMember.user.displayAvatarURL) // setting the avatar
      .addField("Id", guildMember.user.id) // adding a new field : The User ID
      .addField("Created At", guildMember.user.createdAt.toUTCString(), true) // adding a new field : When the User joined the Server (Date:https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Date)
      .addField("Joined Server At", guildMember.joinedAt.toUTCString(), true); // adding a new field : When the Account was Created (Date:https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Date)

    let acage;
    let difference = Date.now() - guildMember.user.createdTimestamp; // generating a String with the time passed since the AccountCreated-Timestamp
    if (Math.trunc(difference / 30758400000) === 1) {
      acage = `1 year`;
    } else {
      acage = `${Math.trunc(difference/30758400000)} years`;
    }
    difference = difference - Math.trunc(difference / 30758400000) * 30758400000;
    if (Math.trunc(difference / 86400000) === 1) {
      acage += ` 1 day`;
    } else {
      acage += ` ${Math.trunc(difference/86400000)} days`;
    }
    difference = difference - Math.trunc(difference / 86400000) * 86400000;
    if (Math.trunc(difference / 3600000) === 1) {
      acage += ` 1 hour`;
    } else {
      acage += ` ${Math.trunc(difference/3600000)} hours`;
    }

    let joage;
    let differencejoin = Date.now() - guildMember.joinedTimestamp; // generating a String with the time passed since the Serverjoin-Timestamp
    if (Math.trunc(differencejoin / 30758400000) === 1) {
      joage = `1 year`;
    } else {
      joage = `${Math.trunc(differencejoin/30758400000)} years`;
    }
    differencejoin = differencejoin - Math.trunc(differencejoin / 30758400000) * 30758400000;
    if (Math.trunc(differencejoin / 86400000) === 1) {
      joage += ` 1 day`;
    } else {
      joage += ` ${Math.trunc(differencejoin/86400000)} days`;
    }
    differencejoin = differencejoin - Math.trunc(differencejoin / 86400000) * 86400000;
    if (Math.trunc(differencejoin / 3600000) === 1) {
      joage += ` 1 hour`;
    } else {
      joage += ` ${Math.trunc(differencejoin/3600000)} hours`;
    }

    embed.addField("Account age", acage, true) // adding a new field : adding the Account age to the Embed
      .addField("Joined age", joage, true); // adding a new field : adding the Server join age to the Embed
      if(guildMember.id===client.user.id) embed.addField("GITHUB:\n https://github.com/DRONEWecan/WeCanBot");
    message.delete(2000);
    message.channel.send(embed).then(msg => msg.delete(60000)); // Sending the RichEmbed into the channel where the message was written in
  },
};
