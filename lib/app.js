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

ioc.register('server', ['express'], (app) => {

	app.get('/channels', (req, res) => {
		var channels = require('./channels.json');
		res.send(channels);
	});

	return app;
});

module.exports = ioc;