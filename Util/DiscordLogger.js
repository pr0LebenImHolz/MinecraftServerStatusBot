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
	API: 1 // Logs server API events (server starting/ started/ stopping/ stopped)
}
module.exports = DiscordLogger;
