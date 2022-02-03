'use-strict';
// data
const Constants = require('./Constants.js');
// libs
const BotStatus = require('./Util/BotStatus.js');
const Logger = require('./Util/Logger.js');
const DiscordLogger = require('./Util/DiscordLogger.js');
const Discord = require('discord.js');
const Https = require('https');
const Fs = require('fs');
const MinecraftPing = require('minecraft-ping');

// init
const logger = new Logger(Constants.logging.level, Constants.logging.basedir, (str) => {
	// there is no replaceAll method in this node version -.-
	return str
		.replace(new RegExp(Constants.api.host, 'g'), '$HOST$')
		.replace(new RegExp(Constants.api.port, 'g'), '$PORT$')
		.replace(new RegExp(Constants.api.token, 'g'), '$TOKEN$');
});
const discordLogger = new DiscordLogger(Constants.bot.logging.level, Constants.bot.logging.planned_api_requests, []);
const client = new Discord.Client();

// dev overwrites
if (Constants.dev === true) {
	Constants.tls.key = './dev/privkey.pem';
	Constants.tls.cert = './dev/fullchain.pem';
}

// methods
function pingServer(callback) {
	var timedOut = false;
	var responded = false;
	setTimeout(() => {
		if (responded === false) {
			timedOut = true;
			callback(false, 'timeout');
		}
	}, Constants.server.timeout);
	MinecraftPing.ping_fefd_udp(Constants.server.ping, (err, response) => {
		if (err) {
			logger.error(`Can't ping server: ${err}`);
			if (timedOut === false) {
				callback(false, err);
				responded = true;
			}
		}
		//else if (typeof response.playersOnline == 'number' && typeof response.maxPlayers == 'number' && typeof response.motd == 'string') {
		else if (typeof response.numPlayers == 'number' && typeof response.maxPlayers == 'number' && typeof response.motd == 'string') {
			if (timedOut === false) {
				callback(true, response);
				responded = true;
			}
		}
		else {
			logger.error(`Can't ping server: Unknown response`);
			if (timedOut === false) {
				callback(false, response);
				responded = true;
			}
		}
	});
}
function updateBot(status) {
	if (!botAvailable) {
		logger.error('Received request to update bot status but bot is offline.');
		return false;
	}
	if (statusLocked) {
		logger.info('Received request to update bot status but status is locked.');
		return false;
	}
	switch (status) {
		case Constants.server.states.starting:
			client.user.setPresence(Constants.bot.activities.starting);
			break;
		case Constants.server.states.stopping:
			client.user.setPresence(Constants.bot.activities.stopping);
			break;
		case Constants.server.states.running:
			pingServer((success, response) => {
				var activity;
				if (success) {
					activity = {
						activity: {
							//name: Constants.bot.activities.running_2.activity.name.replace(/%c/g, response.playersOnline).replace(/%m/g, response.maxPlayers).replace(/%d/g, response.motd),
							name: Constants.bot.activities.running_2.activity.name.replace(/%c/g, response.numPlayers).replace(/%m/g, response.maxPlayers).replace(/%d/g, response.motd),
							type: Constants.bot.activities.running_2.activity.type
						},
						status: Constants.bot.activities.running_2.status
					};
				}
				else {
					logger.info('Received unexpected response from Minecraft Ping, using fallback running activity.');
					activity = Constants.bot.activities.running;
				}
				client.user.setPresence(activity);
			});
			break;
		case Constants.server.states.stopped:
			var activity = Constants.bot.activities.offline;
			client.user.setPresence(activity);
			break;
		default:
			logger.error(`Unknown state: ${status}`);
			break;
	}
	return true;
}
/*
 * unused method; maybe useful for coming features...
function httpsGetRequest(url, timeout, callback) {
	var timedOut = false;
	var responded = false;
	setTimeout(() => {
		if (responded === false) {
			timedOut = true;
			callback(false, 'timeout');
		}
	}, timeout);
	Https.get(url, (res) => {
		var data = '';
		res.on('data', (d) => { data += d; });
		res.on('end', () => {
			if (timedOut === false) {
				callback(true, data);
				responded = true;
			}
		});
	});
}
 */
