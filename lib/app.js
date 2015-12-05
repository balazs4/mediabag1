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

	return app;
});

ioc.register('dataprovider', [], () => {
	var pmongo = require('promised-mongo');
	var db = pmongo('mediabag', ['media']);

	return {
		getAll: function () {
			return db.media.find().toArray();
		}
	};
});

ioc.register('server', ['express', 'dataprovider'], (app, mediaprovider) => {
	app.get('/media', (req, res) => {
		mediaprovider
			.getAll()
			.then(docs => {
				res.send(docs);
			})
			.catch(err => {
				res.status(500).end();
			})
	});
	return app;
});

module.exports = ioc;