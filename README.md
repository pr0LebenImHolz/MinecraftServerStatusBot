# MinecraftServerStatusBot

This DiscordBot uses the [MinecraftServerStatusUpdater](https://github.com/pr0LebenImHolz/MinecraftServerStatusUpdater) Mod to display the status in the activity in real time.

| Index  | Table of Contents                                              |
|--------|----------------------------------------------------------------|
| 1)     | [Bot Commands](#bot-commands)                                  |
| 1.1)   | [Bot States](#bot-states)                                      |
| 1.2)   | [Bot Activities](#bot-activities)                              |
| 2)     | [API](#api)                                                    |
| 2.1)   | [Global](#global)                                              |
| 2.1.1) | [Endpoint: Versions](#endpoint-versions)                       |
| 2.2)   | [V1.0.0](#v100)                                                |
| 2.2.1) | [Endpoint: Version](#endpoint-version)                         |
| 2.2.2) | [Endpoint: Update](#endpoint-update)                           |
| 2.2.3) | [Server States](#server-states)                                |
| 2.3)   | [V2.0.0](#v200)                                                |
| 2.3.1) | [Default Request](#default-request)                            |
| 2.3.2) | [Default Response](#default-response)                          |
| 2.3.3) | [Endpoint: Notify Starting](#endpoint-notify-starting)         |
| 2.3.4) | [Endpoint: Notify Started](#endpoint-notify-started)           |
| 2.3.5) | [Endpoint: Notify Stopping](#endpoint-notify-stopping)         |
| 2.3.6) | [Endpoint: Notify Stopped](#endpoint-notify-stopped)           |
| 2.3.7) | [Endpoint: Notify Player Count](#endpoint-notify-player-count) |
| 3)     | [Installation](#installation)                                  |
| 3.1)   | [Bot Permissions](#bot-permissions)                            |
| 3.2)   | [Installing Script](#installing-script)                        |


## Bot Commands
[[&uarr;]](#minecraftserverstatusbot)

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
[[&uarr;]](#minecraftserverstatusbot)

Requests must be made using HTTP/1.1 and TLS. Also, the host and path specified in Constants.js must match the one in the HTTP header.

The Bot provides following endpoints:

### Global

#### Endpoint: Versions
[[&uarr;]](#minecraftserverstatusbot)

Returns all supported versions. Since API v2.0.0.

##### Request

```HTTP
GET /versions HTTP/1.1
Connection: close
Host: example.com:8443
```


##### Response

The Bot returns an HTTP 200 response with all supported versions separated with linebreaks (`\n`) without trailing linebreak in the response body.
When the request is invalid, it returns an HTTP 400 response with en empty body.

Example response:
```HTTP
HTTP/1.1 200 OK
Date: Sat, 14 May 2022 18:31:58 GMT
Connection: close
Transfer-Encoding: chunked

1.0.0
2.0.0
```


### V1.0.0

#### Endpoint: Version
[[&uarr;]](#minecraftserverstatusbot)

```HTTP
GET /?token=X&target=version HTTP/1.1
Host: example.com:8443
```
- X: API Token

The Bot returns an HTTP 200 response with the API version in the response body without linebreaks:

`1.0.0`


#### Endpoint: Update
[[&uarr;]](#minecraftserverstatusbot)

```HTTP
POST /?token=X&target=update&status=Y HTTP/1.1
Host: example.com:8443
```
- X: API Token
- Y: [Server State](#server-states)

The Bot returns an HTTP 204 response with an empty response body.


#### Server States

- STARTING
- RUNNING
- STOPPING
- OFFLINE


### V2.0.0

#### Default Request
[[&uarr;]](#minecraftserverstatusbot)

```HTTP
M P HTTP/1.1
Authorization: Bearer X
Connection: close
Host: example.com:8443
```
- `M` HTTP Request Method
- `P` HTTP Request Path (and Query, Hash)
- `X` API Token

The path (`P`) has to start with the configured `basePath` followed by the API version (= `2.0.0`) and `endpointPath`:

`/{basePath}/2.0.0/{endpointPath}`

#### Default Response
[[&uarr;]](#minecraftserverstatusbot)

```HTTP
HTTP/1.1 C M
Date: T
Connection: close
Transfer-Encoding: chunked
```
- `C`: The HTTP response code
- `M`: The HTTP response message for the code
- `T`: The timestamp when the response was sent (added by node/http(s)).

These HTTP response codes (`C`) can be returned by all endpoints of this API version.

| Code | Body | Description                              |
|------|------|------------------------------------------|
| 204  | N/A  | Success or failure due to locked bot     |
| 400  | -    | Invalid request                          |
| 401  | -    | No or invalid token                      |
| 404  | -    | Invalid endpoint (due to invalid path)   |
| 405  | -    | Invalid endpoint (due to invalid method) |
| 500  | -    | Fatal unexpected error                   |
| 503  | -    | Error while processing request           |

#### Endpoint: Notify Starting
[[&uarr;]](#minecraftserverstatusbot)

Updates the bot's status to `Server Starting`.

##### Request

[Default](#default-request) with endpointPath `/notify/starting`


##### Response

[Default](#default-response)


#### Endpoint: Notify Started
[[&uarr;]](#minecraftserverstatusbot)

Updates the bot's status to `Server Started`.

##### Request

[Default](#default-request) with endpointPath `/notify/started?motd={motd: string}&slots={slots: int}`

- `motd`: The Server MOTD configured in `server.properties`
- `slots`: The available player slots configured in `server.properties`


##### Response

| Code | Body                                                       | Description                                 |
|------|------------------------------------------------------------|---------------------------------------------|
| N/A  | N/A                                                        | [Default Response Codes](#default-response) |
| 405  | `"missing query argument(s) {motd: string}, {slots: int}"` | When `count` is missing                     |


#### Endpoint: Notify Stopping
[[&uarr;]](#minecraftserverstatusbot)

Updates the bot's status to `Server Stopping`.

##### Request

[Default](#default-request) with endpointPath `/notify/stopping`


##### Response

[Default](#default-response)


#### Endpoint: Notify Stopped
[[&uarr;]](#minecraftserverstatusbot)

Updates the bot's status to `Server Stopped`.

##### Request

```HTTP
POST /2.0.0/notify/stopped HTTP/1.1
Authorization: Bearer X
Connection: close
Host: example.com:8443
```
- `X`: API Token


##### Response

[Default](#default-response)


#### Endpoint: Notify Player Count
[[&uarr;]](#minecraftserverstatusbot)

##### Request

[Default](#default-request) with endpointPath `/notify/started?count={count: int}`

- `count`: The number of players currently online


##### Response

| Code | Body                               | Description                                 |
|------|------------------------------------|---------------------------------------------|
| N/A  | N/A                                | [Default Response Codes](#default-response) |
| 405  | `"missing query argument(s) {count: int}"` | When `count` is missing             |


## Installation

### Bot Permissions
[[&uarr;]](#minecraftserverstatusbot)

The bot only needs the `Send Messages` permission: `https://discord.com/oauth2/authorize?client_id=<APPLICATION ID>&scope=bot&permissions=2048`


### Installing Script
[[&uarr;]](#minecraftserverstatusbot)

The Script is tested under Ubuntu 18.04 LTS and Raspbian 10 Buster with NodeJS v14.16.0.

Download the latest release, unzip it and execute it with `node MinecraftServerStatusBot.js`. 

#### Using init.d
[top](#minecraftserverstatusbot)

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
