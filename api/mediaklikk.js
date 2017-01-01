const sources = {
    m1: {
        src: 'http://player.mediaklikk.hu/player/player-inside-full3.php?userid=mtva&streamid=mtv1live&noflash=yes&hls=1',
        icon: 'http://www.mediaklikk.hu/wp-content/uploads/sites/4/2013/11/M1.png'
    },
    m2: {
        src: 'http://player.mediaklikk.hu/player/player-inside-full3.php?userid=mtva&streamid=mtv2live&noflash=yes&hls=1',
        icon: 'http://www.mediaklikk.hu/wp-content/uploads/sites/4/2013/11/M2.png'
    },
    m4: {
        src: 'http://player.mediaklikk.hu/player/player-inside-full3.php?userid=mtva&streamid=mtv4live&noflash=yes&hls=1',
        icon: 'http://mediaklikk.cms.mtv.hu/wp-content/uploads/sites/4/2015/06/M4_logo.png'
    },
    m5: {
        src: 'http://player.mediaklikk.hu/player/player-inside-full3.php?userid=mtva&streamid=mtv5live&noflash=yes&hls=1',
        icon: 'http://mediaklikk.cms.mtv.hu/wp-content/uploads/sites/4/2016/08/M5_COLOR_CMYK_B1-01-e1470396664209.jpg'
    },
    Duna: {
        src: 'http://player.mediaklikk.hu/player/player-inside-full3.php?userid=mtva&streamid=dunalive&noflash=yes&hls=1',
        icon: 'http://www.mediaklikk.hu/wp-content/uploads/sites/4/2013/11/Duna.png'
    }
}
const horseman = require('node-horseman');
const extract = src =>
    new horseman({
        loadImages: false,
        ignoreSSLErrors: true
    })
        .viewport(320, 568)
        .userAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
        .open(src)
        .waitForSelector('#videoId')
        .evaluate(function () {
            return jQuery('#videoId').children("source").attr('src')
        })
        .log()
        .close();

module.exports = db => {
    const api = require('express').Router();

    Object
        .keys(sources)
        .map(ch => Object.assign({}, sources[ch], { name: ch, tags: ['live'] }))
        .forEach(item => {
            if (db.find({ name: item.name }).length === 0)
                db.insert(item);
            extract(item.src)
                .then(url => db.update({ name: item.name }, { url }))
                .catch(x => console.log(x));
        })

    api.route('/:channel')
        .all((req, res, next) => {
            const {channel} = req.params;
            const [item] = db.find({ name: channel });
            const {src} = sources[channel];
            req.mediabag = { channel, item, src };
            next();
        })
        .get((req, res) => {
            const {item} = req.mediabag;
            res.status(item ? 200 : 404).send(item);
        })
        .mkactivity((req, res) =>
            extract(req.mediabag.src)
                .then(url => db.update({ name: req.mediabag.channel }, { url }))
                .then(_ => res.sendStatus(202))
                .catch(_ => res.sendStatus(404))
        );

    return api;
}