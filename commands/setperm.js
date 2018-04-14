module.exports = {
    name: 'setperm',
    description: 'Sets a new Permission: Add aliases["ADD","add","Add","aDD","+","a"] Delete aliases["DEL","DELETE","del","delete","REMOVE","remove","rm","-","r","d"] ',
    aliases: ['setp','setpermission'],
    usage: '[commandname add/delete role/channelmention]',
    example: "userinfo + #general",
    cooldown: 2,
    guildOnly: true,
    args: true,
    execute(message, args, client) {
      const fs = require('fs');
      if(!args[2]) return message.reply("You have to enter 3 arguments. \n1. The commandname/alias of the command you want to edit. \n2. Add or Delete \n3. Rolename or Channelmention\n example: We.setperm userinfo add MASTERROLE").then(msg => msg.delete(30000));
      const Permissionsraw = fs.readFileSync('./Perms.json');
      const Permissions = JSON.parse(Permissionsraw);

      //args[0]
      const command = client.commands.get(args[0])
    		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));
      if(!command) return message.reply(`There is no command called: ${args[0]}`).then(msg => msg.delete(30000));;

      //args[1]
      let Add = false; const Add_aliases= ["ADD","add","Add","aDD","+","a"];
      if(Add_aliases.includes(args[1])) Add = true;
      let Del = false; const Del_aliases= ["DEL","DELETE","del","delete","REMOVE","remove","rm","-","r","d"];
      if(Del_aliases.includes(args[1])) Del = true;
      if(!Add&&!Del) return message.reply(`I couldn't find an right Add/Delete Operator.`);

      //args[2] channelobject / roleobject
      // channel detection guildchannel.name === args[2] ||
      let channel = message.mentions.channels.first()
         || message.guild.channels.find(guildchannel => guildchannel.id === args[2])|| null;
      let role = message.mentions.roles.first()
         || message.guild.roles.find(role => role.name === args[2] || role.id === args[2])|| null;
      if(!channel&&!role) return message.reply(`I couldn't find an channelmention or role with the name/id: ${args[2]}`).then(msg => msg.delete(30000));;

      if(channel&&Add){//Channel
        if(Permissions[message.guild.id][command.name].allowedchannels.includes(channel.id)) return message.reply(`Ther is already a Permission for \"${command.name}\" in #${channel.name}`).then(msg => msg.delete(30000));;
        if(Permissions[message.guild.id][command.name].allowedchannels.includes("all")){
           Permissions[message.guild.id][command.name].allowedchannels = [`${channel.id}`];
           message.reply("Succesfully added permission.").then(msg => msg.delete(15000));;
        }else{
          Permissions[message.guild.id][command.name].allowedchannels.push(channel.id);
          message.reply("Succesfully added permission.").then(msg => msg.delete(15000));;
        }
      }else if(channel&&Del){
        if(Permissions[message.guild.id][command.name].allowedchannels.includes(channel.id)){
          Permissions[message.guild.id][command.name].allowedchannels.splice(Permissions[message.guild.id][command.name].allowedchannels.indexOf(channel.id),1);
          message.reply("Succesfully deleted permission.").then(msg => msg.delete(15000));;
        }else{
          message.reply(`There is no Permission for ${command.name} for the channel ${channel.name}`).then(msg => msg.delete(20000));;
        }
      }else if(role&&Add){//Role
        if(Permissions[message.guild.id][command.name].allowedroles.includes(role.name)) return message.reply(`Ther is already a Permission for \"${command.name}\" for ${role.name}`).then(msg => msg.delete(15000));;
        if(Permissions[message.guild.id][command.name].allowedroles.includes("all")){
          Permissions[message.guild.id][command.name].allowedroles = [`${role.name}`];
          message.reply("Succesfully added permission.").then(msg => msg.delete(15000));;
        }else{
          Permissions[message.guild.id][command.name].allowedroles.push(role.name);
          message.reply("Succesfully added permission.").then(msg => msg.delete(15000));;
        }
      }else{
        if(Permissions[message.guild.id][command.name].allowedroles.includes(role.name)){
          Permissions[message.guild.id][command.name].allowedroles.splice(Permissions[message.guild.id][command.name].allowedroles.indexOf(role.name),1);
          message.reply("Succesfully deleted Permission").then(msg => msg.delete(15000));;
        }else{
          message.reply(`There is no Permission for ${command.name} for the role ${role.name}`).then(msg => msg.delete(20000));;
        }
      }

      const returnPerms = JSON.stringify(Permissions, null, 3);
      fs.writeFileSync('./Perms.json',returnPerms);
      message.delete(15000)

    },
};
