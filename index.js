require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const database = require("./utils/database.js")
const fs = require('node:fs');
const { DisTube } = require('distube')
const { SpotifyPlugin } = require('@distube/spotify')
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { YtDlpPlugin } = require('@distube/yt-dlp')

const client = new Client({
    intents: [ 
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildVoiceStates,
    ]
});

client.distube = new DisTube(client, {
    leaveOnStop: false,
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: true,
    emitAddListWhenCreatingQueue: false,
    plugins: [
        new SpotifyPlugin({
            emitEventsAfterFetching: true
        }),
        new SoundCloudPlugin(),
        new YtDlpPlugin()
    ]
})

client.distube.on('addSong', (queue, song) =>
		queue.textChannel?.send(
			`Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`,
		),
	)
	.on('addList', (queue, playlist) =>
		queue.textChannel?.send(
			`Added \`${playlist.name}\` playlist (${
				playlist.songs.length
			} songs) to queue\n${status(queue)}`,
		),
	)

client.commands = new Map();
client.player = new Map();
client.settings = {};
slashCommands = []

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        slashCommands.push(command.data.toJSON())
    } else {
        console.log(`[WARNING] The command ${command.name} is missing a required "data", "execute" or "name" property.`);
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.on('interactionCreate', async (interaction) => {
    if(!interaction.isChatInputCommand()) return;
    if (!client.settings[interaction.guildId]) {
        client.settings[interaction.guildId] = await database.getSettings(message.guild.id)
        client.settings[interaction.guildId].prefix = "."
    }

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

    try {
        await command.executeInteraction(interaction, client)
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on('guildMemberAdd', async (member) => {
    var serverID = member.guild.id
    client.settings[serverID] = await database.getSettings(serverID)
    if (client.settings[serverID].defaultrole) member.roles.add(member.guild.roles.cache.find(i => i.name == client.settings[serverID].defaultrole))
})

client.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => { // Listeing to the voiceStateUpdate event
    var voiceChannel = client.guilds.cache.find(i => i == oldVoiceState.guild.id).channels.cache.find(i => i == oldVoiceState.channelID)
    try {
        if (voiceChannel) {
            if (voiceChannel.members.size == 1 && voiceChannel == oldVoiceState.guild.me.voice.channel) {
                if (client.nowPlaying[oldVoiceState.guild.id])
                    delete client.nowPlaying[oldVoiceState.guild.id]
                if (client.queue[oldVoiceState.guild.id])
                    delete client.queue[oldVoiceState.guild.id]
                if (client.connection[oldVoiceState.guild.id]) {
                    client.connection[oldVoiceState.guild.id] = null;
                    oldVoiceState.guild.me.voice.channel.leave();
                }
            }
        }
    } catch (error) {
        console.error(error)
    }
});
 
client.on('messageCreate', async (message) => {
    try {
        var args = [];
        if (message.author.bot) return;
        if (!client.settings[message.guildId]) {
            client.settings[message.guildId] = await database.getSettings(message.guildId)
            //client.settings[message.guildId].prefix = "."
        }
        console.log(client.settings[message.guildId])
        if (!message.content.startsWith(client.settings[message.guildId].prefix) && !message.mentions.has(client.user)) return;
        if (message.mentions.has(client.user)) {
            args = message.content.split(" ");
            args.shift();
        } else args = message.content.substring(client.settings[message.guildId].prefix.length).split(" ");
        let command = client.commands.get(args.shift());
        if (command) await command.execute(message, args, client);
    } catch (err) {
        console.log(err)
        message.channel.send("Something went Wrong!").then(msg => { setTimeout(() => msg.delete(), 10000) });;
    }
})

client.on('ready', async () => {
    // Try to get all the commands and put it in the slashCommands
    try {
		console.log(`Started refreshing ${slashCommands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
			{ body: slashCommands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
    client.user.setActivity('Discord Bot Test v2');
    console.log("Bot Discord v2 Ready!")
})

client.login(process.env.DISCORD_TOKEN);
