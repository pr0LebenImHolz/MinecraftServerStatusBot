const BotStatus = require('./Util/BotStatus.js');

module.exports = {
	/*
	 * Don't change the version unless you know what you're doing.
	 * - v (full release)
	 * - pre (pre release)
	 * - x.y.z (major.minor.patch)
	 */
	version: 'v1.0.0',
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
		version: '1.0.0',
		/*
		 * timeout when this script calls the api (this happens when the command 'status' is triggered)
		 */
		timeout: 3000
	},
	bot: {
		/*
		 * The discord bot token
		 */
		token: 'hippopotomonstrosesquippedaliophobia', //@TODO
		commands: {
			prefix: '!', //@TODO
			help_command: 'help',
			/*
			 * The IDs of all roles which can interact with the bot
			 */
			roles: [
			],
			commands: {
				'ping': {
					syntax: '',
					description: 'Testcommand to check if the bot is still running'
				},
				'status': {
					syntax: '',
					description: 'Shows the current status of the bot and some other useful information'
				},
				'set': {
					syntax: '[status] [activity type] [activity]',
					description: 'Sets the status of the bot until the server overwrites it'
				},
				'lock': {
					syntax: '',
					description: 'Locks the current activity so the server can\'t overwrite it (`set` will still work)'
				},
				'unlock': {
					syntax: '',
					description: 'Unlocks the current activity so the server can overwrite it again'
				},
				'reload': {
					syntax: '',
					description: 'Force reload (i.e. pings the server)'
				}
			},
			responses: {
				types: {
					error: 0,
					info: 1,
					success: 2
				},
				error: {
					insufficient_permission: 'You don\'t have the permission to do that!',
					internal: 'Oups, anything went terribly wrong here...',
					unknown_command: 'Unknown command!',
					illegal_arguments: 'Illegal arguments!\n`%c %a`',
					command_set: 'Can\'t set activity.',
					command_set_unknown_status: `Can\'t set activity: Unknown status:\nValid states: ${parseBotStates(BotStatus.STATUS)}`,
					command_set_unknown_activity: `Can\'t set activity: Unknown activity:\nValid activities: ${parseBotStates(BotStatus.ACTIVITY)}`,
					command_lock: 'Can\'t lock activity.',
					command_unlock: 'Can\'t unlock activity.',
					command_reload: 'Can\'t reload activity.'
				},
				info: {
					command_reload: 'Reloading server status...',
					command_help: '__**HELP**__\n%h'
					command_ping: 'Pong!',
					/* 
					 * %v = program version
					 * %b = bot state
					 * %a = api state
					 * %s = minecraft server state
					 */
					command_status: '__**STATUS**__\n_Version:_ `%v`\n_Bot Status:_ %b\n_API Status:_ %a\n_Server Status:_ %s',
					command_status_loading: 'Loading States...'
				},
				success: {
					command_set: 'Activity set successfully.',
					command_lock: 'Activity locked successfully.',
					command_unlock: 'Activity unlocked successfully.',
					command_reload: 'Reloaded server status successfully.'
				}
			}
		},
		activities: {
			starting: {activity:{name:'the server starting...',type:BotStatus.ACTIVITY.WATCHING},status:BotStatus.STATUS.IDLE},
			stopping: {activity:{name:'the server stopping...',type:BotStatus.ACTIVITY.WATCHING},status:BotStatus.STATUS.IDLE},
			/* 
			 * Fallback running activity
			 */
			running: {activity:{name:'the players gambling',type:BotStatus.ACTIVITY.WATCHING},status:BotStatus.STATUS.ONLINE},
			/* 
			 * Default running activity
			 *  
			 * %c = current online players
			 * %m = max players
			 * %d = motd
			 */
			running_2: {activity:{name:'%c/%m players gambling',type:BotStatus.ACTIVITY.WATCHING},status:BotStatus.STATUS.ONLINE},
			offline: {activity:{name:'the sounds of a dead server',type:BotStatus.ACTIVITY.LISTENING},status:BotStatus.STATUS.DND}
		},
		api_state: [
			':red_circle: `%v`', // offline or unreachable
			':green_circle: `%v`' // online
		],
		bot_state: {
			/* 
			 * The message which will be displayed as response to the command 'status'.
			 * 
			 * %s = status
			 * %l = locked
			 * %a = activity
			 */
			frame: '%s %l `%a`',
			status: {
				online: ':green_circle:',
				idle: ':crescent_moon:',
				offline: ':black_circle:',
				dnd: ':no_entry:'
			},
			locked: [
				':unlock:',
				':lock:'
			]
		},
		server_state: [
			':red_circle:', // offline or unreachable
			':green_circle:' // online
		]
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
		},
		timeout: 3000
	}
};

function parseBotStates(obj) {
	let result = [];
	Object.keys(obj).forEach(k => {
		result.push('`' + k + '`');
	});
	return result.join(', ');
}
