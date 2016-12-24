const moment = require('moment');

const browser = () => require('nightmare')({ show: process.env.DEBUG });

const providers = {
    rtlmost: url => browser()
        .viewport(1600, 900)
        .goto(url)
        .wait("div#video-container")
        .evaluate(() => {
            $("div#video-container div.must-login-btns div label:contains('Belépés')").click();
            $("input#loginform-email").val('17kifli@gmail.com');
            $("input#loginform-password").val('*****');
            $("#login-form button.login-button").click();
        })
        .wait("video")
        .evaluate(() => ({
            "name": $("title").text(),
            "url": $("video source").attr('src'),
            "icon": $("video").attr('poster'),
            "src": $(location).attr('href')
        }))
        .end(),
    mediaklikk: url => browser({ width: 320, height: 568 })
        .viewport(320, 568)
        .useragent('Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
        .goto(url)
        .wait('body')
        .evaluate(() => document.getElementById('#videoId').children('source'))
        .end()
}

const sources = {
    'ejjel-nappal': day => ({
        src: `http://rtl.hu/most/budapest/ejjel-nappal-budapest-${day}`,
        provider: providers['rtlmost']
    }),
    'showder-klub': day => ({
        src: `http://rtl.hu/most/rtl2/showderklub/showder-klub-${day}`,
        provider: providers['rtlmost']
    })
}

module.exports = db => {
    const api = require('express').Router();
    api.route('/:serie/:day*?')
        .all((req, res, next) => {
            const {serie, day = moment().format('YYYY-MM-DD') } = req.params;
            const {src, provider} = sources[serie](day);
            const [item] = db.find({ src });
            req.mediabag = { src, provider, item, serie };
            next();
        })
        .get((req, res) => {
            const {item} = req.mediabag;
            res.status(item ? 200 : 404).send(item);
        })
        .mkactivity((req, res) => {
            const {item, src, provider, serie} = req.mediabag;
            if (item) {
                res.sendStatus(302);
                return;
            }
            provider(src)
                .then(x => {
                    db.insert(Object.assign({}, x, { tags: [serie], extracted: new Date() }));
                    res.sendStatus(201);
                })
                .catch(x => {
                    console.error(x);
                    res.sendStatus(500)
                });
        })
    return api;
}