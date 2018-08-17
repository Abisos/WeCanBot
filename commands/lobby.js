module.exports = {
  name: 'lobby',
  description: 'Create your private Voicechannel',
  aliases: ["privateroom", "room"],
  usage: '[Channelname] [uptimeduration in minutes (max is 300)]',
  cooldown: 60,
  guildOnly: true,
  args: true,
  async execute(message, args, client) {
    const {
      prefix
    } = require('../config.json');
    const util = require('util');
    const setTimeoutPromise = util.promisify(setTimeout);
    let guild = message.guild;

    if(!message.guild.channels.find(gc => gc.type==='category'&&gc.name==='Voicelobby')) guild.createChannel('Voicelobby','category').then(c=> message.channel.send("Successfully created the category:"+c.name).then(msg => msg.delete(60000)).catch(console.error()));

    if(!args[1]) return message.reply("You have to pass the `Channelname` and your `Uptimeduration`. Example: `"+prefix+"lobby MyAwsomeChannel 120`").then(msg => msg.delete(60000));
    let duration= +args[1];
    if(!duration||duration>300){ return message.reply("You have to pass a valid duration between 1 and 300 minutes.").then(msg => msg.delete(30000));}

    let lobby;

    guild.createChannel(args[0],'voice', [{id:message.author,  allowed: ['CONNECT','MANAGE_CHANNELS']}],'WeCan Bot Lobbyautocreate.')
      .then((vc) => {
        message.reply("Your Voicechannel `"+vc.name+"` was created. Time left:`"+duration+" minutes`.").then(msg => msg.delete(30000));
        lobby =vc;
        try{
          lobby.setParent(message.guild.channels.find(gc => gc.type==='category'&&gc.name==='Voicelobby'));
          message.delete();
          setTimeoutPromise(duration*1000*60).then(()=>{lobby.delete("Time is up!")});

        }catch(e){
        console.log(e.stack);
        lobby.delete("An error occured");
        message.channel.send("An error occured. Please message the author of the bot.").then(msg => msg.delete(120000));
        message.delete();


        }
      }).catch(console.error());

},
};
