class DiscordLogger {
	constructor(level, plannedApiRequests, channels) {
		this._level = level;
		this._plannedApiRequests = [];
		this._plannedApiRequests = this._parseTimespan(plannedApiRequests);
		this._channels = channels;
	}
	
	setChannels(channels) {
		this._channels = channels;
	}
	
	log(level, message) {
		if (this._level <= level && this._isLoggingAllowedAtThisTime()) this._channels.forEach((channel) => { channel.send(message); });
	}
	
	_parseTimespan(times) {
		var parsedTimes = [];
		times.forEach((time, i) => {
			// Check if configured timespan matches following regex
			if (/^(([0-9]{4}|x|xxxx)-((0[0-9])|(1[0-2])|x|xx)-(([0-2][0-9])|(3[0-1])|x|xx)T(([0-1][0-9])|(2[0-3])|x|xx)(:(([0-5][0-9])|x|xx)){2}T\d+)$/i.test(time)) {
				// time = 'xxxx-xx-xxTxx:xx:xxTx'
				var parts = time.split('T');
				var date = parts[0].split('-');
				var time = parts[1].split(':');
				var tolerance = Number(parts[2]);
				var maxTolerance = -1; // assuming interval is once
				if (isNaN(date[0])) {
					date[0] = null; // assuming interval is yearly
					maxTolerance = 15778800; // seconds in a year / 2
				}
				if (isNaN(date[1])) {
					date[1] = null; // assuming interval is monthly
					maxTolerance = 1339200; // seconds in a month / 2
				}
				if (isNaN(date[2])) {
					date[2] = null; // assuming interval is dayly
					maxTolerance = 43200; // seconds in a day / 2
				}
				if (isNaN(time[0])) {
					time[0] = null; // assuming interval is hourly
					maxTolerance = 1800; // seconds in a hour / 2
				}
				if (isNaN(time[1])) {
					time[1] = null; // assuming interval is every minute
					maxTolerance = 30; // seconds in a minute / 2
				}
				if (isNaN(time[2])) {
					time[2] = null; // assuming interval is every second - WTF?
					maxTolerance = 0.5; // half a second
				}
				if (maxTolerance == -1 || maxTolerance >= tolerance) {
					parsedTimes.push({
						year: date[0],
						month: date[1],
						day: date[2],
						hour: time[0],
						minute: time[1],
						second: time[2],
						tolerance: tolerance
					});
				}
				else {
					throw new Error('IllegalArgumentException: plannedApiRequests[${i}] is in an invalid format: either tolerance is too high or interval to low');
				}
			}
			else {
				throw new Error('IllegalArgumentException: plannedApiRequests[${i}] is in an invalid format: Invalid RegEx');
			}
		});
		return parsedTimes;
	}
	
	_isLoggingAllowedAtThisTime() {
		function _leadingZero(number) {
			if (number < 0) throw new Error('InvalidStateException: ${number}');
			if (number < 10) return `0${number}`;
			return `${number}`;
		}
		for (var i = 0; i < this._plannedApiRequests.length; i++) {
			var plannedApiRequest = this._plannedApiRequests[i];
			// Get current date
			var current = new Date();
			// Get minimum timestamp in seconds when logging is not allowed
			var min = Math.floor((new Date(`${plannedApiRequest.year == null ? current.getFullYear() : plannedApiRequest.year}-${plannedApiRequest.month == null ? _leadingZero(current.getMonth() + 1) : plannedApiRequest.month}-${plannedApiRequest.day == null ? _leadingZero(current.getDate()) : plannedApiRequest.day}T${plannedApiRequest.hour == null ? _leadingZero(current.getHours()) : plannedApiRequest.hour}:${plannedApiRequest.minute == null ? _leadingZero(current.getMinutes()) : plannedApiRequest.minute}:${plannedApiRequest.second == null ? _leadingZero(current.getSeconds()) : plannedApiRequest.second}`)).getTime() / 1000);
			min -= plannedApiRequest.tolerance / 2;
			// Calculate maximum timestamp in seconds when logging is not allowed
			var max = min + plannedApiRequest.tolerance;
			// Calculate current timestamp in seconds
			current = Math.floor(current.getTime() / 1000);
			// When the current timestamp is not
			if (current > min && current < max) return false;
		};
		return true;
	}
}
DiscordLogger.LogLevels = {
	EVERYTHING: 0, // Logs API and Discord (command) events
	API: 1 // Logs server API events (server starting/ started/ stopping/ stopped)
}
module.exports = DiscordLogger;
