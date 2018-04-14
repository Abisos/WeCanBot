module.exports = {
	name: 'userinfo',
	description: 'Display info about an user.',
  aliases:["ui","userinf","uinf","useri"],
	usage: '[username/nickname/id/mention/none]',
  cooldown:2,
	guildOnly:true,
	async execute(message, args) {

    const discord = require('discord.js');

    /*
    * Since you have to give information about the author itself, if there are no arguments, you have to set the variables to the author.
    */


    let gUser = message.member; //gUser represents the author as a GuildMember(https://discord.js.org/#/docs/main/stable/class/GuildMember)
    let nUser = gUser.user;     //nUser represents the author as a User(https://discord.js.org/#/docs/main/stable/class/User)

    if(args[0]){ // If there are arguments
         gUser = message.mentions.members.first() // trying to find the user
          || message.guild.members.find(m => m.user.username === args[0] || m.nickname === args[0] || m.id === args[0])
          || message.member || await message.guild.fetchMember(message.author) || null;
         if(gUser){ //If there is an User found on the current server
           nUser =gUser.user;
         }else{           //If there is no User found on the current server
           message.channel.send(`Cannot find **${args[0]}** as user on this server (\" *${message.guild.name}* \") `);
           return;
         }
      }

    let embed = new discord.RichEmbed()                         								// Creating a new RichEmbed(https://discord.js.org/#/docs/main/stable/class/RichEmbed)
        .setAuthor(`${nUser.username}#${nUser.discriminator}`)  								// setting the Author
        .setColor("#4286f4")                                    								// setting the color
        .setThumbnail(nUser.displayAvatarURL)                   								// setting the avatar
        .addField("Id",nUser.id)                                								// adding a new field : The User ID
        .addField("Created At",nUser.createdAt.toUTCString(), true)             // adding a new field : When the User joined the Server (Date:https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Date)
        .addField("Joined Server At",gUser.joinedAt.toUTCString(),true);				// adding a new field : When the Account was Created (Date:https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Date)
				let acage; let difference=Date.now()-nUser.createdTimestamp;						// generating a String with the time passed since the AccountCreated-Timestamp
					if(Math.trunc(difference/30758400000)===1){acage= `1 year`;
					}else{acage =`${Math.trunc(difference/30758400000)} years`;}
					difference=difference-Math.trunc(difference/30758400000)*30758400000;
					if(Math.trunc(difference/86400000)===1){acage +=` 1 day`;
					}else{acage +=` ${Math.trunc(difference/86400000)} days`;}
					difference = difference-Math.trunc(difference/86400000)*86400000;
					if(Math.trunc(difference/3600000)===1){acage +=` 1 hour`;
					}else{acage +=` ${Math.trunc(difference/3600000)} hours`;}

				let joage; let differencejoin=Date.now()-gUser.joinedTimestamp;					// generating a String with the time passed since the Serverjoin-Timestamp
					if(Math.trunc(differencejoin/30758400000)===1){joage= `1 year`;
					}else{joage =`${Math.trunc(differencejoin/30758400000)} years`;}
					differencejoin=differencejoin-Math.trunc(differencejoin/30758400000)*30758400000;
					if(Math.trunc(differencejoin/86400000)===1){joage +=` 1 day`;
					}else{joage +=` ${Math.trunc(differencejoin/86400000)} days`;}
					differencejoin = differencejoin-Math.trunc(differencejoin/86400000)*86400000;
					if(Math.trunc(differencejoin/3600000)===1){joage +=` 1 hour`;
					}else{joage +=` ${Math.trunc(differencejoin/3600000)} hours`;}

				embed.addField("Account age",acage, true)																// adding a new field : adding the Account age to the Embed
						 .addField("Joined age",joage,true);          						 					// adding a new field : adding the Server join age to the Embed
		message.delete(60000);
    message.channel.send(embed).then(msg => msg.delete(60000));; // Sending the RichEmbed into the channel where the message was written in
	},
};