function handleCommand(msg, cmd, args) {
	switch (cmd) {
		case 'help':
			if (!helpParsed) {
				logger.info('Parsing help text...');
				let commands = '';
				let aliases = '';
				let q = '`';
				Object.keys(Constants.bot.commands.commands).forEach((k) => {
					commands += `**${k}**\n> ${Constants.bot.commands.commands[k].syntax.length == 0 ? '' : q + Constants.bot.commands.commands[k].syntax + q + ' '}${Constants.bot.commands.commands[k].description}\n`;
				});
				Object.keys(Constants.bot.commands.aliases).forEach((k) => {
					aliases += `**${k}**\n> ${Constants.bot.commands.aliases[k].description}\n`
				});
				Constants.bot.commands.responses.info.command_help = Constants.bot.commands.responses.info.command_help.replace(/%c/g, commands).replace(/%a/g, aliases);
				helpParsed = true;
				logger.info('Parsed help text');
			}
			sendResponse(msg, Constants.bot.commands.responses.types.info, Constants.bot.commands.responses.info.command_help);
			return true;
		case 'ping':
			sendResponse(msg, Constants.bot.commands.responses.types.info, Constants.bot.commands.responses.info.command_ping);
			return true;
		case 'status':
			sendResponse(msg, Constants.bot.commands.responses.types.info, Constants.bot.commands.responses.info.command_status_loading);
			var status = Constants.bot.commands.responses.info.command_status
					.replace(/%v/g, Constants.version)
					.replace(/%b/g, Constants.bot.bot_state.frame
							.replace(/%s/g, Constants.bot.bot_state.status[(botAvailable ? client.user.presence.status : 'unknown')])
							.replace(/%l/g, Constants.bot.bot_state.locked[Number(statusLocked)])
							// no clue why, but ...activities[0]... returns the displayed activity
							.replace(/%a/g, client.user.presence.activities[0].toString()))
					.replace(/%a/g, Constants.bot.api_state[Number(server.listening)].replace(/%v/g, Constants.api.version));
			pingServer((success, data) => {
				status = status.replace(/%s/g, Constants.bot.server_state[Number(success)]);
				sendResponse(msg, Constants.bot.commands.responses.types.info, status);
			});
			return true;
		case 'set':
			if (args.length >= 3) {
				args[0] = args[0].toUpperCase();
				args[1] = args[1].toUpperCase();
				if (Object.keys(BotStatus.STATUS).indexOf(args[0]) == -1) {
					sendResponse(msg, Constants.bot.commands.responses.error, Constants.bot.commands.responses.error.command_set_unknown_status);
					return false;
				}
				if (Object.keys(BotStatus.ACTIVITY).indexOf(args[1]) == -1) {
					sendResponse(msg, Constants.bot.commands.responses.error, Constants.bot.commands.responses.error.command_set_unknown_activity);
					return false;
				}
				let activity = {status:BotStatus.STATUS[args.shift()],activity:{type:BotStatus.ACTIVITY[args.shift()],name:args.join(' ')}};
				client.user.setPresence(activity).then(() => {
					sendResponse(msg, Constants.bot.commands.responses.types.success, Constants.bot.commands.responses.success.command_set);
				});
			}
			else {
				sendResponse(msg, Constants.bot.commands.responses.types.error, Constants.bot.commands.responses.error.illegal_arguments.replace(/%c/g, cmd).replace(/%a/g, Constants.bot.commands.commands[cmd].syntax));
			}
			return true;
		case 'lock':
			statusLocked = true;
			sendResponse(msg, Constants.bot.commands.responses.types.success, Constants.bot.commands.responses.success.command_lock);
			return true;
		case 'unlock':
			statusLocked = false;
			sendResponse(msg, Constants.bot.commands.responses.types.success, Constants.bot.commands.responses.success.command_unlock);
			return true;
		case 'reload':
			pingServer((success, response) => {
				var activity;
				if (success) {
					activity = {
						activity: {
							//name: Constants.bot.activities.running_2.activity.name.replace(/%c/g, response.playersOnline).replace(/%m/g, response.maxPlayers).replace(/%d/g, response.motd),
							name: Constants.bot.activities.running_2.activity.name.replace(/%c/g, response.numPlayers).replace(/%m/g, response.maxPlayers).replace(/%d/g, response.motd),
							type: Constants.bot.activities.running_2.activity.type
						},
						status: Constants.bot.activities.running_2.status
					};
					sendResponse(msg, Constants.bot.commands.responses.types.success, Constants.bot.commands.responses.success.command_reload);
				}
				else {
					logger.info('Received unexpected response from Minecraft Ping, using fallback running activity');
					activity = Constants.bot.activities.offline;
					sendResponse(msg, Constants.bot.commands.responses.types.error, Constants.bot.commands.responses.error.command_reload);
				}
				client.user.setPresence(activity);
			});
			return true;
		default:
			sendResponse(msg, Constants.bot.commands.responses.types.error, Constants.bot.commands.responses.error.unknown_command);
			return false;
	}
}
function sendResponse(msg, type, response) {
	msg.channel.send(response);
}
function logNewServerStateToDiscord(status) {
	if (botAvailable && Object.values(Constants.server.states).indexOf(status) != -1 && oldServerState != status) {
		discordLogger.log(DiscordLogger.LogLevels.API, Constants.bot.logging.messages.server_updated.replace(/%o/g,oldServerState).replace(/%n/g, status));
		oldServerState = status;
	}
}

var oldServerState = null;
var botAvailable = false;
var helpParsed = false;
var statusLocked = false;

logger.info(`Initialized Script ${Constants.version}`);

// bot callbacks
client.once('ready', () => {
	var channels = [];
	Constants.bot.logging.channels.forEach((id) => { channels.push(client.channels.cache.get(id)); });
	discordLogger.setChannels(channels);
	discordLogger.log(DiscordLogger.LogLevels.EVERYTHING, 'Bot Ready');
	logger.info(`Logged in as ${client.user.tag}`);
	botAvailable = true;
	// ToDo 2021-08-25: check for duplicate (Main.updateBot / Main.handleCommand-reload), outsource as much as possible, call Main.handleCommand(null, 'reload', null);
	updateBot(Constants.server.states.stopped);
});

