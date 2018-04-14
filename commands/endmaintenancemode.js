module.exports = {
    name: 'endmaintenancemode',
    description: 'Ends the maintenancemode.',
    aliases:["emtm","endmtm"],
    usage: '[praefix+commandname]',
    cooldown:60,
    guildOnly:true,
    execute(message, args, Perms) {
      const fs = require('fs');

      const Permissionsraw = fs.readFileSync('./Perms.json');
    	const Permissions = JSON.parse(Permissionsraw);

      if (Permissions[message.guild.id].maintenancemodebool) {
        Permissions[message.guild.id].maintenancemodebool = false;
        message.channel.send("The Maintenancemode was ended.").then(msg => msg.delete(9000));
      }else {
        message.channel.send("There is no maintenancemode active.").then(msg => msg.delete(9000));
      }
      const returnPerms = JSON.stringify(Permissions, null, 2);
      fs.writeFileSync('./Perms.json',returnPerms);
      message.delete(9000);

    },
  };
