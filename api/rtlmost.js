const sources = {
    'ejjel-nappal': day => `http://rtl.hu/most/budapest/ejjel-nappal-budapest-${day}`,
    'showder-klub': day => `http://rtl.hu/most/rtl2/showderklub/showder-klub-${day}`
}

module.exports = db => {
    const moment = require('moment');
    const horseman = require('node-horseman');
    const api = require('express').Router();


    api.route('/:serie/:day*?')
        .all((req, res, next) => {
            const {serie, day = moment().format('YYYY-MM-DD') } = req.params;
            const src = sources[serie](day);
            const [item] = db.find({ src });
            req.mediabag = { src, item, serie };
            next();
        })
        .get((req, res) => {
            const {item} = req.mediabag;
            res.status(item ? 200 : 404).send(item);
        })
        .mkactivity((req, res) => {
            const {item, src, serie} = req.mediabag;
            if (item) {
                res.sendStatus(302);
                return;
            }
            const browser =
                new horseman({
                    loadImages: false,
                    ignoreSSLErrors: true,
                    timeout: 3 * 60000, 
                    diskCache: true,
                    diskCachePath: '/tmp/mediabag'
                });

            browser.on('resourceRequested', (req, network) => {
//                console.log(req);
            })

            browser.on('resourceReceived', (res) => {
//                console.log(res);
            })

            browser
                .viewport(1600, 900)
                .userAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36')
                .open(src)
                .waitForSelector("div#video-container")
                .evaluate(function () {
                    $("div#video-container div.must-login-btns div label:contains('Belépés')").click();
                    $("input#loginform-email").val('17kifli@gmail.com');
                    $("input#loginform-password").val('*****');
                    $("#login-form button.login-button").click();
                })
                .wait(30000)// https://github.com/johntitus/node-horseman/issues/188
                .waitForSelector('video')
		.wait(30000)
                .evaluate(function () {
                    return {
                        "name": $("title").text(),
                        "url": $("video source").attr('src'),
                        "icon": $("video").attr('poster'),
                        "src": $(location).attr('href')
                    };
                })
                .log()
                .close()
                .then(x => {
                    db.insert(Object.assign({}, x, { tags: [serie], extracted: new Date() }));
                    res.sendStatus(201);
                })
                .catch(x => res.sendStatus(404));
        })

    api.mkactivity('/', (req, res) => {
        res.sendStatus(200);
        const ping = require('ping-lite');
        const {minBy, flatten, range} = require('lodash');

        Promise.all(
            flatten(range(10, 50, 10).map(x => 'abcde'.split('').map(y => `${x}${y}`)))
                .map(x => `smooth.edge${x}.rtl.hu`)
                .map(x => new ping(x))
                .map(x => new Promise((resolve, reject) => {
                    x.send((err, ms) => {
                        if (err) reject(err)
                        else resolve({ host: x._host, ms })
                    })
                }))
        )
            .then(servers => minBy(servers, srv => srv.ms))
            .then(fastest => {
                console.log(fastest);
                db.find({ 'url': /smooth.*.rtl.hu/ }, { _id: 1, url: 1 })
                    .forEach(({_id, url}) => {
                        db.update(
                            { _id },
                            { url: url.replace(/smooth.*.rtl.hu/, fastest.host) }
                        );
                    })
            });
    })

    return api;
}
