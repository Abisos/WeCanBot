module.exports = {
  name: 'maintenancemode',
  description: 'Starts Maintenancemode. The bot is only avaiable at the channel #bots. \n \t \t \t V1.0',
  aliases: ["smtm", "startmtm"],
  usage: '[praefix+commandname]',
  cooldown: 60,
  guildOnly: true,
  execute(message, args, client) {
    const fs = require('fs');

    if (client.permissions[message.guild.id].maintenancemodebool) {
      message.channel.send("Maintenancemode is already active.").then(msg => msg.delete(9000));;
    } else {
      client.permissions[message.guild.id].maintenancemodebool = true;
      message.channel.send("Maintenancemode activated.").then(msg => msg.delete(9000));;
    }
    const returnPerms = JSON.stringify(client.permissions, null, 2);
    fs.writeFileSync('./Perms.json', returnPerms);
    message.delete(9000);
  },
};
