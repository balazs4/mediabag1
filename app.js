var ioc = require('kontainer-di');
ioc.reset();

ioc.register('express', [], () => {
	var app = require('express')();
	
	return app;
});

ioc.register('server', ['express'], (app) => {
	
	app.post('/watchitlater', (req,res) => {
		res.status(200).end();
	});
	
	return app;
});

module.exports = ioc;