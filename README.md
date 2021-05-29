# MinecraftServerStatusBot

This DiscordBot uses the [MinecraftStatusUpdater](https://github.com/pr0LebenImHolz/MinecraftStatusUpdater) Mod to display the status in the activity in real time.
| Contents |
| --- |
| 1) [Bot Commands](#bot-commands) |
| 1.1) [Bot States](#bot-states) |
| 1.2) [Bot Activities](#user-content-bot-activities) |
| 2) [API](#user-content-api) |
| 2.1) [Endpoint: Version](#user-content-endpoint--version) |
| 2.2) [Endpoint: Update](#user-content-endpoint--update) |
| 3) [Installation](#user-content-installation) |
| 3.1) [Bot Permissions](#user-content-bot-permissions) |
| 3.2) [Installing Script](#user-content-installing-scripts) |

## Bot Commands

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

The Bot provides following endpoints:

### Version

[GET] `https://example.com:443/foo/bar?token=B&target=version`

The Bot returns an HTTP 200 response with the API version in the response body without linebreaks:

`1.0.0`

### Update

[POST] `https://example.com:443/foo/bar?token=B&target=update&status=STARTING`

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
