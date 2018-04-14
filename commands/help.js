 const { prefix } = require('../config.json');

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands','h'],
	usage: '[commandname]',
	cooldown: 5,
	execute(message, args, client) {
		const { commands } = message.client;
		const data = [];

		if (!args.length) {
			data.push('Here\'s a list of all commands:\n\`\`\`');
			data.push(commands.map(command => command.name).join('\n'));
			data.push(`\`\`\`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
		}
		else {
			const command = client.commands.get(args[0])
				|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));

			if (!command) {
				return message.reply('that\'s not a valid command!');
			}

			data.push(`**Name:** \t\t\t ${command.name}`);

			if (command.description) data.push(`**Description:**   ${command.description}`);
			if (command.aliases) data.push(`**Aliases:** \t \t ${command.aliases.join(', ')}`);
			if (command.usage) data.push(`**Usage:**\t \t   *${prefix}${command.name}* ${command.usage}`);
			if (command.example) data.push(`**Example:**\t\t\t*${prefix}${command.name}* ${command.example}`);
			if(command.cooldown) data.push(`**Cooldown:**\t   ${command.cooldown || 3} second(s)`);
		}

		message.author.send(data, { split: true })
			.then(() => {
				if (message.channel.type !== 'dm') {
					message.reply(`I\'ve sent you a DM with all my commands!`)
					.then(msg => msg.delete(9000));

				}
			}).catch(() => message.reply('it seems like I can\'t DM you!')
					.then(msg => msg.delete(20000))
				);
			message.delete(10000);
	},
};
