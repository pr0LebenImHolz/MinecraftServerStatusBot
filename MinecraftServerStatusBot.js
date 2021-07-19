'use-strict';
// data
const Constants = require('./Constants.js');
// libs
const BotStatus = require('./Util/BotStatus.js');
const Logger = require('./Util/Logger.js');
const Discord = require('discord.js');
const Https = require('https');
const Fs = require('fs');
const MinecraftPing = require('minecraft-ping');

// init
const logger = new Logger(Constants.logging.level, Constants.logging.basedir);
const client = new Discord.Client();

// dev overwrites
if (Constants.dev === true){
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
		logger.error('Received request to update bot status but bot is offline');
		return false;
	}
	if (statusLocked) {
		logger.info('Received request to update bot status but status is locked');
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
						activity:{
							//name: Constants.bot.activities.running_2.activity.name.replace(/%c/g, response.playersOnline).replace(/%m/g, response.maxPlayers).replace(/%d/g, response.motd),
							name: Constants.bot.activities.running_2.activity.name.replace(/%c/g, response.numPlayers).replace(/%m/g, response.maxPlayers).replace(/%d/g, response.motd),
							type: Constants.bot.activities.running_2.activity.type
						},
						status: Constants.bot.activities.running_2.status
					};
				}
				else {
					logger.info('Received unexpected response from Minecraft Ping, using fallback running activity');
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
function handleCommand(msg) {
	var args = msg.content.split(' ');
	var cmd = args.shift().replace(Constants.bot.commands.prefix, '').toLowerCase();
	switch (cmd) {
		case 'help':
			if (!helpParsed) {
				logger.info('Parsing help text...');
				let helpText = '';
				let q = '`';
				Object.keys(Constants.bot.commands.commands).forEach((k) => {
					helpText += `**${k}**\n> ${Constants.bot.commands.commands[k].syntax.length == 0 ? '' : q + Constants.bot.commands.commands[k].syntax + q + ' '}${Constants.bot.commands.commands[k].description}\n`;
				});
				Constants.bot.commands.responses.info.command_help = Constants.bot.commands.responses.info.command_help.replace(/%h/g, helpText);
				helpParsed = true;
				logger.info('Parsed help text');
			}
			sendResponse(msg, Constants.bot.commands.responses.types.info, Constants.bot.commands.responses.info.command_help);
			break;
		case 'ping':
			sendResponse(msg, Constants.bot.commands.responses.types.info, Constants.bot.commands.responses.info.command_ping);
			break;
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
			break;
		case 'set':
			if (args.length >= 3) {
				args[0] = args[0].toUpperCase();
				args[1] = args[1].toUpperCase();
				if (Object.keys(BotStatus.STATUS).indexOf(args[0]) == -1) {
					sendResponse(msg, Constants.bot.commands.responses.error, Constants.bot.commands.responses.error.command_set_unknown_status);
					break;
				}
				if (Object.keys(BotStatus.ACTIVITY).indexOf(args[1]) == -1) {
					sendResponse(msg, Constants.bot.commands.responses.error, Constants.bot.commands.responses.error.command_set_unknown_activity);
					break;
				}
				let activity = {status:BotStatus.STATUS[args.shift()],activity:{type:BotStatus.ACTIVITY[args.shift()],name:args.join(' ')}};
				client.user.setPresence(activity).then(() => {
					sendResponse(msg, Constants.bot.commands.responses.types.success, Constants.bot.commands.responses.success.command_set);
				});
			}
			else {
				sendResponse(msg, Constants.bot.commands.responses.types.error, Constants.bot.commands.responses.error.illegal_arguments.replace(/%c/g, cmd).replace(/%a/g, Constants.bot.commands.commands[cmd].syntax));
			}
			break;
		case 'lock':
			statusLocked = true;
			sendResponse(msg, Constants.bot.commands.responses.types.success, Constants.bot.commands.responses.success.command_lock);
			break;
		case 'unlock':
			statusLocked = false;
			sendResponse(msg, Constants.bot.commands.responses.types.success, Constants.bot.commands.responses.success.command_unlock);
			break;
		case 'reload':
			pingServer((success, response) => {
				var activity;
				if (success) {
					activity = {
						activity:{
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
			break;
		default:
			sendResponse(msg, Constants.bot.commands.responses.types.error, Constants.bot.commands.responses.error.unknown_command);
			break;
	} 
}
function sendResponse(msg, type, response) {
	msg.channel.send(response);
}

var botAvailable = false;
var helpParsed = false;
var statusLocked = false;

logger.info(`Initialized Script ${Constants.version}`);

// bot callbacks
client.once('ready', () => {
	logger.info(`Logged in as ${client.user.tag}`);
	botAvailable = true;
	updateBot(Constants.server.states.stopped);
});

client.on('message', msg => {
	if (msg.content.startsWith(Constants.bot.commands.prefix)) {
		if (msg.guild != null) {
			for (id of Constants.bot.commands.roles) {
				if (msg.member.roles.cache.has(id)) {
					handleCommand(msg);
					return;
				}
			}
		}
		// When the message was send on a DM or the member is not in the whitelisted roles
		sendResponse(msg, Constants.bot.commands.responses.types.error, Constants.bot.commands.responses.error.insufficient_permission);
	}
});

// init server
var server = Https.createServer({key: Fs.readFileSync(Constants.tls.key), cert: Fs.readFileSync(Constants.tls.cert)}, (req, res) => {
	var method = req.method;
	var url = new URL(`https://${req.headers.host}${req.url}`);
	logger.debug(`INCOMING REQUEST: [${method}] ${url}`);
	if (url.hostname === Constants.api.host && url.port == Constants.api.port) {
		if (url.searchParams.get('token') === Constants.api.token) {
			switch (url.pathname) {
				case Constants.api.basePath:
					var target = url.searchParams.get('target');
					switch (method) {
						case 'GET':
							switch (target) {
								case 'version':
									res.writeHead(200);
									res.end(Constants.api.version);
									break;
								default:
									res.writeHead(405);
									res.end();
									break;
							}
							break;
						case 'POST':
							switch (target) {
								case 'update':
									var status = url.searchParams.get('status');
									if (typeof status === 'string') {
										var response = updateBot(status);
										res.writeHead(response === true ? 204 : 503);
										res.end();
										break;
									}
								default:
									res.writeHead(405);
									res.end();
									break;
							}
							break;
						default:
							res.writeHead(405);
							res.end();
							break;
					}
					break;
				default:
					res.writeHead(404);
					res.end();
					break;
			}
		}
		else {
			res.writeHead(401, {'WWW-Authenticate': 'Bearer realm="Unauthorized", charset="UTF-8"'});
			res.end();
		}
	}
	else {
		res.writeHead(400);
		res.end();
	}
});

//start

server.listen(Constants.api.port);

client.login(Constants.bot.token);
