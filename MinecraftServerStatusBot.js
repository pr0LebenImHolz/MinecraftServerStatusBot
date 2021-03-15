'use-strict';
// data
const Constants = require('./Constants.js');
// imported by Constants // const BotStatus = require('./Util/BotStatus.js');
// libs
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
	MinecraftPing.ping_fe01(Constants.server.ping, (err, response) => {
		if (err) {
			logger.error(`Can't ping server: ${err}`);
			callback(false, err);
		}
		else if (typeof response.playersOnline == 'number' && typeof response.maxPlayers == 'number' && typeof response.motd == 'string') {
			callback(true, response);
		}
		else {
			logger.error(`Can't ping server: Unknown response`);
			callback(false, response);
		}
	});
}
function updateBot(status) {
	if (!botAvailable) {
		logger.error('Received request to update bot status but bot is offline');
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
							name: Constants.bot.activities.running_2.activity.name.replace(/%c/g, response.playersOnline).replace(/%m/g, response.maxPlayers).replace(/%d/g, response.motd),
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

var botAvailable = false;

logger.info(`Initialized Script`);

// bot callbacks
client.once('ready', () => {
	logger.info(`Logged in as ${client.user.tag}`);
	botAvailable = true;
	updateBot(Constants.server.states.stopped);
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