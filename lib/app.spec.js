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
				res.body.should.eql(expected);
				done();
			})
			.catch(err => done(err));
	})
})