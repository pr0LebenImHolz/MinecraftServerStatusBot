# MinecraftServerStatusBot

This DiscordBot uses the [MinecraftStatusUpdater](https://github.com/pr0LebenImHolz/MinecraftStatusUpdater) Mod to display the status in the activity in real time.
| Contents |
| --- |
| 1) [Bot Commands](#bot-commands) |
| 1.1) [Bot States](#bot-states) |
| 1.2) [Bot Activities](#bot-activities) |
| 2) [API](#api) |
| 2.1) [Endpoint: Version](#version) |
| 2.2) [Endpoint: Update](#update) |
| 3) [Installation](#installation) |
| 3.1) [Bot Permissions](#bot-permissions) |
| 3.2) [Installing Script](#installing-script) |

## Bot Commands

- help: Shows this help
- ping: Testcommand to check if the bot is still running
- status: Shows the current status of the bot and some other useful information
- set `[status] [activity type] [activity]`: Sets the status of the bot until the server overwrites it
- lock: Locks the current activity so the server can\'t overwrite it (`set` will still work)
- unlock: Unlocks the current activity so the server can overwrite it again
- reload: Force reload (i.e. pings the server)

### Bot States

- ONLINE: `online`
- IDLE: `idle`
- INVISIBLE: `offline` (Does not work. I guess, bots can't display them as offline)
- DND: `dnd` (Do Not Disturb)

### Bot Activities

- PLAYING: `0`
- STREAMING: `1`
- LISTENING: `2`
- WATCHING: `3`
- COMPETING: `4`

## API

Requests must be made using HTTP/1.1 and TLS. Also, the host and path specified in Constants.js must match the one in the HTTP header.

The Bot provides following endpoints:

### Version

```HTTP
GET /?token=X&target=version HTTP/1.1
Host: example.com:8443
```
- X: API Token

The Bot returns an HTTP 200 response with the API version in the response body without linebreaks:

`1.0.0`

### Update

```HTTP
POST /?token=X&target=update&status=Y HTTP/1.1
Host: example.com:8443
```
- X: API Token
- Y: [Server State](#server-states)

The Bot returns an HTTP 204 response with an empty response body.

### Server States

- STARTING
- RUNNING
- STOPPING
- OFFLINE

## Installation

### Bot Permissions

The bot only needs the `Send Messages` permission: `https://discord.com/oauth2/authorize?client_id=<APPLICATION ID>&scope=bot&permissions=2048`

### Installing Script

The Script is tested under Ubuntu 18.04 LTS and Raspbian 10 Buster with NodeJS v14.16.0.

Download the latest release, unzip it and execute it with `node MinecraftServerStatusBot.js`. 

#### Using init.d

To start and stop the bot with `systemctl [start|stop|restart] lih-serverstatusbot`, create a new text file in `/etc/init.d/` and paste the following code.

```bash
#! /bin/sh
# /etc/init.d/lih-serverstatusbot

case "$1" in
        start)
                /opt/lih-serverstatusbot/start.sh
                ;;
        stop)
                /opt/lih-serverstatusbot/stop.sh
                ;;
        restart)
                /opt/lih-serverstatusbot/stop.sh
                /opt/lih-serverstatusbot/start.sh
                ;;
esac
exit 0
```
_/etc/init.d/lih-serverstatusbot_

To start the bot when the system starts, paste this line in `/etc/rc.local`:

```bash
systemctl start lih-serverstatusbot
```
