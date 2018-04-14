module.exports = {
  name: 'get',
  description: 'Offers the User go get certain information. !!!In process!!!',
  aliases: ["get", "g"],
  usage: '[praefix+commandname keyword]',
  cooldown: 2,
  guildOnly: true,
  args: true,
  async execute(message, args) {
    message.channel.send("This command is currently in process!")
      .then(msg => msg.delete(9000));
    message.channel.send(`You wanted to know what \"${args[0]}\" is.`)
      .then(msg => msg.delete(9000));
    message.delete(9000);
  },
};
