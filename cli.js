const notifer = require('node-notifier')
const open = require('open')
const request = require('request-promise')
const LRU = require('lru-cache')
const argv = require('yargs')
    .describe('t', 'polling interval')
    .default('t', 10*1000)
    .alias('t', 'interval')
    .describe('i', 'twitch app id')
    .default('i', process.env.TWITCH_ID)
    .alias('i', 'id')
    .argv
const req = (endpoint) => {
    return request(`https://api.twitch.tv/kraken/${endpoint}`, {
        json: true,
        headers: {
            'Client-ID': argv.id,
            'Accept': 'application/vnd.twitchtv.v5+json'
        }
    })
}
const anyIndex = (val, arr) => {
    let b = false
    arr.forEach((e) => {
        if (val.indexOf(e) > -1) {
            b = true
        }
    })

    return b
}
const streamerMap = {}
argv._.forEach((arg) => {
    const streamerParts = arg.split(':')
    streamerMap[streamerParts[0]] = streamerParts[1].indexOf(',') > -1 ? streamerParts[1].split(',') : [streamerParts[1]]
})
const notifHistoryMap = LRU()
setInterval(() => {
    for (let streamerName in streamerMap) {
        let streamerGames = streamerMap[streamerName]

        req(`search/channels/?query=${streamerName}`)
            .then((data) => {
                return data.channels[0]._id
            })
            .then((id) => {
                return req(`streams/?channel=${id}&stream_type=live`)
            })
            .then((data) => {
                return data.streams.filter(s => anyIndex(s.game.toLowerCase(), streamerGames.map(v => v.toLowerCase())))
            })
            .then((filteredStreams) => {
                return filteredStreams.filter(s => !notifHistoryMap.has(streamerName + s.game))
            })
            .then((filteredStreams) => {
                filteredStreams.forEach((s) => {
                    console.log(`${streamerName} has been streaming ${s.game} since ${s.created_at}`)
                    
                    notifHistoryMap.set(streamerName + s.game, s.created_at)

                    let notif = notifer.notify({
                        title: 'TwitchGame',
                        message: `${streamerName} has been streaming ${s.game} since ${s.created_at}`,
                        wait: true
                    })
                    notif.on('click', () => {
                        open(s.channel.url)
                    })
                })
            })
    }
}, argv.interval)