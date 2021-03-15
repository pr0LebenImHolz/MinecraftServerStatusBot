# MinecraftServerStatusBot

This DiscordBot uses the [MinecraftStatusUpdater](https://github.com/pr0LebenImHolz/MinecraftStatusUpdater) Mod to display the status in the activity in real time.

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

- PLAYING: 0
- STREAMING: 1
- LISTENING: 2
- WATCHING: 3
- COMPETING: 4

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