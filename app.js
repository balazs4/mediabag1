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

//client:
//JSON.parse(jQuery(jQuery("div#hmvideo iframe").contents().find("script")[4]).text().match(/{ 'file': '((http|https)\:\/\/)?[a-zA-Z0-9\.\/\?\:@\-_=#]+\.([a-zA-Z0-9\.\/\?\:@\-_=&#])*' }/gm)[0].replace(/\'/g,"\""))
	app.post('/watchitlater', (req, res) => {
		var rp = require('request-promise');

		rp(req.body['iframe'])
			.then((htmlString) => {

				var file = htmlString
					.match(/{ 'file': '((http|https)\:\/\/)?[a-zA-Z0-9\.\/\?\:@\-_=#]+\.([a-zA-Z0-9\.\/\?\:@\-_=&#])*' }/gm)[0];
					
				var result = JSON.parse(file);
				
				res.status(201).send(result);
			})
			.catch((err) => {
				res.status(500).send(err);
			});
	});

	return app;
});

module.exports = ioc;