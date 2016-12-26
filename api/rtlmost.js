const sources = {
    'ejjel-nappal': day => `http://rtl.hu/most/budapest/ejjel-nappal-budapest-${day}`,
    'showder-klub': day => `http://rtl.hu/most/rtl2/showderklub/showder-klub-${day}`
}

module.exports = db => {
    const moment = require('moment');
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
            require('nightmare')({ show: process.env.DEBUG })
                .viewport(1600, 900)
                .goto(src)
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
                .end()
                .then(x => {
                    db.insert(Object.assign({}, x, { tags: [serie], extracted: new Date() }));
                    res.sendStatus(201);
                })
                .catch(x => res.sendStatus(404));
        })
    return api;
}