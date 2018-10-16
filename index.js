const fs = require('fs');
const Discord = require('discord.js');
const streamAnnouncer = require('./streamAnnouncer.js');
const sqlite3 = require('sqlite3').verbose();
const db = require("./dbHandler.js");
const {
  prefix,
  token
} = require('./config.json');

/*Example for
	const Permissionsraw = fs.readFileSync('./Perms.json');
	const Permissions = JSON.parse(Permissionsraw);

	Permissions[message.guild.id]={};
	Permissions[message.guild.id].name="franz";

	const returnPerms = JSON.stringify(Permissions, null, 2);
	fs.writeFileSync('./Perms.json',returnPerms);
*/

// generate config files if they not exists (due to their exclusion in .gitignore)
if (!fs.existsSync('./Perms.json')) {
  fs.writeFileSync('./Perms.json', JSON.stringify({}), 'utf8');
}

if (!fs.existsSync('./GuildSettings.json')) {
  fs.writeFileSync('./GuildSettings.json', JSON.stringify({}), 'utf8');
}

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.permissions = new Discord.Collection();
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
  client.permissions = JSON.parse(Permissionsraw);

  //setup check for each guild the bot is in
  client.guilds.forEach(guild => {
    // create permissions object in case the bot was invited to a guild before it
    // was started and could never reach client.on("guildCreate").
    // this can almost only happen in dev environment and if the bot
    // has a longer downtime while restarting
    if (!client.permissions[guild.id]) {
      client.permissions[guild.id] = {};
      client.permissions[guild.id].maintenancemodebool = false;
    }

    //adding new permissions if new commands are created
    client.commands.forEach(command => {

      if (!client.permissions[guild.id][command.name]) {
        client.permissions[guild.id][command.name] = {
          allowedroles: ["all"],
          allowedchannels: ["all"]
        };
        console.log(`Added commandperm options for ${command.name}`);
      }
    });

    // deleting permissions if a command was deleted
    const jsobarray = Object.entries(client.permissions[guild.id]);

    for (var i = 1; i < jsobarray.length; i++) {

      let approved = false;
      //comparing the permission name with the name of every single command
      client.commands.forEach(command => {
        if (command.name === jsobarray[i][0]) {
          approved = true;
        }
      });

      if (!approved) {
        delete client.permissions[guild.id][jsobarray[i][0]];
        console.log(`deleted`);
      }
    }

  });

  const returnPerms = JSON.stringify(client.permissions, null, 2);
  fs.writeFileSync('./Perms.json', returnPerms);

  /* ---- BEGIN GuildSettings ---- */
  // parse settings file
  const SettingsFile = fs.readFileSync(`./GuildSettings.json`);
  const GuildSettings = JSON.parse(SettingsFile);

  // build setting entrys for each guild the client is in
  client.guilds.forEach(guild => {
    // create settings object and database in case the bot was invited to a guild before it
    // was started and could never reach client.on("guildCreate").
    // this can almost only happen in dev environment and if the bot
    // has a longer downtime while restarting
    if (!GuildSettings[guild.id]) {
      GuildSettings[guild.id] = {};
    }

    guild.settings = new Discord.Collection();

    for(var settingName in GuildSettings[guild.id]) {
      guild.settings[settingName] = GuildSettings[guild.id][settingName];
    }

    // load or create database
    if (!guild.database) {
      guild.database = new sqlite3.cached.Database(`./databases/${guild.id}.sqlite`);

      db.initTables(guild.database);
    }
  });

  // write GuildSettings to file
  const returnSettings =  JSON.stringify(GuildSettings, null, 2);
  fs.writeFileSync('./GuildSettings.json', returnSettings);
  /* ---- END GuildSettings ---- */

  console.log("Fully Active now.");
});

client.on("guildCreate", async guild => {

  const Permissionsraw = fs.readFileSync('./Perms.json');
  client.permissions = JSON.parse(Permissionsraw);
  if (!client.permissions[guild.id]) {
    console.log("Creating permission model");
    client.permissions[guild.id] = {};
    client.permissions[guild.id].maintenancemodebool = false;
    client.commands.forEach(async c => {
      console.log(`Adding permission for : ${c.name}`);
      client.permissions[guild.id][c.name] = {
        allowedroles: ["all"],
        allowedchannels: ["all"]
      };
    });
  }
  const botstest = await guild.channels.find(GuildChannel => GuildChannel.name === "bots");
  if (botstest) {
    client.permissions[guild.id].maintenancemodebool = true;
  }

  const returnPerms = JSON.stringify(client.permissions, null, 3);
  fs.writeFileSync('./Perms.json', returnPerms);

  /* ---- BEGIN GuildSettings ---- */
  // create entry in settings file for the new guild
  // parse settings file
  const SettingsFile = fs.readFileSync(`./GuildSettings.json`);
  const GuildSettings = JSON.parse(SettingsFile);

  // build setting entrys for the guild
  if (!GuildSettings[guild.id]) {
    GuildSettings[guild.id] = {};
  }

  guild.settings = new Discord.Collection();

  const returnSettings = JSON.stringify(GuildSettings, null, 2);
  fs.writeFileSync('./GuildSettings.json', returnSettings);
  /* ---- END GuildSettings ---- */

  /* ---- BEGIN Guild Database ---- */
  guild.database = new sqlite3.cached.Database(`./databases/${guild.id}.sqlite`);
  db.initTables(guild.database);
  /* ---- END Guild Database ----*/

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
    if (client.permissions[message.guild.id].maintenancemodebool && message.channel.name !== "bots") return;
    if (!client.permissions[message.guild.id][command.name].allowedchannels.includes("all") && !client.permissions[message.guild.id][command.name].allowedchannels.includes(message.channel.id)) return;
    if (!client.permissions[message.guild.id][command.name].allowedroles.includes("all") && !client.permissions[message.guild.id][command.name].allowedroles.includes(message.member.highestRole.name)) return;
  }


  if (command.guildOnly && message.channel.type !== 'text') { //Checks if the command is allowed in DM
    return message.reply('I can\'t execute that command inside DMs!').then(m => message.delete(60000));
  }

  if (command.args && !args.length) { //Checks if args where send
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply).then(m => message.delete(60000));
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
      return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`).then(m => {message.delete(); m.delete(30000);});
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

// assign scores to a user for each message he sends,
// including base score and a bonus based on message length
client.on('message', async message => {
  // return if message is a command or from a bot
  if (message.content.toLowerCase().startsWith(prefix) || message.author.bot) return;

  // set base score plus bonus based on message length
  let letters = message.content.length;
  var score = Math.floor(Math.random() * (20 - 10) + 10);

  switch (true) {
    case letters > 40 && letters < 91:
      score += 2;
      break;
    case letters >90 && letters <151:
      score += 5;
      break;
    case letters >150 && letters <251:
      score += 9;
      break;
    case letters >250:
      score += 15;
      break;
    default:
      score += 0;
  }

  // update the score of the member
  db.updateScore(message.guild.database, message.author.id, score);
});

client.on('presenceUpdate', async (oldMember, newMember) => {
  try {
    streamAnnouncer.execute(oldMember,  newMember);
  } catch (error) {
    console.log(`${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')} ERROR: presenceUpdate`);
    console.error(error);
  }
});

client.on("disconnect", async() => {
  client.guilds.forEach(guild => {
    guild.database.close(); // dont know if it gets executed in case of a crash or if it is even necessary to close them programatically
  });
});

// process.on('unhandledRejection', err => console.error(`Uncaught Promise Rejection: \n${err.stack}`));
client.login(token);
