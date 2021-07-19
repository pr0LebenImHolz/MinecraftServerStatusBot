class DiscordLogger {
	constructor(level, channels) {
		this.level = level;
		this.channels = channels;
	}
	
	setChannels(channels) {
		this.channels = channels;
	}
	
	log(level, message) {
		if (this.level <= level) this.channels.forEach((channel) => {
			channel.send(message);
		});
	}
}
DiscordLogger.LogLevels = {
	EVERYTHING: 0, // Logs API and Discord (command) events
	API_EVERYTHING: 1, // Logs all API events (server starting/ started/ stopping/ stopped, player joined/ left)
	API_SERVER: 2 // Logs server API events (server starting/ started/ stopping/ stopped)
}
module.exports = DiscordLogger;