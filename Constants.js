const BotStatus = require('./Util/BotStatus.js');

module.exports = {
	logging: {
		level: 0,
		basedir: ''
	},
	dev: false,
	tls: {
		key: './privkey.pem',
		cert: './fullchain.pem'
	},
	api: {
		host: null,
		port: null,
		basePath: '/',
		token: null, // https://randomkeygen.com/ -> CodeIgniter Encryption Keys
		version: '1.0.0'
	},
	bot: {
		token: null,
		activities: {
			starting: {activity:{name:'dem Server beim Starten zu...',type:BotStatus.ACTIVITY.WATCHING},status:BotStatus.STATUS.IDLE},
			stopping: {activity:{name:'dem Server beim Stoppen zu...',type:BotStatus.ACTIVITY.WATCHING},status:BotStatus.STATUS.IDLE},
			running: {activity:{name:'den Spielern beim z0cken zu',type:BotStatus.ACTIVITY.WATCHING},status:BotStatus.STATUS.ONLINE},
			/* 
			 * %c = current online players
			 * %m = max players
			 * %d = motd
			 */
			running_2: {activity:{name:'%c/%m Spielern beim z0cken zu',type:BotStatus.ACTIVITY.WATCHING},status:BotStatus.STATUS.ONLINE},
			offline: {activity:{name:'den Geräuschen eines toten Servers zu',type:BotStatus.ACTIVITY.LISTENING},status:BotStatus.STATUS.DND}
		}
	},
	server: {
		states: {
			starting: 'STARTING',
			stopping: 'STOPPING',
			running: 'RUNNING',
			stopped: 'STOPPED'
		},
		ping: {
			host: null,
			port: null
		}
	}
};
