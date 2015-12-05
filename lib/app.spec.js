var chai = require('chai');
chai.use(require('chai-http'));
chai.should();



var path = require('path');

var app = require('./app');
var server = app.get('server');

describe('Features', () => {
	it('GET /channels', (done) => {
		chai.request(server)
			.get('/channels')
			.then(res => {
				res.status.should.be.equal(200);
				var expected = require('./channels.json');
				res.body.length.should.eql(expected.length);
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