client.on('message', msg => {
	try {
		if (msg.content.startsWith(Constants.bot.commands.prefix)) {
			if (msg.guild != null) {
				for (id of Constants.bot.commands.roles) {
					if (msg.member.roles.cache.has(id)) {
						var success;
						var cmd = msg.content.replace(Constants.bot.commands.prefix, '').toLowerCase();
						if (Object.keys(Constants.bot.commands.aliases).indexOf(cmd) != -1) {
							success = true;
							for (var i = 0; i < Constants.bot.commands.aliases[cmd].commands.length; i++) {
								var aliasArgs = Constants.bot.commands.aliases[cmd].commands[i].split(' ');
								var aliasCmd = aliasArgs.shift();
								success = handleCommand(msg, aliasCmd, aliasArgs);
								if (!success) {
									sendResponse(msg, Constants.bot.commands.responses.types.error, Constants.bot.commands.responses.error.alias_aborted);
									logger.error(`Aborted alias execution of '${cmd}' at position ${i} (${aliasCmd}). Please check your configuration`);
									break;
								}
							}
						}
						else {
							var fullCommand = args = msg.content.split(' ');
							fullCommand[0] = fullCommand[0].replace(Constants.bot.commands.prefix, '');
							fullCommand = fullCommand.join(' ');
							cmd = args.shift().replace(Constants.bot.commands.prefix, '').toLowerCase();
							success = handleCommand(msg, cmd, args);
						}
						if (success) discordLogger.log(DiscordLogger.LogLevels.EVERYTHING, Constants.bot.logging.messages.used_command_successfully.replace(/%u/g, msg.author.toString()).replace(/%U/g, `${msg.author.username}#${msg.author.discriminator}`).replace(/%m/g, fullCommand).replace(/%c/g, cmd));
						return;
					}
				}
			}
			// When the message was send on a DM or the member is not in the whitelisted roles
			sendResponse(msg, Constants.bot.commands.responses.types.error, Constants.bot.commands.responses.error.insufficient_permission);
		}
	}
	catch(e) {
		logger.error('An unexpected error occured during message event:');
		console.error(e);
		logger.info('Ignoring message.');
	}
});

// init server
var server = Https.createServer({key: Fs.readFileSync(Constants.tls.key), cert: Fs.readFileSync(Constants.tls.cert)}, (req, res) => {
	// req.connection is deprecated since nodejs v16.0.0 - the bot uses v14.17.2
	const ip = req.ip || req.connection.remoteAddress
	logger.debug(`Incoming Request:\n  Remote:   '${ip}'\n  Protocol:   HTTP/'${req.httpVersion}'\n  Method:     '${String(req.method).toUpperCase()}'\n  Host:       '${req.headers.host}'\n  URL:        '${req.url}'\n  User-Agent: '${req.headers['user-agent']}'`);
	function respond(code, head = null, body = null) {
		if (Constants.logging.fail2ban === true) switch(code) {
			case 400:
			case 401:
			case 403:
			case 404:
			case 405:
				logger.log(`fail2ban invalid request from ${ip} responded with ${code}`);
				break;
		}
		if (head) {
			res.writeHead(code, head);
		}
		else {
			res.writeHead(code);
		}
		if (body) {
			res.end(body);
		}
		else {
			res.end();
		}
	}
	try {
		if (req.httpVersion === '1.1' && typeof req.headers.host === 'string' && req.headers.host.length != 0) {
			var url = new URL(`https://${req.headers.host}${req.url}`);
			if (url.hostname === Constants.api.host && url.port == Constants.api.port) {
				if (url.searchParams.get('token') === Constants.api.token) {
					switch (url.pathname) {
						case Constants.api.basePath:
							var target = url.searchParams.get('target');
							switch (req.method) {
								case 'GET':
									switch (target) {
										case 'version':
											respond(200, null, Constants.api.version);
											break;
										default:
											respond(405);
											break;
									}
									break;
								case 'POST':
									switch (target) {
										case 'update':
											var status = url.searchParams.get('status');
											if (typeof status === 'string') {
												logNewServerStateToDiscord(status);
												var response = updateBot(status);
												respond(response === true ? 204 : 503);
												break;
											}
										default:
											respond(405);
											break;
									}
									break;
								default:
									respond(405);
									break;
							}
							break;
						default:
							respond(404);
							break;
					}
				}
				else {
					respond(401, {'WWW-Authenticate': 'Bearer realm="Unauthorized", charset="UTF-8"'});
				}
			}
			else {
				respond(400);
			}
		}
		else {
			respond(400);
		}
	}
	catch(e) {
		logger.error('An unexpected error occured during API request:');
		console.error(e);
		logger.info('Ignoring API request.');
	}
});

//start

server.listen(Constants.api.port);

client.login(Constants.bot.token);
