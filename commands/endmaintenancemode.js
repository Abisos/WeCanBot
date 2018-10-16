module.exports = {
  name: 'endmaintenancemode',
  description: 'Ends the maintenancemode.',
  aliases: ["emtm", "endmtm"],
  usage: '',
  cooldown: 60,
  guildOnly: true,
  execute(message, args, client) {
    const fs = require('fs');

    if (client.permissions[message.guild.id].maintenancemodebool) {
      client.permissions[message.guild.id].maintenancemodebool = false;
      message.channel.send("The Maintenancemode was ended.").then(msg => msg.delete(9000));
    } else {
      message.channel.send("There is no maintenancemode active.").then(msg => msg.delete(9000));
    }
    const returnPerms = JSON.stringify(client.permissions, null, 2);
    fs.writeFileSync('./Perms.json', returnPerms);
    message.delete(9000);

  },
};
