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
                    doc.url = doc.url.replace(/smooth\.edge[\d\w]+\.rtl\.hu/, 'smooth.edge10d.rtl.hu')
                });
				res.send(docs);
			})
			.catch(err => {
				res.status(500).end();
			})
	});
	return app;
});

module.exports = ioc;