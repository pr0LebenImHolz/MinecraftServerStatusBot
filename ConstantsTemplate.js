const BotStatus = require('./Util/BotStatus.js');

module.exports = {
	/*
	 * Don't use this in production - this enables dev logging and some dev variables
	 * @see MinecraftServerStatusBot.js:16 'dev overwrites'
	 */
	dev: false,
	logging: {
		/* 
		 * 0 DEBUG (Don't use this in production)
		 * 1 INFO (Use this)
		 * 2 LOG
		 * 3 ERROR
		 */
		level: 0, //@TODO
		/*
		 * The directory to cut of all log messages (the parent directory of the main class should be fine)
		 * working dir (parent dir of main class): `${process.cwd()}/`
		 */
		basedir: `${process.cwd()}/`
	},
	tls: {
		/* 
		 * For Let's Encrypt (Certbot), use these paths:
		 * key: /etc/letsencrypt/live/[domain]/privkey.pem
		 * cert: /etc/letsencrypt/live/[domain]/fullchain.pem
		 */
		key: './dev/privkey.pem', //@TODO
		cert: './dev/fullchain.pem' //@TODO
	},
	api: {
		/* 
		 * Defines the credentials to access the API.
		 * No protocol (http(s)://) needed for host - using tls anyways!
		 */
		host: 'example.com', //@TODO
		port: 443, //@TODO
		basePath: '/',
		/* 
		 * https://randomkeygen.com/ -> CodeIgniter Encryption Keys
		 */
		token: 'hippopotomonstrosesquippedaliophobia', //@TODO
		/* 
		 * API Version - will be returned so the Mod can check (compare) them
		 */
		version: '1.0.0'
	},
	bot: {
		/*
		 * The discord bot token
		 */
		token: 'hippopotomonstrosesquippedaliophobia', //@TODO
		activities: {
			starting: {activity:{name:'dem Server beim Starten zu...',type:BotStatus.ACTIVITY.WATCHING},status:BotStatus.STATUS.IDLE},
			stopping: {activity:{name:'dem Server beim Stoppen zu...',type:BotStatus.ACTIVITY.WATCHING},status:BotStatus.STATUS.IDLE},
			/* 
			 * Fallback running activity
			 */
			running: {activity:{name:'den Spielern beim z0cken zu',type:BotStatus.ACTIVITY.WATCHING},status:BotStatus.STATUS.ONLINE},
			/* 
			 * Default running activity
			 *  
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
			/* 
			 * All states the Mod sends to the API
			 */
			starting: 'STARTING',
			stopping: 'STOPPING',
			running: 'RUNNING',
			stopped: 'STOPPED'
		},
		ping: {
			/* 
			 * The host and port of the minecraft server (to get the data for the activity)
			 */
			host: 'example.com', //@TODO
			port: 25565 //@TODO
		}
	}
};
