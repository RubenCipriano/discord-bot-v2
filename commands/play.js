const { SlashCommandBuilder } = require("discord.js");
const { createAudioResource, StreamType, createAudioPlayer, joinVoiceChannel } = require('@discordjs/voice');
const play_dl = require('play-dl')

module.exports = {
    data: new SlashCommandBuilder().setName("play").setDescription("Plays a music").addStringOption(option => option.setName('query').setRequired(true)),
    async executeInteraction(interaction, client) {
        try {
            const guild = client.guilds.cache.get(interaction.guildId)
            const member = guild.members.cache.get(interaction.member.user.id);
            const voiceChannel = member.voice.channel;
            console.log(interaction.options.getString('query'));
            this.play(client, interaction.guildId, voiceChannel)
        } catch (error) {
            console.error(error);
        }
    },
    async execute(message, args, client) {
        try {
            const guild = client.guilds.cache.get(message.guildId)
            const member = guild.members.cache.get(message.author.id);
            const voiceChannel = member.voice.channel;
            this.play(client, message.guildId, voiceChannel)
        } catch (error) {
            console.error(error);
        }
    },
    async play(client, guildId, voiceChannel) {
        if(!client.player.get(guildId)) client.player.set(guildId, createAudioPlayer());
        const searched = (await play_dl.search('Rick Roll', { limit : 1 }))[0]
        const source = await play_dl.stream(searched.url);
        const resource = createAudioResource(source.stream, {
            inputType : source.type
       })
       const player = client.player.get(guildId);

       player.play(resource)

       player.connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
       })

       player.connection.subscribe(player)
    }
}