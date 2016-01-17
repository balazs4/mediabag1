var ioc = require('kontainer-di');
ioc.reset();

ioc.register('express', [], () => {
    var app = require('express')();

    var bodyparser = require('body-parser');

    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({
        limit: '1mb',
        extended: true
    }));

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    })

    return app;
});

ioc.register('dataprovider', [], () => {
    var pmongo = require('promised-mongo');
    var db = pmongo('piserver/mediabag', ['media']);

    return {
        insert: function (item) {
            return db.media
                .find({ 'name': item.name })
                .then(found => {
                    return found[0] || db.media.insert(item);
                });
        },
        getAll: function () {
            return db.media.find({ 'url': { $exists: true } }).toArray();
        }
    };
});

ioc.register('server', ['express', 'dataprovider'], (app, mediaprovider) => {

    var path = require('path');

    app.get('/munkaugyek', (req, res) => {
        res.sendFile(path.join(__dirname, "..", "ext", "munkaugyek.js"))
    });

    app.post('/media', (req, res) => {
        mediaprovider
            .insert(req.body)
            .then(doc => {
                res.send(doc)
            })
            .catch(err => {
                res.status(500).end();
            })
    });

    app.get('/media', (req, res) => {
        mediaprovider
            .getAll()
            .then(docs => {
                docs.forEach((doc) => {
                    // PING-RACE
                    doc.url = doc.url.replace(/smooth\.edge[\d\w]+\.rtl\.hu/, rtlmostserver || 'smooth.edge10d.rtl.hu')
                });
                res.send(docs);
            })
            .catch(err => {
                res.status(500).end();
            })
    });

    var rtlmostserver;

    app.get('/rtlmost', (req, res) => {
        var q = require('q');
        var _ = require('lodash');
        var Ping = require('ping-lite');

        var pinghost = [
            "smooth.edge10d.rtl.hu",
            "smooth.edge10e.rtl.hu",
            "smooth.edge20a.rtl.hu",
            "smooth.edge20b.rtl.hu",
            "smooth.edge30a.rtl.hu",
            "smooth.edge30b.rtl.hu",
            "smooth.edge30d.rtl.hu",
            "smooth.edge40a.rtl.hu",
            "smooth.edge40d.rtl.hu",
            "smooth.edge9a.rtl.hu"
        ].map((host) => {
            var defer = q.defer();
            new Ping(host).send((err, ms) => {
                if (err)
                    defer.reject(err);

                defer.resolve({
                    host: host,
                    response: ms
                });
            });
            return defer.promise;
        });

        q
            .all(pinghost)
            .then((results) => {
                var fastest = _.min(results, (result) => {
                    return result.response;
                });
                rtlmostserver = fastest.host;
                res.status(200).send(fastest);
            }).catch((err) => {
                res.status(500).end();
            });
    });

    return app;
});

module.exports = ioc;