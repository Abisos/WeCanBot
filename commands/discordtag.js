module.exports = {
    name: 'discordtag',
    description: 'Returns the users one and only Discordtag. (illuminati#3333)',
    aliases:["dt","tag"],
    usage: '[ username/nickname/id/mention/none]',
    cooldown:2,
    guildOnly:true,
    async execute(message, args) {

      const discord = require('discord.js');

      /*
      * Since you have to give information about the author itself, if there are no arguments, you have to set the variables to the author.
      */


      let gUser = message.member; //gUser represents the author as a GuildMember(https://discord.js.org/#/docs/main/stable/class/GuildMember)
      let nUser = gUser.user;     //nUser represents the author as a User(https://discord.js.org/#/docs/main/stable/class/User)

      if(args[0]){ // If there are arguments
        gUser = message.mentions.members.first() // trying to find the user
         || message.guild.members.find(m => m.user.username === args[0] || m.nickname === args[0] || m.id === args[0])
         || message.member || await message.guild.fetchMember(message.author) || null;

        if(gUser){
             nUser =gUser.user;
           }else{
             message.channel.send(`Cannot find **${args[0]}** as user on this server (\" *${message.guild.name}* \") `);
             return;
           }
      }

      let embed = new discord.RichEmbed().setAuthor(`${nUser.username}#${nUser.discriminator}`);
      message.channel.send(embed).then(msg => msg.delete(60000));;
      message.delete(60000);
    },
};
