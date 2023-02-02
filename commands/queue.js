const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName("queue").setDescription("Gives Bot queue"),
    async executeInteraction(interaction, client) {
        console.log(client.settings)
        var msgEmbed = new EmbedBuilder().setColor("#b80000").setAuthor({name: client.user.username}).setTitle("Bot Commands").setDescription("Current Prefix: " + client.settings[interaction.guildId].prefix).setThumbnail(client.user.displayAvatarURL()).setTimestamp()
        try {
            const queue = client.distube.getQueue(interaction);
            console.log(queue)
            if(queue) {
                var fieldsMusic = []
                msgEmbed.addField("Now Playing:", "**" + client.nowPlaying[interaction.guildId].name + "**\n");
                for(var i = 1; i < 10 && i < queue.songs.length; i++)
                    fieldsMusic.push(`**[${i + 1}] **${client.queue[message.guild.id][i].name}`)
                if(fieldsMusic.length) msgEmbed.addFields({name: "Songs", value: fieldsMusic.join("\n")})
                msgEmbed.setFooter("Number of songs: " + client.queue[message.guild.id].length)
            } else {
                message.channel.send(`There's no songs in the queue!`);
            }
        } catch (error) {
            console.error(error);
        }
    },
    async execute(message, args, client) {
        var msgEmbed = new EmbedBuilder().setColor("#b80000").setAuthor({name: client.user.username}).setTitle("Bot Commands").setDescription("Current Prefix: " + client.settings[message.guild.id].prefix).setThumbnail(client.user.displayAvatarURL()).setTimestamp()
        try {
            const queue = client.distube.getQueue(message);
            console.log(queue)
            if(queue) {
                var fieldsMusic = []
                msgEmbed.addField("Now Playing:", "**" + client.nowPlaying[message.guild.id].name + "**\n");
                for(var i = 1; i < 10 && i < client.queue[message.guild.id].length; i++)
                    fieldsMusic.push(`**[${i + 1}] **${client.queue[message.guild.id][i].name}`)
                if(fieldsMusic.length) msgEmbed.addFields({name: "Songs", value: fieldsMusic.join("\n")})
                msgEmbed.setFooter("Number of songs: " + client.queue[message.guild.id].length)
            } else {
                message.channel.send(`There's no songs in the queue!`);
            }
        } catch (error) {
            console.error(error);
        }
    }
}