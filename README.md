# twitchgame

> as in "(t)which game are you playing"?

A polling script that tells you when your favorite streamers are live, playing your favorite game.

## How

First, get a client id, as detailed [here](https://dev.twitch.tv/docs/v5/guides/using-the-twitch-api)

> Note, leave spaces between each streamer name (ie `timthetatman:overwatch eevee:overwatch`)

```
node cli.js --id <yourClientId> [streamer1:game1,game2,gameN ...]
```