
const Discord = require("discord.js");

const client = new Discord.Client();

const ms = require("ms");

const Prefix = '>';

client.on("ready", () => {
  
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
 
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});


client.on("message", async message => {
  
  if(message.author.bot) return;
  
 
  if(message.content.indexOf(Prefix) !== 0) return;
  
  const args = message.content.slice(Prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
 
  if(command === "ping") {
    
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command === "say") {
    
    const sayMessage = args.join(" ");
    
    message.delete().catch(O_o=>{}); 
    
    message.channel.send(sayMessage);
  }
  
  if(command === "kick") {
    
    if(!message.member.roles.some(r=>["Administrator", "Moderator", "Owner"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }
  
  if(command === "ban") {
  
    if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }
  if(command === "purge") {
    
    const deleteCount = parseInt(args[0], 10);
    
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
  //Start Mute Code
  module.exports.run = async (bot, message, args) => {

  let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  if(!tomute) return message.reply("Couldn't find user.");
  const mod = message.author;
  if(tomute.hasPermission("ADMINISTRATOR")) return message.reply("You need permissions for use this command.");
  const modlog = message.guild.channels.find(channel => channel.name === 'logs');
  let muterole = message.guild.roles.find(`name`, "Muted");
  //start of create role
  let muteChannel = message.guild.channels.find(`name`, "logs");
  if (!muteChannel) return message.channel.send('**Please create a channel with the name `logs`**')
  if (!muterole) {
      try{
      muterole = await message.guild.createRole({
        name: "Muted",
        color: "#000000",
        permissions:[]
      })
      message.guild.channels.forEach(async (channel, id) => {
        await channel.overwritePermissions(muterole, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false
        });
      });
    }catch(e){
      console.log(e.stack);
    }
  }
  //end of create role
  let mutetime = args[1];
  if(!mutetime) return message.reply("You didn't specify a time!");

  await(tomute.addRole(muterole.id));
  const muteembed = new Discord.RichEmbed()
          .setAuthor(' Action | Mute', `https://images-ext-2.discordapp.net/external/Wms63jAyNOxNHtfUpS1EpRAQer2UT0nOsFaWlnDdR3M/https/image.flaticon.com/icons/png/128/148/148757.png`)
          .addField('User', `<@${tomute.id}>`)
          .addField('Time', `${ms(ms(mutetime))}`)
          .addField('Staff_Member', `${mod}`)
          .setColor('#0d05ff')
          .setFooter("Made By DarkSoul")
          modlog.send(muteembed)
          
          setTimeout(function(){
            tomute.removeRole(muterole.id);
            message.channel.send(`<@${tomute.id}> has been unmuted!`);
          }, ms(mutetime));
}

exports.conf = {
  aliases: [],
  permLevel: 2
};


module.exports.help = {
  name: "mute"
}
//end of mute code
//Start of Unmute Code
module.exports.run = async (bot, message, args) => {

  if (!message.member.hasPermissions ('ADMINISTRATOR')) return message.channel.send("You need **ADMINISTRATOR** permissions for use this command.")
  const modlog = message.guild.channels.find(channel => channel.name === 'mute-banned-kicked-logs');
  const mod = message.author;
  let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  if (!user) return message.channel.send("Couldn't find user.")
  if (!user.roles.find(`name`, "Muted")) return message.channel.send('There are\'t in muted.')
  let muterole = message.guild.roles.find(`name`, "Muted");
  if(args[0] == "help"){
    message.reply("Usage: >unmute <user>");
    return;
  }
let muteChannel = message.guild.channels.find(`name`, "Logs");
if (!muteChannel) return message.channel.send('**Please create a channel with the name `Logs`**')

  if (!muterole) {
      try {
          muterole = await message.guild.createRole({
              name: "Muted",
              color: "#000000",
              permissions: []
          })
          message.guild.channels.forEach(async (channel, id) => {
              await channel.overwritePermissions(muterole, {
                  SEND_MESSAGES: false,
                  ADD_REACTIONS: false
              });
          });
      } catch (e) {
          console.log(e.stack);
      }
  }


  let mutetime = args[1];

  await (user.removeRole(muterole.id));
  const muteembed = new Discord.RichEmbed()
          .setAuthor(' Action | UnMute', `https://images-ext-2.discordapp.net/external/wKCsnOcnlBoNk-__BXsd6BrO6YddfUB-MtmaoaMxeHc/https/lh3.googleusercontent.com/Z5yhBQBJTSJVe5veJgaK-9p29hXm7Kv8LKF2oN0hDnsToj4wTcQbirR94XVpH4Lt5a5d%3Dw300`)
          .addField('User', `<@${user.id}>`)
          .addField('Staff_Member', `${mod}`)
          .setColor('#0d05ff')
        .setFooter("Made By FlashBlink", "https://cdn.discordapp.com/avatars/453870812311584779/72734a7ab1876a3d63e565e70f378fc2.png?size=2048")
      modlog.send(muteembed)


}


exports.conf = {
  aliases: [],
  permLevel: 2
};

module.exports.help = {
  name: "unmute",
  category: "MODERATION"
}
//End of Unmute Code

});

client.login(process.env.BOT_TOKEN);