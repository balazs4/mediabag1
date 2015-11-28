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

	app.post('/watchitlater', (req, res) => {
		var input = req.body['iframe'];

		var result = {
			"link": input
		};
		res.status(201).send(result);
	});

	return app;
});

module.exports = ioc;