const BotStatus = require('./Util/BotStatus.js');

module.exports = {
	/*
	 * Don't change the version unless you know what you're doing.
	 * - v (full release)
	 * - pre (pre release)
	 * - x.y.z (major.minor.patch)
	 */
	version: 'v1.0.2',
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
		 * 3 WARN
		 * 4 ERROR
		 */
		level: 1, //@TODO
		/*
		 * The directory to cut of all log messages (the parent directory of the main class should be fine)
		 * working dir (parent dir of main class): `${process.cwd()}/`
		 */
		basedir: `${process.cwd()}/`,
		/**
		 * Whether to log information for fail2ban or not
		 */
		fail2ban: true
	},
	tls: {
		/* 
		 * For Let's Encrypt (Certbot), use these paths:
		 * key: /etc/letsencrypt/live/[domain]/privkey.pem
		 * cert: /etc/letsencrypt/live/[domain]/fullchain.pem
		 * 
		 * The disabled flag is only available when Constants.dev === true:
		 * It disables TLS and uses http.createServer instead of https.createServer.
		 */
		key: './dev/privkey.pem', //@TODO
		cert: './dev/fullchain.pem', //@TODO
		disabled: false
	},
	api: {
		/* 
		 * Defines the credentials to access the API.
		 * No protocol (http(s)://) needed for host - using tls anyways!
		 * API Version(s): 2.0.0
		 */
		host: 'example.com', //@TODO
		port: 443, //@TODO
		basePath: '/',
		/* 
		 * https://randomkeygen.com/ -> CodeIgniter Encryption Keys
		 */
		token: 'hippopotomonstrosesquippedaliophobia' //@TODO
	},
	bot: {
		/*
		 * The discord bot token
		 */
		token: 'hippopotomonstrosesquippedaliophobia', //@TODO
		logging: {
			/*
			 * The IDs (Snowflake) of the channels where the bot should log
			 */
			channels: [ //@TODO
			],
			/*
			 * 0 Events triggered by the Bot and API: successfull commands, server starting/ started/ stopping/ stopped
			 * 1 Events triggered by the API: server starting/ started/ stopping/ stopped
			 */
			level: 0, //@TODO
			messages: {
				/*
				 * %u The user who executed the command (using Discord.User.toString() - This will mention the user)
				 * %U The user who executed the command (using `${Discord.User.username}#${Discord.User.discriminator}` - This won't mention the user)
				 * %m The whole message of the user (without prefix)
				 * %c Only the command (first word of the message)
				 */ 
				used_command_successfully: '`%U` has executed command `%m` successfully',
				/*
				 * %o The old (cached) server state
				 * %n The new server state
				 */
				server_updated: 'Server state has changed from `%o` to `%n`'
			},
			/*
			 * Defines planned API requests from the server.
			 * All API requests within this time won't be logged to avoid spam.
			 * 
			 * Syntax:  yyyy-mm-ddThh:mm:ssTtolerance
			 * Default: xxxx-xx-xxT03:00:00T300 // every day from (including) 02:57:31 to (including) 03:02:29
			 * 
			 * - yyyy:      Year (e.g. 2021; /^([0-9]{4}|x|xxxx)$/i)
			 * - -:         Separator
			 * - mm:        Month (e.g. 01, 12; /^((0[0-9])|(1[0-2])|x|xxxx)$/i)
			 * - -:         Separator
			 * - dd:        Day (e.g. 01, 31; /^(([0-2][0-9])|(3[0-1])|x|xxxx)$/i)
			 * - T:         Separator
			 * - hh:        Hour (e.g. 00, 23; /^(([0-1][0-9])|(2[0-3])|x|xxxx)$/i)
			 * - ::         Separator
			 * - mm:        Minute (e.g. 00, 59; /^(([0-5][0-9])|x|xxxx)$/i)
			 * - ::         Separator
			 * - ss:        Second (e.g. 00, 59; /^(([0-5][0-9])|x|xxxx)$/i)
			 * - T:         Separator
			 * - tolerance: Offset in seconds; The bot won't log anything to the defined channels in this timespan
			 */
			planned_api_requests: [
				'XXXX-XX-XXT03:00:00T300'
			]
		},
		commands: {
			prefix: '!', //@TODO
			help_command: 'help',
			/*
			 * The IDs of all roles which can interact with the bot
			 */
			roles: [ //@TODO
			],
			/*
			 * Aliases are basically key value pairs where the key is the alias and the value is an array which will be processed in the configured order.
			 * 
			 * Note that the aliases must not be named the same as a command.
			 * 
			 * e.g.:
			 * 'backup': {
			 *   commands: ['lock', 'set dnd watching watches the backup...'],
			 *   description: 'Sets and locks the activity. Reason: backups'
			 * },
			 * 'mainetance': {
			 *   commands: ['lock', 'set dnd watching maintenance work...']
			 *   description: 'Sets and locks the activity. Reason: mainetance work'
			 * },
			 * 'clearstate': {
			 *   commands: ['unlock', 'reload']
			 *   description: 'Unlocks and Reloads the activity'
			 * }
			 */
			aliases: {
			},
			commands: {
				'help': {
					syntax: '',
					description: 'Shows this help'
				},
				'ping': {
					syntax: '',
					description: 'Testcommand to check if the bot is still running'
				},
				'status': {
					syntax: '',
					description: 'Shows the current status of the bot and some other useful information'
				},
				'set': {
					syntax: '[status] [activity type] [activity...]',
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
					description: 'Force reload (i.e. pings the server). The lockdown of the activity will *not* be affected at this!'
				}
			},
			responses: {
				types: {
					error: 0,
					info: 1,
					success: 2
				},
				error: {
					alias_aborted: 'Execution of aliases aborted due to incorrect configuration.',
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
					/*
					 * %c list of all commands
					 * %a list of all aliases
					 */
					command_help: '__**HELP**__\n__**Commands:**__\n%c\n__**Aliases:**__\n%a',
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
				dnd: ':no_entry:',
				unknown: ':question:'
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
