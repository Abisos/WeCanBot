module.exports = {
  name: 'showperms',
  description: 'Prints all Permissions for the server you\`re in. V1.1 ',
  aliases: ['showp', 'showpermission'],
  usage: '[command comandname ]',
  cooldown: 2,
  execute(message, args, client) {
    const fs = require('fs');

    const Permissionsraw = fs.readFileSync('./Perms.json');
    const Permissions = JSON.parse(Permissionsraw);
    if (!args[0]) {
      let returnString = `Commandpermissions for the Server: ${message.guild.name} \n \`\`\`css\n`;
      let longestCommandname = 0;
      client.commands.forEach(c => {
        if (c.name.length > longestCommandname) longestCommandname = c.name.length;
      });
      client.commands.forEach(c => {
        returnString += `${c.name}: `;
        for (var i = 0; i < longestCommandname - c.name.length + 2; i++) returnString += ` `;

        returnString += `Allowed Roles:[${Permissions[message.guild.id][c.name].allowedroles}]\n`;
        for (var i = 0; i < longestCommandname + 2; i++) {
          returnString += ` `;
        }
        var allowedchannelsname = [];
        Permissions[message.guild.id][c.name].allowedchannels.forEach(element => {
          if (element !== "all") {
            allowedchannelsname.push(client.channels.get(element).name);
          } else {
            allowedchannelsname.push("all");
          }
        });

        returnString += `  Allowed Channels:[${allowedchannelsname.sort()}]\n`;
      });
      returnString += `\`\`\``;
      message.delete(60000);
      return message.channel.send(returnString).then(msg => msg.delete(60000));;

    }
  },
};
