const fs = require('fs');
const Discord = require('discord.js');
const {
  prefix,
  token
} = require('./config.json');

var Perms = null;

/*Example for
	const Permissionsraw = fs.readFileSync('./Perms.json');
	const Permissions = JSON.parse(Permissionsraw);

	Permissions[message.guild.id]={};
	Permissions[message.guild.id].name="franz";

	const returnPerms = JSON.stringify(Permissions, null, 2);
	fs.writeFileSync('./Perms.json',returnPerms);
*/

// generate Perms.json if not exists (due to its exclusion in .gitignore)
if (!fs.existsSync('./Perms.json')) {
  fs.writeFileSync('./Perms.json', '{}', 'utf8');
}

const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands');

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}


client.on("ready", async () => {

  console.log(`${client.user.username} is ready!`);
  try {
    let link = await client.generateInvite(["ADMINISTRATOR"]);
    console.log(link);
  } catch (e) {
    console.log(e.stack);
  }
  client.user.setActivity(' a server.', {
    type: 'WATCHING'
  });

  const Permissionsraw = fs.readFileSync('./Perms.json');
  const Permissions = JSON.parse(Permissionsraw);

  //setup check for each guild the bot is in
  client.guilds.forEach(guild => {
    // create permissions object in case the bot was invited to a guild before it
    // was started and could never reach client.on("guildCreate").
    // this can almost only happen in dev environment
    if (!Permissions[guild.id]) {
      Permissions[guild.id] = {};
      Permissions[guild.id].maintenancemodebool = false;
    }
    //adding new permissions if new commands are created
    client.commands.forEach(command => {

      if (!Permissions[guild.id][command.name]) {
        Permissions[guild.id][command.name] = {
          allowedroles: ["all"],
          allowedchannels: ["all"]
        };
        console.log(`Added commandperm options for ${command.name}`);
      }
    });

    // deleting permissions if a command was deleted
    const jsobarray = Object.entries(Permissions[guild.id]);

    for (var i = 1; i < jsobarray.length; i++) {

      let approved = false;
      //comparing the permission name with the name of every single command
      client.commands.forEach(command => {
        if (command.name === jsobarray[i][0]) {
          approved = true;
        }
      });

      if (!approved) {
        delete Permissions[guild.id][jsobarray[i][0]];
        console.log(`deleted`);
      }
    }

  });

  const returnPerms = JSON.stringify(Permissions, null, 2);
  fs.writeFileSync('./Perms.json', returnPerms);

  console.log("Fully Active now.");
  Perms = require('./Perms.json');
});

client.on("guildCreate", async guild => {

  const Permissionsraw = fs.readFileSync('./Perms.json');
  const Permissions = JSON.parse(Permissionsraw);
  if (!Permissions[guild.id]) {
    console.log("Creating permission model");
    Permissions[guild.id] = {};
    Permissions[guild.id].maintenancemodebool = false;
    client.commands.forEach(async c => {
      console.log(`Adding permission for : ${c.name}`);
      Permissions[guild.id][c.name] = {
        allowedroles: ["all"],
        allowedchannels: ["all"]
      };
    });
  }
  const botstest = await guild.channels.find(GuildChannel => GuildChannel.name === "bots");
  if (botstest) {
    Permissions[guild.id].maintenancemodebool = true;
  }

  const returnPerms = JSON.stringify(Permissions, null, 3);
  fs.writeFileSync('./Perms.json', returnPerms);

  console.log(`The bot was added to a new server: ${guild.name}.`);
});

client.on('message', async message => {
  if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return;



  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;
  if (message.channel.type === "text") {
    if (Perms[message.guild.id].maintenancemodebool && message.channel.name !== "bots") return;
    if (!Perms[message.guild.id][command.name].allowedchannels.includes("all") && !Perms[message.guild.id][command.name].allowedchannels.includes(message.channel.id)) return;
    if (!Perms[message.guild.id][command.name].allowedroles.includes("all") && !Perms[message.guild.id][command.name].allowedroles.includes(message.role.name)) return;
  }


  if (command.guildOnly && message.channel.type !== 'text') { //Checks if the command is allowed in DM
    return message.reply('I can\'t execute that command inside DMs!');
  }

  if (command.args && !args.length) { //Checks if args where send
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  if (!cooldowns.has(command.name)) { //Creates a new Cooldownlist if a new Command was created
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown) * 1000;

  if (!timestamps.has(message.author.id)) { //Cooldown
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  } else {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }

  try {
    command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }

});

client.login(token);
