var ioc = require('kontainer-di');
ioc.reset();

ioc.register('express', [], () => {
	var app = require('express')();

	return app;
});

ioc.register('server', ['express'], (app) => {

	app.post('/watchitlater', (req, res) => {
		
		
		var result = {
			"link": "google.com"
		};
		
		
		
		
		res.status(201).send(result);
	});

	return app;
});

module.exports = ioc;