var chai = require('chai');
chai.use(require('chai-http'));
chai.should();



var path = require('path');

var app = require('./app');
var server = app.get('server');

describe('Features', () => {
	it('GET /media', (done) => {
		chai.request(server)
			.get('/media')
			.then(res => {
				res.status.should.be.equal(200);
				var expected = require('../ext/mediaklikk.json');
				res.body.length.should.be.at.least(expected.length);
				done();
			})
			.catch(err => done(err));
	})
})

describe('Database', () => {
	it('should return something', (done) => {
		app.get('dataprovider')
			.getAll()
			.then((docs) => {
				docs.length.should.be.at.least(4);
				done();
			})
			.catch(err => done(err));
		;
	})
})
