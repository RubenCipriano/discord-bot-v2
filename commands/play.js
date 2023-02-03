const { SlashCommandBuilder } = require("discord.js");
const { createAudioResource, StreamType, createAudioPlayer, joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder().setName("play").setDescription("Plays a music").addStringOption(option => option.setName('query').setDescription('Query for search').setRequired(true)),
    async executeInteraction(interaction, client) {
        try {
            const guild = client.guilds.cache.get(interaction.guildId)
            const member = guild.members.cache.get(interaction.member.user.id);
            const voiceChannel = member.voice.channel;
            this.play(client, interaction.guildId, voiceChannel, interaction.options.getString('query'));
            interaction.reply({ content: 'Added to queue!', ephemeral: true })
        } catch (error) {
            console.error(error);
        }
    },
    async execute(message, args, client) {
        try {
            const guild = client.guilds.cache.get(message.guildId)
            const member = guild.members.cache.get(message.author.id);
            const voiceChannel = member.voice.channel;
            this.play(client, message.guildId, voiceChannel, args.join(' '))
            message.channel.send("Added to queue").then(msg => { setTimeout(() => msg.delete(), 15000) });
        } catch (error) {
            console.error(error);
        }
    },
    async play(client, guildId, voiceChannel, search) {
        if(!client.player.get(guildId)) client.player.set(guildId, createAudioPlayer());
        client.distube.play(voiceChannel, search).catch(err => {
			message.reply(err.message);
		});;
    }
}